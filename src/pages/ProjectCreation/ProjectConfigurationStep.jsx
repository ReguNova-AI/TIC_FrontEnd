import { brand } from "themes/theme/brand";
import React, { useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SyncIcon from "@mui/icons-material/Sync";
import { useProjectCreation } from "./ProjectCreationContext";

const ProjectConfigurationStep = () => {
  const { folders, configFiles, setConfigFileForFolder, removeConfigFileForFolder } = useProjectCreation();
  const fileInputRefs = useRef({});
  const globalFileInputRef = useRef(null);

  // Handle global config upload (applies to all folders)
  const handleGlobalUpload = () => {
    globalFileInputRef.current?.click();
  };

  const onGlobalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && folders.length > 0) {
      // Upload as global config (no specific folder)
      setConfigFileForFolder(null, file, true);
    }
    e.target.value = "";
  };

  // Handle per-folder config upload
  const handleFolderUpload = (folderId) => {
    fileInputRefs.current[folderId]?.click();
  };

  const onFolderFileChange = (folderId) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload for specific folder
      setConfigFileForFolder(folderId, file, false);
    }
    e.target.value = "";
  };

  // Handle delete config for a folder
  const handleDeleteConfig = (folderId) => {
    removeConfigFileForFolder(folderId);
  };

  // Download template (placeholder)
  const handleDownloadTemplate = () => {
    // TODO: Replace with actual template download endpoint
    const link = document.createElement("a");
    link.href = "#";
    link.download = "project_configuration_template.xlsx";
    link.click();
  };

  return (
    <Box>
      {/* ---- Action buttons ---- */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={handleGlobalUpload}
          sx={{
            textTransform: "none",
            backgroundColor: brand.primary,
            borderRadius: "20px",
            "&:hover": { backgroundColor: brand.primaryHover },
          }}
        >
          Upload project configuration
        </Button>
        <input
          ref={globalFileInputRef}
          type="file"
          hidden
          accept=".xlsx,.csv,.xls"
          onChange={onGlobalFileChange}
        />

        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleDownloadTemplate}
          sx={{
            textTransform: "none",
            borderColor: brand.primary,
            color: brand.primary,
            borderRadius: "20px",
            "&:hover": {
              borderColor: brand.primary,
              backgroundColor: "rgba(91,4,41,0.04)",
            },
          }}
        >
          Download Template
        </Button>
      </Box>

      {/* ---- Folder list (simple rows per mockup UL6) ---- */}
      {folders.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            border: "2px dashed #e8e8e8",
            borderRadius: "8px",
          }}
        >
          <Typography variant="body2" sx={{ color: "#8c8c8c" }}>
            No folders available. Go back to Step 2 to create folders.
          </Typography>
        </Box>
      ) : (
        <Box>
          {folders.map((folder, index) => {
            const config = configFiles[folder.id];
            const hasConfig = !!config;

            return (
              <Box
                key={folder.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2.5,
                  py: 1.5,
                  borderRadius: "6px",
                  border: "1px solid #f0f0f0",
                  mb: 1.5,
                  backgroundColor: "#fafafa",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  transition: "background-color 0.15s",
                }}
              >
                {/* Folder icon + name */}
                <FolderOutlinedIcon sx={{ color: brand.primary, mr: 1.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {folder.name}
                </Typography>

                {/* File count */}
                <Typography
                  variant="body2"
                  sx={{ color: "#8c8c8c", mr: 3 }}
                >
                  {folder.files.length} file{folder.files.length !== 1 ? "s" : ""}
                </Typography>

                {/* Config file display or Upload button */}
                {hasConfig ? (
                  <>
                    {/* Config file name with grid icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mr: 2,
                      }}
                    >
                      <GridOnOutlinedIcon
                        sx={{ fontSize: 18, color: brand.primary }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#262626", fontWeight: 500 }}
                      >
                        {config.name}
                      </Typography>
                    </Box>

                    {/* Replace button */}
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleFolderUpload(folder.id)}
                      sx={{
                        textTransform: "none",
                        color: brand.primary,
                        fontWeight: 500,
                        mr: 1,
                        "&:hover": { backgroundColor: "rgba(91,4,41,0.04)" },
                      }}
                    >
                      Replace
                    </Button>

                    {/* Delete button */}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteConfig(folder.id)}
                      sx={{
                        color: "#8c8c8c",
                        "&:hover": { color: "#ff4d4f", backgroundColor: "rgba(255,77,79,0.04)" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </>
                ) : (
                  /* Upload for this folder button */
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => handleFolderUpload(folder.id)}
                    sx={{
                      textTransform: "none",
                      color: brand.primary,
                      fontWeight: 500,
                      "&:hover": { backgroundColor: "rgba(91,4,41,0.04)" },
                    }}
                  >
                    Upload for this folder
                  </Button>
                )}
                <input
                  ref={(el) => (fileInputRefs.current[folder.id] = el)}
                  type="file"
                  hidden
                  accept=".xlsx,.csv,.xls"
                  onChange={onFolderFileChange(folder.id)}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ProjectConfigurationStep;
