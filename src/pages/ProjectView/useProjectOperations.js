import { useState, useCallback } from "react";
import { formatDateToCustomFormat } from "shared/utility";
import {
  useUpdateProject,
  useUpdateProjectChat,
  useUploadFilesToAIServer,
  useProjectDocumentUpload,
  useProjectStandardChecklist,
  useUploadStandardChat,
} from "./useProjectQueries";
import { useQueryClient } from "@tanstack/react-query";

// Helper function to create a history object based on changes
export const createHistoryObject = (data, previousData, heading, userName) => {
  const historyItem = {
    changedby: userName,
    date: new Date().toISOString(),
    changes: {
      projectName:
        heading === "projectDetails"
          ? (data?.projectName || data?.project_name) !== previousData.project_name
            ? (data?.projectName || data?.project_name)
            : ""
          : "",
      projectNo:
        heading === "projectDetails"
          ? (data?.projectNo || data?.project_no) !== previousData.project_no
            ? (data?.projectNo || data?.project_no)
            : ""
          : "",
      description:
        heading === "projectDetails"
          ? (data?.projectDesc || data?.project_description) !== previousData.project_description
            ? (data?.projectDesc || data?.project_description)
            : ""
          : "",
      invite: "",
      documents: heading === "documentUpload" ? (data ? data : "") : "",
      checklistRun:
        heading === "checklistRun" ? "Run to generated checklist report" : "",
      assessmentRun:
        heading === "assessmentRun" ? "Run to generate Assessment report" : "",
      standardUplaoded:
        heading === "StandardUpdates"
          ? data.standardUploaded !== previousData.standardUploaded
            ? data.standardUploaded
            : ""
          : "",
      projectConfiguration:
        heading === "projectConfiguration" ? "Uploaded project configuration" : "",
      status: previousData.status,
    },
  };
  return historyItem;
};

export const useProjectOperations = (projectData, userName) => {
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [aiButtonLoading, setAiButtonLoading] = useState(false);

  // Mutations
  const updateProjectMutation = useUpdateProject();
  const updateProjectChatMutation = useUpdateProjectChat();
  const uploadFilesToAIServerMutation = useUploadFilesToAIServer();
  const projectDocumentUploadMutation = useProjectDocumentUpload();
  const projectStandardChecklistMutation = useProjectStandardChecklist();
  const uploadStandardChatMutation = useUploadStandardChat();
  const queryClient = useQueryClient();

  const handleProgressModalOpen = useCallback(() => {
    setIsProgressModalVisible(true);
    setDisableButton(false);
  }, []);

  const handleProgressModalClose = useCallback(() => {
    setIsProgressModalVisible(false);
  }, []);

  const handleChatUpdate = useCallback(
    (data) => {
      const updatedResponse = {
        project_id: projectData.project_id,
        chatResponse: { data: data },
      };

      updateProjectChatMutation.mutate(updatedResponse);
    },
    [projectData?.project_id, updateProjectChatMutation]
  );

  const updateProjectDetails = useCallback(
    (data, heading = "projectDetails") => {
      const updatedResponse = { ...projectData };
      const previousData = { ...projectData };

      if (heading === "projectDetails") {
        updatedResponse.project_name = data.projectName || data.project_name;
        updatedResponse.project_description = data.projectDesc || data.project_description;
        updatedResponse.project_no = data.projectNo || data.project_no;
        updatedResponse.invite_members = data.invite_Users || data.invite_members;
        updatedResponse.invited_user_list = data.invited_user_list;
      }

      if (heading === "projectMappingStandards") {
        updatedResponse.mapping_standards = data.mapping_standards;
      }

      const newHistory = createHistoryObject(
        data,
        previousData,
        heading,
        userName
      );
      const updatedHistory = [...(projectData.history || []), newHistory];
      const updatedResponseWithHistory = {
        ...updatedResponse,
        history: updatedHistory,
      };

      updateProjectMutation.mutate(updatedResponseWithHistory, {
        onSuccess: () => {
          queryClient.invalidateQueries(['projectDetails', updatedResponse.project_id]);
        },
      });
    },
    [projectData, userName, updateProjectMutation, queryClient]
  );

  const handleRunAIAssessment = useCallback(async () => {
    setAiButtonLoading(true);

    let files = [];
    if (projectData?.project_documents?.length > 0) {
      projectData.project_documents.forEach((document) => {
        let { file_path, document_name } = document;
        if (file_path !== null && file_path !== "null") {
          files.push({
            path: file_path,
            name: document_name || file_path.split('/').pop()
          });
        }
      });
    }

    if (files?.length > 0) {
      const payload = {
        project_id: projectData?.project_id,
        files: files,
      };

      uploadFilesToAIServerMutation.mutate(payload, {
        onSettled: () => {
          setAiButtonLoading(false);
        },
      });
    } else {
      setAiButtonLoading(false);
      // Error handling is in the mutation
    }
  }, [projectData, uploadFilesToAIServerMutation]);

  const parseApiResponse = useCallback((response) => {
    let dataArray = [];
    if (response.checklist && Array.isArray(response.checklist)) {
      let checklist = response.checklist;
      const sections = [];
      const annexes = [];

      checklist.forEach((item) => {
        if (item.includes("##")) {
          if (item.toLowerCase().startsWith("## annex")) {
            annexes.push({
              title: item
                .split("##")[1]
                ?.trim()
                .replace(/^Annex\s*[:,-]?\s*/i, ""),
              points: [],
            });
          } else {
            sections.push({
              title: item
                .split("##")[1]
                ?.trim()
                .replace(/^Section\s*[:,-]?\s*/i, "")
                .replace(/^\d+\s*/, ""),
              points: [],
            });
          }
        } else if (item.includes("**")) {
          if (item.toLowerCase().startsWith("** annex")) {
            annexes.push({
              title: item
                .split("**")[1]
                ?.trim()
                .replace(/^Annex\s*[:,-]?\s*/i, ""),
              points: [],
            });
          } else {
            sections.push({
              title: item
                .split("**")[1]
                ?.trim()
                .replace(/^Section\s*[:,-]?\s*/i, "")
                .replace(/^\d+\s*/, ""),
              points: [],
            });
          }
        } else {
          const lastSection = sections[sections.length - 1];
          const lastAnnex = annexes[annexes.length - 1];

          if (lastSection) {
            const raw = item
              .replace(/^\d+\.\s*/, "")
              .replace("---", "")
              .replace(/\\"/g, "")
              .trim();
            if (raw !== "") {
              dataArray.push(raw);
            }
            lastSection.points.push(item.replace(/^\d+\.\s*/, "").trim());
          } else if (lastAnnex) {
            const raw = item
              .replace(/^\d+\.\s*/, "")
              .replace("---", "")
              .replace(/\\"/g, "")
              .trim();
            if (raw !== "") {
              dataArray.push(raw);
            }
            lastAnnex.points.push(item.replace(/^\d+\.\s*/, "").trim());
          }
        }
      });

      return dataArray;
    } else {
      console.error("Unknown response format");
      return [];
    }
  }, []);

  const runComplianceAssessment = useCallback(
    async (query, projectId, type, standardData) => {
      setDisableButton(true);

      const regex = /\/([^/]+)$/;
      let file = null;
      let docArray = [];
      let match = null;

      projectData?.documents?.forEach((document) => {
        let { documenttype, path } = document;
        if (documenttype === "Project Document") {
          file = path;
          match = file?.match(regex);
          docArray.push(match?.[1]);
        }
      });

      let data = [];
      if (query) {
        data = parseApiResponse(query);
      }

      let customImageKeyValue = null;
      let fileName = standardData?.find(
        (data) => data?.standard_name === projectData?.regulatory_standard
      )?.standard_url;

      let customFileName = projectData?.documents
        ?.filter((f) => f.documenttype === "Custom Regulatory")
        ?.map((f) => f.path);

      if (
        (fileName === undefined || fileName === null) &&
        customFileName?.length <= 0
      ) {
        fileName = projectData?.mapping_standards;
      }

      if (fileName !== undefined) {
        const regex1 = /\/([^/]+)$/;
        const match =
          customFileName?.length > 0
            ? customFileName?.[0].match(regex1)
            : fileName?.match(regex1);

        customImageKeyValue = match?.[1];
      }

      const payload = {
        imageKey: docArray,
        project_id: projectId,
        requirements: data,
        user_name: userName,
        checkListImageKey: customImageKeyValue,
      };

      if (match !== undefined && match?.length > 0) {
        projectDocumentUploadMutation.mutate(
          { payload, type },
          {
            onSuccess: () => {
              handleProgressModalOpen();
            },
            onError: () => {
              setDisableButton(false);
              const updatedResponse = { ...projectData };
              const previousData = { ...projectData };
              updatedResponse.no_of_runs = updatedResponse?.no_of_runs + 1;
              updatedResponse.fail_count = updatedResponse?.fail_count + 1;
              updatedResponse.status = "Failed";
              updatedResponse.last_run = formatDateToCustomFormat(new Date());

              const newHistory = createHistoryObject(
                projectData,
                previousData,
                "assessmentRun",
                userName
              );
              const updatedHistory = [
                ...(projectData.history || []),
                newHistory,
              ];
              const updatedResponseWithHistory = {
                ...updatedResponse,
                history: updatedHistory,
              };

              updateProjectMutation.mutate(updatedResponseWithHistory);
            },
          }
        );
      } else {
        setDisableButton(false);
        // Error message handled in mutation
      }
    },
    [
      projectData,
      userName,
      parseApiResponse,
      projectDocumentUploadMutation,
      handleProgressModalOpen,
      updateProjectMutation,
    ]
  );

  const runChecklistCRT = useCallback(
    async (standardData) => {
      setDisableButton(true);

      let fileName = standardData?.find(
        (data) => data?.standard_name === projectData?.regulatory_standard
      )?.standard_url;

      let customFileName = projectData?.documents
        ?.filter((f) => f.documenttype === "Custom Regulatory")
        ?.map((f) => f.path);

      if (
        (fileName === undefined || fileName === null) &&
        customFileName?.length <= 0
      ) {
        fileName = projectData?.mapping_standards;
      }

      if (fileName !== undefined) {
        const regex = /\/([^/]+)$/;
        const match =
          customFileName?.length > 0
            ? customFileName?.[0].match(regex)
            : fileName?.match(regex);

        const payload = new FormData();
        payload.append("imageKey", match?.[1]);
        payload.append("project_id", projectData?.project_id);
        payload.append("user_name", userName);

        projectStandardChecklistMutation.mutate(payload, {
          onSuccess: () => {
            handleProgressModalOpen();
          },
          onError: () => {
            setDisableButton(false);
          },
        });
      }
    },
    [
      projectData,
      userName,
      projectStandardChecklistMutation,
      handleProgressModalOpen,
    ]
  );

  const runChecklistAPI = useCallback(
    async (standardData) => {
      let fileName = standardData?.find(
        (data) => data?.standard_name === projectData?.regulatory_standard
      )?.standard_url;

      if (fileName === undefined || fileName === null) {
        fileName = projectData?.mapping_standards;
      }

      if (fileName !== undefined) {
        const regex = /\/([^/]+)$/;
        const match = fileName.match(regex);

        const payload = new FormData();
        payload.append("imageKey", match?.[1]);
        payload.append("project_id", projectData?.project_id);
        payload.append("user_name", userName);

        uploadStandardChatMutation.mutate(payload);
      }
    },
    [projectData, userName, uploadStandardChatMutation]
  );

  return {
    // State
    isProgressModalVisible,
    disableButton,
    aiButtonLoading,

    // Handlers
    handleProgressModalOpen,
    handleProgressModalClose,
    handleChatUpdate,
    updateProjectDetails,
    handleRunAIAssessment,
    runComplianceAssessment,
    runChecklistCRT,
    runChecklistAPI,

    // Mutations for external use
    updateProjectMutation,
    updateProjectChatMutation,
    uploadFilesToAIServerMutation,
  };
};
