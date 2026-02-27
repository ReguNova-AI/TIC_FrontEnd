import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import {
  CheckOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import { message, Progress, Tree, Modal, Tooltip, Button, Input, Select, Space, Card, Typography } from "antd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { API_ERROR_MESSAGE, FORM_LABEL } from "shared/constants";
import folderIcon from "../../assets/images/icons/folderIcon1.svg";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { ProjectApiService } from "services/api/ProjectAPIService";
import UnifiedDocumentControl from "../../components/UnifiedDocumentControl";
import GoogleDrivePicker from "./GoogleDrivePicker";
import GoogleDriveFileCard from "./GoogleDriveFileCard";
import { GoogleDrivePickerService } from "services/api/googleDrivePickerService";
import { padding } from "polished";
import UnifiedFileTree from "../../components/UnifiedFileTree"; // Added
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
      // return <FileUnknownOutlined style={{ color: "#595959" }} />;
      return <FilePdfOutlined style={{ color: "#cf1322" }} />;
  }
};

const FileStructureView = ({ data, onFileUploadSuccess }) => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showLeafIcon, setShowLeafIcon] = useState(false);
  const [localFolders, setLocalFolders] = useState([]); // Store optimistic folders
  const [expandedKeys, setExpandedKeys] = useState([]); // Store keys to expand
  const [newDoc, setNewDoc] = useState({ file: null });

  // New folder and file creation states (Remove gData usage references eventually)

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("");
  const [addingFileToFolder, setAddingFileToFolder] = useState(null); // Track which folder is getting a new file

  // --- Upload modal state
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [document, setDocument] = useState({});
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  // Multiple file upload states
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [multipleUploadProgress, setMultipleUploadProgress] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);

  // Hidden file input ref for multiple file uploads
  const fileInputRef = useRef(null);

  // Google Drive functionality
  // Check Google token status
  const checkGoogleToken = async () => {
    setIsTokenLoading(true);
    try {
      const userdetails = JSON.parse(sessionStorage.getItem('userDetails'));
      const userId = userdetails?.[0]?.user_id;

      if (userId) {
        const response = await GoogleDrivePickerService.getGoogleAccessTokenWithCache(userId);
        const hasToken = response && (response.access_token || response.accessToken);
        setHasGoogleToken(hasToken);
      }
    } catch (error) {
      setHasGoogleToken(false);
    } finally {
      setIsTokenLoading(false);
    }
  };

  // Google Drive functionality
  // Check for Google authorization completion on component mount
  useEffect(() => {
    const checkForGoogleAuthCompletion = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const googleAuthSuccess = urlParams.get('google_auth_success');
      const googleAuthCode = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const gdrive = urlParams.get('gdrive');

      // Check for any indication of Google auth completion
      if (googleAuthSuccess === 'true' || googleAuthCode || (state && !error) || gdrive === '1') {
        console.log('Google authorization detected, checking token immediately');
        // Check token immediately without delay
        checkGoogleToken();

        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    // Check on mount
    checkForGoogleAuthCompletion();

    // Also check token on mount
    checkGoogleToken();
  }, []);

  // Check when window regains focus (user returns from Google)
  useEffect(() => {
    const handleFocus = () => {
      checkGoogleToken();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);


  // --- File Upload logic
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadingFile(file);
    setUploadProgress(0);
    setUploadSuccess(false);
    setOpenModal(true);

    try {
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop();
      const payload = { documents: [fileDataUrl], type: ext, project_id : data.project_id };

      const response = await FileUploadApiService.fileUpload(payload, {
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(percent);
        },
      });

      // Assume API returns the uploaded file path
      const filePath = response.data.details?.[0];
      setUploadProgress(100);
      // Update the corresponding document in state
      setFilePath(filePath);
      // You might want to call a prop function to update the parent component's state
      // For example: props.onFileUploadSuccess(docName, filePath);

      setUploadSuccess(true);
      message.success("File uploaded successfully!");
      return filePath;
    } catch (err) {
      console.error(err);
      message.error("File upload failed!");
      setOpenModal(false);
    }
  };

  const handleUploadDocument = (doc_data) => {
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    console.log("Document data to upload", doc_data);
    const payload = {
      project_id: data?.project_id,
      document_name: doc_data?.document_name,
      document_type: doc_data?.document_type,
      uploaded_by_id: userdetails?.[0]?.user_id,
      uploaded_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      folder_name: doc_data?.folder_name,
      document_desc: doc_data?.document_desc || "",
      file_path: doc_data?.file_path, // ✅ use passed-in value
      risk_information: {
        risk_level: data?.risk_information?.risk_level || " ",
        mitigation: data?.risk_information?.mitigation || " ",
      },
      information_extract: {
        summary: data?.information_extract?.summary || " ",
      },
    };
    console.log("Final payload", JSON.stringify(payload, null, 2));

    // Use createProjectDocument for new uploads, uploadProjectDocument for updates
    if (doc_data.version_id) {
      // This is an update to an existing document
      ProjectApiService.uploadProjectDocument(payload, doc_data.version_id)
        .then((response) => {
          message.success(response.message || "Document updated successfully!");
          console.log("payload", payload);

          // Call the callback to refresh project data in parent component
          if (onFileUploadSuccess) {
            onFileUploadSuccess();
          }
        })
        .catch((errResponse) => {
          message.error(
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
            "Document update failed!"
          );
        });
    } else {
      // This is a new document upload
      ProjectApiService.createProjectDocument(payload)
        .then((response) => {
          message.success(response.message || "Document uploaded successfully!");
          console.log("payload", payload);

          // Call the callback to refresh project data in parent component
          if (onFileUploadSuccess) {
            onFileUploadSuccess();
          }
        })
        .catch((errResponse) => {
          message.error(
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
            "Document upload failed!"
          );
        });
    }

    // reset states
    setOpenModal(false);
    setUploadProgress(0);
    setUploadingFile(null);
    setUploadSuccess(false);
    setFilePath("");
    setNewDoc({ file: null });
  };

  // Handle multiple file uploads
  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploadingMultiple(true);
    setMultipleUploadProgress(0);
    setUploadedFilesCount(0);
    setTotalFilesCount(files.length);
    setOpenModal(true);

    let successfulUploads = 0;
    let failedUploads = 0;
    const uploadResults = [];

    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

          // Upload file to S3
          const uploadedPath = await handleFileUpload(file);

          if (uploadedPath) {
            // Create document record
            const documentData = {
              document_name: file.name,
              document_type: file.type || 'application/octet-stream',
              file_path: uploadedPath,
            };

            // Upload document metadata
            await handleUploadDocument(documentData);

            successfulUploads++;
            uploadResults.push({ file: file.name, status: 'success' });
            console.log(`Successfully uploaded: ${file.name}`);
          } else {
            failedUploads++;
            uploadResults.push({ file: file.name, status: 'failed', error: 'No upload path returned' });
            console.error(`Failed to upload: ${file.name} - No upload path`);
          }
        } catch (error) {
          failedUploads++;
          uploadResults.push({ file: file.name, status: 'failed', error: error.message });
          console.error(`Failed to upload: ${file.name}`, error);
        }

        // Update progress
        const currentProgress = ((i + 1) / files.length) * 100;
        setUploadedFilesCount(i + 1);
        setMultipleUploadProgress(currentProgress);
      }

      // Show completion message
      if (successfulUploads === files.length) {
        message.success(`🎉 All ${files.length} files uploaded successfully!`);
      } else if (successfulUploads > 0) {
        message.warning(`⚠️ ${successfulUploads} of ${files.length} files uploaded successfully. ${failedUploads} failed.`);
      } else {
        message.error(`❌ All ${files.length} files failed to upload.`);
      }

      // Log detailed results
      console.log('Upload Results:', uploadResults);

      // Refresh the file structure
      if (onFileUploadSuccess && successfulUploads > 0) {
        onFileUploadSuccess();
      }

    } catch (error) {
      console.error("Multiple file upload failed:", error);
      message.error(`❌ Upload process failed: ${error.message}`);
    } finally {
      setIsUploadingMultiple(false);
      setOpenModal(false);

      // Reset progress after a delay to show completion
      setTimeout(() => {
        setMultipleUploadProgress(0);
        setUploadedFilesCount(0);
        setTotalFilesCount(0);
      }, 2000);
    }
  };

  // Handle file picker for multiple selection
  const handleMultipleFileSelect = () => {
    console.log('handleMultipleFileSelect called');
    try {
      if (fileInputRef.current) {
        console.log('Triggering file input click');
        fileInputRef.current.click();
      } else {
        console.error('File input ref not found');
        message.error('File input not available. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error in handleMultipleFileSelect:', error);
      message.error('Failed to open file picker. Please try again.');
    }
  };

  const handleDeleteDocument = async (document) => {
    try {
      if (!document.version_id || !document.document_id) {
        message.error("Document ID or version ID not found!");
        return;
      }

      // Show Antd Modal confirmation dialog
      Modal.confirm({
        title: 'Delete Document',
        content: `Are you sure you want to delete "${document.document_name}"? This action cannot be undone.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            const response = await ProjectApiService.deleteProjectDocument(
              document.document_id,
              document.version_id
            );

            message.success(response.message || "Document deleted successfully!");

            // Call the callback to refresh project data in parent component
            if (onFileUploadSuccess) {
              onFileUploadSuccess();
            }
          } catch (error) {
            console.error("Delete failed:", error);
            message.error(
              error?.error?.message ||
              API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
              "Failed to delete document!"
            );
          }
        },
      });
    } catch (error) {
      console.error("Delete setup failed:", error);
      message.error("Failed to initiate delete operation!");
    }
  };


  const handleFileChange = async (e, document) => {
    const file = e.target.files[0];
    if (!file) return;

    // store file locally
    setNewDoc((prev) => ({ ...prev, file }));
    console.log("Selected file:", file);
    console.log("Selected document:", document);
    try {
      // Wait for upload to finish and get the path
      const uploadedPath = await handleFileUpload(file);
      console.log("Uploaded document:", document);
      if (uploadedPath) {
        handleUploadDocument({
          ...document,
          file_path: uploadedPath,
        });
      }
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const combinedDocuments = useMemo(() => {
    const apiDocs = data?.project_documents || [];
    return [...apiDocs, ...localFolders];
  }, [data, localFolders]);

  // Set expanded keys on initial load
  useEffect(() => {
    if (data?.project_documents) {
      // Optional: Expand all folders initially?
      // const allFolders = data.project_documents.map(d => d.folder_name).filter(Boolean);
      // setExpandedKeys(allFolders); 
      // Existing logic did it via transformDataToTree result. 
      // We can just leave it empty or expand top level.
    }
  }, [data]);
  // ... (Unified Handlers follow) ...
  // ...


  // --- Unified Handlers
  const handleUnifiedAddFolder = async (folderName) => {
    const existingFolders = data?.project_documents
      ?.map(doc => doc.folder_name)
      .filter(name => name && name !== "null") || [];

    const optimisticFolders = localFolders.map(f => f.folder_name);
    const allFolders = [...existingFolders, ...optimisticFolders];

    if (allFolders.includes(folderName)) {
      message.error("Folder with this name already exists");
      throw new Error("Folder exists");
    }

    // Add optimistic folder
    setLocalFolders(prev => [...prev, {
      folder_name: folderName,
      document_name: null, // Placeholder
      document_id: `temp-${Date.now()}`,
      version: 'V1'
    }]);

    // Expand new folder
    const folderKey = folderName.replace(/\s+/g, "-");
    setExpandedKeys(prev => [...prev, folderKey]);

    message.success("Folder created successfully!");
  };


  const handleUnifiedAddFile = async (fileData) => {
    const { name, type, file, folderName } = fileData;
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));

    // Create API payload
    const payload = {
      project_id: data?.project_id,
      document_name: name,
      document_type: type,
      uploaded_by_id: userdetails?.[0]?.user_id,
      uploaded_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      folder_name: folderName || "null",
      document_desc: "",
      file_path: null,
      risk_information: { risk_level: " ", mitigation: " " },
      information_extract: { summary: " " },
    };

    try {
      // Correcting flow for file upload case:
      if (file) {
        const uploadedPath = await handleFileUpload(file);
        if (uploadedPath) {
          payload.file_path = uploadedPath;
          // Now create
          await ProjectApiService.createProjectDocument(payload);

          message.success("Document created and file uploaded!");
        }
      } else {
        const createResponse = await ProjectApiService.createProjectDocument(payload);
        message.success(createResponse.message || "Document created successfully!");
      }

      if (onFileUploadSuccess) onFileUploadSuccess();
      setAddingFileToFolder(null);
    } catch (errResponse) {
      message.error(errResponse?.error?.message || "Failed to create document!");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {/* Unified Controls & Google Drive Layout */}
        <div style={{ display: "flex", flexDirection: 'row', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          <div style={{ flex: 1, minWidth: '600px' }}>
            <UnifiedDocumentControl
              onAddFolder={handleUnifiedAddFolder}
              onAddFile={handleUnifiedAddFile}
              showUploadMultiple={true}
              onUploadMultiple={(e) => {
                if (e && e.preventDefault) e.preventDefault();
                handleMultipleFileSelect();
              }}
              addingToFolder={addingFileToFolder}
              onCancelAddingToFolder={() => setAddingFileToFolder(null)}
            />
          </div>

          {/* Google Drive functionality - HIDDEN as per user request */}
          {/* <div style={{ marginTop: 0 }}>
            {hasGoogleToken ? (
              <GoogleDriveFileCard
                projectId={data?.project_id}
                onUploadSuccess={onFileUploadSuccess}
                style={{ width: "100%" }} 
              />
            ) : (
              <GoogleDrivePicker projectId={data?.project_id} />
            )}
          </div> */}
        </div>

        {/* Upload Progress Modal */}
        <Modal
          open={openModal}
          footer={null}
          onCancel={() => setOpenModal(false)}
          title={isUploadingMultiple ? "Uploading Multiple Files" : "Uploading Document"}
          centered
        >
          {isUploadingMultiple ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>
                  Uploading {uploadedFilesCount} of {totalFilesCount} files
                </Typography.Text>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Progress: {Math.round(multipleUploadProgress)}% complete
                </div>
              </div>
              <Progress
                percent={Math.round(multipleUploadProgress)}
                status="active"
                format={(percent) => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Files will be uploaded to the root directory
              </div>
              {uploadedFilesCount === totalFilesCount && (
                <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                  <Typography.Text style={{ color: '#52c41a', fontSize: 12 }}>
                    ✅ Upload completed! Refreshing file structure...
                  </Typography.Text>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {getFileIcon(uploadingFile?.name)}
                <span
                  style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {uploadingFile?.name}
                </span>
                {uploadSuccess && (
                  <CheckOutlined style={{ color: "green", fontSize: 20 }} />
                )}
              </div>
              <Progress
                percent={uploadProgress}
                status={uploadSuccess ? "success" : "active"}
              />
            </div>
          )}
        </Modal>
      </div>


      <UnifiedFileTree
        documents={combinedDocuments}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        onAddFolderFile={(folderName) => {
          setAddingFileToFolder(folderName);
        }}
        onDeleteFile={(doc) => handleDeleteDocument(doc)}
        onDeleteFolder={null}
        onUploadFile={handleFileChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => {
          console.log('File input changed, files:', e.target.files);
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            console.log('Selected files:', files);
            handleMultipleFileUpload(files);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default FileStructureView;
