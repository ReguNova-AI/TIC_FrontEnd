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
import { Progress, Popconfirm } from "antd";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

// Utility: format size
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Utility: icon by extension
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
  const [documents, setDocuments] = useState([]);
  const [openFolder, setOpenFolder] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [newDoc, setNewDoc] = useState({ name: "", type: "", file: null });

  // Add folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      { type: "folder", name: newFolderName, children: [] },
    ]);
    setNewFolderName("");
  };

  // Add document
  const handleAddDocument = () => {
    if (!newDoc.name || !newDoc.file) return;

    const newFile = {
      type: "file",
      name: newDoc.name,
      file: newDoc.file,
      documenttype: newDoc.type || "Project Document",
      size: newDoc.file.size,
      progress: 100, // simulate completed upload
    };

    setDocuments((prev) => [...prev, newFile]);
    setNewDoc({ name: "", type: "", file: null });
  };

  // Toggle folder
  const handleToggleFolder = (folderName) => {
    setOpenFolder((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Remove file/folder
  const handleDelete = (itemName) => {
    setDocuments((prev) => prev.filter((d) => d.name !== itemName));
  };

  return (
    <section
      className="container"
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
            style={{
              background: "#003a8c",
              textTransform: "none",
            }}
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
            style={{
              background: "#003a8c",
              textTransform: "none",
            }}
          >
            Add Document
          </Button>
        </Box>

        {/* List of Documents/Folders */}
        <List sx={{ mt: 2 }}>
          {documents.map((item, idx) =>
            item.type === "file" ? (
              <ListItem
                key={idx}
                sx={{ display: "flex", alignItems: "flex-start" }}
              >
                {/* File Icon */}
                <span style={{ marginRight: "10px", fontSize: "18px" }}>
                  {getFileIcon(item.file?.name)}
                </span>

                {/* File Info */}
                <ListItemText
                  primary={
                    <Tooltip title={item.file?.name}>
                      <span>
                        {item.name}{" "}
                        <span style={{ color: "#2ba9bc" }}>
                          ({item.documenttype})
                        </span>
                      </span>
                    </Tooltip>
                  }
                  secondary={`${formatFileSize(item.size)}`}
                />

                {/* Progress */}
                <Progress
                  percent={item.progress}
                  size="small"
                  strokeColor="#52c41a"
                  style={{ width: "40%", marginRight: "10px" }}
                />

                {/* Delete */}
                <Popconfirm
                  title="Delete File"
                  description="Are you sure you want to delete this file?"
                  onConfirm={() => handleDelete(item.name)}
                  okText="Confirm"
                  cancelText="Cancel"
                  icon={<CloseCircleOutlined style={{ color: "red" }} />}
                >
                  <IconButton>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Popconfirm>
              </ListItem>
            ) : (
              <React.Fragment key={idx}>
                <ListItem button onClick={() => handleToggleFolder(item.name)}>
                  <Folder sx={{ mr: 1 }} />
                  <ListItemText primary={item.name} />
                  {openFolder[item.name] ? <ExpandLess /> : <ExpandMore />}
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
                        <ListItem key={cIdx}>
                          <InsertDriveFile sx={{ mr: 1 }} />
                          <ListItemText
                            primary={`${child.name} (${child.documenttype})`}
                            secondary={child.file?.name}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
            )
          )}
        </List>
      </Box>
    </section>
  );
};

export default DocumentSection;
