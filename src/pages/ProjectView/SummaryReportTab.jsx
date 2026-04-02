import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PropTypes from "prop-types";
import RiskAssessmentTab from "./RiskAssessmentTab";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useRiskSummary } from "./useProjectQueries";
import { apiPath } from "../../config";
import { FileBarChart2, User, Clock, Info } from "lucide-react";
import { Modal, Divider } from "antd";

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ children, action }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 3, height: 20, bgcolor: "#5B0429", borderRadius: "2px", flexShrink: 0 }} />
      <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>
        {children}
      </Typography>
    </Box>
    {action}
  </Box>
);

// ── Simple Relative Time Helper ──────────────────────────────────────────────
const getRelativeTimeString = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Previously assessed report row ────────────────────────────────────────────
const ReportRow = ({ entry, onDownload, onView }) => {
  const label =
    entry?.changes?.riskSummaryRun ||
    entry?.changes?.assessmentRun ||
    entry?.changes?.checklistRun ||
    "Assessment Report";

  // Use the project name if available, or fallback
  const reportName = typeof label === "string" ? label.toLowerCase().replace(/\s+/g, '-') : "project-report";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #f0f0f0",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: "#fafafa" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FileBarChart2 size={24} color="#5B0428" strokeWidth={2} />
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
            {reportName}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#8c8c8c", mt: 0.1 }}>
            {getRelativeTimeString(entry?.date)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => onView && onView(entry)}
          sx={{
            textTransform: "none",
            fontSize: "12px",
            borderRadius: "20px",
            borderColor: "#d9d9d9",
            color: "#595959",
            fontWeight: 600,
            px: 2,
            height: "32px",
            "&:hover": { borderColor: "#5B0429", color: "#5B0428", bgcolor: "transparent" },
          }}
        >
          View
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
          onClick={() => onDownload && onDownload(entry)}
          sx={{
            textTransform: "none",
            fontSize: "12px",
            borderRadius: "20px",
            bgcolor: "#5B0428",
            color: "#fff",
            fontWeight: 600,
            px: 2,
            height: "32px",
            boxShadow: "none",
            "&:hover": { bgcolor: "#470119", boxShadow: "none" },
          }}
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SummaryReportTab = ({ projectData }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projectId = projectData?.project_id;

  // Fetch risk summary for download
  const { data: riskSummary } = useRiskSummary(projectId);

  const handleDownloadReport = () => {
    if (!riskSummary?.doc_path_aws) return;
    const link = document.createElement("a");
    link.href = `${apiPath}/${riskSummary.doc_path_aws}`;
    link.setAttribute("download", riskSummary.doc_path_aws.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const allHistory = projectData?.history || [];
  
  // Use all history entries to ensure no data is hidden, matching previous behavior
  const reportHistory = allHistory;

  const handleViewReport = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const renderEntryDetails = (changes) => {
    if (!changes) return "No details captured.";
    return Object.entries(changes)
      .filter(([key, val]) => val && typeof val === "string")
      .map(([key, val]) => (
        <Box key={key} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#5B0429", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#333", mt: 0.5 }}>
            {val}
          </Typography>
        </Box>
      ));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      
      {/* ── Latest Report ──────────────────────────────────────── */}
      <Box>
        <SectionHeading
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
              disabled={!riskSummary?.doc_path_aws}
              onClick={handleDownloadReport}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                borderRadius: "4px",
                bgcolor: "#5B0428",
                color: "#fff",
                fontWeight: 600,
                px: 2.5,
                py: 0.8,
                boxShadow: "none",
                "&:hover": { bgcolor: "#470119", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#f0f0f0", color: "#bfbfbf" },
              }}
            >
              Download full report
            </Button>
          }
        >
          Latest Report
        </SectionHeading>

        {/* Blue-bordered risk summary preview */}
        <Box
          sx={{
            border: "1px solid #e8e8e8",
            borderRadius: "4px",
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}
        >
          <RiskAssessmentTab projectData={projectData} />
        </Box>
      </Box>

      {/* ── Previously assessed reports ─────────────────────────── */}
      {/* 
      <Box>
        <SectionHeading>Previously assessed reports</SectionHeading>

        {reportHistory.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              bgcolor: "#fafafa",
              border: "1px dashed #d9d9d9",
              borderRadius: "4px",
            }}
          >
            <Typography sx={{ color: "#bfbfbf", fontSize: "14px" }}>
              No previously assessed reports found.
            </Typography>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              border: "1px solid #f0f0f0",
              borderRadius: "4px",
              bgcolor: "#fff"
            }}
          >
            {reportHistory.map((entry, idx) => (
              <ReportRow
                key={idx}
                entry={entry}
                onDownload={handleDownloadReport}
                onView={handleViewReport}
              />
            ))}
          </Box>
        )}
      </Box>
      */}

      {/* ── Report History Details Modal ───────────────────────── */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
        centered
        bodyStyle={{ padding: 0 }}
        zIndex={9999}
      >
        <Box sx={{ p: 0 }}>
          {/* Modal Header */}
          <Box sx={{ 
            bgcolor: "#5B0429", 
            p: 3, 
            color: "#fff", 
            borderTopLeftRadius: "8px", 
            borderTopRightRadius: "8px" 
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <FileBarChart2 size={24} color="#fff" />
              <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                Report History Details
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", opacity: 0.8 }}>
              {selectedEntry?.changes?.assessmentRun || "Assessment run logs and metadata"}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Metadata Section */}
            <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <User size={16} color="#8c8c8c" />
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#8c8c8c", fontWeight: 600 }}>GENERATED BY</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{selectedEntry?.changedby || "System"}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Clock size={16} color="#8c8c8c" />
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#8c8c8c", fontWeight: 600 }}>TIMESTAMP</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{new Date(selectedEntry?.date).toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider style={{ margin: "24px 0" }} />

            {/* Content Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Info size={16} color="#5B0429" />
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                Log Data
              </Typography>
            </Box>
            
            <Box sx={{ 
              bgcolor: "#fcfcfc", 
              p: 2.5, 
              border: "1px solid #f0f0f0", 
              borderRadius: "4px" 
            }}>
              {renderEntryDetails(selectedEntry?.changes)}
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                onClick={() => setIsModalOpen(false)}
                sx={{ 
                  bgcolor: "#5B0429", 
                  color: "#fff", 
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#470119" } 
                }}
              >
                Close View
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

SummaryReportTab.propTypes = {
  projectData: PropTypes.object.isRequired,
};

export default SummaryReportTab;