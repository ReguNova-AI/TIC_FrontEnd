import React, { useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProjectApiService } from 'services/api/ProjectAPIService';

const FolderOpenLucideIcon = ({ size = 20, color = "currentColor", strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>
  </svg>
);

const FolderLucideIcon = ({ size = 20, color = "currentColor", strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

const FileTextLucideIcon = ({ size = 20, color = "currentColor", strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);
import cardGraphSVG from 'assets/Card_grap.svg';

const DashboardStats = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState({
    total_projects_count: 0,
    total_documents_count: 0,
    active_users: 0, // Placeholder
    inactive_users: 0, // Placeholder
  });

  const getProjectsCounts = () => {
    let payload = {
      user_id: 1, // Will update when auth is connected
    };

    ProjectApiService.projectCounts(payload)
      .then((res) => {
        if (res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching project counts:", err);
      });
  };

  useEffect(() => {
    getProjectsCounts();
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Create New Project Card */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            bgcolor: '#5B0428',
            color: 'white',
            borderRadius: '2px',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '170px',
            boxShadow: '0 4px 10px rgba(91,4,40,0.3)',
          }}
        >
          {/* Faint wavy lines background effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '55%',
              backgroundImage: `url(${cardGraphSVG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1, width: '70%' }}>
            <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 700, mb: 1, color: 'white' }}>
              Create New Project
            </Typography>
            <Typography sx={{ fontSize: '14px', mb: 2, fontWeight: 400, opacity: 0.9 }}>
              Start a new project and upload documents
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/createProject')}
              sx={{
                color: 'white',
                borderColor: 'white',
                borderRadius: '24px',
                textTransform: 'none',
                px: 3,
                py: 0.5,
                fontWeight: 600,
                fontSize: '13px',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              + Create project
            </Button>
          </Box>

          {/* Top Right Folder Icon in White Box */}
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #ffffff 0%, #D5D5D5 100%)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <FolderLucideIcon color="#5B0428" size={20} />
          </Box>
        </Box>
      </Grid>

      {/* Total Projects Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #EBE3D5 0%, #DDD3BE 100%)',
            border: '1px solid #D4C9B4',
            borderRadius: '2px',
            p: 3,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '170px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #8A2D4A 0%, #470119 100%)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <FolderOpenLucideIcon color="white" size={18} />
          </Box>
          <Typography sx={{ color: '#5B0428', fontSize: '38px', fontWeight: 700, lineHeight: 1 }}>
            {data?.total_projects_count || 48}
          </Typography>
          <Typography sx={{ color: '#000000', fontSize: '15px', fontWeight: 600, mt: 1 }}>
            Total Projects
          </Typography>
        </Box>
      </Grid>

      {/* Total Documents Uploads Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #EBE3D5 0%, #DDD3BE 100%)',
            border: '1px solid #D4C9B4',
            borderRadius: '2px',
            p: 3,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '170px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #8A2D4A 0%, #470119 100%)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <FileTextLucideIcon color="white" size={18} />
          </Box>
          <Typography sx={{ color: '#5B0428', fontSize: '38px', fontWeight: 700, lineHeight: 1 }}>
            {data?.total_documents_count || 145}
          </Typography>
          <Typography sx={{ color: '#000000', fontSize: '15px', fontWeight: 600, mt: 1 }}>
            Total Documents Uploaded
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
