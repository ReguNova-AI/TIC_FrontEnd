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
import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { useRiskSummary } from "./useProjectQueries";
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

const RiskAssessmentTab = ({ projectData }) => {
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
  useEffect(() => {
    if (existingConfigs.includes(projectId)) {
      setHasItsConfig(true);
    }
  }, [projectId]);

  const { data: riskSummary, isLoading, error } = useRiskSummary(projectId);

  const { isRiskSummaryLoading, handleRegenerateRiskSummary } =
    useRiskSummaryOperations(projectData);

  useEffect(() => {
    if (!riskSummary?.doc_path_aws) return;

    const renderDocx = async () => {
      setIsDocxRendering(true);
      setRenderError(null);
      try {
        const response = await ProjectApiService.downloadRiskSummary(projectId);
        const arrayBuffer = await response.data.arrayBuffer();

        await renderAsync(arrayBuffer, containerRef.current, null, {
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
  }, [riskSummary?.doc_path_aws, projectId]); // ✅ stable primitive dep

  const handleDownloadFullDocx = () => {
    if (!riskSummary?.doc_path_aws) return;
    const link = document.createElement("a");
    link.href = `${apiPath}/${riskSummary.doc_path_aws}`;
    link.setAttribute("download", riskSummary.doc_path_aws.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const renderRiskSummary = () => {
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || "Failed to fetch risk summary data."}
        </Alert>
      );
    }

    if (renderError) {
      return <Alert severity="warning">{renderError}</Alert>;
    }

    if (isDocxRendering) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading document...</Typography>
        </Box>
      );
    }

    if (!riskSummary && !isRiskSummaryLoading) {
      return <Typography>No Risk Summary available.</Typography>;
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
              riskSummary && !isDocxRendering && !renderError
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
};

export default RiskAssessmentTab;
