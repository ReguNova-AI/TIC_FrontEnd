import React from 'react';
import { Box, Chip, Typography, LinearProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAIAssessment } from '../contexts/AIAssessmentContext';

/**
 * Project-specific AI Assessment Status Indicator Component
 * Shows the current status of AI Assessment processing for a specific project
 */
const AIAssessmentStatusIndicator = ({ 
  projectId, // Required: The project ID to show status for
  variant = 'chip', // 'chip', 'progress', 'text'
  size = 'medium'
}) => {
  const {
    processingProjects,
    projectStatuses,
    getProjectStatus,
    isProjectProcessing,
  } = useAIAssessment();

  // Don't render if no projectId provided
  if (!projectId) {
    return null;
  }

  // Check if this specific project is processing
  const isThisProjectProcessing = isProjectProcessing(projectId);
  const projectStatus = getProjectStatus(projectId);

         // Don't render if this project is not processing
         if (!isThisProjectProcessing) {
           return null;
         }

  const renderChip = () => (
    <Chip
      icon={<AutoAwesomeIcon />}
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          AI Assessment Processing
        </Typography>
      }
      color="warning"
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
      <AutoAwesomeIcon color="warning" sx={{ fontSize: 16 }} />
      <LinearProgress 
        variant="indeterminate" 
        color="warning"
        sx={{ 
          height: 4, 
          borderRadius: 2, 
          flexGrow: 1,
          backgroundColor: 'rgba(255, 152, 0, 0.1)'
        }}
      />
      <Typography variant="caption" sx={{ 
        fontWeight: 600, 
        color: 'warning.main',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap'
      }}>
        Processing...
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
        color: 'warning.main'
      }}
    >
      <AutoAwesomeIcon fontSize="small" />
      AI Assessment Processing
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
