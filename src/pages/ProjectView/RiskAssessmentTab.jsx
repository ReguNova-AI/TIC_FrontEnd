import { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import PropTypes from "prop-types";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { renderAsync } from "docx-preview";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRiskSummary } from "./useProjectQueries";
import { useQuery } from "@tanstack/react-query";
import { ProjectApiService } from "../../services/api/ProjectAPIService";
import { useRiskSummaryOperations } from "../../components/hooks/useRiskSummaryOperations";
import RiskSummaryStatusIndicator, {
  markRiskSummaryStart,
} from "../../components/RiskSummaryStatusIndicator";
import { apiPath } from "../../config";
import { getFileIcon } from "./FileStructureView";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import { message, Progress, Modal } from "antd";

const RiskAssessmentTab = ({ projectData, versionId, docPath }) => {
  const containerRef = useRef(null);
  const [isDocxRendering, setIsDocxRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [hasItsConfig, setHasItsConfig] = useState(false);
  const existingConfigs = JSON.parse(localStorage.getItem("hasConfig") || "[]");
  const projectId = projectData?.project_id;

  // Use versionId when provided (history view), else fall back to projectId (latest)
  const activeId = versionId || projectId;

  useEffect(() => {
    if (existingConfigs.includes(projectId)) {
      setHasItsConfig(true);
    }
  }, [projectId]);

  // Only fetch from API when docPath is NOT already provided by the parent.
  // When docPath IS provided, we can skip the list-fetch and render directly.
  const { data: riskSummary, isLoading, error } = useRiskSummary(
    docPath ? null : activeId  // pass null to disable the query when docPath is known
  );

  // Resolved doc_path_aws: prefer the prop (from list), fall back to hook data
  const resolvedDocPath = docPath || riskSummary?.doc_path_aws;

  const { isRiskSummaryLoading, handleRegenerateRiskSummary } =
    useRiskSummaryOperations(projectData);

  // Call React Query to cache the binary document blob.
  // Because older versions are immutable, we keep staleTime as Infinity for high performance.
  const { 
    data: documentArrayBuffer, 
    isFetching: isDownloadingDocx, 
    error: downloadError 
  } = useQuery({
    queryKey: ["risk_summary_docx_blob", activeId],
    queryFn: async () => {
      const response = await ProjectApiService.downloadRiskSummary(activeId);
      return response.data.arrayBuffer();
    },
    enabled: !!resolvedDocPath && !!activeId,
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!documentArrayBuffer || !containerRef.current) return;

    // Clear the container before re-rendering a new version
    containerRef.current.innerHTML = "";

    const renderDocx = async () => {
      setIsDocxRendering(true);
      setRenderError(null);
      try {
        await renderAsync(documentArrayBuffer, containerRef.current, null, {
          className: "docx-preview",
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          ignoreFonts: false,
          breakPages: false,
          ignoreLastRenderedPageBreak: true,
          experimental: true,
          trimXmlDeclaration: true,
        });
      } catch (err) {
        console.error("docx render failed:", err);
        setRenderError("Failed to load document preview.");
      } finally {
        setIsDocxRendering(false);
      }
    };

    renderDocx();
  }, [documentArrayBuffer, activeId]); // re-render whenever the active arrayBuffer changes

  useEffect(() => {
    if (downloadError) setRenderError("Failed to load document preview.");
  }, [downloadError]);

  const handleDownloadFullDocx = () => {
    if (!resolvedDocPath) return;
    const link = document.createElement("a");
    link.href = `${apiPath}/${resolvedDocPath}`;
    link.setAttribute("download", resolvedDocPath.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const renderRiskSummary = () => {
    if (error && !docPath) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || "Failed to fetch risk summary data."}
        </Alert>
      );
    }

    if (renderError) {
      return <Alert severity="warning">{renderError}</Alert>;
    }

    if (isDocxRendering || isDownloadingDocx) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading document...</Typography>
        </Box>
      );
    }

    // Only show "No Risk Summary" when we have no docPath from parent AND no hook data
    if (!resolvedDocPath && !isLoading && !isRiskSummaryLoading) {
      return <Typography sx={{ p: 2, color: "#888" }}>No Risk Summary available.</Typography>;
    }

    return null; // content is rendered into containerRef by renderAsync
  };
  const handleFileUpload = async (file, silent = false, onProgress = null) => {
    if (!file) return;

    if (!silent) {
      setUploadingFile(file);
      setUploadProgress(0);
      setUploadSuccess(false);
      setOpenModal(true);
    }

    try {
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop();
      const payload = {
        documents: [fileDataUrl],
        type: ext,
        project_id: projectId,
        isConfig: true,
        folder_name: "", // Empty for configuration files
        file_name: file.name,
      };
      console.log(payload, "payload");

      // CHANGED: pass onUploadProgress via otherConfig (4th arg) so axios fires progress events.
      // BaseApiService.post signature: post(url, params, data, useBaseApiPath, otherConfig)
      // FileUploadApiService.fileUpload calls BaseApiService.post(`/api/v1/uploadToStorage`, null, filepayload)
      // — we need to thread the config through. See note below on FileUploadApiService change.
      const response = await FileUploadApiService.fileUpload(payload, {
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          if (!silent) setUploadProgress(percent);
          if (onProgress) onProgress(percent);
        },
      });

      // Assume API returns the uploaded file path
      const filePath = response.data.details?.[0];

      if (!silent) {
        setUploadProgress(100);
        setUploadSuccess(true);
        message.success("File uploaded successfully!");
      }

      return filePath;
    } catch (err) {
      console.error(err);
      throw err; // CHANGED: re-throw so multi-upload loop can catch and count failures
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Wait for upload to finish and get the path
      await handleFileUpload(file);

      // 🔽 Avoid duplicates
      if (!existingConfigs.includes(projectId)) {
        existingConfigs.push(projectId);
      }
      // 🔽 Save back
      localStorage.setItem("hasConfig", JSON.stringify(existingConfigs));
      setHasItsConfig(true);
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setOpenModal(false);
    }
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ width: '100%' }}>
        {/* Header bar — Hidded per user request to clean up report UX */}
        <Box
          sx={{
            display: "none",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <RiskSummaryStatusIndicator
              projectId={projectId}
              variant="progress"
              size="small"
              isRegenerating={!!riskSummary}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={isRiskSummaryLoading || isLoading}
            >
              {hasItsConfig ? "Re-upload Config File" : "Load Config File"}
              <input
                id="config"
                type="file"
                accept={[".xlsx"]}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e)}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadFullDocx}
              disabled={
                !riskSummary?.doc_path_aws || isRiskSummaryLoading || isLoading
              }
              size="small"
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Download Report
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                markRiskSummaryStart(projectId);
                handleRegenerateRiskSummary();
              }}
              disabled={isRiskSummaryLoading || isLoading}
              size="small"
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {isRiskSummaryLoading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {!riskSummary ? "Generating..." : "Regenerating..."}
                </>
              ) : !riskSummary ? (
                "Generate Assessment"
              ) : (
                "Regenerate Assessment"
              )}
            </Button>
          </Box>
        </Box>

        {/* State-based messages (loading / error / empty) */}
        {renderRiskSummary()}

        <Box
          sx={{
            maxHeight: "65vh",
            overflowY: "auto",
            px: 4,
            py: 2,
            "& table": { borderCollapse: "collapse" },
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "8px",
            },
            // hide until rendered — avoids flash of empty box
            display:
              resolvedDocPath && !isDocxRendering && !renderError
                ? "block"
                : "none",
          }}
          ref={containerRef}
        />
      </Box>
      <Modal
        open={openModal}
        footer={null}
        closable={false}
        title="Uploading config file"
        centered
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {getFileIcon(uploadingFile?.name)}
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {uploadingFile?.name}
            </span>
            {uploadSuccess && (
              <CheckOutlined style={{ color: "green", fontSize: 20 }} />
            )}
          </div>
          <Progress
            percent={uploadProgress}
            status={uploadSuccess ? "success" : "active"}
          />
        </div>
      </Modal>
    </Box>
  );
};

RiskAssessmentTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  versionId: PropTypes.number,
  docPath: PropTypes.string,
};

export default RiskAssessmentTab;
