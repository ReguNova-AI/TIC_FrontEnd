import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAIAssessment } from '../contexts/AIAssessmentContext';

// ─── Constants ───────────────────────────────────────────────────────────────

export const ESTIMATED_DURATION = 120; // seconds
const LS_KEY = (projectId) => `ai_assessment_start_${projectId}`;

// ─── Message resolver ─────────────────────────────────────────────────────────

const getMessage = (elapsed) => {
  if (elapsed < 10) {
    return 'AI Assessment in progress...';
  }
  if (elapsed < 20) {
    return 'Usually takes less than 3 mins';
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

// ─── Progress value (0–100) capped at 95 so bar never fully fills ────────────

const getProgress = (elapsed) => {
  if (elapsed >= ESTIMATED_DURATION) return 95;
  return Math.min(95, (elapsed / ESTIMATED_DURATION) * 100);
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

export const markAssessmentStart = (projectId) => {
  if (!projectId) return;
  localStorage.setItem(LS_KEY(projectId), Date.now().toString());
};

export const clearAssessmentTimer = (projectId) => {
  if (!projectId) return;
  localStorage.removeItem(LS_KEY(projectId));
};

export const getElapsedSeconds = (projectId) => {
  const raw = localStorage.getItem(LS_KEY(projectId));
  if (!raw) return 0;
  return Math.floor((Date.now() - parseInt(raw, 10)) / 1000);
};

// ─── Component ────────────────────────────────────────────────────────────────

const AIAssessmentStatusIndicator = ({
  projectId,
  isLoading,
  backendStatus,
  variant = 'chip',
  size = 'medium',
}) => {
  const { isProjectProcessing } = useAIAssessment();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  // Determine if this project is actively processing
  const isThisProjectProcessing =
    typeof isLoading === 'boolean'
      ? isLoading
      : backendStatus?.toLowerCase() === 'processing'
        ? true
        : isProjectProcessing(projectId);


  useEffect(() => {
    if (!projectId) return;

    if (!isThisProjectProcessing) {
      // Assessment finished — clear localStorage and stop ticker
      clearAssessmentTimer(projectId);
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Seed elapsed from localStorage so refresh-safe
    const initial = getElapsedSeconds(projectId);
    setElapsed(initial);

    intervalRef.current = setInterval(() => {
      setElapsed(getElapsedSeconds(projectId));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [projectId, isThisProjectProcessing]);

  if (!projectId || !isThisProjectProcessing) return null;

  const message = getMessage(elapsed);
  const progress = getProgress(elapsed);
  const isOverdue = elapsed >= ESTIMATED_DURATION;

  // ── Chip variant ────────────────────────────────────────────────────────────
  const renderChip = () => (
    <Chip
      icon={<AutoAwesomeIcon />}
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {message}
        </Typography>
      }
      color={isOverdue ? 'error' : 'warning'}
      variant="filled"
      size={size}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        },
      }}
    />
  );

  // ── Progress variant ────────────────────────────────────────────────────────
  const renderProgress = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 260 }}>
      <AutoAwesomeIcon
        sx={{ fontSize: 16, color: isOverdue ? 'error.main' : 'warning.main' }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isOverdue ? 'error' : 'warning'}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: isOverdue
              ? 'rgba(211, 47, 47, 0.1)'
              : 'rgba(255, 152, 0, 0.1)',
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isOverdue ? 'error.main' : 'warning.main',
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
        color: isOverdue ? 'error.main' : 'warning.main',
      }}
    >
      <AutoAwesomeIcon fontSize="small" />
      {message}
    </Typography>
  );

  switch (variant) {
    case 'progress':
      return renderProgress();
    case 'text':
      return renderText();
    case 'chip':
    default:
      return renderChip();
  }
};

export default AIAssessmentStatusIndicator;
