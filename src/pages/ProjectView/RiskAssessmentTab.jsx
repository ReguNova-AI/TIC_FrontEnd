import React from "react";
import { Typography, Box, CircularProgress, Alert, Button } from "@mui/material";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import html2pdf from "html2pdf.js";
import mammoth from "mammoth";

import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { apiHost } from "../../config";
import { useRiskSummary } from "./useProjectQueries";
import { ProjectApiService } from "../../services/api/ProjectAPIService";
import { useRiskSummaryOperations } from "../../components/hooks/useRiskSummaryOperations";
import RiskSummaryStatusIndicator from "../../components/RiskSummaryStatusIndicator";

const RiskAssessmentTab = ({ projectData }) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [docxText, setDocxText] = React.useState(null);

  // Use React Query hook to fetch risk summary
  const {
    data: riskSummary,
    isLoading,
    error,
    isError
  } = useRiskSummary(projectData?.project_id);

  // Fetch DOCX blob and extract text
  React.useEffect(() => {
    const fetchAndProcessDocx = async () => {
      if (riskSummary?.doc_path_aws) {
        try {
          const response = await ProjectApiService.downloadRiskSummary(projectData?.project_id);
          const arrayBuffer = await new Response(response.data).arrayBuffer();

          // Extract raw text from DOCX as it contains Markdown
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          setDocxText(result.value);
        } catch (err) {
          console.error("Failed to process DOCX:", err);
        }
      }
    };

    fetchAndProcessDocx();
  }, [riskSummary?.doc_path_aws, projectData?.project_id]);

  // Use global state for regenerating risk summary
  const {
    isRiskSummaryLoading,
    currentRiskSummaryStatus,
    handleRegenerateRiskSummary,
  } = useRiskSummaryOperations(projectData);

  const handleDownloadRiskReport = () => {
    if (!riskSummary) return;

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Risk Summary Report - ${projectData?.project_name} </h1>
        <div style="margin-top: 20px; line-height: 1.6;">
          ${document.querySelector('.risk-summary-content')?.innerHTML || riskSummary?.summary}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `risk-assessment-${projectData?.project_name || 'project'}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleDownloadDocx = async () => {
    try {
      if (riskSummary?.doc_path_aws) {
        setIsDownloading(true);
        const response = await ProjectApiService.downloadRiskSummary(projectData?.project_id);

        // Extract filename from the path or use default
        const fileName = riskSummary.doc_path_aws.split('/').pop() ||
          `risk-assessment-${projectData?.project_name || 'project'}.docx`;

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
      // Optional: Show error message
    } finally {
      setIsDownloading(false);
    }
  };

  const renderRiskSummary = () => {
    if (isLoading || isRiskSummaryLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            {isRiskSummaryLoading && riskSummary ? "Regenerating risk summary..." : "Loading risk summary..."}
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || "Failed to fetch risk summary data."}
        </Alert>
      );
    }

    if (riskSummary) {
      const hasDocx = !!riskSummary.doc_path_aws;

      // If we expect a Docx but haven't extracted text yet, show loading
      if (hasDocx && !docxText) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Processing document...</Typography>
          </Box>
        );
      }

      const contentToRender = hasDocx && docxText ? docxText : riskSummary.summary;

      return (
        <Box
          sx={{
            maxHeight: '65vh', // Fixed height for scrolling
            overflowY: 'auto', // Enable internal scrolling
            padding: '10px 10px 10px 0', // Padding for scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
            // Markdown Styles
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: '#333', // Changed from blue to standard text color
              marginTop: '1.5rem',
              marginBottom: '0.75rem'
            },
            '& p': {
              marginBottom: '1rem',
              lineHeight: 1.7
            },
            '& ul, & ol': {
              marginBottom: '1rem',
              paddingLeft: '2rem'
            },
            '& li': {
              marginBottom: '0.5rem'
            },
            '& strong': {
              fontWeight: 600,
              color: '#333'
            },
            '& code': {
              backgroundColor: '#f5f5f5',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.875rem'
            },
            '& pre': {
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              marginBottom: '1rem'
            },
            '& blockquote': {
              borderLeft: '4px solid #1976d2',
              paddingLeft: '1rem',
              marginLeft: 0,
              marginBottom: '1rem',
              fontStyle: 'italic',
              color: '#555'
            }
          }}
          className="risk-summary-content"
        >
          <ReactMarkdown>{contentToRender}</ReactMarkdown>
        </Box>
      );
    }

    return (
      <Typography>No Risk Summary available.</Typography>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Risk Summary Section */}
      <Box
        sx={{
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "15px"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography style={{ fontSize: "18px" }}>
              {PROJECT_DETAIL_PAGE.RISK_SUMMARY}
            </Typography>
            <RiskSummaryStatusIndicator
              projectId={projectData?.project_id}
              variant="progress"
              size="small"
              isRegenerating={!!riskSummary}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {riskSummary?.doc_path_aws ? (
              <Button
                variant="outlined"
                startIcon={!isDownloading && <DownloadIcon />}
                onClick={handleDownloadDocx}
                disabled={isRiskSummaryLoading || isLoading || isDownloading}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: '#e3f2fd',
                  }
                }}
              >
                {isDownloading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Downloading...
                  </>
                ) : (
                  "Download Report"
                )}
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadRiskReport}
                disabled={!riskSummary || isRiskSummaryLoading || isLoading}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: '#e3f2fd',
                  }
                }}
              >
                Download Report
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRegenerateRiskSummary}
              disabled={isRiskSummaryLoading || isLoading}
              size="small"
              sx={{
                textTransform: 'none',
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#e3f2fd',
                }
              }}
            >
              {isRiskSummaryLoading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {(
                    !riskSummary ? "Generating..." : 'Regenerating...'
                  )}
                </>
              ) : (
                !riskSummary ? "Generate Assessment" : 'Regenerate Assessment'
              )}
            </Button>
          </Box>
        </Box>

        {renderRiskSummary()}
      </Box>

      {/* Extracted Information Section */}

    </Box>
  );
};

RiskAssessmentTab.propTypes = {
  projectData: PropTypes.object.isRequired,
};

export default RiskAssessmentTab;