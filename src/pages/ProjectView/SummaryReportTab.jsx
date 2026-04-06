import React, { useState, useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from "prop-types";
import RiskAssessmentTab from "./RiskAssessmentTab";
import DownloadIcon from "@mui/icons-material/Download";
import { useRiskSummaryList } from "./useProjectQueries";
import { ProjectApiService } from "../../services/api/ProjectAPIService";
import { FileBarChart2, Calendar, User, Trash2 } from "lucide-react";
import { PROJECT_QUERY_KEYS } from "./useProjectQueries"; // Will need to invalidate
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

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

// ── Timestamp formatter ───────────────────────────────────────────────────────
const timeAgo = (ts) => {
  if (!ts) return "—";
  const date = new Date(ts > 1e12 ? ts : ts * 1000);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
  return "just now";
};

// ── Report row in history table ───────────────────────────────────────────────
const ReportRow = ({ entry, projectName, isActive, onView, onDownload, isDownloading, onDelete, isDeleting }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        border: "1px solid #eaeaea",
        borderRadius: "6px",
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FileBarChart2 size={18} color="#5B0429" strokeWidth={2} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
            {projectName ? `${projectName}-report` : `project-report`}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#999", ml: 1 }}>
            {timeAgo(entry.timestamp)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onView(entry)}
          sx={{
            textTransform: "none",
            fontSize: "13px",
            borderRadius: "30px",
            fontWeight: 500,
            px: 3,
            height: "32px",
            borderColor: "rgba(91,4,41,0.5)",
            color: "#5B0429",
            "&:hover": { borderColor: "#5B0429", bgcolor: "rgba(91,4,41,0.04)" },
          }}
        >
          View
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onDownload(entry)}
          disabled={isDownloading}
          sx={{
            textTransform: "none",
            fontSize: "13px",
            borderRadius: "30px",
            bgcolor: "#5B0429",
            color: "#fff",
            fontWeight: 500,
            px: 3,
            height: "32px",
            boxShadow: "none",
            "&:hover": { bgcolor: "#470119", boxShadow: "none" },
          }}
        >
          {isDownloading ? <CircularProgress size={14} color="inherit" /> : "Download"}
        </Button>
        <IconButton
          size="small"
          onClick={() => onDelete(entry)}
          disabled={isDeleting}
          sx={{
            color: "#d32f2f", // standard error/red color
            bgcolor: "rgba(211,47,47,0.08)",
            borderRadius: "6px",
            height: "32px",
            width: "32px",
            ml: 0.5,
            "&:hover": { bgcolor: "rgba(211,47,47,0.15)" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {isDeleting ? <CircularProgress size={14} color="inherit" /> : <Trash2 size={16} />}
        </IconButton>
      </Box>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SummaryReportTab = ({ projectData, handleRunAIAssessment, aiButtonLoading, isCompleted, currentProgress }) => {
  const queryClient = useQueryClient();
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState(null);
  const [deletingVersionId, setDeletingVersionId] = useState(null);
  const viewerRef = useRef(null);
  const projectId = projectData?.project_id;

  // Step 1: fetch list of all versions using project_id
  // API: GET /risk-summary/{projectId} → { data: { risk_summaries: [...] } }
  const { data: riskSummaries = [], isLoading: isListLoading } = useRiskSummaryList(projectId);

  // Step 2: once list loads, auto-select the latest version (first in sorted-desc list)
  useEffect(() => {
    if (riskSummaries.length > 0 && selectedVersionId === null) {
      setSelectedVersionId(riskSummaries[0].version_id);
    }
  }, [riskSummaries, selectedVersionId]);

  // Annotate each entry with a flag for the latest
  const annotatedList = riskSummaries.map((entry, idx) => ({
    ...entry,
    _isLatest: idx === 0,
  }));

  const handleViewReport = (entry) => {
    setSelectedVersionId(entry.version_id);
    // Scroll to the preview box at the top of the tab
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Download a specific version's DOCX using version_id
  const handleDownloadVersion = async (entry) => {
    if (downloadingVersionId) return;
    setDownloadingVersionId(entry.version_id);
    try {
      const response = await ProjectApiService.downloadRiskSummary(entry.version_id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = entry.doc_path_aws?.split("/").pop() || `risk_report_v${entry.version_id}.docx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingVersionId(null);
    }
  };

  // Delete a specific version's DOCX using version_id
  const handleDeleteVersion = async (entry) => {
    if (deletingVersionId) return;
    setDeletingVersionId(entry.version_id);
    try {
      await ProjectApiService.deleteRiskSummary(entry.version_id);
      message.success("Report deleted successfully");
      
      // If we just deleted the version currently being previewed, select the next available one
      if (selectedVersionId === entry.version_id) {
        const remaining = riskSummaries.filter(e => e.version_id !== entry.version_id);
        if (remaining.length > 0) {
          setSelectedVersionId(remaining[0].version_id);
        } else {
          setSelectedVersionId(null);
        }
      }
      
      // Invalidate the cache to trigger a true refetch
      queryClient.invalidateQueries(PROJECT_QUERY_KEYS.riskSummaryList(projectId));
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete report");
    } finally {
      setDeletingVersionId(null);
    }
  };

  const selectedEntry = riskSummaries.find((e) => e.version_id === selectedVersionId);
  const handleDownloadSelected = () => { if (selectedEntry) handleDownloadVersion(selectedEntry); };
  const isLatestSelected = annotatedList[0]?.version_id === selectedVersionId;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isListLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress size={28} sx={{ color: "#5B0429" }} />
        <Typography sx={{ ml: 2, color: "#666" }}>Loading reports...</Typography>
      </Box>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (riskSummaries.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center", bgcolor: "#fafafa", border: "1px dashed #e0e0e0", borderRadius: "4px" }}>
        <FileBarChart2 size={36} color="#d0d0d0" />
        <Typography sx={{ color: "#bfbfbf", fontSize: "14px", mt: 1.5 }}>
          No assessment reports found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {/* ── Report Preview ──────────────────────────────────────── */}
      <Box>
        <SectionHeading
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={
                downloadingVersionId === selectedVersionId
                  ? <CircularProgress size={14} color="inherit" />
                  : <DownloadIcon sx={{ fontSize: 15 }} />
              }
              disabled={!selectedVersionId || !!downloadingVersionId}
              onClick={handleDownloadSelected}
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
          {isLatestSelected
            ? "Latest Report"
            : `Historical Report — Version ${selectedVersionId}`}
        </SectionHeading>

        <Box
          ref={viewerRef}
          className="latest-report-preview"
          sx={{
            border: "1px solid #e8e8e8",
            borderRadius: "4px",
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            minHeight: "300px",
          }}
        >
          {/*
            Pass versionId AND docPath from the already-fetched list.
            This avoids a redundant GET /risk-summary/{versionId} call
            and prevents the "No Risk Summary available" state.
          */}
          <RiskAssessmentTab
            projectData={projectData}
            versionId={selectedVersionId}
            docPath={selectedEntry?.doc_path_aws}
          />
        </Box>
      </Box>

      {/* ── Version History Table ─────────────────────────────────── */}
      {annotatedList.length > 1 && (
        <Box>
          <SectionHeading>Previously assessed reports</SectionHeading>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {annotatedList.slice(1).map((entry) => (
              <ReportRow
                key={entry.version_id}
                entry={entry}
                projectName={projectData?.project_name}
                isActive={entry.version_id === selectedVersionId}
                onView={handleViewReport}
                onDownload={handleDownloadVersion}
                isDownloading={downloadingVersionId === entry.version_id}
                onDelete={handleDeleteVersion}
                isDeleting={deletingVersionId === entry.version_id}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

SummaryReportTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  handleRunAIAssessment: PropTypes.func,
  aiButtonLoading: PropTypes.bool,
  isCompleted: PropTypes.bool,
  currentProgress: PropTypes.number,
};

export default SummaryReportTab;