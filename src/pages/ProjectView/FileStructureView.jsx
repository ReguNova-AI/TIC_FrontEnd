import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  CheckOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusCircleOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { message, Progress, Tree, Modal, Tooltip, Button, Input, Select, Space, Card, Typography } from "antd";
import { IconButton } from "@mui/material";
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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { ProjectApiService } from "services/api/ProjectAPIService";
import GoogleDrivePicker from "./GoogleDrivePicker";
import GoogleDriveFileCard from "./GoogleDriveFileCard";
import { GoogleDrivePickerService } from "services/api/googleDrivePickerService";
import { padding } from "polished";
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
  const [gData, setGData] = useState([]); // Store the tree data
  const [expandedKeys, setExpandedKeys] = useState([]); // Store keys to expand
  const [newDoc, setNewDoc] = useState({ file: null });

  // New folder and file creation states
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
      const payload = { documents: [fileDataUrl], type: ext };

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

    ProjectApiService.uploadProjectDocument(payload, doc_data.version_id
    )
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

    // reset states
    setOpenModal(false);
    setUploadProgress(0);
    setUploadingFile(null);
    setUploadSuccess(false);
    setFilePath("");
    setNewDoc({ file: null });
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

  // Handler for creating new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      message.error("Please enter a folder name");
      return;
    }

    // Check if folder already exists (check existing folders from data + manually created ones)
    const existingFolders = data?.project_documents
      ?.map(doc => doc.folder_name)
      .filter(name => name && name !== "null") || [];

    const manuallyCreatedFolders = gData
      .filter(item => !item.isLeaf && !item.documentData)
      .map(item => {
        // Extract folder name from the complex title structure
        if (typeof item.title === 'string') return item.title;
        // For React elements, we'll use the key to extract the name
        return item.key?.replace(/^folder-/, '').replace(/-\d+$/, '').replace(/-/g, ' ');
      })
      .filter(Boolean);

    const allFolders = [...existingFolders, ...manuallyCreatedFolders];
 
    if (allFolders.includes(newFolderName)) {
      message.error("Folder with this name already exists");
      return;
    }

    // Create new folder node
    const newFolderNode = { 
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={folderIcon}
              width="20px"
              style={{ marginRight: "8px" }}
              alt="folder"
            />
            <span style={{ fontWeight: 500, color: "#1890ff" }}>{newFolderName}</span>
          </div>
          <Tooltip title="Add document to this folder">
            <Button
              type="text"
              size="small"
              icon={<PlusCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setAddingFileToFolder(newFolderName);
                setIsCreatingFile(true);
              }}
              style={{
                fontSize: 12,
                padding: "4px 8px",
                marginLeft: 8,
                color: "#1890ff",
                borderRadius: 4,
                background: "rgba(24, 144, 255, 0.1)",
                border: "1px solid rgba(24, 144, 255, 0.2)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(24, 144, 255, 0.15)";
                e.target.style.borderColor = "rgba(24, 144, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(24, 144, 255, 0.1)";
                e.target.style.borderColor = "rgba(24, 144, 255, 0.2)";
              }}
            />
          </Tooltip>
        </div>
      ),
      key: `folder-${newFolderName.replace(/\s+/g, "-")}-${Date.now()}`,
      children: [],
    };

    // Add to tree data
    setGData(prevData => [newFolderNode, ...prevData]);

    // Expand the new folder
    setExpandedKeys(prev => [...prev, newFolderNode.key]);

    // Reset state
    setNewFolderName("");
    setIsCreatingFolder(false);

    message.success("Folder created successfully!");
  };

  // Handler for creating new file
  const handleCreateFile = (folderName = null) => {
    if (!newFileName.trim() || !newFileType.trim()) {
      message.error("Please enter file name and select document type");
      return;
    }
   
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));

    // Create API payload
    const payload = {
      project_id: data?.project_id,
      document_name: newFileName,
      document_type: newFileType,
      uploaded_by_id: userdetails?.[0]?.user_id,
      uploaded_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      folder_name: folderName || "null", // Use provided folder name or root level
      document_desc: "",
      file_path: null,
      risk_information: {
        risk_level: " ",
        mitigation: " ",
      },
      information_extract: {
        summary: " ",
      },
    };

    // Call API to create document
    ProjectApiService.createProjectDocument(payload)
      .then((response) => {
        message.success(response.message || "Document created successfully!");

        // Call the callback to refresh project data in parent component
        if (onFileUploadSuccess) {
          onFileUploadSuccess();
        }

        // Reset state
        setNewFileName("");
        setNewFileType("");
        setIsCreatingFile(false);
        setAddingFileToFolder(null);
      })
      .catch((errResponse) => {
        message.error(
          errResponse?.error?.message ||
          "Failed to create document!"
        );
      });
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

  // Function to transform the data into the required tree format
  const transformDataToTree = useCallback((documents) => {
    const treeStructure = {};
    const folderKeys = []; // Collect all folder keys
    const rootFiles = []; // Files without a folder

    documents.forEach((document) => {
      let { document_type, document_name, file_path, folder_name } =
        document;

      if (document_type === "Custom Regulatory") {
        document_type = FORM_LABEL.CUSTOM_REGULATORY;
      }

      // Create the file node
      const fileNode = {
        title: (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                marginRight: 8
              }}
            >
              {document_name} ({document_type})
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* File type icon - always show at the end */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {getFileIcon(document_type)}
              </div>

              {/* Upload/Delete actions */}
              {file_path ? (
                <Tooltip title="Delete Document">
                  <DeleteOutlined
                    onClick={() => handleDeleteDocument(document)}
                    style={{
                      fontSize: 16,
                      color: "#ff4d4f",
                      cursor: "pointer",
                      marginLeft: 4
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Upload Document">
                  <input
                    type="file"
                    hidden
                    id={`file-input-${document.document_id}-${document.version_id}`}
                    onChange={(e) => handleFileChange(e, document)}
                    onClick={(document) => setDocument(document)}
                  />
                  <label htmlFor={`file-input-${document.document_id}-${document.version_id}`}>
                    <IconButton
                      component="span"
                      sx={{
                        padding: 0,
                        fontSize: 16,
                        color: "#3366ff",
                      }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                </Tooltip>
              )}
            </div>
          </div>
        ),
        key: `${document.document_id}-${document.version_id}`, // Use unique key
        isLeaf: true,
        documentData: document, // Store original document data
      };

      // Check if document has a folder_name and it's not "null" or empty
      if (folder_name && folder_name !== "null" && folder_name.trim() !== "") {
        const folderKey = folder_name.replace(/\s+/g, "-");

        // If the tree structure doesn't have the folder, create it
        if (!treeStructure[folder_name]) {
          treeStructure[folder_name] = {
            title: (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={folderIcon}
                    width="20px"
                    style={{ marginRight: "8px" }}
                    alt="folder"
                  />
                  <span style={{ fontWeight: 500, color: "#1890ff" }}>{folder_name}</span>
                </div>
                <Tooltip title="Add document to this folder">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddingFileToFolder(folder_name);
                      setIsCreatingFile(true);
                    }}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      marginLeft: 8,
                      color: "#1890ff",
                      borderRadius: 4,
                      background: "rgba(24, 144, 255, 0.1)",
                      border: "1px solid rgba(24, 144, 255, 0.2)",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(24, 144, 255, 0.15)";
                      e.target.style.borderColor = "rgba(24, 144, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(24, 144, 255, 0.1)";
                      e.target.style.borderColor = "rgba(24, 144, 255, 0.2)";
                    }}
                  />
                </Tooltip>
              </div>
            ),
            key: folderKey,
            children: [],
          };

          // Add folder key to the list for expansion
          if (!folderKeys.includes(folderKey)) {
            folderKeys.push(folderKey);
          }
        }

        // Add the document under the correct folder
        treeStructure[folder_name].children.push(fileNode);
      } else {
        // Document doesn't have a folder, add it to root level
        rootFiles.push(fileNode);
      }
    });

    // Sort files within each folder alphabetically
    Object.keys(treeStructure).forEach(folderName => {
      treeStructure[folderName].children.sort((a, b) => {
        const nameA = a.documentData?.document_name || '';
        const nameB = b.documentData?.document_name || '';
        return nameA.localeCompare(nameB);
      });
    });

    // Sort root files alphabetically
    rootFiles.sort((a, b) => {
      const nameA = a.documentData?.document_name || '';
      const nameB = b.documentData?.document_name || '';
      return nameA.localeCompare(nameB);
    });

    // Convert the treeStructure object to an array and sort folders alphabetically
    const folderNodes = Object.values(treeStructure).sort((a, b) => {
      console.log(a)
      return (a.key
        ?? "").localeCompare(b.key
          ?? '')
    });

    // Combine folders and root files
    const treeData = [...folderNodes, ...rootFiles];

    return {
      treeData: treeData,
      folderKeys: folderKeys
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set the tree data when the component mounts or when `data` changes
  useEffect(() => {
    if (data && Array.isArray(data?.project_documents)) {
      const { treeData, folderKeys } = transformDataToTree(data?.project_documents);

      setGData(treeData); // Set the tree data
      setExpandedKeys(folderKeys); // Set keys to expand all folders
    }
  }, [data, transformDataToTree]);

  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {/* Create Buttons Row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
  <Button
    type="primary"
    ghost
    icon={<FolderAddOutlined />}
    onClick={() => setIsCreatingFolder(true)}
    style={{
      borderRadius: 8,
      height: 40,
      fontSize: 14,
      fontWeight: 500,
      borderColor: "#52c41a",
      color: "#52c41a",
    }}
  >
    Create New Folder
  </Button>

  <Button
    type="primary"
    icon={<FileAddOutlined />}
    onClick={() => setIsCreatingFile(true)}
    style={{
      borderRadius: 8,
      height: 40,
      fontSize: 14,
      fontWeight: 500,
      background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
      border: "none",
    }}
  >
    Create New Document
  </Button>

  {hasGoogleToken ? (
  <div style={{ display: "flex", alignItems: "center", marginTop: -2, flex: 1 }}>
    <GoogleDriveFileCard
      projectId={data?.project_id}
      onUploadSuccess={onFileUploadSuccess}
      style={{ width: "50%" }} 
    />
  </div>
) : (
  <GoogleDrivePicker projectId={data?.project_id} />
)}

</div>

        {/* Create Folder Modal/Card */}
        {isCreatingFolder && (
          <Card
            size="small"
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              marginBottom: 16
            }}
          >
            <Space align="center" style={{ width: "100%" }}>
              <FolderAddOutlined style={{ color: "#52c41a", fontSize: 16 }} />
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onPressEnter={handleCreateFolder}
                style={{
                  borderRadius: 6,
                  border: "1px solid #d9f7be"
                }}
                autoFocus
              />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleCreateFolder}
                style={{ borderRadius: 6, background: "#52c41a", borderColor: "#52c41a" }}
              >
                Create
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                style={{ borderRadius: 6 }}
              >
                Cancel
              </Button>
            </Space>
          </Card>
        )}

        {/* Create File Modal/Card */}
          <Card
            size="small"
            style={{
              background: "#f0f9ff",
              border: "1px solid #91d5ff",
              borderRadius: 8,
              marginBottom: 16
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {addingFileToFolder && (
                <div style={{
                  padding: "8px 12px",
                  background: "#e6f7ff",
                  borderRadius: 6,
                  border: "1px solid #bae7ff"
                }}>
                  <Typography.Text style={{ fontSize: 13, color: "#1890ff" }}>
                    <FolderOpenOutlined style={{ marginRight: 6 }} />
                    Adding to folder: <strong>{addingFileToFolder}</strong>
                  </Typography.Text>
                </div>
              )}

              <Space align="center" style={{ width: "100%", flexWrap: "wrap" }}>
                <FileAddOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Input
                  placeholder="Enter document name..."
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  style={{
                    minWidth: 200,
                    borderRadius: 6,
                    border: "1px solid #91d5ff"
                  }}
                  autoFocus
                />
                <Select
                  placeholder="Select document type"
                  value={newFileType}
                  onChange={setNewFileType}
                  style={{
                    minWidth: 180,
                    borderRadius: 6
                  }}
                  options={[
                    {
                      value: "Technical Specification",
                      label: (
                        <Space>
                          <FilePdfOutlined style={{ color: "#cf1322" }} />
                          Technical Specification
                        </Space>
                      )
                    },
                    {
                      value: "Safety Standard",
                      label: (
                        <Space>
                          <FileTextOutlined style={{ color: "#722ed1" }} />
                          Safety Standard
                        </Space>
                      )
                    },
                    {
                      value: "Test Report",
                      label: (
                        <Space>
                          <FileExcelOutlined style={{ color: "#52c41a" }} />
                          Test Report
                        </Space>
                      )
                    },
                    {
                      value: "Certificate",
                      label: (
                        <Space>
                          <FilePdfOutlined style={{ color: "#cf1322" }} />
                          Certificate
                        </Space>
                      )
                    },
                    {
                      value: "Manual",
                      label: (
                        <Space>
                          <FileWordOutlined style={{ color: "#1890ff" }} />
                          Manual
                        </Space>
                      )
                    },
                    {
                      value: "Custom Regulatory",
                      label: (
                        <Space>
                          <FileUnknownOutlined style={{ color: "#595959" }} />
                          Custom Regulatory
                        </Space>
                      )
                    },
                    {
                      value: "Other",
                      label: (
                        <Space>
                          <FileUnknownOutlined style={{ color: "#595959" }} />
                          Other
                        </Space>
                      )
                    },
                  ]}
                />
              </Space>

              <Space style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => handleCreateFile(addingFileToFolder)}
                  style={{
                    borderRadius: 6,
                    background: "#1890ff",
                    borderColor: "#1890ff"
                  }}
                  disabled={!newFileName.trim() || !newFileType}
                >
                  Create Document
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setIsCreatingFile(false);
                    setNewFileName("");
                    setNewFileType("");
                    setAddingFileToFolder(null);
                  }}
                  style={{ borderRadius: 6 }}
                >
                  Cancel
                </Button>
              </Space>
            </Space>
          </Card>
      
        {/* Upload Progress Modal */}

        <Modal
          open={openModal}
          footer={null}
          onCancel={() => setOpenModal(false)}
          title="Uploading Document"
          centered
        >
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
        </Modal>
      </div>

      <Tree
        className="draggable-tree"
        showLine={showLine ? { showLeafIcon } : false}
        showIcon={showIcon}
        expandedKeys={expandedKeys} // Controlled expansion
        onExpand={setExpandedKeys} // Handle expand/collapse
        onSelect={onSelect}
        treeData={gData} // Set the dynamic tree data
        blockNode
      />
    </div>
  );
};

FileStructureView.propTypes = {
  data: PropTypes.object,
  onFileUploadSuccess: PropTypes.func,
};

export default FileStructureView;
