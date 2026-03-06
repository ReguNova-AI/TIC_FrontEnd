import React from "react";
import { Typography, Box, CircularProgress, Alert, Button } from "@mui/material";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import html2pdf from "html2pdf.js";
import mammoth from "mammoth";
// import HtmlDocx from "html-docx-js/dist/html-docx";
import { Document, Packer, Paragraph, TextRun, ImageRun, Footer, AlignmentType } from "docx";
import { saveAs } from "file-saver";
// import LogoUrl from "../../assets/images/gridConform2.png"; // Vite import

import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { apiHost } from "../../config";
import { useRiskSummary } from "./useProjectQueries";
import { ProjectApiService } from "../../services/api/ProjectAPIService";
import { useRiskSummaryOperations } from "../../components/hooks/useRiskSummaryOperations";
import RiskSummaryStatusIndicator, { markRiskSummaryStart } from "../../components/RiskSummaryStatusIndicator";
// import Logo from "../../assets/images/gridConform2.png?url"; // Vite will give you a URL

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

  const [processingError, setProcessingError] = React.useState(null);

  // Fetch DOCX blob and extract text
  React.useEffect(() => {
    const fetchAndProcessDocx = async () => {
      if (riskSummary?.doc_path_aws) {
        setProcessingError(null);
        try {
          const response = await ProjectApiService.downloadRiskSummary(projectData?.project_id);
          const arrayBuffer = await new Response(response.data).arrayBuffer();

          // Extract raw text from DOCX as it contains Markdown
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          setDocxText(result.value);
        } catch (err) {
          console.error("Failed to process DOCX:", err);
          setProcessingError("Failed to load document preview. Please try downloading the report.");
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

      if (processingError) {
        return (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {processingError}
          </Alert>
        );
      }

      if (hasDocx && !docxText) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Processing document...</Typography>
          </Box>
        );
      }

      const baseContent = hasDocx && docxText ? docxText : riskSummary.summary;

      return (
        <Box
          sx={{
            maxHeight: '65vh',
            overflowY: 'auto',
            px: 4,
            py: 3,
            pr: 2,
            background: '#fafbfc',
            fontFamily: '"Inter", "Roboto", sans-serif',
            fontSize: '0.96rem',
            lineHeight: 1.8,
            color: '#2d3748',

            /* Scrollbar */
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '8px' },

            /* Main Title */
            '& h1': { fontSize: '1.8rem', fontWeight: 700, mb: 3, pb: 1.5, borderBottom: '3px solid #e2e8f0', color: '#0f172a', letterSpacing: '-0.5px' },

            /* Section Headers */
            '& h2': { fontSize: '1.35rem', fontWeight: 600, mt: 4, mb: 2, padding: '10px 14px', background: 'linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%)', borderLeft: '5px', borderRadius: '6px', color: '#1e293b' },

            /* Subsection Headers */
            '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 3, mb: 1, color: '#334155' },

            /* Paragraph spacing */
            '& p': { mb: 1.2 },

            /* Lists */
            '& ul, & ol': { pl: 3, mb: 2 },
            '& li': { mb: 0.6 },

            /* Tables */
            '& table': { width: '100%', borderCollapse: 'collapse', mb: 3, fontSize: '0.92rem', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
            '& th': { backgroundColor: '#f1f5f9', fontWeight: 600, padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
            '& td': { padding: '10px', borderBottom: '1px solid #f1f5f9' },

            /* Risk Block Styling */
            '& p:has(strong:contains("Risk"))': { mt: 3, padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: '1.02rem', borderLeft: '4px solid #6366f1' },
            '& p:has(strong:contains("Category"))': { mt: 2, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.3px' },
            '& p:has(strong:contains("Section/Clause"))': { fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', display: 'inline-block', fontSize: '0.85rem' },
            '& p:has(strong:contains("Evidence"))': { backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #94a3b8', fontStyle: 'italic', color: '#475569' },

            /* Severity Styling */
            '& p:contains("Severity: High")': { fontWeight: 600, color: '#dc2626' },
            '& p:contains("Severity: Medium")': { fontWeight: 600, color: '#ea580c' },
            '& p:contains("Severity: Low")': { fontWeight: 600, color: '#16a34a' },

            /* Divider */
            '& hr': { border: 'none', borderTop: '1px solid #e2e8f0', my: 4 },

            /* Blockquote (Executive Notes) */
            '& blockquote': { backgroundColor: '#eef2ff', padding: '16px', borderLeft: '4px solid #6366f1', borderRadius: '8px', fontStyle: 'normal', color: '#1e293b' },

            /* Strong emphasis */
            '& strong': { fontWeight: 600 },
          }}
          className="risk-summary-content"
        >
          {/* Beginning Page */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h1">{`Risk Summary Report`}</Typography>
            <Typography variant="h2">{projectData?.project_name}</Typography>
            {/* <Typography sx={{ fontSize: '0.85rem', mt: 2, color: '#64748b' }}>Generated by Diligence2AI</Typography> */}
          </Box>

          {/* Base Content (Markdown) */}
          <ReactMarkdown>{baseContent}</ReactMarkdown>
        </Box>
      );
    }

    return <Typography>No Risk Summary available.</Typography>;
  };


  // const getImageUint8Array = async (imgUrl) => {
  //   const response = await fetch(imgUrl);
  //   const blob = await response.blob();
  //   const arrayBuffer = await blob.arrayBuffer();
  //   return new Uint8Array(arrayBuffer);
  // };

  // const fetchBase64 = async (url) => {
  //   const response = await fetch(url);
  //   const blob = await response.blob();
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result.split(',')[1]); // get base64
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // };

  // const base64ToUint8Array = (base64) => {
  //   const binary = atob(base64);
  //   const len = binary.length;
  //   const bytes = new Uint8Array(len);
  //   for (let i = 0; i < len; i++) {
  //     bytes[i] = binary.charCodeAt(i);
  //   }
  //   return bytes;
  // };



  const handleDownloadFullDocx = async () => {
    const contentElement = document.querySelector('.risk-summary-content');
    if (!contentElement) return;

    const contentLines = (contentElement.innerText || "").split("\n");
    const mainContentLines = contentLines.slice(2);

    // detect lines
    const isSectionHeader = line => /^A\)|^B\)|^C\)/.test(line.trim());
    const isMainPoint = line => /^[A-Z]\)|•/.test(line) && !isSectionHeader(line);
    const isSubPoint = line => /^[-•]/.test(line);

    const mainContentParagraphs = mainContentLines
      .filter(line => line.trim() !== "")
      .map(line => {
        const trimmedLine = line.trim();
        if (isSectionHeader(trimmedLine)) {
          return new Paragraph({ children: [new TextRun({ text: trimmedLine, bold: true })], spacing: { after: 240, line: 276 } });
        } else if (isMainPoint(trimmedLine)) {
          return new Paragraph({ children: [new TextRun({ text: trimmedLine.replace(/^•/, "").trim(), bold: true })], spacing: { after: 150, line: 276 } });
        } else if (isSubPoint(trimmedLine)) {
          return new Paragraph({ children: [new TextRun({ text: trimmedLine.replace(/^[-•]/, "").trim(), indent: { left: 400 } })], spacing: { after: 150, line: 276 } });
        } else {
          return new Paragraph({ children: [new TextRun({ text: trimmedLine })], spacing: { after: 150, line: 276 } });
        }
      });

    // const logo = Media.addImage(doc, fs.readFileSync("../../assets/images/gridConform2.png"), 200, 200); // ERROR HERE: "fs.readFileSync is not a function
    const footer = new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated by Diligence2AI",
              size: 24, // 12pt
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: { page: { size: { orientation: "portrait" } } },
          footers: {
            default: footer,
          },
          children: [
            // new Paragraph({
            //   children: [
            //     new Paragraph(logo),
            //   ],
            //   alignment: AlignmentType.CENTER,
            //   spacing: { after: 400 },
            // }),
            new Paragraph({ spacing: { before: 3000 } }),
            new Paragraph({
              children: [
                new TextRun({ text: "Risk Summary Report", bold: true, size: 48, color: "#0B3D91" }),
              ],
              spacing: { after: 400 },
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${projectData?.project_name}`, size: 32 }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
        {
          properties: {},
          footers: {
            default: footer,
          },
          children: mainContentParagraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `risk-assessment.docx`);
  };


  ``
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
                onClick={handleDownloadFullDocx}
                disabled={isRiskSummaryLoading || isLoading || isDownloading}
                size="small"
                sx={{
                  textTransform: 'none',
                  // borderColor: '#1976d2',
                  // color: '#1976d2',
                  '&:hover': {
                    // borderColor: '#1565c0',
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
              onClick={()=>{
                markRiskSummaryStart(projectData?.project_id);
                handleRegenerateRiskSummary();
              }}
              disabled={isRiskSummaryLoading || isLoading}
              size="small"
              sx={{
                textTransform: 'none',
                // borderColor: '#1976d2',
                // color: '#1976d2',
                '&:hover': {
                  // borderColor: '#1565c0',
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