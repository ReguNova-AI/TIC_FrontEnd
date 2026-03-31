import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ---------- Provider ----------
export const ProjectCreationProvider = ({ children }) => {
  const navigate = useNavigate();
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

  const addFilesToFolder = useCallback(
    async (folderId, fileList) => {
      const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);

      for (const file of filesArray) {
        const fileId = generateId();
        const fileEntry = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          path: "",
          progress: 0,
        };

        // Add to state immediately (progress = 0)
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folderId ? { ...f, files: [...f.files, fileEntry] } : f
          )
        );

        // Upload in background
        try {
          const reader = new FileReader();
          const fileDataUrl = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const ext = file.name.split(".").pop();
          const payload = { documents: [fileDataUrl], type: ext };

          const response = await FileUploadApiService.fileUpload(payload);

          setFolders((prev) =>
            prev.map((f) =>
              f.id === folderId
                ? {
                  ...f,
                  files: f.files.map((fi) =>
                    fi.id === fileId
                      ? { ...fi, path: response.data.details[0], progress: 100 }
                      : fi
                  ),
                }
                : f
            )
          );
        } catch (err) {
          console.error("File upload failed:", err);
          setSnackData({
            show: true,
            message: "File upload failed!",
            type: "error",
          });
        }
      }
    },
    []
  );

  const removeFileFromFolder = useCallback((folderId, fileId) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, files: f.files.filter((fi) => fi.id !== fileId) }
          : f
      )
    );
  }, []);

  // ---- Step 3: Config helpers ----
  const setConfigFileForFolder = useCallback(async (folderId, file) => {
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
      const response = await FileUploadApiService.fileUpload(payload);

      setConfigFiles((prev) => ({
        ...prev,
        [folderId]: {
          file,
          name: file.name,
          path: response.data.details[0],
        },
      }));

      setSnackData({
        show: true,
        message: "Configuration file uploaded successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Config upload failed:", err);
      setSnackData({
        show: true,
        message: "Configuration file upload failed!",
        type: "error",
      });
    }
  }, []);

  // ---- Navigation ----
  const handleNext = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // ---- Build documents array for API ----
  const buildDocumentsArray = useCallback(() => {
    const docs = [];
    folders.forEach((folder) => {
      folder.files.forEach((f) => {
        if (f.name && f.name.trim() !== "" && f.path) {
          docs.push({
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

  // ---- Submit (same payload as original ProjectCreateForm) ----
  const handleSubmit = useCallback(
    (submissionStatus = "In Progress") => {
      const cleanedDocuments = buildDocumentsArray();

      if (cleanedDocuments.length === 0) {
        setSnackData({
          show: true,
          message: "Please add at least one document.",
          type: "error",
        });
        return;
      }

      setSubmitLoading(true);

      const updatedStatus =
        submissionStatus === "Draft" ? "Draft" : "In Progress";

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
          documents: formData.document || "",
          checklistRun: "",
          assessmentRun: "",
          standardUplaoded: "",
          status: updatedStatus,
        },
      };

      const payload = {
        project_name: projectName,
        project_no: formData.projectNo,
        project_description: projectDesc,
        regulatory_standard: formData.regulatory,
        invite_members: formData.invite_Users,
        invited_user_list: formData.invited_user_list,
        documents: cleanedDocuments,
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
        status: updatedStatus,
        no_of_runs: 0,
        success_count: 0,
        fail_count: 0,
        mapping_standards: formData.mapping_standards,
        summary_report: {},
        history: [historyItem],
        checkListResponse: formData?.checkListResponse,
      };

      if (submissionStatus !== "Draft") {
        payload.last_run = formatDateToCustomFormat(new Date());
      }

      console.log("Project Creation Payload:", JSON.stringify(payload, null, 2));
      console.log("Documents being sent:", cleanedDocuments);

      PaymentApiService.isProjectCreationAllowed({
        user_id: userdetails?.[0]?.user_id,
      })
        .then((response) => {
          if (response.data?.details?.restricted) {
            setSnackData({
              show: true,
              message: "You have reached the maximum number of projects allowed.",
              type: "error",
            });
            setTimeout(() => {
              navigate("/payment?source=restriction");
            }, 2000);
          } else {
            ProjectApiService.projectCreate(payload)
              .then((response) => {
                console.log("Project Creation Response:", response);
                setSubmitLoading(false);
                setSnackData({
                  show: true,
                  message: response.message,
                  type: "success",
                });
                const projectId = response?.data?.details?.[0].project_id;

                // ---- Trigger Risk Assessment if heading for 'In Progress' ----
                if (submissionStatus === "In Progress") {
                  startRiskSummaryProcessing(projectId, projectName).catch(err => {
                    console.error("Failed to start risk summary processing in global context:", err);
                  });
                  ProjectApiService.regenerateRiskSummary(projectId).catch(err => {
                    console.error("Failed to trigger regenerateRiskSummary API:", err);
                  });
                }

                navigate(`/projectView/${projectId}`, {
                  state: {
                    projectId: projectId,
                    projectName: projectName,
                  },
                });
                queryClient.invalidateQueries({ queryKey: ["projects"] });
              })
              .catch((errResponse) => {
                console.error("Project Creation Error:", errResponse);
                setSubmitLoading(false);
                setSnackData({
                  show: true,
                  message: extractApiError(errResponse),
                  type: "error",
                });
              });
          }
        })
        .catch((errResponse) => {
          setSubmitLoading(false);
          console.error("Payment check failed:", errResponse);
        });
    },
    [
      projectName,
      projectDesc,
      formData,
      folders,
      buildDocumentsArray,
      navigate,
      queryClient,
      userdetails,
    ]
  );

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

    // Submit
    handleSubmit,
    buildDocumentsArray,
  };

  return (
    <ProjectCreationContext.Provider value={value}>
      {children}
    </ProjectCreationContext.Provider>
  );
};

export default ProjectCreationContext;
