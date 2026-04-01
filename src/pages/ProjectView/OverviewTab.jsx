import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import FileStructureView from "./FileStructureView";
import { Pencil, FolderClosed, FileText, RefreshCw, X } from "lucide-react";

const OverviewTab = ({
  projectData,
  handleModalOpen,
  handleRunAIAssessment,
  aiButtonLoading,
  isCompleted,
  onFileUploadSuccess,
}) => {
  const isAssessing = aiButtonLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', pt: 2, pb: 20, px: 2 }}>

      {/* ── Project Desk heading ── */}
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3, fontSize: '20px' }}>
        Project Desk
      </Typography>

      {/* ── Project Details card ── */}
      <Box sx={{ mb: 4, bgcolor: '#fff', p: '20px 24px', border: '1px solid #e4e4e4', borderRadius: '4px' }}>

        {/* Section heading + Edit inline */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
          <Box component="span" sx={{ width: 3, height: 20, bgcolor: '#5B0429', borderRadius: '2px', flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>
            Project Details
          </Typography>
          <Button
            startIcon={<Pencil size={13} />}
            onClick={() => handleModalOpen('Edit')}
            disabled={!isCompleted}
            size="small"
            sx={{
              textTransform: 'none',
              color: isCompleted ? '#5B0429' : '#ccc',
              fontSize: '12px',
              fontWeight: 500,
              padding: 0,
              minWidth: 'auto',
              lineHeight: 1,
              ml: 1,
              '&.Mui-disabled': { color: '#ccc' },
              '&:hover': { color: '#4a0322', bgcolor: 'transparent' },
            }}
          >
            Edit
          </Button>
        </Box>

        {/* Project info grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px 40px' }}>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, mb: 0.5 }}>
              Project Name
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#222' }}>
              {projectData?.project_name || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, mb: 0.5 }}>
              Project Description
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#444', lineHeight: 1.65 }}>
              {projectData?.project_description || '—'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Documents Uploads section ── */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box component="span" sx={{ width: 3, height: 20, bgcolor: '#5B0429', borderRadius: '2px', flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>
            Documents Uploads
          </Typography>
        </Box>

        <FileStructureView
          aiButtonLoading={aiButtonLoading}
          data={projectData}
          onFileUploadSuccess={onFileUploadSuccess}
          disabled={!isCompleted}
          isCompleted={isCompleted}
        />
      </Box>

      {/* ── Project Configuration section ── */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Box component="span" sx={{ width: 3, height: 20, bgcolor: '#5B0429', borderRadius: '2px', flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>
            Project Configuration
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
            disabled={!isCompleted}
            sx={{
              bgcolor: isCompleted ? '#5B0429' : '#f5f5f5',
              color: isCompleted ? '#fff' : '#aaa',
              textTransform: 'none',
              boxShadow: 'none',
              borderRadius: '20px',
              px: 2.5,
              py: 0.75,
              fontSize: '13px',
              fontWeight: 500,
              border: isCompleted ? 'none' : '1px solid #e0e0e0',
              '&:hover': { bgcolor: isCompleted ? '#4a0322' : '#f0f0f0', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: '#f5f5f5', color: '#ccc', borderColor: '#e0e0e0' },
            }}
          >
            Upload project configuration
            <input type="file" hidden accept=".xlsx,.csv" />
          </Button>
          <Button
            variant="outlined"
            startIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
            disabled={!isCompleted}
            sx={{
              borderColor: isCompleted ? '#5B0429' : '#e0e0e0',
              color: isCompleted ? '#5B0429' : '#aaa',
              textTransform: 'none',
              borderRadius: '20px',
              px: 2.5,
              py: 0.75,
              fontSize: '13px',
              fontWeight: 500,
              '&:hover': { borderColor: isCompleted ? '#4a0322' : '#d0d0d0', color: isCompleted ? '#4a0322' : '#888', bgcolor: isCompleted ? 'rgba(91,4,41,0.05)' : 'transparent' },
              '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#ccc' },
            }}
          >
            Download template
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(projectData?.project_configuration || []).map((folder) => (
            <Box
              key={folder.name || folder}
              sx={{
                px: 2,
                py: 1.5,
                border: '1px solid #e4e4e4',
                borderRadius: '4px',
                bgcolor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderClosed color="#5B0429" size={18} />
                <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#222' }}>
                  {folder.name || folder}
                </Typography>
              </Box>
              {isCompleted && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#5B0429' }}>
                    <FileText size={15} color="#5B0429" />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>sheet.xlsx</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: '#666', '&:hover': { color: '#444' } }}>
                    <RefreshCw size={13} />
                    <Typography sx={{ fontSize: '13px' }}>Replace</Typography>
                  </Box>
                  <X size={15} color="#e53935" style={{ cursor: 'pointer' }} />
                </Box>
              )}
            </Box>
          ))}

          {(!projectData?.project_configuration || projectData.project_configuration.length === 0) && (
            <Box sx={{ py: 3, color: '#bbb', fontSize: '13px', textAlign: 'center', fontStyle: 'italic', border: '1px dashed #e4e4e4', borderRadius: '4px', bgcolor: '#fafafa' }}>
              No configuration folders added yet.
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ height: 60 }} />
    </Box>
  );
};

OverviewTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
  handleRunAIAssessment: PropTypes.func.isRequired,
  aiButtonLoading: PropTypes.bool.isRequired,
  onFileUploadSuccess: PropTypes.func,
};

export default OverviewTab;