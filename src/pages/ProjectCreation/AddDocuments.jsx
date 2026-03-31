import { useState } from "react";
import Box from "@mui/material/Box";
import { message, Typography } from "antd";
import FilePdfOutlined from "@ant-design/icons/FilePdfOutlined";
import FileWordOutlined from "@ant-design/icons/FileWordOutlined";
import FileExcelOutlined from "@ant-design/icons/FileExcelOutlined";
import FileTextOutlined from "@ant-design/icons/FileTextOutlined";
import FileImageOutlined from "@ant-design/icons/FileImageOutlined";
import FileUnknownOutlined from "@ant-design/icons/FileUnknownOutlined";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import UnifiedDocumentControl from "../../components/UnifiedDocumentControl";
import UnifiedFileTree from "../../components/UnifiedFileTree"; // Added

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
  const [currentFolder, setCurrentFolder] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
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

  // ... inside Component
  return (
    <section>
      <Box sx={{ mt: 2 }}>
        <Box sx={{
          textAlign: "center",
          padding: "20px",
          borderRadius: "8px",
          border: "1px dashed #5B0429",
        }}>
          <UnifiedDocumentControl
            onAddFolder={handleUnifiedAddFolder}
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
