import React, { useEffect, useState, useRef } from "react";
import { Box, Chip, Typography, CircularProgress } from "@mui/material";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import { useDataQuery } from "../contexts/DataQueryContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTIMATED_DURATION = 90; // seconds (midpoint of 1–2 min range)
const LS_KEY = (projectId) => `data_extraction_start_${projectId}`;

// ─── Message resolver ─────────────────────────────────────────────────────────

const getMessage = (elapsed) => {
  if (elapsed < 5) {
    return "Extracting data...";
  }
  if (elapsed < 10) {
    return `Scanning document parameters...`;
  }
  if (elapsed < 45) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Approximate waiting — ~${remaining}s remaining`;
  }
  if (elapsed < 50) {
    return "Halfway there, hang tight!";
  }
  if (elapsed < 55) {
    return "Feel free to continue your work";
  }
  if (elapsed < 60) {
    return "Taking a bit longer than usual...";
  }
  if (elapsed < 75) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Approximate waiting — ~${remaining}s remaining`;
  }
  if (elapsed < 85) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Wrapping up — done within ~${remaining}s`;
  }
  if (elapsed < 90) {
    return `Finalizing extraction, hang tight!`;
  }
  return "Taking longer than expected — we'll notify you when done";
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

export const markExtractionStart = (projectId) => {
  if (!projectId) return;
  localStorage.setItem(LS_KEY(projectId), Date.now().toString());
};

export const clearExtractionTimer = (projectId) => {
  if (!projectId) return;
  localStorage.removeItem(LS_KEY(projectId));
};

const getElapsedSeconds = (projectId) => {
  const raw = localStorage.getItem(LS_KEY(projectId));
  if (!raw) return 0;
  return Math.floor((Date.now() - parseInt(raw, 10)) / 1000);
};

/**
 * Project-specific Data Extraction Status Indicator Component
 * Shows the current status of Data Extraction for a specific project
 */
const DataExtractionLoader_Timer = ({
  projectId, // Required: The project ID to show status for
  variant = "chip", // 'chip', 'progress', 'text'
  size = "medium",
}) => {
  const { isProjectExtracting } = useDataQuery();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  // Check if this specific project is extracting
   const isThisProjectExtracting = projectId ? isProjectExtracting(projectId) : false;

  useEffect(() => {
    if (!projectId || !isThisProjectExtracting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Seed from localStorage — survives refresh
    const initial = getElapsedSeconds(projectId);
    setElapsed(initial);

    intervalRef.current = setInterval(() => {
      setElapsed(getElapsedSeconds(projectId));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [projectId, isThisProjectExtracting]);

  // Don't render if this project is not extracting
  if (!projectId || !isThisProjectExtracting) return null;
  const message = getMessage(elapsed);

  const renderChip = () => (
    <Chip
      icon={
        <CircularProgress
          size={16}
          sx={{
            color: "white",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      }
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {message}
        </Typography>
      }
      color="info"
      variant="filled"
      size={size}
      sx={{
        fontWeight: 600,
        "& .MuiChip-icon": {
          fontSize: size === "small" ? 16 : 20,
        },
      }}
    />
  );

  const renderProgress = () => (
    <Chip
      icon={
        <CircularProgress
          size={16}
          sx={{
            color: "white",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      }
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {message}
        </Typography>
      }
      color="info"
      variant="filled"
      size={size}
      sx={{
        fontWeight: 600,
        "& .MuiChip-icon": {
          fontSize: size === "small" ? 16 : 20,
        },
      }}
    />
  );

  const renderText = () => (
    <Typography
      variant="body2"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontWeight: 600,
        color: "primary.main",
      }}
    >
      <DataUsageIcon fontSize="small" />
      {message}
    </Typography>
  );

  switch (variant) {
    case "progress":
      return renderProgress();
    case "text":
      return renderText();
    case "chip":
    default:
      return renderChip();
  }
};

export default DataExtractionLoader_Timer;
