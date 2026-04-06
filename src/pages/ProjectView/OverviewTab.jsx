import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import FileStructureView from "./FileStructureView";
import { Pencil, FolderClosed, FileText, RefreshCw, X } from "lucide-react";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { message, Modal, Progress } from "antd";
import { brand } from "themes/theme/brand";

const OverviewTab = ({
  projectData,
  handleModalOpen,
  handleRunAIAssessment,
  aiButtonLoading,
  isCompleted,
  onFileUploadSuccess,
  updateProjectDetails,
}) => {
  const isAssessing = aiButtonLoading;
  
  // Available at all times except when an assessment is actively running
  const isActionEnabled = !isAssessing;
  const shouldDisable = isAssessing;

  // Configuration upload state
  const [isConfigUploading, setIsConfigUploading] = useState(false);
  const [configUploadProgress, setConfigUploadProgress] = useState(0);
  const [currentConfigFileName, setCurrentConfigFileName] = useState("");
  const [docToReplace, setDocToReplace] = useState(null);
  const replaceInputRef = useRef(null);

  const handleConfigUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsConfigUploading(true);
    setConfigUploadProgress(0);
    setCurrentConfigFileName("");

    let successCount = 0;
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentConfigFileName(file.name);

        // Convert to base64
        const reader = new FileReader();
        const fileDataUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const ext = file.name.split(".").pop();
        const payload = {
          documents: [fileDataUrl],
          folder_name: "", // Empty for configuration files as requested
          isConfig: true,
          project_id: projectData?.project_id,
          type: ext,
        };

        // 1. Upload to storage
        const uploadResponse = await FileUploadApiService.fileUpload(payload, {
          onUploadProgress: (evt) => {
            // Percent within the single file
          },
        });

        const filePath = uploadResponse.data.details?.[0];

        if (filePath) {
          // 2. Create actual document record
          const docPayload = {
            project_id: projectData?.project_id,
            document_name: file.name,
            document_type: "Configuration Document",
            uploaded_by_id: userdetails?.[0]?.user_id,
            uploaded_by_name: userdetails?.[0]?.user_first_name + " " + userdetails?.[0]?.user_last_name,
            folder_name: "",
            document_desc: "",
            file_path: filePath,
            risk_information: { risk_level: " ", mitigation: " " },
            information_extract: { summary: " " },
          };

          await ProjectApiService.createProjectDocument(docPayload);
          successCount++;
        }

        // Update overall progress
        setConfigUploadProgress(((i + 1) / files.length) * 100);
      }

      if (successCount > 0) {
        if (onFileUploadSuccess) onFileUploadSuccess(); // Refresh project data
        message.success(`Successfully uploaded ${successCount} configuration file(s).`);
      }
    } catch (error) {
      console.error("Config upload failed:", error);
      message.error("Failed to upload project configuration.");
    } finally {
      setTimeout(() => {
        setIsConfigUploading(false);
        setConfigUploadProgress(0);
        setCurrentConfigFileName("");
      }, 1500);
      e.target.value = ""; // Clear input
    }
  };

  const handleDeleteConfig = async (doc) => {
    if (!doc.version_id || !doc.document_id) {
      message.error("Document ID not found!");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${doc.document_name}"?`)) {
      try {
        await ProjectApiService.deleteProjectDocument(doc.document_id, doc.version_id);
        message.success("Configuration deleted successfully!");
        if (onFileUploadSuccess) onFileUploadSuccess();
      } catch (error) {
        console.error("Delete failed:", error);
        message.error("Failed to delete configuration.");
      }
    }
  };

  const handleReplaceConfig = (doc) => {
    // We'll store the document being replaced in state
    setDocToReplace(doc);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const onReplaceFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !docToReplace) return;

    setIsConfigUploading(true);
    setCurrentConfigFileName(`Replacing with ${file.name}...`);

    try {
      // 1. Upload new file to storage
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop();
      const uploadPayload = {
        documents: [fileDataUrl],
        folder_name: "",
        isConfig: true,
        project_id: projectData?.project_id,
        type: ext,
      };

      const uploadResponse = await FileUploadApiService.fileUpload(uploadPayload);
      const filePath = uploadResponse.data.details?.[0];

      if (filePath) {
        // 2. Update existing document with new path
        const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
        const updatePayload = {
          project_id: projectData?.project_id,
          document_name: file.name,
          document_type: "Configuration Document",
          uploaded_by_id: userdetails?.[0]?.user_id,
          uploaded_by_name: userdetails?.[0]?.user_first_name + " " + userdetails?.[0]?.user_last_name,
          folder_name: "",
          document_desc: "",
          file_path: filePath,
          risk_information: { risk_level: " ", mitigation: " " },
          information_extract: { summary: " " },
        };

        await ProjectApiService.uploadProjectDocument(updatePayload, docToReplace.version_id);
        message.success("Configuration replaced successfully!");
        if (onFileUploadSuccess) onFileUploadSuccess();
      }
    } catch (error) {
      console.error("Replace failed:", error);
      message.error("Failed to replace configuration.");
    } finally {
      setIsConfigUploading(false);
      setCurrentConfigFileName("");
      setDocToReplace(null);
      e.target.value = "";
    }
  };

  // Filter configuration documents
  const configDocs = (projectData?.project_documents || []).filter(
    (doc) => doc.document_type === "Configuration Document"
  );

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
            disabled={shouldDisable}
            size="small"
            sx={{
              textTransform: 'none',
              color: isActionEnabled ? '#5B0429' : '#ccc',
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
          disabled={shouldDisable}
          isCompleted={isActionEnabled}
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
            disabled={shouldDisable}
            sx={{
              bgcolor: isActionEnabled ? '#5B0429' : '#f5f5f5',
              color: isActionEnabled ? '#fff' : '#aaa',
              textTransform: 'none',
              boxShadow: 'none',
              borderRadius: '20px',
              px: 2.5,
              py: 0.75,
              fontSize: '13px',
              fontWeight: 500,
              border: isActionEnabled ? 'none' : '1px solid #e0e0e0',
              '&:hover': { bgcolor: isActionEnabled ? '#4a0322' : '#f0f0f0', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: '#f5f5f5', color: '#ccc', borderColor: '#e0e0e0' },
            }}
          >
            Upload project configuration
            <input 
              type="file" 
              hidden 
              multiple 
              accept=".xlsx,.csv" 
              onChange={handleConfigUpload}
              disabled={shouldDisable}
            />
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
            disabled={shouldDisable}
            sx={{
              borderColor: isActionEnabled ? '#5B0429' : '#e0e0e0',
              color: isActionEnabled ? '#5B0429' : '#aaa',
              textTransform: 'none',
              borderRadius: '20px',
              px: 2.5,
              py: 0.75,
              fontSize: '13px',
              fontWeight: 500,
              '&:hover': { borderColor: isActionEnabled ? '#4a0322' : '#d0d0d0', color: isActionEnabled ? '#4a0322' : '#888', bgcolor: isActionEnabled ? 'rgba(91,4,41,0.05)' : 'transparent' },
              '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#ccc' },
            }}
          >
            Download template
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {configDocs.map((doc, index) => (
            <Box
              key={doc.document_id}
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
                  {`Folder ${index + 1}`}
                </Typography>
              </Box>
              {isActionEnabled && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#5B0429' }}>
                    <FileText size={15} color="#5B0429" />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{doc.document_name}</Typography>
                  </Box>
                  <Box 
                    onClick={() => handleReplaceConfig(doc)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: '#666', '&:hover': { color: '#444' } }}
                  >
                    <RefreshCw size={13} />
                    <Typography sx={{ fontSize: '13px' }}>Replace</Typography>
                  </Box>
                  <X 
                    size={15} 
                    color="#e53935" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleDeleteConfig(doc)}
                  />
                </Box>
              )}
            </Box>
          ))}

          <input
            type="file"
            ref={replaceInputRef}
            onChange={onReplaceFileChange}
            style={{ display: "none" }}
            accept=".xlsx,.csv"
          />

          {configDocs.length === 0 && (
            <Box sx={{ py: 3, color: '#bbb', fontSize: '13px', textAlign: 'center', fontStyle: 'italic', border: '1px dashed #e4e4e4', borderRadius: '4px', bgcolor: '#fafafa' }}>
              No configuration folders added yet.
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ height: 60 }} />

      {/* Configuration Upload Modal */}
      <Modal
        open={isConfigUploading}
        footer={null}
        closable={false}
        maskClosable={false}
        title="Uploading Project Configuration"
        centered
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            File: {currentConfigFileName}
          </Typography>
          <Progress 
            percent={Math.round(configUploadProgress)} 
            status={configUploadProgress === 100 ? "success" : "active"}
            strokeColor={brand.primary}
          />
        </Box>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Uploading files sequentially to the project storage...
        </Typography>
      </Modal>
    </Box>
  );
};

OverviewTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
  handleRunAIAssessment: PropTypes.func.isRequired,
  aiButtonLoading: PropTypes.bool.isRequired,
  onFileUploadSuccess: PropTypes.func,
  updateProjectDetails: PropTypes.func,
};

export default OverviewTab;