import React, { useEffect, useState, useRef } from 'react';
import { Box, Chip, Typography, LinearProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAIAssessment } from '../contexts/AIAssessmentContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTIMATED_DURATION = 180; // seconds
const LS_KEY = (projectId) => `risk_summary_start_${projectId}`;

// ─── Message resolver ─────────────────────────────────────────────────────────

const getMessage = (elapsed, isRegenerating) => {
  const prefix = isRegenerating ? 'Re-g' : 'G';
   if (elapsed < 10) {
    return isRegenerating ? 'Regenerating risk summary...' : 'Generating risk summary...';
  }
  if (elapsed < 20) {
    return `Analyzing document risks...`;
  }
  if (elapsed < 90) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Approximate waiting — ~${remaining}s remaining`;
  }
  if (elapsed < 100) {
    return 'Halfway there, hang tight!';
  }
  if (elapsed < 110) {
    return 'Feel free to continue your work';
  }
  if (elapsed < 120) {
    return 'Taking a bit longer than usual...';
  }
  if (elapsed < 150) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Approximate waiting — ~${remaining}s remaining`;
  }
  if (elapsed < 180) {
    const remaining = ESTIMATED_DURATION - elapsed;
    return `Wrapping up — done within ~${remaining}s`;
  }
  // 180s+
  return "Taking longer than expected — we'll notify you when done";
};

// ─── Progress value capped at 95 ─────────────────────────────────────────────

const getProgress = (elapsed) => {
  if (elapsed >= ESTIMATED_DURATION) return 95;
  return Math.min(95, (elapsed / ESTIMATED_DURATION) * 100);
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

export const markRiskSummaryStart = (projectId) => {
  if (!projectId) return;
  localStorage.setItem(LS_KEY(projectId), Date.now().toString());
};

export const clearRiskSummaryTimer = (projectId) => {
  if (!projectId) return;
  localStorage.removeItem(LS_KEY(projectId));
};

const getElapsedSeconds = (projectId) => {
  const raw = localStorage.getItem(LS_KEY(projectId));
  if (!raw) return 0;
  return Math.floor((Date.now() - parseInt(raw, 10)) / 1000);
};

// ─── Component ────────────────────────────────────────────────────────────────

const RiskSummaryStatusIndicator = ({
  projectId,
  variant = 'chip',
  size = 'medium',
  isRegenerating = false,
}) => {
  const { getRiskSummaryStatus, isRiskSummaryProcessing } = useAIAssessment();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const isThisProjectProcessing = isRiskSummaryProcessing(projectId);
  const projectStatus = getRiskSummaryStatus(projectId);
  const isDone = projectStatus === 'Completed' || projectStatus === 'Failed';
  
  useEffect(() => {
    if (!projectId) return;

    if (isDone) {
      clearRiskSummaryTimer(projectId);
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (!isThisProjectProcessing) {
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
  }, [projectId, isThisProjectProcessing, isDone]);

  if (!projectId || !isThisProjectProcessing) return null;

  const message = getMessage(elapsed, isRegenerating);
  const progress = getProgress(elapsed);
  const isOverdue = elapsed >= ESTIMATED_DURATION;

  // ── Chip variant ────────────────────────────────────────────────────────────
  const renderChip = () => (
    <Chip
      icon={<AssessmentIcon />}
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {message}
        </Typography>
      }
      color={isOverdue ? 'error' : 'info'}
      variant="filled"
      size={size}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': { fontSize: size === 'small' ? 16 : 20 },
      }}
    />
  );

  // ── Progress variant ────────────────────────────────────────────────────────
  const renderProgress = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 260 }}>
      <AssessmentIcon
        sx={{ fontSize: 16, color: isOverdue ? 'error.main' : 'info.main' }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isOverdue ? 'error' : 'info'}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: isOverdue
              ? 'rgba(211, 47, 47, 0.1)'
              : 'rgba(33, 150, 243, 0.1)',
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isOverdue ? 'error.main' : 'info.main',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  // ── Text variant ────────────────────────────────────────────────────────────
  const renderText = () => (
    <Typography
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontWeight: 600,
        color: isOverdue ? 'error.main' : 'info.main',
      }}
    >
      <AssessmentIcon fontSize="small" />
      {message}
    </Typography>
  );

  switch (variant) {
    case 'progress': return renderProgress();
    case 'text':     return renderText();
    case 'chip':
    default:         return renderChip();
  }
};

export default RiskSummaryStatusIndicator;