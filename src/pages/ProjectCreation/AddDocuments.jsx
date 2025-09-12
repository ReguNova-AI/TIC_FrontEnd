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
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
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
import { FORM_LABEL } from "shared/constants";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AttachFileIcon from "@mui/icons-material/AttachFile";

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

const documentTypes = [
  "Project Document",
  "Specification",
  "Drawing",
  "Report",
  "Certificate",
  "Other",
];

const DocumentSection = ({ documents, setDocuments }) => {
  const [openFolder, setOpenFolder] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [newDoc, setNewDoc] = useState({ name: "", type: "", file: null });
  const [currentFolder, setCurrentFolder] = useState(null);

  // --- Add Folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      { type: "folder", name: newFolderName, children: [] },
    ]);
    setCurrentFolder(newFolderName);
    setNewFolderName("");
  };

  // --- Upload file for existing doc entry
  const handleFileUpload = async (file, docName, folderName) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop();
      const payload = { documents: [fileDataUrl], type: ext };

      const response = await FileUploadApiService.fileUpload(payload, {
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setDocuments((prev) =>
            prev.map((item) =>
              item.type === "folder" && item.name === folderName
                ? {
                    ...item,
                    children: item.children.map((doc) =>
                      doc.name === docName ? { ...doc, progress: percent } : doc
                    ),
                  }
                : item.name === docName
                  ? { ...item, progress: percent }
                  : item
            )
          );
        },
      });

      setDocuments((prev) =>
        prev.map((item) =>
          item.type === "folder" && item.name === folderName
            ? {
                ...item,
                children: item.children.map((doc) =>
                  doc.name === docName
                    ? {
                        ...doc,
                        file,
                        path: response.data.details[0],
                        progress: 100,
                      }
                    : doc
                ),
              }
            : item.name === docName
              ? { ...item, file, path: response.data.details[0], progress: 100 }
              : item
        )
      );

      message.success("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error("File upload failed!");
    }
  };

  // --- Toggle folder open/close
  const handleToggleFolder = (folderName) => {
    setOpenFolder((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // --- Delete File
  const handleDeleteFile = async (folderIdx, fileName, filePath) => {
    try {
      const regex = /\/([^/]+)$/;
      const match = filePath?.match(regex);
      if (match) {
        await FileUploadApiService.fileDelete({ imageKey: match[1] });
      }

      setDocuments((prev) => {
        const updated = [...prev];
        if (typeof folderIdx === "number") {
          updated[folderIdx].children = updated[folderIdx].children.filter(
            (f) => f.name !== fileName
          );
        } else {
          return prev.filter((f) => f.name !== fileName);
        }
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
    if (currentFolder === folderName) {
      setCurrentFolder(null);
    }
  };

  // --- Add Document entry
  const handleAddDocument = () => {
    if (!newDoc.name || !newDoc.type) {
      message.error("Document name and type are mandatory");
      return;
    }

    const docEntry = { ...newDoc, progress: 0 };

    if (currentFolder) {
      setDocuments((prev) =>
        prev.map((item) =>
          item.type === "folder" && item.name === currentFolder
            ? { ...item, children: [...item.children, docEntry] }
            : item
        )
      );
    } else {
      setDocuments((prev) => [...prev, docEntry]);
    }

    setNewDoc({ name: "", type: "", file: null });
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
        <h4 style={{ fontWeight: 500, margin: "4px" }}>
          {FORM_LABEL.DOCUMENT_UPLOAD}
        </h4>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            borderRadius: "8px",
            border: "1px dashed #aba8a8",
          }}
        >
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
              endIcon={<FolderOpenIcon sx={{ height: 20, width: "auto" }} />}
            >
              Add Folder
            </Button>
          </Box>

          {/* Add Document */}
          <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
            <TextField
              label="Document Name"
              variant="outlined"
              required
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
            />

            <FormControl fullWidth sx={{ maxWidth: 160 }}>
              <InputLabel id="document-type-label">Type*</InputLabel>
              <Select
                labelId="document-type-label"
                label="Type"
                value={newDoc.type}
                onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                required
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* File input with icon */}
            <Tooltip title="Upload Document">
              <input
                type="file"
                hidden
                id="file-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewDoc((prev) => ({ ...prev, file }));
                  }
                }}
              />
              <label htmlFor="file-input">
                <IconButton
                  component="span"
                  color={newDoc.file ? "success" : "default"}
                >
                  {/* <InsertDriveFile /> */}
                  <AttachFileIcon />
                </IconButton>
              </label>
            </Tooltip>
            {/* Add Document button */}
            <Button
              variant="contained"
              onClick={handleAddDocument}
              endIcon={<InsertDriveFile sx={{ height: 20, width: "auto" }} />}
            >
              Add
            </Button>
          </Box>
        </div>

        {/* List of Folders & Files */}
        <List sx={{ mt: 2 }}>
          {documents.map((item, idx) =>
            item.type === "folder" ? (
              <React.Fragment key={idx}>
                <ListItem button onClick={() => handleToggleFolder(item.name)}>
                  <Checkbox
                    checked={currentFolder === item.name}
                    onChange={() =>
                      setCurrentFolder(
                        currentFolder === item.name ? null : item.name
                      )
                    }
                  />
                  <Folder sx={{ mr: 1 }} />
                  <ListItemText primary={item.name} />
                  {openFolder[item.name] ? <ExpandLess /> : <ExpandMore />}
                  <Popconfirm
                    title="Delete Folder"
                    description="Delete this folder and its files?"
                    onConfirm={() => handleDeleteFolder(item.name)}
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
                  in={openFolder[item.name]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.children?.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="(Empty Folder)" />
                      </ListItem>
                    ) : (
                      item.children.map((child, cIdx) => (
                        <ListItem
                          key={cIdx}
                          sx={{ display: "flex", alignItems: "flex-start" }}
                        >
                          <span
                            style={{ marginRight: "10px", fontSize: "18px" }}
                          >
                            {getFileIcon(child.file?.name)}
                          </span>
                          <ListItemText
                            primary={
                              <Tooltip title={child.file?.name || "No File"}>
                                <span>
                                  {child.name}{" "}
                                  <span style={{ color: "#2ba9bc" }}>
                                    ({child.type})
                                  </span>
                                </span>
                              </Tooltip>
                            }
                            secondary={
                              child.file
                                ? formatFileSize(child.file.size)
                                : "No File"
                            }
                          />

                          <Progress
                            percent={child.progress}
                            size="small"
                            strokeColor="#52c41a"
                            style={{ width: "40%", marginRight: "10px" }}
                          />
                          <Tooltip title="Upload Document">
                            {/* Upload file later */}
                            <input
                              type="file"
                              hidden
                              id={`file-upload-${idx}-${cIdx}`}
                              onChange={(e) =>
                                handleFileUpload(
                                  e.target.files[0],
                                  child.name,
                                  item.name
                                )
                              }
                            />
                            <label htmlFor={`file-upload-${idx}-${cIdx}`}>
                              <IconButton component="span">
                                <InsertDriveFile />
                              </IconButton>
                            </label>
                          </Tooltip>
                          <Popconfirm
                            title="Delete File"
                            description="Delete this file?"
                            onConfirm={() =>
                              handleDeleteFile(idx, child.name, child.path)
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
            ) : (
              <ListItem
                key={idx}
                sx={{ display: "flex", alignItems: "flex-start" }}
              >
                <span style={{ marginRight: "10px", fontSize: "18px" }}>
                  {getFileIcon(item.file?.name)}
                </span>
                <ListItemText
                  primary={
                    <Tooltip title={item.file?.name || "No File"}>
                      <span>
                        {item.name}{" "}
                        <span style={{ color: "#2ba9bc" }}>({item.type})</span>
                      </span>
                    </Tooltip>
                  }
                  secondary={
                    item.file ? formatFileSize(item.file.size) : "No File"
                  }
                />
                <Progress
                  percent={item.progress}
                  size="small"
                  strokeColor="#52c41a"
                  style={{ width: "40%", marginRight: "10px" }}
                />
                <input
                  type="file"
                  hidden
                  id={`file-upload-${idx}`}
                  onChange={(e) =>
                    handleFileUpload(e.target.files[0], item.name, null)
                  }
                />
                <label htmlFor={`file-upload-${idx}`}>
                  <IconButton component="span">
                    <InsertDriveFile />
                  </IconButton>
                </label>
                <Popconfirm
                  title="Delete File"
                  description="Delete this file?"
                  onConfirm={() => handleDeleteFile(null, item.name, item.path)}
                  okText="Confirm"
                  cancelText="Cancel"
                  icon={<CloseCircleOutlined style={{ color: "red" }} />}
                >
                  <IconButton>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Popconfirm>
              </ListItem>
            )
          )}
        </List>
      </Box>
    </section>
  );
};

export default DocumentSection;
