import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BreadcrumbsView from "components/Breadcrumbs";
import { brand } from "themes/theme/brand";
import { useProjectCreation } from "./ProjectCreationContext";
import ProjectDetailsStep from "./ProjectDetailsStep";
import UploadDocumentsStep from "./UploadDocumentsStep";
import ProjectConfigurationStep from "./ProjectConfigurationStep";
import MasterContractStep from "./MasterContractStep";
import ReviewAssessStep from "./ReviewAssessStep";
import { useNavigate } from "react-router-dom";
import { Spin, Modal, Progress, Typography as AntTypography } from "antd";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import FilePdfOutlined from "@ant-design/icons/FilePdfOutlined";

import FileWordOutlined from "@ant-design/icons/FileWordOutlined";
import FileExcelOutlined from "@ant-design/icons/FileExcelOutlined";
import FileTextOutlined from "@ant-design/icons/FileTextOutlined";
import FileImageOutlined from "@ant-design/icons/FileImageOutlined";
import FileUnknownOutlined from "@ant-design/icons/FileUnknownOutlined";

// ---- File icon helper (matches FileStructureView) ----
const getFileIcon = (filename) => {
  if (!filename) return <FileUnknownOutlined style={{ color: "#595959", fontSize: 24 }} />;
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#cf1322", fontSize: 24 }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#1890ff", fontSize: 24 }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileImageOutlined style={{ color: "#fa8c16", fontSize: 24 }} />;
    case "txt":
      return <FileTextOutlined style={{ color: "#722ed1", fontSize: 24 }} />;
    default:
      return <FilePdfOutlined style={{ color: "#cf1322", fontSize: 24 }} />;
  }
};

// ---- Step labels ----
const STEPS = [
  "Project Details",
  "Upload Documents",
  "Master Contract",
  "Project Configuration",
  "Review & Assess",
];

// ---- Inline step icon (circle with number or checkmark) ----
const StepCircle = ({ index, activeStep }) => {
  const isCompleted = index < activeStep;
  const isActive = index === activeStep;

  const circleStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
    transition: "all 0.3s ease",
    ...(isCompleted && { backgroundColor: "#009688", color: "#fff" }),
    ...(isActive && { backgroundColor: "#00BCD4", color: "#fff" }),
    ...(!isActive && !isCompleted && {
      backgroundColor: "#fff",
      color: "#262626",
      border: "2px solid #bdbdbd",
    }),
  };

  return (
    <Box sx={circleStyles}>
      {isCompleted ? <CheckIcon sx={{ fontSize: 20 }} /> : index + 1}
    </Box>
  );
};

// ---- Main Wizard Component ----
const ProjectCreationWizard = () => {
  const navigate = useNavigate();
  const {
    activeStep,
    handleNext,
    handleBack,
    snackData,
    setSnackData,
    submitLoading,
    loading,
    handleSubmit,
    isUploading,
    isCreatingProject,
    // Validation data
    projectName,
    projectDesc,
    folders,
    // Upload modal state
    uploadModalOpen,
    uploadingFile,
    uploadProgress,
    uploadSuccess,
    uploadType,
    // Multiple upload state
    isUploadingMultiple,
    multipleUploadProgress,
    currentFileProgress,
    currentFileName,
    uploadedFilesCount,
    totalFilesCount,
    uploadingFilesList,
  } = useProjectCreation();

  // ---- Per-step validation ----
  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: {
        if (!projectName.trim()) {
          setSnackData({
            show: true,
            message: "Project Name is required.",
            type: "error",
          });
          return false;
        }
        if (projectName.length > 50) {
          setSnackData({
            show: true,
            message: "Project Name must be 50 characters or less.",
            type: "error",
          });
          return false;
        }
        if (!projectDesc.trim()) {
          setSnackData({
            show: true,
            message: "Project Description is required.",
            type: "error",
          });
          return false;
        }
        return true;
      }
      case 1: {
        if (folders.length === 0) {
          setSnackData({
            show: true,
            message: "Please create at least one folder.",
            type: "error",
          });
          return false;
        }
        // Count all files including Excel files
        const hasFiles = folders.some((f) => f.files.length > 0);
        if (!hasFiles) {
          setSnackData({
            show: true,
            message: "Please upload at least one file.",
            type: "error",
          });
          return false;
        }
        // Check for empty folders
        const emptyFolders = folders.filter((f) => f.files.length === 0);
        if (emptyFolders.length > 0) {
          setSnackData({
            show: true,
            message: `Please add at least one file to: ${emptyFolders.map((f) => f.name).join(", ")}`,
            type: "error",
          });
          return false;
        }
        // Check for files still uploading (no path yet)
        const uploadingFiles = folders.flatMap((f) =>
          f.files
            .filter((fi) => !fi.path)
            .map((fi) => ({ folder: f.name, file: fi.name }))
        );
        if (uploadingFiles.length > 0) {
          setSnackData({
            show: true,
            message: `Please wait for files to finish uploading: ${uploadingFiles.map((u) => u.file).join(", ")}`,
            type: "error",
          });
          return false;
        }
        return true;
      }
      case 2:
        // Master Contract step is optional
        return true;
      case 3:
        // Config step is optional
        return true;
      default:
        return true;
    }
  };

  const onNextClick = () => {
    if (validateCurrentStep()) {
      handleNext();
    }
  };

  const onCancelClick = () => {
    navigate("/dashboard");
  };

  const onRunAssessment = () => {
    handleSubmit("In Progress");
  };

  // ---- Render active step ----
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ProjectDetailsStep />;
      case 1:
        return <UploadDocumentsStep />;
      case 2:
        return <MasterContractStep />;
      case 3:
        return <ProjectConfigurationStep />;
      case 4:
        return <ReviewAssessStep />;
      default:
        return null;
    }
  };

  return (
    <>
      <BreadcrumbsView currentPage="Create Project" />
      <Spin tip="Processing..." size="large" spinning={loading || submitLoading || isCreatingProject}>
        <Box sx={{ maxWidth: "1200px", margin: "auto", pb: 4 }}>
          {/* ---- Header Section (Separate Card) ---- */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryHover} 100%)`,
              px: 4,
              py: 3,
              color: "#fff",
              boxShadow: "0px 6px 6.1px 0px #BD9BA9",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Create New Project
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Start a new project and upload documents
            </Typography>
          </Box>

          {/* ---- Stepper Section (Separate Card) ---- */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            {STEPS.map((label, index) => (
              <React.Fragment key={label}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                  <StepCircle index={index} activeStep={activeStep} />
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: index === activeStep ? 600 : 400,
                        color: index <= activeStep ? "#262626" : "#8c8c8c",
                        whiteSpace: "nowrap",
                        fontSize: "0.875rem",
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Box>
                {index < STEPS.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      borderTop: "1px solid #e0e0e0",
                      mx: 3,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* ---- Content Section (Separate Card) ---- */}
          <Box
            sx={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Step title bar with left maroon accent */}
            <Box sx={{ px: 4, py: 3, borderBottom: "1px solid #f0f0f0" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#262626",
                  borderLeft: `3px solid ${brand.primary}`,
                  pl: 2,
                  lineHeight: 1.2,
                }}
              >
                {STEPS[activeStep]}
              </Typography>
            </Box>

            {/* Step body */}
            <Box sx={{ px: 4, py: 4, }}>
              {renderStepContent()}
            </Box>

            {/* ---- Footer Buttons (Integrated in Content Card) ---- */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 2,
                px: 4,
                py: 2.5,
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#fafafa",
              }}
            >
              {activeStep === 0 && (
                <Button
                  variant="outlined"
                  onClick={onCancelClick}
                  sx={{
                    textTransform: "none",
                    borderColor: brand.primary,
                    color: brand.primary,
                    borderRadius: "24px",
                    px: 3,
                    "&:hover": {
                      borderColor: brand.primary,
                      backgroundColor: `${brand.primary}0a`,
                    },
                  }}
                >
                  Cancel
                </Button>
              )}

              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    textTransform: "none",
                    borderColor: brand.primary,
                    color: brand.primary,
                    borderRadius: "24px",
                    px: 3,
                    "&:hover": {
                      borderColor: brand.primary,
                      backgroundColor: `${brand.primary}0a`,
                    },
                  }}
                >
                  Back
                </Button>
              )}

              {activeStep < 4 && (
                <Button
                  variant="contained"
                  onClick={onNextClick}
                  disabled={(activeStep === 1 && isUploading()) || isCreatingProject}
                  sx={{
                    textTransform: "none",
                    backgroundColor: brand.primary,
                    borderRadius: "24px",
                    px: 4,
                    "&:hover": { backgroundColor: brand.primaryHover },
                  }}
                >
                  {isCreatingProject ? "Creating Project..." : "Next"}
                </Button>
              )}

              {activeStep === 4 && (
                <Button
                  variant="contained"
                  onClick={onRunAssessment}
                  disabled={submitLoading}
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    textTransform: "none",
                    background: `linear-gradient(90deg, ${brand.primary} 0%, #00689C 100%)`,
                    borderRadius: "100px",
                    minWidth: 204,
                    height: 44,
                    px: "24px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.1px",
                    "&:hover": {
                      background: `linear-gradient(90deg, ${brand.primaryHover} 0%, #0080b8 100%)`,
                    },
                  }}
                >
                  Run AI Assessment
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Spin>

      {/* ---- Snackbar ---- */}
      <Snackbar
        style={{ top: "80px" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={3000}
        onClose={() => setSnackData({ show: false })}
      >
        <Alert
          onClose={() => setSnackData({ show: false })}
          severity={snackData.type}
        >
          {snackData.message}
        </Alert>
      </Snackbar>

      {/* ---- Upload Progress Modal ---- */}
      <Modal
        open={uploadModalOpen}
        footer={null}
        onCancel={() => {
          if (!isUploadingMultiple) setUploadModalOpen(false);
        }}
        closable={!isUploadingMultiple}
        maskClosable={!isUploadingMultiple}
        title={
          isUploadingMultiple
            ? uploadType === "configuration"
              ? "Uploading Multiple Configurations"
              : "Uploading Multiple Files"
            : uploadType === "configuration"
              ? "Uploading Configuration"
              : "Uploading Document"
        }
        centered
      >
        <div>
          {/* Overall progress */}
          <div style={{ marginBottom: 16 }}>
            <AntTypography.Text strong>
              Uploading {uploadedFilesCount} of {totalFilesCount || 1} files
            </AntTypography.Text>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              Progress: {Math.round(isUploadingMultiple ? multipleUploadProgress : uploadProgress)}% complete
            </div>
          </div>
          <Progress
            percent={Math.round(isUploadingMultiple ? multipleUploadProgress : uploadProgress)}
            status={(isUploadingMultiple ? multipleUploadProgress : uploadProgress) === 100 ? "success" : "active"}
            format={(percent) => `${percent}%`}
            strokeColor={{
              "0%": "#ffffff",
              "100%": brand.primary,
            }}
          />

          {/* Current file progress card */}
          {(currentFileName || uploadingFile?.name) && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 12px",
                backgroundColor: "#fafafa",
                border: "1px solid #f0f0f0",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                {getFileIcon(currentFileName || uploadingFile?.name)}
                <AntTypography.Text ellipsis style={{ flex: 1, fontSize: 13 }}>
                  {currentFileName || uploadingFile?.name}
                </AntTypography.Text>
                <AntTypography.Text type="secondary" style={{ fontSize: 12 }}>
                  {isUploadingMultiple ? currentFileProgress : uploadProgress}%
                </AntTypography.Text>
              </div>
              <Progress
                percent={isUploadingMultiple ? currentFileProgress : uploadProgress}
                size="small"
                showInfo={false}
                status={(isUploadingMultiple ? currentFileProgress : uploadProgress) === 100 ? "success" : "active"}
                strokeColor={brand.primary}
              />
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Files will be uploaded to the selected folder
          </div>
          {((isUploadingMultiple && uploadedFilesCount === totalFilesCount && totalFilesCount > 0) ||
            (!isUploadingMultiple && uploadSuccess)) && (
            <div
              style={{
                marginTop: 12,
                padding: 8,
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 4,
              }}
            >
              <AntTypography.Text style={{ color: "#52c41a", fontSize: 12 }}>
                ✅ Upload completed!
              </AntTypography.Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ProjectCreationWizard;
