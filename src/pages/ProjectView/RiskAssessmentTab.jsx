import React, { useEffect, useRef } from "react";
import { Typography, Box, CircularProgress, Alert, Button } from "@mui/material";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import html2pdf from "html2pdf.js";
import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { useRiskSummary, useRegenerateRiskSummary } from "./useProjectQueries";

const RiskAssessmentTab = ({ projectData }) => {
  // Ref to track if we've already attempted auto-regeneration
  const hasAttemptedAutoRegeneration = useRef(false);

  // Use React Query hook to fetch risk summary
  const {
    data: riskSummary,
    isLoading,
    error,
    isError
  } = useRiskSummary(projectData?.project_id);

  // Use React Query mutation for regenerating risk summary
  const regenerateRiskSummary = useRegenerateRiskSummary(projectData?.project_id);

  // Auto-regenerate risk summary if it's null and we haven't tried before
  useEffect(() => {
    if (
      projectData?.project_id && // Project ID exists
      !isLoading && // Not currently loading
      !error && // No error from initial fetch
      riskSummary === null && // Risk summary is null
      !regenerateRiskSummary.isPending && // Not already regenerating
      !hasAttemptedAutoRegeneration.current // Haven't tried auto-regeneration before
    ) {
      hasAttemptedAutoRegeneration.current = true;
      regenerateRiskSummary.mutate();
    }
  }, [
    projectData?.project_id,
    isLoading,
    error,
    riskSummary,
    regenerateRiskSummary
  ]);

  const handleRegenerateRiskSummary = () => {
    regenerateRiskSummary.mutate();
  };

  const handleDownloadRiskReport = () => {
    if (!riskSummary) return;

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Risk Summary Report - ${projectData?.project_name} </h1>
        <div style="margin-top: 20px; line-height: 1.6;">
          ${document.querySelector('.risk-summary-content')?.innerHTML || riskSummary}
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

  const renderRiskSummary = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading risk summary...</Typography>
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
      return (
        <Box sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            color: '#1976d2',
            marginTop: '1rem',
            marginBottom: '0.5rem'
          },
          '& p': {
            marginBottom: '0.75rem',
            lineHeight: 1.6
          },
          '& ul, & ol': {
            marginBottom: '0.75rem',
            paddingLeft: '1.5rem'
          },
          '& li': {
            marginBottom: '0.25rem'
          },
          '& strong': {
            fontWeight: 600
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
            fontStyle: 'italic'
          }
        }}
          className="risk-summary-content"
        >
          <ReactMarkdown>{riskSummary}</ReactMarkdown>
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
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <Typography style={{ fontSize: "18px" }}>
            {PROJECT_DETAIL_PAGE.RISK_SUMMARY}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadRiskReport}
              disabled={!riskSummary || regenerateRiskSummary.isPending || isLoading}
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

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRegenerateRiskSummary}
              disabled={regenerateRiskSummary.isPending || isLoading}
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
              {regenerateRiskSummary.isPending ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Regenerating...
                </>
              ) : (
                'Regenerate Assessment'
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