import React from 'react';
import { Box, Chip, Typography, LinearProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAIAssessment } from '../contexts/AIAssessmentContext';

/**
 * Project-specific Risk Summary Status Indicator Component
 * Shows the current status of Risk Summary regeneration for a specific project
 */
const RiskSummaryStatusIndicator = ({
  projectId, // Required: The project ID to show status for
  variant = 'chip', // 'chip', 'progress', 'text'
  size = 'medium'
}) => {
  const {
    riskSummaryProcessingProjects,
    riskSummaryStatuses,
    getRiskSummaryStatus,
    isRiskSummaryProcessing,
  } = useAIAssessment();

  // Don't render if no projectId provided
  if (!projectId) {
    return null;
  }

  // Check if this specific project is processing
  const isThisProjectProcessing = isRiskSummaryProcessing(projectId);
  const projectStatus = getRiskSummaryStatus(projectId);

  // Don't render if this project is not processing
  if (!isThisProjectProcessing) {
    return null;
  }

  const renderChip = () => (
    <Chip
      icon={<AssessmentIcon />}
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Risk Assessment Generating
        </Typography>
      }
      color="info"
      variant="filled"
      size={size}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        }
      }}
    />
  );

  const renderProgress = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
      <AssessmentIcon color="info" sx={{ fontSize: 16 }} />
      <LinearProgress
        variant="indeterminate"
        color="info"
        sx={{
          height: 4,
          borderRadius: 2,
          flexGrow: 1,
          backgroundColor: 'rgba(33, 150, 243, 0.1)'
        }}
      />
      <Typography variant="caption" sx={{
        fontWeight: 600,
        color: 'info.main',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap'
      }}>
        Generating...
      </Typography>
    </Box>
  );

  const renderText = () => (
    <Typography
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontWeight: 600,
        color: 'info.main'
      }}
    >
      <AssessmentIcon fontSize="small" />
      Risk Assessment Generating
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

export default RiskSummaryStatusIndicator;
