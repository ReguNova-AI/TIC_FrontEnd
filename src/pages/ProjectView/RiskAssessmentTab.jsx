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
import { API_ERROR_MESSAGE, PROJECT_DETAIL_PAGE } from "shared/constants";
import { ProjectApiService } from "../../services/api/ProjectAPIService";
import RiskSummaryStatusIndicator, {
  markRiskSummaryStart,
} from "../../components/RiskSummaryStatusIndicator";
import { apiPath } from "../../config";
import { getFileIcon } from "./FileStructureView";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import { message, Progress, Modal } from "antd";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { useDownloadRiskSummary, useRiskSummaries } from "./useRiskSummary";

const RiskAssessmentTab = ({ projectData }) => {
  const containerRef = useRef(null);
  const [isDocxRendering, setIsDocxRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const projectId = projectData?.project_id;
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [unselectedSummaries, setUnselectedSummaries] = useState(null);
  const {
    data: riskSummaries,
    isLoading,
    error,
    refetch: refetchRiskSummaries,
  } = useRiskSummaries(projectId);
  const { data: downloadedData } = useDownloadRiskSummary(
    selectedSummary?.version_id,
  );

  useEffect(() => {
    setSelectedSummary(riskSummaries?.[0]);
  }, [riskSummaries]);
  useEffect(() => {
    const remainingSummaries = riskSummaries?.filter(
      (summary) => summary?.version_id !== selectedSummary?.version_id,
    );
    setUnselectedSummaries(remainingSummaries);
  }, [selectedSummary]);

  useEffect(() => {
    if (!downloadedData) return;

    const renderDocx = async () => {
      setIsDocxRendering(true);
      setRenderError(null);
      try {
        const arrayBuffer = await downloadedData.data.arrayBuffer();

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
  }, [downloadedData]); // ✅ stable primitive dep

  const handleDownloadFullDocx = () => {
    if (!selectedSummary?.doc_path_aws) return;
    const link = document.createElement("a");
    link.href = `${apiPath}/${selectedSummary.doc_path_aws}`;
    link.setAttribute(
      "download",
      selectedSummary.doc_path_aws.split("/").pop(),
    );
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

    if (!selectedSummary) {
      return <Typography>This Risk Summary is not available.</Typography>;
    }

    return null; // content is rendered into containerRef by renderAsync
  };

  const handleDeleteSummary = async () => {
    try {
      const response = await ProjectApiService.deleteRiskSummary(
        selectedSummary.version_id,
      );

      message.success(response.message || "Document deleted successfully!");

      // Call the callback to refresh project data in parent component
      refetchRiskSummaries();
    } catch (error) {
      console.error("Delete failed:", error);
      message.error(
        error?.error?.message ||
          API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
          "Failed to delete document!",
      );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
          backgroundColor: "#fff",
        }}
      >
        {/* Header bar — unchanged */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "15px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography style={{ fontSize: "18px" }}>
              {PROJECT_DETAIL_PAGE.RISK_SUMMARY}
            </Typography>
            <RiskSummaryStatusIndicator
              projectId={projectId}
              variant="progress"
              size="small"
              isRegenerating={!!selectedSummary}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadFullDocx}
              disabled={!selectedSummary?.doc_path_aws || isLoading}
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
              startIcon={<DeleteForever />}
              onClick={handleDeleteSummary}
              disabled={!selectedSummary?.doc_path_aws || isLoading}
              size="small"
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Delete Report
            </Button>
          </Box>
        </Box>

        {/* State-based messages (loading / error / empty) */}
        {renderRiskSummary()}

        {/* ✅ Always mounted so containerRef is available when useEffect fires */}
        <Box
          sx={{
            maxHeight: "65vh",
            overflowY: "auto",
            px: 2,
            "& table": { borderCollapse: "collapse" },
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "8px",
            },
            // hide until rendered — avoids flash of empty box
            display:
              selectedSummary && !isDocxRendering && !renderError
                ? "block"
                : "none",
          }}
          ref={containerRef}
        />
      </Box>
      <ul>
        {unselectedSummaries?.length > 0 &&
          unselectedSummaries.map((summary, index) => (
            <li>
              {index + 1}
              <button onClick={() => setSelectedSummary(summary)}>View</button>
              <button onClick={handleDownloadFullDocx}>Download</button>
              <button onClick={handleDeleteSummary}>Delete</button>
            </li>
          ))}
      </ul>
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
