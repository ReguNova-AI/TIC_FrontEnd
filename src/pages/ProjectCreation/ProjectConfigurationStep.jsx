import { brand } from "themes/theme/brand";
import React, { useRef, useState } from "react";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Modal, message } from "antd";
import { useProjectCreation } from "./ProjectCreationContext";

const ProjectConfigurationStep = () => {
  const { folders, configFiles, setConfigFileForFolder, removeConfigFileForFolder } = useProjectCreation();
  const fileInputRefs = useRef({});
  const globalFileInputRef = useRef(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [replacingFolderId, setReplacingFolderId] = useState(null);

  // Auto-expand all folders by default or when new ones are added
  React.useEffect(() => {
    if (folders.length > 0) {
      setExpandedFolders((prev) => {
        const newExpanded = { ...prev };
        folders.forEach((f) => {
          if (newExpanded[f.id] === undefined) {
            newExpanded[f.id] = true;
          }
        });
        return newExpanded;
      });
    }
  }, [folders]);

  // Handle global config upload (applies to all folders)
  const handleGlobalUpload = () => {
    globalFileInputRef.current?.click();
  };

  const onGlobalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && folders.length > 0) {
      // Check if any folder already has a config file
      const hasExistingConfig = folders.some(folder => configFiles[folder.id]);
      // Upload as global config with delete flag if config exists
      setConfigFileForFolder(null, file, true, hasExistingConfig);
    }
    e.target.value = "";
  };

  // Handle per-folder config upload
  const handleFolderUpload = (folderId) => {
    setReplacingFolderId(null);
    fileInputRefs.current[folderId]?.click();
  };

  // Handle replace config - deletes existing first then uploads new
  const handleReplaceConfig = (folderId) => {
    setReplacingFolderId(folderId);
    fileInputRefs.current[folderId]?.click();
  };

  const onFolderFileChange = (folderId) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload for specific folder
      // If this folder was in replace mode, delete existing config first
      const isReplace = replacingFolderId === folderId;
      setConfigFileForFolder(folderId, file, false, isReplace);
    }
    // Reset replacing state
    setReplacingFolderId(null);
    e.target.value = "";
  };

  // Handle delete config with confirmation modal
  const handleDeleteConfig = (folderId, configName) => {
    Modal.confirm({
      title: "Delete Configuration",
      content: `Are you sure you want to delete "${configName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeConfigFileForFolder(folderId);
        } catch (error) {
          console.error("Delete failed:", error);
          message.error("Failed to delete configuration!");
        }
      },
    });
  };

  // Toggle folder expansion
  const toggleFolderExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Download template
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template/config_sample_template.xlsx";
    link.download = "config_sample_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* ---- Folder list with accordion ---- */}
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
          {folders.map((folder) => {
            const config = configFiles[folder.id];
            const hasConfig = !!config;
            const isExpanded = expandedFolders[folder.id];

            return (
              <Accordion
                key={folder.id}
                expanded={isExpanded}
                onChange={() => toggleFolderExpand(folder.id)}
                disableGutters
                sx={{
                  mb: 2,
                  borderRadius: "8px !important",
                  border: "1px solid #e8e8e8",
                  "&::before": { display: "none" },
                  boxShadow: "none",
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#fafafa",
                    px: 2,
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <FolderOutlinedIcon sx={{ color: brand.primary, mr: 1 }} />
                  <Typography sx={{ fontWeight: 600, flex: 1, color: "#262626" }}>
                    {folder.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#8c8c8c", mr: 2 }}
                  >
                    {folder.files.length} file{folder.files.length !== 1 ? "s" : ""}
                  </Typography>

                  {/* Config file indicator (summary view) */}
                  {hasConfig && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mr: 2,
                      }}
                    >
                      <GridOnOutlinedIcon
                        sx={{ fontSize: 16, color: brand.primary }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#262626", fontWeight: 500 }}
                      >
                        {config.name}
                      </Typography>
                    </Box>
                  )}
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                  {/* Config file section */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 2,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#262626" }}
                    >
                      Configuration File:
                    </Typography>

                    {hasConfig ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
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

                        <Button
                          size="small"
                          variant="text"
                          startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleReplaceConfig(folder.id)}
                          sx={{
                            textTransform: "none",
                            color: brand.primary,
                            fontWeight: 500,
                            ml: 2,
                            "&:hover": { backgroundColor: "rgba(91,4,41,0.04)" },
                          }}
                        >
                          Replace
                        </Button>

                        <IconButton
                          size="small"
                          onClick={() => handleDeleteConfig(folder.id, config.name)}
                          sx={{
                            color: "#8c8c8c",
                            "&:hover": { color: "#ff4d4f", backgroundColor: "rgba(255,77,79,0.04)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ) : (
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
                  </Box>

                  <input
                    ref={(el) => (fileInputRefs.current[folder.id] = el)}
                    type="file"
                    hidden
                    accept=".xlsx,.csv,.xls"
                    onChange={onFolderFileChange(folder.id)}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ProjectConfigurationStep;
