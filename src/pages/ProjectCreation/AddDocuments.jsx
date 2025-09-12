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
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "",
    desc: "",
    file: null,
  });
  const [currentFolder, setCurrentFolder] = useState(null);

  // --- Add Folder (empty placeholder entry)
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      {
        document_id: Date.now(),
        version: "V1",
        docuemnt_name: "",
        docuemnt_type: "",
        docuemnt_desc: "",
        folder_name: newFolderName,
        path: "",
        progress: 0,
      },
    ]);
    setCurrentFolder(newFolderName);
    setNewFolderName("");
  };

  // --- Upload file
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
            prev.map((doc) =>
              doc.docuemnt_name === docName &&
              doc.folder_name === (folderName || "")
                ? { ...doc, progress: percent }
                : doc
            )
          );
        },
      });

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.docuemnt_name === docName &&
          doc.folder_name === (folderName || "")
            ? {
                ...doc,
                file,
                path: response.data.details[0],
                progress: 100,
              }
            : doc
        )
      );

      message.success("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      message.error("File upload failed!");
    }
  };

  // --- Toggle folder open/close (UI only)
  const handleToggleFolder = (folderName) => {
    setOpenFolder((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // --- Delete File
  const handleDeleteFile = async (docId, filePath) => {
    try {
      const regex = /\/([^/]+)$/;
      const match = filePath?.match(regex);
      if (match) {
        await FileUploadApiService.fileDelete({ imageKey: match[1] });
      }

      setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
      message.success("File deleted successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete file!");
    }
  };

  // --- Delete Folder (remove all docs under it)
  const handleDeleteFolder = (folderName) => {
    setDocuments((prev) => prev.filter((d) => d.folder_name !== folderName));
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

    const docEntry = {
      document_id: Date.now(),
      version: "V1",
      docuemnt_name: newDoc.name,
      docuemnt_type: newDoc.type,
      docuemnt_desc: newDoc.desc || "",
      folder_name: currentFolder || "",
      path: "",
      file: newDoc.file,
      progress: 0,
    };

    setDocuments((prev) => {
      // if folder only had placeholder, remove it
      const filtered = prev.filter(
        (d) =>
          !(
            d.folder_name === currentFolder &&
            !d.docuemnt_name &&
            !d.docuemnt_type
          )
      );
      return [...filtered, docEntry];
    });

    setNewDoc({ name: "", type: "", desc: "", file: null });
  };

  // --- Group docs by folder_name
  const groupedDocs = documents.reduce((acc, doc) => {
    const folder = doc.folder_name || "Uncategorized";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(doc);
    return acc;
  }, {});

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
              //   required
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
                // required
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              variant="outlined"
              value={newDoc.desc}
              onChange={(e) => setNewDoc({ ...newDoc, desc: e.target.value })}
            />

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
          {Object.entries(groupedDocs).map(([folder, docs]) => (
            <React.Fragment key={folder}>
              {/* --- Folder Header --- */}
              <ListItem
                button
                onClick={() => handleToggleFolder(folder)}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Checkbox
                  checked={currentFolder === folder}
                  onChange={(e) =>
                    setCurrentFolder(e.target.checked ? folder : null)
                  }
                  onClick={(e) => e.stopPropagation()}
                />

                <Folder sx={{ mr: 1 }} />
                <ListItemText primary={folder} />

                <Popconfirm
                  title="Delete Folder"
                  description="Delete this folder and all files inside?"
                  onConfirm={() => handleDeleteFolder(folder)}
                  okText="Confirm"
                  cancelText="Cancel"
                  icon={<CloseCircleOutlined style={{ color: "red" }} />}
                >
                  <IconButton onClick={(e) => e.stopPropagation()}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Popconfirm>

                {openFolder[folder] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              {/* --- Folder Files --- */}
              <Collapse in={openFolder[folder]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {docs.filter((d) => d.docuemnt_name).length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No files"
                        sx={{ fontStyle: "italic" }}
                      />
                    </ListItem>
                  ) : (
                    docs.map((doc) => (
                      <ListItem
                        key={doc.document_id}
                        sx={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <span style={{ marginRight: "10px", fontSize: "18px" }}>
                          {getFileIcon(doc.file?.name || doc.path)}
                        </span>
                        <ListItemText
                          primary={
                            <Tooltip
                              title={doc.file?.name || doc.path || "No File"}
                            >
                              <span>
                                {doc.docuemnt_name}{" "}
                                <span style={{ color: "#2ba9bc" }}>
                                  ({doc.docuemnt_type})
                                </span>
                              </span>
                            </Tooltip>
                          }
                          secondary={
                            doc.file
                              ? formatFileSize(doc.file.size)
                              : doc.path || "No File"
                          }
                        />

                        <Progress
                          percent={doc.progress || 0}
                          size="small"
                          strokeColor="#52c41a"
                          style={{ width: "40%", marginRight: "10px" }}
                        />

                        <input
                          type="file"
                          hidden
                          id={`file-upload-${doc.document_id}`}
                          onChange={(e) =>
                            handleFileUpload(
                              e.target.files[0],
                              doc.docuemnt_name,
                              doc.folder_name
                            )
                          }
                        />
                        <label htmlFor={`file-upload-${doc.document_id}`}>
                          <IconButton component="span">
                            <InsertDriveFile />
                          </IconButton>
                        </label>

                        <Popconfirm
                          title="Delete File"
                          description="Delete this file?"
                          onConfirm={() =>
                            handleDeleteFile(doc.document_id, doc.path)
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
          ))}
        </List>
      </Box>
    </section>
  );
};

export default DocumentSection;
