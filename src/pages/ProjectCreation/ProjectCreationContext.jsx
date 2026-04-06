import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { UserApiService } from "services/api/UserAPIService";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { PaymentApiService } from "services/api/Payment";
import { extractApiError, formatDateToCustomFormat } from "shared/utility";
import { useAIAssessment } from "contexts/AIAssessmentContext";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
} from "shared/constants";

const ProjectCreationContext = createContext(null);

export const useProjectCreation = () => {
  const ctx = useContext(ProjectCreationContext);
  if (!ctx) {
    throw new Error("useProjectCreation must be used inside ProjectCreationProvider");
  }
  return ctx;
};

// ---------- helpers ----------
const generateId = () => Math.floor(1000 + Math.random() * 9000);

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ---------- Provider ----------
export const ProjectCreationProvider = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { startRiskSummaryProcessing } = useAIAssessment();

  // ---- Wizard step ----
  const [activeStep, setActiveStep] = useState(0);

  // ---- Step 1: Project Details ----
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // ---- Step 2: Upload Documents (folder-based) ----
  // Each folder: { id, name, files: [{ id, file, name, size, path, progress }] }
  const [folders, setFolders] = useState([]);

  // ---- Step 3: Project Configuration ----
  // { [folderId]: { file, name, path } | null }
  const [configFiles, setConfigFiles] = useState({});
  const configFilesRef = useRef(configFiles);

  // Keep ref in sync with state to avoid stale closure issues
  useEffect(() => {
    configFilesRef.current = configFiles;
  }, [configFiles]);

  // ---- Created project state (for multi-step API approach) ----
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [createdProject, setCreatedProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // ---- Legacy form data (for fields not shown in wizard but needed for API payload) ----
  const [formData, setFormData] = useState({
    projectNo: "",
    teamMembers: [],
    regulatory: "",
    invite_Users: [],
    document: [],
    status: "",
    invited_user_list: [],
    mapping_standards: "",
    checkListResponse: "",
    industry_id: "",
    industry_name: "",
  });

  // ---- Fetched data ----
  const [userData, setUserData] = useState([]);
  const [standardData, setStandardData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  // ---- UI state ----
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // ---- Upload modal state ----
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadType, setUploadType] = useState("document"); // "document" or "configuration"

  // ---- Multiple file upload state ----
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [multipleUploadProgress, setMultipleUploadProgress] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);
  const [uploadingFilesList, setUploadingFilesList] = useState([]); // Track all files being uploaded

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const industryDetails = userdetails?.[0]?.industries;

  // ---- Data fetching (same as original ProjectCreateForm) ----
  useEffect(() => {
    fetchUserData();
    fetchStandardData();
    if (industryDetails?.length > 1) {
      fetchIndustryData();
    }
  }, []);

  // ---- Restore project state from project data ----
  const restoreProjectState = useCallback((projectData) => {
    setCreatedProjectId(projectData.project_id);
    setCreatedProject(projectData);
    setProjectName(projectData.project_name || "");
    setProjectDesc(projectData.project_description || "");
    setFormData((prev) => ({
      ...prev,
      projectNo: projectData.project_no || "",
      regulatory: projectData.regulatory_standard || "",
      industry_id: projectData.industry_id || "",
      industry_name: projectData.industry_name || "",
      mapping_standards: projectData.mapping_standards || "",
    }));

    const projectDocs = projectData.project_documents || [];
    if (projectDocs.length > 0) {
      const folderMap = new Map();
      const configDocs = [];

      projectDocs.forEach((doc) => {
        const isConfig = !doc.folder_name || doc.folder_name?.trim() === "";

        if (isConfig) {
          configDocs.push(doc);
        } else {
          const folderName = doc.folder_name?.trim();
          if (!folderName) {
            console.warn(`Document ${doc.document_name} has no folder_name, skipping`);
            return;
          }
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, {
              id: generateId(),
              name: folderName,
              files: [],
            });
          }
          const folder = folderMap.get(folderName);
          folder.files.push({
            id: generateId(),
            name: doc.document_name,
            size: doc.size || 0,
            sizeFormatted: formatFileSize(doc.size || 0),
            path: doc.path || doc.file_path,
            progress: 100,
            document_id: doc.document_id,
            version_id: doc.version_id,
            file: null,
          });
        }
      });

      const restoredFolders = Array.from(folderMap.values());
      if (restoredFolders.length > 0) {
        setFolders(restoredFolders);

        const configFilesMap = {};
        const sortedConfigDocs = [...configDocs].sort((a, b) => {
          const idA = a.document_id || 0;
          const idB = b.document_id || 0;
          return idA - idB;
        });

        if (sortedConfigDocs.length > 0) {
          const firstConfigDoc = sortedConfigDocs[0];
          restoredFolders.forEach((folder) => {
            configFilesMap[folder.id] = {
              file: null,
              name: firstConfigDoc.document_name,
              path: firstConfigDoc.path || firstConfigDoc.file_path,
              document_id: firstConfigDoc.document_id,
              version_id: firstConfigDoc.version_id,
            };
          });
        }

        if (Object.keys(configFilesMap).length > 0) {
          setConfigFiles(configFilesMap);
        }
      }
    }
  }, []);

  // ---- Refresh project state from server ----
  const refreshProjectState = useCallback(async () => {
    if (!createdProjectId) return;
    try {
      const response = await ProjectApiService.projectDetails(createdProjectId);
      const projectData = response?.data?.details?.[0];
      if (projectData) {
        restoreProjectState(projectData);
      }
    } catch (error) {
      console.error("Failed to refresh project state:", error);
    }
  }, [createdProjectId, restoreProjectState]);

  // ---- Load project from URL if exists ----
  useEffect(() => {
    const projectIdFromUrl = searchParams.get("projectId");
    if (projectIdFromUrl && !createdProjectId) {
      ProjectApiService.projectDetails(projectIdFromUrl)
        .then((response) => {
          const projectData = response?.data?.details?.[0];
          if (projectData) {
            restoreProjectState(projectData);
          }
        })
        .catch((error) => {
          console.error("Failed to load project from URL:", error);
          setSearchParams({});
        });
    }
  }, [searchParams.get("projectId")]);

  const fetchIndustryData = () => {
    UserApiService.industryDetails()
      .then((response) => {
        setIndustryData(
          response?.data?.details?.filter((data) =>
            industryDetails?.includes(data.industry_id)
          ) || []
        );
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const fetchUserData = () => {
    UserApiService.userListing()
      .then((response) => {
        if (response && response?.data) {
          const userEmailToExclude = userdetails?.[0]?.user_email;
          const filteredUsers = response?.data?.activeUsers?.filter(
            (user) => user.user_email !== userEmailToExclude
          );
          setUserData(filteredUsers);
        }
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const fetchStandardData = () => {
    AdminConfigAPIService.standardListing()
      .then((response) => {
        if (response?.data?.details) {
          setStandardData(response?.data?.details);
        }
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  // ---- Step 1: Create project with minimal data ----
  const createProjectStep1 = useCallback(async () => {
    if (!projectName.trim()) {
      setSnackData({
        show: true,
        message: "Project Name is required.",
        type: "error",
      });
      return null;
    }
    if (!projectDesc.trim()) {
      setSnackData({
        show: true,
        message: "Project Description is required.",
        type: "error",
      });
      return null;
    }

    setIsCreatingProject(true);

    const historyItem = {
      changedby:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      date: new Date().toISOString(),
      changes: {
        projectName: projectName || "",
        projectNo: formData.projectNo || "",
        description: projectDesc || "",
        invite: "",
        documents: [],
        checklistRun: "",
        assessmentRun: "",
        standardUplaoded: "",
        status: "Draft",
      },
    };

    const payload = {
      project_name: projectName,
      project_no: formData.projectNo,
      project_description: projectDesc,
      regulatory_standard: formData.regulatory,
      invite_members: formData.invite_Users,
      invited_user_list: formData.invited_user_list,
      documents: [], // Empty initially - documents will be added incrementally
      org_id: userdetails?.[0]?.org_id,
      org_name: userdetails?.[0]?.org_name,
      created_by_id: userdetails?.[0]?.user_id,
      created_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      sector_id: userdetails?.[0]?.sector_id,
      sector_name: userdetails?.[0]?.sector_name,
      industry_id:
        formData.industry_id ||
        userdetails?.[0]?.industry_id ||
        userdetails?.[0]?.industries?.[0],
      industry_name:
        formData.industry_name ||
        userdetails?.[0]?.industry_names ||
        userdetails?.[0]?.industries?.[0],
      status: "Draft",
      no_of_runs: 0,
      success_count: 0,
      fail_count: 0,
      mapping_standards: formData.mapping_standards,
      summary_report: {},
      history: [historyItem],
      checkListResponse: formData?.checkListResponse,
    };

    try {
      // Check if project creation is allowed
      const permissionResponse = await PaymentApiService.isProjectCreationAllowed({
        user_id: userdetails?.[0]?.user_id,
      });

      if (permissionResponse.data?.details?.restricted) {
        setSnackData({
          show: true,
          message: "You have reached the maximum number of projects allowed.",
          type: "error",
        });
        setTimeout(() => {
          navigate("/payment?source=restriction");
        }, 2000);
        setIsCreatingProject(false);
        return null;
      }

      // Create the project
      const response = await ProjectApiService.projectCreate(payload);
      const projectId = response?.data?.details?.[0]?.project_id;
      const projectData = response?.data?.details?.[0];

      if (projectId) {
        setCreatedProjectId(projectId);
        setCreatedProject(projectData);
        // Store project ID in URL for persistence
        setSearchParams({ projectId });
        setSnackData({
          show: true,
          message: "Project created successfully!",
          type: "success",
        });
        setIsCreatingProject(false);
        return projectData;
      } else {
        throw new Error("Project ID not returned from server");
      }
    } catch (errResponse) {
      console.error("Project Creation Error:", errResponse);
      setSnackData({
        show: true,
        message: extractApiError(errResponse) || "Failed to create project",
        type: "error",
      });
      setIsCreatingProject(false);
      return null;
    }
  }, [
    projectName,
    projectDesc,
    formData,
    userdetails,
    navigate,
  ]);

  // ---- Helper: Create project document ----
  const createProjectDocumentEntry = useCallback(async (fileEntry, folderName) => {
    if (!createdProjectId) {
      console.error("Cannot create document: project_id is not set");
      return null;
    }

    const payload = {
      project_id: createdProjectId,
      document_name: fileEntry.name,
      document_type: fileEntry.file?.type || "application/octet-stream",
      uploaded_by_id: userdetails?.[0]?.user_id,
      uploaded_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      folder_name: folderName || "",
      document_desc: "",
      file_path: fileEntry.path,
      risk_information: {
        risk_level: " ",
        mitigation: " ",
      },
      information_extract: {
        summary: " ",
      },
    };

    try {
      const response = await ProjectApiService.createProjectDocument(payload);
      const documentData = response?.data?.details?.[0];

      if (documentData) {
        return {
          document_id: documentData.document_id,
          version_id: documentData.version_id,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to create project document:", error);
      setSnackData({
        show: true,
        message: `Failed to save document "${fileEntry.name}" to project`,
        type: "error",
      });
      return null;
    }
  }, [createdProjectId, userdetails]);

  // ---- Step 2: Folder / File helpers ----
  const addFolder = useCallback((name) => {
    const newFolder = { id: generateId(), name, files: [] };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  const renameFolder = useCallback((folderId, newName) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    );
  }, []);

  const removeFolder = useCallback((folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Also remove config for this folder
    setConfigFiles((prev) => {
      const copy = { ...prev };
      delete copy[folderId];
      return copy;
    });
  }, []);

  // Helper to check if file is Excel (config file)
  const isExcelFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["xlsx", "xls", "csv"].includes(ext);
  };

  // Helper to upload a single config file
  const uploadSingleConfigFile = async (file, folderId, isGlobal = false, forceCreateNew = false) => {
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
      folder_name: "",  // Always empty for config files
      isConfig: true,
      project_id: createdProjectId,
    };
    const response = await FileUploadApiService.fileUploadWithMetadata(payload);
    const s3Path = response.data.details[0];

    const configEntry = {
      file,
      name: file.name,
      path: s3Path,
      document_id: null,
      version_id: null,
    };

    // If project is already created, create or update the document entry
    // Use ref to get latest state and avoid stale closure issues
    const currentConfigFiles = configFilesRef.current;
    if (createdProjectId) {
      const existingConfig = currentConfigFiles[folderId];

      // If forceCreateNew is true (e.g., after replace delete), always create new document
      if (existingConfig?.document_id && existingConfig?.version_id && !isGlobal && !forceCreateNew) {
        const updatePayload = {
          file_path: s3Path,
          uploaded_by_id: userdetails?.[0]?.user_id,
          uploaded_by_name:
            userdetails?.[0]?.user_first_name +
            " " +
            userdetails?.[0]?.user_last_name,
        };

        const updateResponse = await ProjectApiService.uploadProjectDocument(
          updatePayload,
          existingConfig.version_id
        );

        const updatedDocData = updateResponse?.data?.details?.[0];
        if (updatedDocData) {
          configEntry.document_id = updatedDocData.document_id;
          configEntry.version_id = updatedDocData.version_id;
        } else {
          configEntry.document_id = existingConfig.document_id;
          configEntry.version_id = existingConfig.version_id;
        }
      } else {
        const docResult = await createProjectDocumentEntry(
          { ...configEntry, file },
          ""
        );
        if (docResult) {
          configEntry.document_id = docResult.document_id;
          configEntry.version_id = docResult.version_id;
        }
      }
    }

    return configEntry;
  };

  const setConfigFileForFolder = useCallback(async (folderId, file, isGlobal = false, shouldDeleteExisting = false) => {
    if (!file) return;

    // Handle array of files (multiple config upload)
    const filesArray = Array.isArray(file) ? file : [file];
    if (filesArray.length === 0) return;

    const isMultiple = filesArray.length > 1;

    // If replace mode (shouldDeleteExisting), delete existing config first
    // Use ref to get latest state and avoid stale closure issues
    const currentConfigFiles = configFilesRef.current;

    if (shouldDeleteExisting) {
      if (isGlobal) {
        // Global upload: delete ALL existing config files across all folders
        for (const [fid, existingConfig] of Object.entries(currentConfigFiles)) {
          if (existingConfig) {
            try {
              if (existingConfig.document_id && existingConfig.version_id) {
                await ProjectApiService.deleteProjectDocument(
                  existingConfig.document_id,
                  existingConfig.version_id
                );
              }
            } catch (error) {
              console.error("[DEBUG] Global delete - Failed to delete config for folder:", fid, error);
            }
          }
        }
        // Clear all configs from state
        setConfigFiles({});
      } else if (folderId) {
        // Per-folder upload: delete only this folder's config
        const existingConfig = currentConfigFiles[folderId];
        if (existingConfig) {
          try {
            // Delete from server using document delete API (not S3 delete)
            if (existingConfig.document_id && existingConfig.version_id) {
              await ProjectApiService.deleteProjectDocument(
                existingConfig.document_id,
                existingConfig.version_id
              );
            }
            // Remove from state
            setConfigFiles((prev) => {
              const newConfig = { ...prev };
              delete newConfig[folderId];
              return newConfig;
            });
          } catch (error) {
            console.error("[DEBUG] Failed to delete existing config:", error);
            // Continue with upload even if delete fails
          }
        } else {
          console.info("[DEBUG] No existing config found for folderId:", folderId);
        }
      }
    } else {
    }

    try {
      // Set upload type to configuration for config files
      setUploadType("configuration");

      if (isMultiple) {
        // Multiple files - use multiple upload modal
        setIsUploadingMultiple(true);
        setMultipleUploadProgress(0);
        setCurrentFileProgress(0);
        setCurrentFileName("");
        setUploadedFilesCount(0);
        setTotalFilesCount(filesArray.length);
        setUploadingFilesList(
          filesArray.map((f, index) => ({
            id: `config-${index}`,
            name: f.name,
            progress: 0,
            status: 'uploading',
          }))
        );
        setUploadModalOpen(true);
      } else {
        // Single file - use single upload modal
        setUploadingFile(filesArray[0]);
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadModalOpen(true);
      }

      const uploadedConfigs = [];

      for (let i = 0; i < filesArray.length; i++) {
        const currentFile = filesArray[i];

        if (isMultiple) {
          setCurrentFileName(currentFile.name);
          setCurrentFileProgress(0);
          setUploadingFilesList(prev =>
            prev.map((f, idx) =>
              idx === i ? { ...f, progress: 0, status: 'uploading' } : f
            )
          );
        }

        try {
          // Pass shouldDeleteExisting as forceCreateNew to ensure new document is created after delete
          const configEntry = await uploadSingleConfigFile(currentFile, folderId, isGlobal, shouldDeleteExisting);
          uploadedConfigs.push(configEntry);

          if (isMultiple) {
            setCurrentFileProgress(100);
            setUploadingFilesList(prev =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: 100, status: 'completed' } : f
              )
            );
            setUploadedFilesCount(i + 1);
            setMultipleUploadProgress(((i + 1) / filesArray.length) * 100);
          } else {
            setUploadProgress(100);
            setUploadSuccess(true);
          }

          // Apply config to folders
          if (isGlobal) {
            setConfigFiles((prev) => {
              const newConfig = { ...prev };
              folders.forEach((f) => {
                newConfig[f.id] = { ...configEntry };
              });
              return newConfig;
            });
          } else {
            setConfigFiles((prev) => ({
              ...prev,
              [folderId]: configEntry,
            }));
          }
        } catch (error) {
          console.error(`Failed to upload config file ${currentFile.name}:`, error);
          if (isMultiple) {
            setUploadingFilesList(prev =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: 0, status: 'error' } : f
              )
            );
            setUploadedFilesCount(i + 1);
            setMultipleUploadProgress(((i + 1) / filesArray.length) * 100);
          }
        }
      }

      // Refresh project state to get latest document IDs from server
      if (createdProjectId) {
        await refreshProjectState();
      }

      // Show success message
      setSnackData({
        show: true,
        message: isGlobal
          ? `Configuration file${filesArray.length > 1 ? 's' : ''} uploaded successfully for all folders!`
          : `Configuration file${filesArray.length > 1 ? 's' : ''} uploaded successfully!`,
        type: "success",
      });

      // Close modal after delay
      if (isMultiple) {
        setTimeout(() => {
          setIsUploadingMultiple(false);
          setUploadModalOpen(false);
          setMultipleUploadProgress(0);
          setCurrentFileProgress(0);
          setCurrentFileName("");
          setUploadedFilesCount(0);
          setTotalFilesCount(0);
          setUploadingFilesList([]);
        }, 1500);
      } else {
        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadingFile(null);
        }, 800);
      }
    } catch (err) {
      console.error("Config upload failed:", err);
      setSnackData({
        show: true,
        message: "Configuration file upload failed!",
        type: "error",
      });
      if (isMultiple) {
        setIsUploadingMultiple(false);
        setUploadModalOpen(false);
      }
    }
  }, [createdProjectId, folders, createProjectDocumentEntry, userdetails, refreshProjectState]);

  const addFilesToFolder = useCallback(
    async (folderId, fileList) => {
      const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
      const folder = folders.find((f) => f.id === folderId);
      const folderName = folder?.name || "";

      // Separate Excel files from regular files
      const excelFiles = filesArray.filter((f) => isExcelFile(f.name));
      const regularFiles = filesArray.filter((f) => !isExcelFile(f.name));

      // Handle Excel files - create separate folders for each Excel file
      if (excelFiles.length > 0) {
        // Upload Excel files as config for this folder
        await setConfigFileForFolder(folderId, excelFiles, false);

        // Also add Excel files to the folder's files list so they show in uploaded files section
        for (const excelFile of excelFiles) {
          const fileId = generateId();
          const fileEntry = {
            id: fileId,
            file: excelFile,
            name: excelFile.name,
            size: excelFile.size,
            sizeFormatted: formatFileSize(excelFile.size),
            path: "",
            progress: 0,
            document_id: null,
            version_id: null,
            isExcel: true, // Mark as Excel file
          };

          // Add to current folder's files
          setFolders((prev) =>
            prev.map((f) =>
              f.id === folderId ? { ...f, files: [...f.files, fileEntry] } : f
            )
          );

          // Upload Excel file to get S3 path
          try {
            const reader = new FileReader();
            const fileDataUrl = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(excelFile);
            });

            const ext = excelFile.name.split(".").pop();
            const payload = {
              documents: [fileDataUrl],
              type: ext,
              folder_name: folderName,
              isConfig: false,
              project_id: createdProjectId,
            };

            const response = await FileUploadApiService.fileUploadWithMetadata(payload);
            const s3Path = response.data.details[0];

            // Update file entry with S3 path
            const updatedFileEntry = {
              ...fileEntry,
              path: s3Path,
              progress: 100,
            };

            // If project is already created, create the document entry
            if (createdProjectId) {
              const docResult = await createProjectDocumentEntry(updatedFileEntry, folderName);
              if (docResult) {
                updatedFileEntry.document_id = docResult.document_id;
                updatedFileEntry.version_id = docResult.version_id;
              }
            }

            setFolders((prev) =>
              prev.map((f) =>
                f.id === folderId
                  ? {
                      ...f,
                      files: f.files.map((fi) =>
                        fi.id === fileId ? updatedFileEntry : fi
                      ),
                    }
                  : f
              )
            );
          } catch (err) {
            console.error("Excel file upload failed:", err);
          }
        }
      }

      // Only process regular files here
      if (regularFiles.length === 0) {
        return; // All files were Excel, handled above
      }

      // Continue with regular files only
      const filesToProcess = regularFiles;

      // If multiple files, use multiple upload mode
      const isMultiple = filesToProcess.length > 1;

      // Set upload type to document for regular files
      setUploadType("document");

      if (isMultiple) {
        setIsUploadingMultiple(true);
        setMultipleUploadProgress(0);
        setCurrentFileProgress(0);
        setCurrentFileName("");
        setUploadedFilesCount(0);
        setTotalFilesCount(filesToProcess.length);
        // Initialize uploading files list with all files
        setUploadingFilesList(
          filesToProcess.map((file, index) => ({
            id: `temp-${index}`,
            name: file.name,
            progress: 0,
            status: 'uploading', // uploading, completed, error
          }))
        );
        setUploadModalOpen(true);
      }

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const fileId = generateId();
        const fileEntry = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          path: "",
          progress: 0,
          document_id: null,
          version_id: null,
        };

        // Add to state immediately (progress = 0)
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folderId ? { ...f, files: [...f.files, fileEntry] } : f
          )
        );

        // Show upload modal for single file or update current file for multiple
        if (isMultiple) {
          setCurrentFileName(file.name);
          setCurrentFileProgress(0);
          // Update current file progress in the list
          setUploadingFilesList(prev =>
            prev.map((f, idx) =>
              idx === i ? { ...f, progress: 0, status: 'uploading' } : f
            )
          );
        } else {
          setUploadingFile(file);
          setUploadProgress(0);
          setUploadSuccess(false);
          setUploadModalOpen(true);
        }

        // Upload in background with metadata
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
            folder_name: folderName,
            isConfig: false,
            project_id: createdProjectId,
          };

          const response = await FileUploadApiService.fileUploadWithMetadata(payload);
          const s3Path = response.data.details[0];

          if (isMultiple) {
            setCurrentFileProgress(100);
            // Mark file as completed in the list
            setUploadingFilesList(prev =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: 100, status: 'completed' } : f
              )
            );
          } else {
            setUploadProgress(100);
            setUploadSuccess(true);
          }

          // Update file entry with S3 path
          const updatedFileEntry = {
            ...fileEntry,
            path: s3Path,
            progress: 100,
          };

          // If project is already created, create the document entry immediately
          if (createdProjectId) {
            const docResult = await createProjectDocumentEntry(updatedFileEntry, folderName);
            if (docResult) {
              updatedFileEntry.document_id = docResult.document_id;
              updatedFileEntry.version_id = docResult.version_id;
            }
          }

          setFolders((prev) =>
            prev.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    files: f.files.map((fi) =>
                      fi.id === fileId ? updatedFileEntry : fi
                    ),
                  }
                : f
            )
          );

          // Update multiple upload progress
          if (isMultiple) {
            setUploadedFilesCount(i + 1);
            setMultipleUploadProgress(((i + 1) / filesToProcess.length) * 100);
          } else {
            // Close modal after a brief delay for single file
            setTimeout(() => {
              setUploadModalOpen(false);
              setUploadingFile(null);
            }, 800);
          }
        } catch (err) {
          console.error("File upload failed:", err);
          setSnackData({
            show: true,
            message: `File upload failed for ${file.name}!`,
            type: "error",
          });
          if (isMultiple) {
            setUploadedFilesCount(i + 1);
            setMultipleUploadProgress(((i + 1) / filesToProcess.length) * 100);
            // Mark file as error in the list
            setUploadingFilesList(prev =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: 0, status: 'error' } : f
              )
            );
          }
        }
      }

      // Refresh project state to get latest document IDs from server
      if (createdProjectId) {
        await refreshProjectState();
      }

      // Close modal after delay for multiple files
      if (isMultiple) {
        setTimeout(() => {
          setIsUploadingMultiple(false);
          setUploadModalOpen(false);
          setMultipleUploadProgress(0);
          setCurrentFileProgress(0);
          setCurrentFileName("");
          setUploadedFilesCount(0);
          setTotalFilesCount(0);
          setUploadingFilesList([]);
        }, 1500);
      }
    },
    [folders, createdProjectId, createProjectDocumentEntry, setConfigFileForFolder, refreshProjectState]
  );

  const removeFileFromFolder = useCallback(async (folderId, fileId) => {
    const folder = folders.find((f) => f.id === folderId);
    const file = folder?.files.find((fi) => fi.id === fileId);

    // Delete from server using document delete API
    if (file?.document_id && file?.version_id) {
      try {
        await ProjectApiService.deleteProjectDocument(
          file.document_id,
          file.version_id
        );
      } catch (error) {
        console.error("Failed to delete document from server:", error);
        // Continue with local removal even if server deletion fails
      }
    }

    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, files: f.files.filter((fi) => fi.id !== fileId) }
          : f
      )
    );
  }, [folders]);

  // ---- Step 3: Remove config for a folder ----
  const removeConfigFileForFolder = useCallback(async (folderId) => {
    // Use ref to get latest state and avoid stale closure issues
    const config = configFilesRef.current[folderId];

    // If config has document_id and version_id, delete from server
    if (config?.document_id && config?.version_id) {
      try {
        await ProjectApiService.deleteProjectDocument(
          config.document_id,
          config.version_id
        );
      } catch (error) {
        console.error("Failed to delete config document:", error);
      }
    }

    // Remove from state
    setConfigFiles((prev) => {
      const newConfig = { ...prev };
      delete newConfig[folderId];
      return newConfig;
    });

    setSnackData({
      show: true,
      message: "Configuration file removed successfully!",
      type: "success",
    });
  }, []);

  // ---- Register unregistered files when projectId becomes available ----
  useEffect(() => {
    const registerUnregisteredFiles = async () => {
      if (!createdProjectId) return;

      // Register files in folders that don't have document_id
      for (const folder of folders) {
        for (const file of folder.files) {
          if (file.path && !file.document_id) {
            const fileEntry = {
              id: file.id,
              name: file.name,
              file: file.file,
              path: file.path,
            };
            const docResult = await createProjectDocumentEntry(fileEntry, folder.name);
            if (docResult) {
              // Update the file with document_id and version_id
              setFolders((prev) =>
                prev.map((f) =>
                  f.id === folder.id
                    ? {
                        ...f,
                        files: f.files.map((fi) =>
                          fi.id === file.id
                            ? { ...fi, document_id: docResult.document_id, version_id: docResult.version_id }
                            : fi
                        ),
                      }
                    : f
                )
              );
            }
          }
        }
      }

      // Register config files that don't have document_id
      // Use ref to get latest state and avoid stale closure issues
      const currentConfigFiles = configFilesRef.current;
      for (const [folderId, config] of Object.entries(currentConfigFiles)) {
        if (config?.path && !config.document_id) {
          const docResult = await createProjectDocumentEntry(
            { ...config, file: config.file },
            "" // Empty folder name for config
          );
          if (docResult) {
            setConfigFiles((prev) => ({
              ...prev,
              [folderId]: {
                ...prev[folderId],
                document_id: docResult.document_id,
                version_id: docResult.version_id,
              },
            }));
          }
        }
      }
    };

    registerUnregisteredFiles();
  }, [createdProjectId]); // Only run when createdProjectId changes

  // ---- Navigation ----
  const handleNext = useCallback(async () => {
    // If moving from Step 0 to Step 1 and project not yet created, create it first
    if (activeStep === 0 && !createdProjectId) {
      const projectData = await createProjectStep1();
      if (projectData) {
        setActiveStep((prev) => Math.min(prev + 1, 3));
      }
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, 3));
  }, [activeStep, createdProjectId, createProjectStep1]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // ---- Build documents array for API ----
  // Based on AsISawAPI.md, the API expects documents with these fields:
  // document_id, version, docuemnt_name, docuemnt_type, folder_name, path
  const buildDocumentsArray = useCallback(() => {
    const docs = [];
    folders.forEach((folder) => {
      folder.files.forEach((f) => {
        if (f.name && f.name.trim() !== "" && f.path) {
          docs.push({
            document_id: f.document_id || null,
            version: f.version_id || "V1",  // Fixed: was f.version
            docuemnt_name: f.name,
            docuemnt_type: "Project Document",
            docuemnt_desc: "",
            folder_name: folder.name,
            path: f.path,
            relativePath: f.name,
            name: f.name,
            size: f.size,
            type: f.file?.type || "",
            documenttype: "Project Document",
            uploadedOn: new Date().toISOString(),
          });
        }
      });
    });
    return docs;
  }, [folders]);

  // ---- Build config documents array for API ----
  const buildConfigDocumentsArray = useCallback(() => {
    const docs = [];
    // Use ref to get latest state and avoid stale closure issues
    const currentConfigFiles = configFilesRef.current;
    Object.entries(currentConfigFiles).forEach(([folderId, configFile]) => {
      if (configFile && configFile.path) {
        docs.push({
          document_id: configFile.document_id || null,  // Fixed: was always null
          version: configFile.version_id || "V1",       // Fixed: use version_id
          docuemnt_name: configFile.name,
          docuemnt_type: "Configuration Document",
          docuemnt_desc: "",
          folder_name: "",  // Always empty for config files
          path: configFile.path,
          relativePath: configFile.name,
          name: configFile.name,
          size: configFile.file?.size || 0,
          type: configFile.file?.type || "",
          documenttype: "Configuration Document",
          uploadedOn: new Date().toISOString(),
        });
      }
    });
    return docs;
  }, []);

  // ---- Helper: Upload files for AI Assessment ----
  const uploadFilesForAIAssessment = useCallback(async () => {
    if (!createdProjectId) {
      console.error("Cannot upload files for AI assessment: project_id is not set");
      return false;
    }

    // Collect all files from folders and config
    const files = [];

    // Add files from folders
    folders.forEach((folder) => {
      folder.files.forEach((file) => {
        if (file.path) {
          files.push({
            path: file.path,
            name: file.name,
          });
        }
      });
    });

    // Add config files
    // Use ref to get latest state and avoid stale closure issues
    const currentConfigFiles = configFilesRef.current;
    Object.entries(currentConfigFiles).forEach(([folderId, configFile]) => {
      if (configFile && configFile.path) {
        files.push({
          path: configFile.path,
          name: configFile.name,
        });
      }
    });

    if (files.length === 0) {
      console.warn("No files to upload for AI assessment");
      return true;
    }

    const payload = {
      project_id: createdProjectId,
      files: files,
    };

    try {
      const response = await ProjectApiService.uploadFilesToAIserver(payload);
      console.log("AI Assessment file upload response:", response);
      return true;
    } catch (error) {
      console.error("Failed to upload files for AI assessment:", error);
      setSnackData({
        show: true,
        message: "Failed to upload files for AI assessment. Please try again.",
        type: "error",
      });
      return false;
    }
  }, [createdProjectId, folders]);

  // ---- Submit: Only run AI Assessment ----
  const handleSubmit = useCallback(
    async (submissionStatus = "In Progress") => {
      // Check if project was created
      if (!createdProjectId) {
        setSnackData({
          show: true,
          message: "Project not found. Please start over.",
          type: "error",
        });
        return;
      }

      // Check for any files still uploading (safety check)
      const allFiles = folders.flatMap((f) => f.files);
      const uploadingFiles = allFiles.filter((f) => !f.path);
      if (uploadingFiles.length > 0) {
        setSnackData({
          show: true,
          message: `Please wait for ${uploadingFiles.length} file(s) to finish uploading.`,
          type: "error",
        });
        return;
      }

      setSubmitLoading(true);

      try {
        // ---- Upload files for AI Assessment ----
        const uploadSuccess = await uploadFilesForAIAssessment();
        if (!uploadSuccess) {
          setSubmitLoading(false);
          return;
        }

        setSubmitLoading(false);
        setSnackData({
          show: true,
          message: "AI Assessment started successfully!",
          type: "success",
        });

        // ---- Trigger Risk Assessment ----
        startRiskSummaryProcessing(createdProjectId, projectName).catch(err => {
          console.error("Failed to start risk summary processing in global context:", err);
        });

        navigate(`/projectView/${createdProjectId}`, {
          state: {
            projectId: createdProjectId,
            projectName: projectName,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      } catch (errResponse) {
        console.error("AI Assessment Error:", errResponse);
        setSubmitLoading(false);
        setSnackData({
          show: true,
          message: extractApiError(errResponse) || "Failed to start AI assessment",
          type: "error",
        });
      }
    },
    [
      createdProjectId,
      projectName,
      folders,
      configFiles,
      navigate,
      queryClient,
      startRiskSummaryProcessing,
      uploadFilesForAIAssessment,
    ]
  );

  // ---- Check if any files are currently uploading ----
  const isUploading = useCallback(() => {
    return folders.some((folder) =>
      folder.files.some((file) => !file.path || file.progress < 100)
    );
  }, [folders]);

  const value = {
    // Step navigation
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,

    // Step 1
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,

    // Step 2
    folders,
    addFolder,
    renameFolder,
    removeFolder,
    addFilesToFolder,
    removeFileFromFolder,

    // Step 3
    configFiles,
    setConfigFileForFolder,
    removeConfigFileForFolder,

    // Created project (multi-step API)
    createdProjectId,
    createdProject,
    isCreatingProject,
    createProjectStep1,

    // Legacy form data
    formData,
    setFormData,

    // Fetched data
    userData,
    standardData,
    industryData,
    selectedIndustry,
    setSelectedIndustry,

    // UI state
    loading,
    setLoading,
    submitLoading,
    snackData,
    setSnackData,
    isUploading,

    // Submit
    handleSubmit,
    buildDocumentsArray,
    buildConfigDocumentsArray,

    // Upload modal state
    uploadModalOpen,
    setUploadModalOpen,
    uploadingFile,
    uploadProgress,
    uploadSuccess,
    uploadType,

    // Multiple upload state
    isUploadingMultiple,
    multipleUploadProgress,
    currentFileProgress,
    currentFileName,
    uploadedFilesCount,
    totalFilesCount,
    uploadingFilesList,
  };

  return (
    <ProjectCreationContext.Provider value={value}>
      {children}
    </ProjectCreationContext.Provider>
  );
};

export default ProjectCreationContext;
