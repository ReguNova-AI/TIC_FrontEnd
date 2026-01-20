import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAIAssessment } from '../../contexts/AIAssessmentContext';
import { ProjectApiService } from '../../services/api/ProjectAPIService';
import { message } from 'antd';

/**
 * Custom hook for AI Assessment operations with global state management
 * @param {Object} projectData - Current project data
 * @returns {Object} - AI Assessment operations and state
 */
export const useAIAssessmentOperations = (projectData) => {
  const queryClient = useQueryClient();
  const {
    startAIAssessment,
    stopAIAssessment,
    isProjectProcessing,
    getProjectStatus,
  } = useAIAssessment();

  // Upload files to AI server mutation
  const uploadFilesToAIServerMutation = useMutation({
    mutationFn: (payload) => ProjectApiService.uploadFilesToAIserver(payload),
    onMutate: async (payload) => {
      // Start processing state
      await startAIAssessment(
        payload.project_id,
        projectData?.project_name || 'Unknown Project'
      );
    },
    onSuccess: (response, variables) => {
      // Stop processing with success
      stopAIAssessment(
        variables.project_id,
        projectData?.project_name || 'Unknown Project',
        'Completed',
        true
      );

      // Invalidate and refetch project details
      queryClient.invalidateQueries({
        queryKey: ['projectDetails', variables.project_id],
      });

      // Show success message
      message.success(
        response?.data?.message ||
        'AI Assessment completed successfully'
      );
    },
    onError: (error, variables) => {
      // Stop processing with error
      stopAIAssessment(
        variables.project_id,
        projectData?.project_name || 'Unknown Project',
        'Failed',
        false
      );

      // Show error message
      message.error(
        error?.response?.data?.message ||
        error?.message ||
        'AI Assessment failed'
      );
    },
  });

  // Handle AI Assessment execution
  const handleRunAIAssessment = useCallback(async () => {
    if (!projectData?.project_id) {
      message.error('No project selected');
      return;
    }

    if (isProjectProcessing(projectData.project_id)) {
      message.warning('AI Assessment is already running for this project');
      return;
    }

    // Prepare file paths
    let files = [];
    if (projectData?.project_documents?.length > 0) {
      projectData.project_documents.forEach((document) => {
        let { file_path, document_name } = document;
        if (file_path !== null && file_path !== "null" && file_path !== "") {
          files.push({
            path: file_path,
            name: document_name || file_path.split('/').pop()
          });
        }
      });
    }

    if (files?.length === 0) {
      message.error('No files found for AI Assessment. Please upload documents first.');
      return;
    }

    const payload = {
      project_id: projectData.project_id,
      files: files,
    };

    // Execute the mutation
    uploadFilesToAIServerMutation.mutate(payload);
  }, [
    projectData,
    isProjectProcessing,
    uploadFilesToAIServerMutation,
  ]);

  // Get current project status
  const currentProjectStatus = getProjectStatus(projectData?.project_id);

  return {
    // State
    currentProjectStatus,
    isProcessing: uploadFilesToAIServerMutation.isPending,

    // Actions
    handleRunAIAssessment,

    // Mutation object for advanced usage
    uploadFilesToAIServerMutation,
  };
};
