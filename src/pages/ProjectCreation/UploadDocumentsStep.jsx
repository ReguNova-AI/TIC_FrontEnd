import React, { useState, useCallback, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import { useDropzone } from "react-dropzone";
import { Modal, message } from "antd";
import { brand } from "themes/theme/brand";
import { useProjectCreation } from "./ProjectCreationContext";
import { useSearchParams } from "react-router-dom";

// ---- Format bytes ----
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ---- Check if file is an Excel/Config file ----
const isExcelFile = (filename) => {
  if (!filename) return false;
  const ext = filename.split(".").pop().toLowerCase();
  return ["xlsx", "xls", "csv"].includes(ext);
};

// ---- DropZone per-folder (matches mockup: cloud icon left, text+browse right) ----
const FolderDropZone = ({ folderId, onFilesAdded }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Accept all files including Excel files - they will be shown in uploaded files section
      if (acceptedFiles.length > 0) {
        onFilesAdded(folderId, acceptedFiles);
      }
    },
    [folderId, onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? brand.primary : brand.primary,
        borderRadius: "8px",
        p: 3,
        display: "flex",
        alignItems: "center",
        gap: 3,
        cursor: "default",
        backgroundColor: isDragActive ? "rgba(91,4,41,0.04)" : "#fff",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "rgba(91,4,41,0.02)",
        },
      }}
    >
      <input {...getInputProps()} />
      {/* Cloud upload icon */}
      <Box
        sx={{
          flexShrink: 0,
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CloudUploadOutlinedIcon
          sx={{ fontSize: 64, color: "#bdbdbd" }}
        />
      </Box>
      {/* Text & browse button */}
      <Box>
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, color: "#262626", mb: 0.5 }}
        >
          Click to upload or drag and drop files here
        </Typography>
        <Typography variant="body2" sx={{ color: "#8c8c8c", mb: 1.5 }}>
          Supported file formats: PDF, DOCX, DOC, TXT, XLSX, XLS, CSV
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          sx={{
            textTransform: "none",
            borderColor: brand.primary,
            color: brand.primary,
            borderRadius: "20px",
            px: 3,
            "&:hover": {
              borderColor: brand.primary,
              backgroundColor: "rgba(91,4,41,0.04)",
            },
          }}
        >
          Browse
        </Button>
      </Box>
    </Box>
  );
};

// ---- Main Step Component ----
const UploadDocumentsStep = () => {
  const {
    folders,
    addFolder,
    removeFolder,
    renameFolder,
    renameFolderInDb,
    addFilesToFolder,
    removeFileFromFolder,
  } = useProjectCreation();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const nameInputRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Auto-expand all folders by default or when new ones are added
  useEffect(() => {
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

  // Auto-create "Folder 1" by default when component initially mounts
  useEffect(() => {
    // Only auto-create if there's no project ID in the URL and no folders exist
    const projectIdInUrl = searchParams.get("projectId");
    if (!projectIdInUrl && folders.length === 0) {
      addFolder("Folder 1", false).then((folder) => {
        if (folder) {
          setExpandedFolders({ [folder.id]: true });
        }
      });
    }
  }, []); // Only run once on mount

  // ---- Create folder ----
  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    
    try {
      const folder = await addFolder(trimmed);
      setExpandedFolders((prev) => ({ ...prev, [folder.id]: true }));
      setNewFolderName("");
      setIsCreatingFolder(false);
      message.success("Folder created successfully!");
    } catch (error) {
      console.error("Folder creation failed:", error);
      message.error("Failed to create folder. Please try again.");
    }
  };

  const handleCancelCreate = () => {
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  // ---- Delete file with confirmation ----
  const handleDeleteFile = (folderId, file) => {
    Modal.confirm({
      title: "Delete Document",
      content: `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeFileFromFolder(folderId, file.id);
          message.success("Document deleted successfully!");
        } catch (error) {
          console.error("Delete failed:", error);
          message.error("Failed to delete document!");
        }
      },
    });
  };

  const handleDeleteFolder = (folder) => {
    Modal.confirm({
      title: "Delete Folder",
      content: `Are you sure you want to delete "${folder.name}" and all its contents? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeFolder(folder.id);
          message.success("Folder deleted successfully!");
        } catch (error) {
          console.error("Folder delete failed:", error);
          message.error("Failed to delete folder!");
        }
      },
    });
  };

  // ---- Rename ----
  const startRename = (folder) => {
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const applyRename = () => {
    if (renameValue.trim()) {
      renameFolder(renamingFolderId, renameValue.trim());
      // Sync rename to database
      renameFolderInDb(renamingFolderId, renameValue.trim());
    }
    setRenamingFolderId(null);
    setRenameValue("");
  };

  // ---- Expand/collapse ----
  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  return (
    <Box>
      {/* ---- Create Folder button (always visible) ---- */}
      <Button
        variant="contained"
        startIcon={<CreateNewFolderOutlinedIcon />}
        onClick={() => setIsCreatingFolder(true)}
        sx={{
          textTransform: "none",
          backgroundColor: brand.primary,
          borderRadius: "20px",
          "&:hover": { backgroundColor: brand.primaryHover },
          mb: isCreatingFolder ? 2 : 3,
        }}
      >
        Create folder
      </Button>

      {/* ---- Create Folder input form (shown below button when active) ---- */}
      {isCreatingFolder && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            p: 2,
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
            backgroundColor: "#fafafa",
          }}
        >
          <FolderOutlinedIcon sx={{ color: brand.primary }} />
          <TextField
            size="small"
            autoFocus
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") handleCancelCreate();
            }}
            inputRef={nameInputRef}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                "&.Mui-focused fieldset": { borderColor: brand.primary },
              },
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
            sx={{
              textTransform: "none",
              backgroundColor: brand.primary,
              "&:hover": { backgroundColor: brand.primaryHover },
              minWidth: 80,
            }}
          >
            Create
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCancelCreate}
            sx={{
              textTransform: "none",
              borderColor: "#d9d9d9",
              color: "#595959",
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* ---- Folders list ---- */}
      {folders.length === 0 && !isCreatingFolder && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            border: "2px dashed #e8e8e8",
            borderRadius: "8px",
          }}
        >
          <CreateNewFolderOutlinedIcon
            sx={{ fontSize: 48, color: "#d9d9d9", mb: 1 }}
          />
          <Typography variant="body2" sx={{ color: "#8c8c8c" }}>
            No folders yet. Click "Create folder" to get started.
          </Typography>
        </Box>
      )}

      {folders.map((folder) => (
        <Accordion
          key={folder.id}
          expanded={expandedFolders[folder.id] ?? false}
          onChange={() => toggleExpand(folder.id)}
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

            {renamingFolderId === folder.id ? (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <TextField
                  size="small"
                  autoFocus
                  placeholder="Enter folder name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyRename();
                    if (e.key === "Escape") setRenamingFolderId(null);
                  }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      "&.Mui-focused fieldset": { borderColor: brand.primary },
                    },
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={applyRename}
                  disabled={!renameValue.trim()}
                  sx={{
                    textTransform: "none",
                    backgroundColor: brand.primary,
                    "&:hover": { backgroundColor: brand.primaryHover },
                    minWidth: 70,
                  }}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setRenamingFolderId(null)}
                  sx={{
                    textTransform: "none",
                    borderColor: "#d9d9d9",
                    color: "#595959",
                  }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <>
                <Typography sx={{ fontWeight: 600, flex: 1, color: "#262626" }}>
                  {folder.name}
                </Typography>
                {/* Count all files including Excel files */}
                {folder.files.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#8c8c8c", mr: 1 }}
                  >
                    {folder.files.length} file{folder.files.length !== 1 ? "s" : ""}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(folder);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" sx={{ color: "#8c8c8c" }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" sx={{ color: "#ff4d4f" }} />
                </IconButton>
              </>
            )}
          </AccordionSummary>

          <AccordionDetails sx={{ p: 2 }}>
            {/* Drop zone */}
            <FolderDropZone
              folderId={folder.id}
              onFilesAdded={addFilesToFolder}
            />

            {/* File list - show all files including Excel files */}
            {folder.files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {folder.files.map((f) => (
                    <Box
                      key={f.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1,
                        px: 1.5,
                        borderRadius: "6px",
                        border: "1px solid #f0f0f0",
                        mb: 1,
                        "&:hover": { backgroundColor: "#fafafa" },
                      }}
                    >
                      {isExcelFile(f.name) ? (
                        <GridOnOutlinedIcon
                          sx={{ color: "#52c41a", fontSize: 20 }}
                        />
                      ) : (
                        <InsertDriveFileOutlinedIcon
                          sx={{ color: brand.primary, fontSize: 20 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ flex: 1, color: "#434343" }}
                        noWrap
                      >
                        {f.name}
                      </Typography>
                      {/* Removed hardcoded Config tag for Excel files in Step 2 */}
                      <Typography
                        variant="caption"
                        sx={{ color: "#8c8c8c", minWidth: 70, textAlign: "right" }}
                      >
                        {formatFileSize(f.size)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFile(folder.id, f)}
                      >
                        <DeleteOutlineIcon
                          fontSize="small"
                          sx={{ color: "#ff4d4f" }}
                        />
                      </IconButton>
                    </Box>
                  ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default UploadDocumentsStep;
