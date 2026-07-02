import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAIAssessment } from '../../contexts/AIAssessmentContext';
import { ProjectApiService } from '../../services/api/ProjectAPIService';
import { message } from 'antd';
import { clearAssessmentTimer } from '../AIAssessmentStatusIndicator';
import { useState } from 'react';
import { extractApiError } from '../../shared/utility';

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

  const [isMutationSuccess, setIsMutationSuccess] = useState(false);

  // Upload files to AI server mutation
  const uploadFilesToAIServerMutation = useMutation({
    mutationFn: (payload) => ProjectApiService.uploadFilesToAIserver(payload),
    onMutate: async (payload) => {
      // Start processing state
      setIsMutationSuccess(false);
      message.info('AI Assessment started. Analyzing documents...');
      await startAIAssessment(
        payload.project_id,
        projectData?.project_name || 'Unknown Project'
      );
    },
    onSuccess: (response, variables) => {
      // Set local success state
      setIsMutationSuccess(true);

      // Stop processing with success
      stopAIAssessment(
        variables.project_id,
        projectData?.project_name || 'Unknown Project',
        'Completed',
        true
      );

      // Clear local timer immediately so UI can unlock
      clearAssessmentTimer(variables.project_id);

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
      setIsMutationSuccess(false);
      const errorMessage = extractApiError(error);
      
      // Stop processing with error and provide the extracted message
      stopAIAssessment(
        variables.project_id,
        projectData?.project_name || 'Unknown Project',
        'Failed',
        false,
        errorMessage
      );

      // Clear local timer
      clearAssessmentTimer(variables.project_id);
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

    setIsMutationSuccess(false);
    // Prepare file paths
    let files = [];
    if (projectData?.project_documents?.length > 0) {
      //const seenPaths = new Set();
      projectData.project_documents.forEach((document) => {
        const { document_name, document_type } = document;
        const file_path = document.file_path || document.path;
        if (
          file_path &&
          file_path !== "null"
          //!seenPaths.has(file_path)
        ) {
          //seenPaths.add(file_path);

          let type = "Contract";
          if (document_type === "Master Contract") type = "Master Contract";
          else if (document_type === "Configuration Document") type = "Config";

          files.push({
            path: file_path,
            name: document_name || file_path.split('/').pop(),
            type,
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
    isGlobalProcessing: isProjectProcessing(projectData?.project_id),
    isMutationSuccess,

    // Actions
    handleRunAIAssessment,

    // Mutation object for advanced usage
    uploadFilesToAIServerMutation,
  };
};
