import React, { useState, useEffect, useRef, useMemo } from "react";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import FilePdfOutlined from "@ant-design/icons/FilePdfOutlined";
import FileWordOutlined from "@ant-design/icons/FileWordOutlined";
import FileExcelOutlined from "@ant-design/icons/FileExcelOutlined";
import FileTextOutlined from "@ant-design/icons/FileTextOutlined";
import FileImageOutlined from "@ant-design/icons/FileImageOutlined";
import FileUnknownOutlined from "@ant-design/icons/FileUnknownOutlined";
import { message, Progress, Modal, Typography } from "antd";
import { API_ERROR_MESSAGE } from "shared/constants";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { ProjectApiService } from "services/api/ProjectAPIService";
import UnifiedDocumentControl from "../../components/UnifiedDocumentControl";
// import GoogleDrivePicker from "./GoogleDrivePicker";
// import GoogleDriveFileCard from "./GoogleDriveFileCard";
import { GoogleDrivePickerService } from "services/api/googleDrivePickerService";
import UnifiedFileTree from "../../components/UnifiedFileTree"; // Added
import { brand } from "themes/theme/brand";
export const getFileIcon = (filename) => {
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

const FileStructureView = ({ data, onFileUploadSuccess, aiButtonLoading }) => {
  const [localFolders, setLocalFolders] = useState([]); // Store optimistic folders
  const [expandedKeys, setExpandedKeys] = useState([]); // Store keys to expand
  const [newDoc, setNewDoc] = useState({ file: null });

  // New folder and file creation states (Remove gData usage references eventually)
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
  const [currentFileProgress, setCurrentFileProgress] = useState(0); // NEW: per-file S3 progress
  const [currentFileName, setCurrentFileName] = useState(""); // NEW: per-file name display
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);

  // Hidden file input ref for multiple file uploads
  const fileInputRef = useRef(null);

  // Google Drive functionality
  // Check Google token status
  const checkGoogleToken = async () => {
    setIsTokenLoading(true);
    try {
      const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
      const userId = userdetails?.[0]?.user_id;

      if (userId) {
        const response =
          await GoogleDrivePickerService.getGoogleAccessTokenWithCache(userId);
        const hasToken =
          response && (response.access_token || response.accessToken);
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
      const googleAuthSuccess = urlParams.get("google_auth_success");
      const googleAuthCode = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const gdrive = urlParams.get("gdrive");

      // Check for any indication of Google auth completion
      if (
        googleAuthSuccess === "true" ||
        googleAuthCode ||
        (state && !error) ||
        gdrive === "1"
      ) {
        console.log(
          "Google authorization detected, checking token immediately",
        );
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

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // --- File Upload logic
  // CHANGED: added optional `silent` and `onProgress` params.
  // Existing single-file callers pass nothing — behaviour is identical for them.
  const handleFileUpload = async (file, silent = false, onProgress = null) => {
    if (!file) return;

    if (!silent) {
      setUploadingFile(file);
      setUploadProgress(0);
      setUploadSuccess(false);
      setOpenModal(true);
    }

    try {
      const reader = new FileReader();
      const fileDataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop();
      const payload = {
        documents: [fileDataUrl],
        type: ext,
        project_id: data.project_id,
      };

      // CHANGED: pass onUploadProgress via otherConfig (4th arg) so axios fires progress events.
      // BaseApiService.post signature: post(url, params, data, useBaseApiPath, otherConfig)
      // FileUploadApiService.fileUpload calls BaseApiService.post(`/api/v1/uploadToStorage`, null, filepayload)
      // — we need to thread the config through. See note below on FileUploadApiService change.
      const response = await FileUploadApiService.fileUpload(payload, {
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          if (!silent) setUploadProgress(percent);
          if (onProgress) onProgress(percent);
        },
      });

      // Assume API returns the uploaded file path
      const filePath = response.data.details?.[0];

      if (!silent) {
        setUploadProgress(100);
        setFilePath(filePath);
        setUploadSuccess(true);
        message.success("File uploaded successfully!");
      }

      return filePath;
    } catch (err) {
      console.error(err);
      if (!silent) {
        message.error("File upload failed!");
        setOpenModal(false);
      }
      throw err; // CHANGED: re-throw so multi-upload loop can catch and count failures
    }
  };

  // CHANGED: added optional `silent` param.
  // When silent=true (called from multi-upload loop), skips modal close and messages.
  const handleUploadDocument = async (doc_data, silent = false) => {
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

    const apiCall = doc_data.version_id
      ? ProjectApiService.uploadProjectDocument(payload, doc_data.version_id)
      : ProjectApiService.createProjectDocument(payload);

    return apiCall
      .then((response) => {
        if (!silent) {
          message.success(
            response.message || "Document uploaded successfully!",
          );
          if (onFileUploadSuccess) onFileUploadSuccess();
        }
      })
      .catch((errResponse) => {
        if (!silent) {
          message.error(
            errResponse?.error?.message ||
              API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
              "Document upload failed!",
          );
        }
        throw errResponse;
      })
      .finally(() => {
        // CHANGED: only reset modal/state for non-silent (single-file) flows
        if (!silent) {
          setOpenModal(false);
          setUploadProgress(0);
          setUploadingFile(null);
          setUploadSuccess(false);
          setFilePath("");
          setNewDoc({ file: null });
        }
      });
  };

  // Handle multiple file uploads
  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploadingMultiple(true);
    setMultipleUploadProgress(0);
    setCurrentFileProgress(0); // NEW
    setCurrentFileName(""); // NEW
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

        // NEW: update which file is currently uploading and reset its progress bar
        setCurrentFileName(file.name);
        setCurrentFileProgress(0);

        try {
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

          // CHANGED: silent=true (don't touch single-file modal state),
          // onProgress callback drives the per-file progress bar in real time
          const uploadedPath = await handleFileUpload(file, true, (pct) =>
            setCurrentFileProgress(pct),
          );

          if (uploadedPath) {
            // Create document record
            const documentData = {
              document_name: file.name,
              document_type: file.type || "application/octet-stream",
              file_path: uploadedPath,
            };

            // CHANGED: silent=true so handleUploadDocument doesn't close the modal mid-batch
            await handleUploadDocument(documentData, true);

            successfulUploads++;
            uploadResults.push({ file: file.name, status: "success" });
            console.log(`Successfully uploaded: ${file.name}`);
          } else {
            failedUploads++;
            uploadResults.push({
              file: file.name,
              status: "failed",
              error: "No upload path returned",
            });
            console.error(`Failed to upload: ${file.name} - No upload path`);
          }
        } catch (error) {
          failedUploads++;
          uploadResults.push({
            file: file.name,
            status: "failed",
            error: error.message,
          });
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
        message.warning(
          `⚠️ ${successfulUploads} of ${files.length} files uploaded successfully. ${failedUploads} failed.`,
        );
      } else {
        message.error(`❌ All ${files.length} files failed to upload.`);
      }

      // Log detailed results
      console.log("Upload Results:", uploadResults);

      // Refresh the file structure
      if (onFileUploadSuccess && successfulUploads > 0) {
        onFileUploadSuccess();
      }
    } catch (error) {
      console.error("Multiple file upload failed:", error);
      message.error(`❌ Upload process failed: ${error.message}`);
    } finally {
      // CHANGED: delay close so user sees the 100% completion state briefly
      setTimeout(() => {
        setIsUploadingMultiple(false);
        setOpenModal(false);
        setMultipleUploadProgress(0);
        setCurrentFileProgress(0);
        setCurrentFileName("");
        setUploadedFilesCount(0);
        setTotalFilesCount(0);
      }, 1500);
    }
  };

  // Handle file picker for multiple selection
  const handleMultipleFileSelect = () => {
    console.log("handleMultipleFileSelect called");
    try {
      if (fileInputRef.current) {
        console.log("Triggering file input click");
        fileInputRef.current.click();
      } else {
        console.error("File input ref not found");
        message.error("File input not available. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error in handleMultipleFileSelect:", error);
      message.error("Failed to open file picker. Please try again.");
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
        title: "Delete Document",
        content: `Are you sure you want to delete "${document.document_name}"? This action cannot be undone.`,
        okText: "Delete",
        okButtonProps: {
          disabled: aiButtonLoading,
        },
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            if (aiButtonLoading) return;
            const response = await ProjectApiService.deleteProjectDocument(
              document.document_id,
              document.version_id,
            );

            message.success(
              response.message || "Document deleted successfully!",
            );

            // Call the callback to refresh project data in parent component
            if (onFileUploadSuccess) {
              onFileUploadSuccess();
            }
          } catch (error) {
            console.error("Delete failed:", error);
            message.error(
              error?.error?.message ||
                API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR ||
                "Failed to delete document!",
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
    const existingFolders =
      data?.project_documents
        ?.map((doc) => doc.folder_name)
        .filter((name) => name && name !== "null") || [];

    const optimisticFolders = localFolders.map((f) => f.folder_name);
    const allFolders = [...existingFolders, ...optimisticFolders];

    if (allFolders.includes(folderName)) {
      message.error("Folder with this name already exists");
      throw new Error("Folder exists");
    }

    // Add optimistic folder
    setLocalFolders((prev) => [
      ...prev,
      {
        folder_name: folderName,
        document_name: null, // Placeholder
        document_id: `temp-${Date.now()}`,
        version: "V1",
      },
    ]);

    // Expand new folder
    const folderKey = folderName.replace(/\s+/g, "-");
    setExpandedKeys((prev) => [...prev, folderKey]);

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
        const createResponse =
          await ProjectApiService.createProjectDocument(payload);
        message.success(
          createResponse.message || "Document created successfully!",
        );
      }

      if (onFileUploadSuccess) onFileUploadSuccess();
      setAddingFileToFolder(null);
    } catch (errResponse) {
      message.error(
        errResponse?.error?.message || "Failed to create document!",
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {/* Unified Controls & Google Drive Layout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "600px" }}>
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
          onCancel={() => {
            if (!isUploadingMultiple) setOpenModal(false);
          }} // CHANGED: block accidental close during upload
          closable={!isUploadingMultiple} // CHANGED
          maskClosable={!isUploadingMultiple} // CHANGED
          title={
            isUploadingMultiple
              ? "Uploading Multiple Files"
              : "Uploading Document"
          }
          centered
        >
          {isUploadingMultiple ? (
            <div>
              {/* Overall progress — layout unchanged */}
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>
                  Uploading {uploadedFilesCount} of {totalFilesCount} files
                </Typography.Text>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Progress: {Math.round(multipleUploadProgress)}% complete
                </div>
              </div>
              <Progress
                percent={Math.round(multipleUploadProgress)}
                status={multipleUploadProgress === 100 ? "success" : "active"}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  "0%": "#ffffff",
                  "100%": brand.primary,
                }}
              />

              {/* NEW: per-file progress card */}
              {currentFileName && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 12px",
                    backgroundColor: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    {getFileIcon(currentFileName)}
                    <Typography.Text ellipsis style={{ flex: 1, fontSize: 13 }}>
                      {currentFileName}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {currentFileProgress}%
                    </Typography.Text>
                  </div>
                  <Progress
                    percent={currentFileProgress}
                    size="small"
                    showInfo={false}
                    status={currentFileProgress === 100 ? "success" : "active"}
                    strokeColor={brand.primary}
                  />
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Files will be uploaded to the root directory
              </div>
              {uploadedFilesCount === totalFilesCount &&
                totalFilesCount > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 8,
                      backgroundColor: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: 4,
                    }}
                  >
                    <Typography.Text style={{ color: "#52c41a", fontSize: 12 }}>
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
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
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
        aiButtonLoading={aiButtonLoading}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={(e) => {
          console.log("File input changed, files:", e.target.files);
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            console.log("Selected files:", files);
            handleMultipleFileUpload(files);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default FileStructureView;
