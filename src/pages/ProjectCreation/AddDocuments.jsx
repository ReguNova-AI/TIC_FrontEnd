import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Folder,
  InsertDriveFile,
  ExpandLess,
  ExpandMore,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Progress, Popconfirm, message } from "antd";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { FileUploadApiService } from "services/api/FileUploadAPIService";

// --- Utility: format size
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// --- Utility: file icons
const getFileIcon = (filename) => {
  if (!filename) return <FileUnknownOutlined style={{ color: "#595959" }} />;
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#cf1322" }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#1890ff" }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#52c41a" }} />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileImageOutlined style={{ color: "#fa8c16" }} />;
    case "txt":
      return <FileTextOutlined style={{ color: "#722ed1" }} />;
    default:
      return <FileUnknownOutlined style={{ color: "#595959" }} />;
  }
};

const DocumentSection = () => {
  const [documents, setDocuments] = useState([]); // [{type:"folder", name, children:[{file}] }]
  const [openFolder, setOpenFolder] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [newDoc, setNewDoc] = useState({ name: "", type: "", file: null });

  // --- Add Folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      { type: "folder", name: newFolderName, children: [] },
    ]);
    setNewFolderName("");
  };

  // --- Upload + Add File into last folder
  const handleAddDocument = async () => {
    if (!newDoc.name || !newDoc.file) return;
    if (documents.length === 0) {
      message.error("Please create a folder first.");
      return;
    }

    const lastFolderIdx = documents.length - 1;
    const folder = documents[lastFolderIdx];

    try {
      // Prepare base64
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(newDoc.file);
      });

      const ext = newDoc.file.name.split(".").pop();
      const payload = { documents: [fileDataUrl], type: ext };

      const response = await FileUploadApiService.fileUpload(payload, {
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setDocuments((prev) => {
            const updated = [...prev];
            updated[lastFolderIdx].children = updated[
              lastFolderIdx
            ].children.map((f) =>
              f.name === newDoc.name ? { ...f, progress: percent } : f
            );
            return updated;
          });
        },
      });

      const uploadedFile = {
        type: "file",
        name: newDoc.name,
        file: newDoc.file,
        documenttype: newDoc.type || "Project Document",
        size: newDoc.file.size,
        path: response.data.details[0], // from API
        progress: 100,
      };

      setDocuments((prev) => {
        const updated = [...prev];
        updated[lastFolderIdx].children.push(uploadedFile);
        return updated;
      });

      setNewDoc({ name: "", type: "", file: null });
      message.success("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error("File upload failed!");
    }
  };

  // --- Toggle Folder
  const handleToggleFolder = (folderName) => {
    setOpenFolder((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // --- Delete File
  const handleDeleteFile = async (folderIdx, fileName, filePath) => {
    try {
      const regex = /\/([^/]+)$/;
      const match = filePath.match(regex);
      const filepayload = { imageKey: match[1] };

      await FileUploadApiService.fileDelete(filepayload);

      setDocuments((prev) => {
        const updated = [...prev];
        updated[folderIdx].children = updated[folderIdx].children.filter(
          (f) => f.name !== fileName
        );
        return updated;
      });
      message.success("File deleted successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete file!");
    }
  };

  // --- Delete Folder
  const handleDeleteFolder = (folderName) => {
    setDocuments((prev) => prev.filter((f) => f.name !== folderName));
  };

  return (
    <section
      style={{
        border: "1px dashed #aba8a8",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <Box sx={{ mt: 4 }}>
        <h4 style={{ fontWeight: 500, margin: "4px" }}>Project Documents</h4>

        {/* Add Folder */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            variant="outlined"
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddFolder}
            style={{ background: "#003a8c", textTransform: "none" }}
          >
            Add Folder
          </Button>
        </Box>

        {/* Add Document */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            label="Document Name"
            variant="outlined"
            value={newDoc.name}
            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
          />
          <TextField
            variant="outlined"
            label="Type"
            value={newDoc.type}
            onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
          />
          <Button variant="outlined" component="label">
            Upload
            <input
              hidden
              type="file"
              onChange={(e) =>
                setNewDoc({ ...newDoc, file: e.target.files[0] })
              }
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDocument}
            style={{ background: "#003a8c", textTransform: "none" }}
          >
            Add Document
          </Button>
        </Box>

        {/* List of Folders */}
        <List sx={{ mt: 2 }}>
          {documents.map((folder, fIdx) =>
            folder.type === "folder" ? (
              <React.Fragment key={fIdx}>
                <ListItem
                  button
                  onClick={() => handleToggleFolder(folder.name)}
                >
                  <Folder sx={{ mr: 1 }} />
                  <ListItemText primary={folder.name} />
                  {openFolder[folder.name] ? <ExpandLess /> : <ExpandMore />}
                  <Popconfirm
                    title="Delete Folder"
                    description="This will remove the folder and all its files. Continue?"
                    onConfirm={() => handleDeleteFolder(folder.name)}
                    okText="Confirm"
                    cancelText="Cancel"
                    icon={<CloseCircleOutlined style={{ color: "red" }} />}
                  >
                    <IconButton>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Popconfirm>
                </ListItem>
                <Collapse
                  in={openFolder[folder.name]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {folder.children?.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="(Empty Folder)" />
                      </ListItem>
                    ) : (
                      folder.children.map((child, cIdx) => (
                        <ListItem key={cIdx}>
                          <span style={{ marginRight: 10 }}>
                            {getFileIcon(child.file?.name)}
                          </span>
                          <ListItemText
                            primary={`${child.name} (${child.documenttype})`}
                            secondary={formatFileSize(child.size)}
                          />
                          <Progress
                            percent={child.progress}
                            size="small"
                            strokeColor="#52c41a"
                            style={{ width: "40%", marginRight: "10px" }}
                          />
                          <Popconfirm
                            title="Delete File"
                            description="Are you sure you want to delete this file?"
                            onConfirm={() =>
                              handleDeleteFile(fIdx, child.name, child.path)
                            }
                            okText="Confirm"
                            cancelText="Cancel"
                            icon={
                              <CloseCircleOutlined style={{ color: "red" }} />
                            }
                          >
                            <IconButton>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Popconfirm>
                        </ListItem>
                      ))
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : null
          )}
        </List>
      </Box>
    </section>
  );
};

export default DocumentSection;
