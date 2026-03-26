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

const RiskAssessmentTab = ({ projectData }) => {
  const containerRef = useRef(null);
  const [isDocxRendering, setIsDocxRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);

  const projectId = projectData?.project_id;

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
              isRegenerating={!!riskSummary}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
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
              riskSummary && !isDocxRendering && !renderError
                ? "block"
                : "none",
          }}
          ref={containerRef}
        />
      </Box>
    </Box>
  );
};

RiskAssessmentTab.propTypes = {
  projectData: PropTypes.object.isRequired,
};

export default RiskAssessmentTab;
