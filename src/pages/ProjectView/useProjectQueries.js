import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { message } from "antd";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";
import { extractApiError } from "shared/utility";

// Query Keys
export const PROJECT_QUERY_KEYS = {
  projects: "projects",
  projectDetails: (id) => ["projects", "details", id ? Number(id) : id],
  standardData: "standardData",
  chatResponse: (projectId) => ["projects", "chat", projectId ? Number(projectId) : projectId],
  riskSummaryList: (projectId) => ["projects", "riskSummaryList", projectId ? Number(projectId) : projectId],
  riskSummary: (id) => ["projects", "riskSummary", id ? Number(id) : id],
  chatHistory: (projectId) => ["projects", "chatHistory", projectId ? Number(projectId) : projectId],
  extractedInfo: (projectId) => ["projects", "extractedInfo", projectId ? Number(projectId) : projectId],
};

// Custom Hooks for Project Data
export const useProjectDetails = (projectId) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.projectDetails(projectId),
    queryFn: () => ProjectApiService.projectDetails(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
    refetchOnWindowFocus: false,
    select: (response) => ({
      project: response?.data?.details[0],
      history: response?.data?.details[0]?.history || [],
    }),
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

export const useStandardData = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.standardData,
    queryFn: () => AdminConfigAPIService.standardListing(),
    staleTime: 1000 * 60 * 10, // 10 minutes (standards don't change often)
    refetchOnWindowFocus: false,
    select: (response) => response?.data?.details || [],
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

// Mutations for Project Updates
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ProjectApiService.projectUpdate(payload),
    onSuccess: (response, variables) => {
      message.success(
        response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY
      );

      // Invalidate and refetch project details
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(variables.project_id),
      });
    },
    onError: (error) => {
      message.error(extractApiError(error));
    },
  });
};

export const useUpdateProjectChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ProjectApiService.projectChatUpdate(payload),
    onSuccess: (response, variables) => {
      message.success(
        response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY
      );

      // Invalidate project details to get updated chat data
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(variables.project_id),
      });
    },
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

export const useUploadFilesToAIServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ProjectApiService.uploadFilesToAIserver(payload),
    onSuccess: (response, variables) => {
      message.success(
        response?.data?.message ||
        "Project documents uploaded to AI server successfully"
      );

      // Refetch project details to get updated status
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(variables.project_id),
      });
      // Show completion notification
      message.success("Assessment completed");
    },
    onError: (error) => {
      message.error(extractApiError(error));
    },
  });
};

export const useProjectDocumentUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, type }) =>
      ProjectApiService.projectDocumentUpload(payload, type),
    onSuccess: (response, variables) => {
      // Invalidate project details to reflect document upload
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(
          variables.payload.project_id
        ),
      });
    },
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

export const useProjectStandardChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      ProjectApiService.projectStandardChecklist(payload),
    onSuccess: (response, variables) => {
      // Get project_id from FormData
      const projectId = variables.get("project_id");

      // Invalidate project details
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(projectId),
      });
    },
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

export const useUploadStandardChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      ProjectApiService.projectUploadStandardChat(payload),
    onSuccess: (response, variables) => {
      // Get project_id from FormData
      const projectId = variables.get("project_id");

      // Invalidate project details
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(projectId),
      });
    },
    onError: (error) => {
      // Don't show error for this operation as it's handled differently
      console.error("Standard chat upload error:", error);
    },
  });
};

export const useUpdateProjectComplianceAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      ProjectApiService.projectUpdateComplianceAssessment(payload),
    onSuccess: (response, variables) => {
      message.success(
        response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY
      );

      // Invalidate project details
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(variables.project_id),
      });
    },
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

export const useUpdateProjectChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ProjectApiService.projectUpdateChecklist(payload),
    onSuccess: (response, variables) => {
      message.success(
        response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY
      );

      // Invalidate project details
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.projectDetails(variables.project_id),
      });
    },
    onError: (error) => {
      message.error(
        error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
      );
    },
  });
};

// Risk Summary List Hook — fetches all versions for a project
export const useRiskSummaryList = (projectId) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.riskSummaryList(projectId),
    queryFn: () => ProjectApiService.getRiskSummary(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    select: (response) => {
      // API returns { data: { risk_summaries: [...] } } when called with project_id
      if (Array.isArray(response?.data?.risk_summaries)) {
        // Sort descending by version_id so latest is first
        return [...response.data.risk_summaries].sort((a, b) => b.version_id - a.version_id);
      }
      return [];
    },
    onError: (error) => {
      console.error("Failed to fetch risk summary list:", error);
    },
  });
};

// Risk Summary Hook — fetches a single version detail by version_id (or project_id for legacy)
export const useRiskSummary = (id) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.riskSummary(id),
    queryFn: () => ProjectApiService.getRiskSummary(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    select: (response) => {
      // When called with a version_id the API returns { data: { risk_summary: {...} } }
      if (response?.data?.risk_summary?.doc_path_aws) {
        return {
          summary: response.data.risk_summary?.risks_summary,
          doc_path_aws: response.data.risk_summary?.doc_path_aws,
          version_id: response.data.risk_summary?.version_id,
        };
      }
      // Fallback: if the server still returns the list shape, pick the first entry
      if (Array.isArray(response?.data?.risk_summaries) && response.data.risk_summaries.length > 0) {
        const latest = [...response.data.risk_summaries].sort((a, b) => b.version_id - a.version_id)[0];
        return {
          summary: null,
          doc_path_aws: latest.doc_path_aws,
          version_id: latest.version_id,
        };
      }
      return null;
    },
    onError: (error) => {
      console.error("Failed to fetch risk summary:", error);
    },
  });
};

// Chat History Hook
export const useChatHistory = (projectId) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId),
    queryFn: () => ProjectApiService.getChatHistory(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    select: (response) => {
      // Handle different response formats
      if (
        response?.data &&
        response?.data?.chat_history &&
        Array.isArray(response?.data?.chat_history)
      ) {
        return response.data.chat_history;
      }
      if (response?.data?.history && Array.isArray(response.data.history)) {
        return response.data.history;
      }
      return [];
    },
    onError: (error) => {
      console.error("Failed to fetch chat history:", error);
    },
  });
};

// Extracted Info Hook
export const useExtractedInfo = (projectId) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.extractedInfo(projectId),
    queryFn: () => ProjectApiService.getExtractedInfo(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    select: (response) => response?.data?.extracted_information || null,
    onError: (error) => {
      console.error("Failed to fetch extracted info:", error);
    },
  });
};

// Chat Mutation Hook
export const useChatMutation = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query }) => ProjectApiService.projectChat(query, projectId),
    onSuccess: (response, variables) => {
      // Invalidate and refetch chat history to include the new chat
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId),
      });
    },
    onError: (error) => {
      console.error("Chat mutation failed:", error);
    },
  });
};

// Regenerate Risk Summary Mutation Hook
export const useRegenerateRiskSummary = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProjectApiService.regenerateRiskSummary(projectId),
    onSuccess: (response) => {
      // Invalidate and refetch risk summary to show the new data
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.riskSummary(projectId),
      });

      message.success("Risk assessment regenerated successfully!");
    },
    onError: (error) => {
      console.error("Risk summary regeneration failed:", error);
      message.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to regenerate risk assessment. Please try again."
      );
    },
  });
};
