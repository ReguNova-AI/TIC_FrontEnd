import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  IconButton, // Keep for legacy or UnifiedControl
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Fab, // Keep if still using for mobile add?
} from "@mui/material";
import {
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Progress, Popconfirm, message, Tree, Button, Tooltip, Typography } from "antd"; // Added Tree, Button, Typography
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined, // Added
  DeleteOutlined,     // Added
} from "@ant-design/icons";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { FORM_LABEL } from "shared/constants";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // For UnifiedControl
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For UnifiedControl?
import UnifiedDocumentControl from "../../components/UnifiedDocumentControl";
import UnifiedFileTree from "../../components/UnifiedFileTree"; // Added
import folderIcon from "../../assets/images/icons/folderIcon1.svg"; // Import folder icon

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
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "",
    desc: "",
    file: null,
  });
  const [currentFolder, setCurrentFolder] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
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
      setCurrentFolder(null); // Clear selection if deleted
    }
  };

  // --- Unified Handlers
  const handleUnifiedAddFolder = async (folderName) => {
    // Check duplicates
    if (documents.some(d => d.folder_name === folderName)) {
      message.warning("Folder already exists or uses a reserved name.");
      // Proceeding anyway as per original logic which allowed it, 
      // but typically should block. For now, adding plain.
    }

    setDocuments((prev) => [
      ...prev,
      {
        document_id: generateOTP(),
        version: "V1",
        docuemnt_name: "", // Placeholder for folder
        docuemnt_type: "",
        docuemnt_desc: "",
        folder_name: folderName,
        path: "",
        progress: 0,
      },
    ]);

    // Auto-expand the new folder
    const folderKey = folderName.replace(/\s+/g, "-");
    setExpandedKeys(prev => [...prev, folderKey]);

    setCurrentFolder(folderName);
  };

  const handleUnifiedAddFile = async (fileData) => {
    const { name, type, desc, file, folderName } = fileData;

    // Upload if file exists
    if (file) {
      handleFileUpload(file, name, folderName || null);
    }

    const docEntry = {
      document_id: generateOTP(),
      version: "V1",
      docuemnt_name: name,
      docuemnt_type: type,
      docuemnt_desc: desc || "",
      folder_name: folderName || "", // Empty for standalone
      path: "",
      file: file,
      progress: 0,
    };

    setDocuments((prev) => {
      // If adding to a folder that only had a placeholder, remove the placeholder
      // Actually, we don't need to remove the placeholder strictly, but it cleans up 'empty' rows.
      // The tree logic handles empty folder nodes separately.

      // Let's keep placeholder if we want empty folders to stay empty visually if all files deleted?
      // For now, logic: just add. 
      return [...prev, docEntry];
    });
  };



  // ... inside Component
  return (
    <section>
      <Box sx={{ mt: 2 }}>
        <Box sx={{
          textAlign: "center",
          padding: "20px",
          borderRadius: "8px",
          border: "1px dashed #aba8a8",
        }}>
          <UnifiedDocumentControl
            onAddFolder={handleUnifiedAddFolder}
            onAddFile={handleUnifiedAddFile}
            addingToFolder={currentFolder}
            onCancelAddingToFolder={() => setCurrentFolder(null)}
          />
        </Box>

        <Box sx={{ mt: 3, border: '1px solid #f0f0f0', borderRadius: 8, padding: 2 }}>
          <UnifiedFileTree
            documents={documents}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            onAddFolderFile={(folderName) => {
              setCurrentFolder(folderName);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteFolder={handleDeleteFolder}
            onDeleteFile={(doc) => handleDeleteFile(doc.document_id, doc.path)}
          />
          {documents.length === 0 && (
            <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
              No documents or folders yet.
            </Typography.Text>
          )}
        </Box>
      </Box>
    </section>
  );
};

export default DocumentSection;
