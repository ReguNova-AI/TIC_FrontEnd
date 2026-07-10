import React from 'react';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import { useDataQuery } from '../contexts/DataQueryContext';

/**
 * Project-specific Data Extraction Status Indicator Component
 * Shows the current status of Data Extraction for a specific project
 */
const DataExtractionLoader = ({ 
  projectId, // Required: The project ID to show status for
  variant = 'chip', // 'chip', 'progress', 'text'
  size = 'medium'
}) => {
  const {
    isExtracting,
    extractionStatuses,
    isProjectExtracting,
    getExtractionStatus
  } = useDataQuery();

  // Don't render if no projectId provided
  if (!projectId) {
    return null;
  }

  // Check if this specific project is extracting
  const isThisProjectExtracting = isProjectExtracting(projectId);
  const projectStatus = getExtractionStatus(projectId);

  // Don't render if this project is not extracting
  if (!isThisProjectExtracting) {
    return null;
  }

  const renderChip = () => (
    <Chip
      icon={
        <CircularProgress 
          size={16} 
          sx={{ 
            color: 'white',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
      }
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {projectStatus || 'Extracting Data...'}
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
    <Chip
      icon={
        <CircularProgress 
          size={16} 
          sx={{ 
            color: 'white',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
      }
      label={
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {projectStatus || 'Extracting Data...'}
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

  const renderText = () => (
    <Typography 
      variant="body2" 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontWeight: 600,
        color: 'primary.main'
      }}
    >
      <DataUsageIcon fontSize="small" />
      {projectStatus || 'Extracting Data...'}
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

export default DataExtractionLoader;