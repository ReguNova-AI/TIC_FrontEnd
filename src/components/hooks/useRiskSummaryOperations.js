import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAIAssessment } from '../../contexts/AIAssessmentContext';
import { ProjectApiService } from '../../services/api/ProjectAPIService';
import { PROJECT_QUERY_KEYS } from '../../pages/ProjectView/useProjectQueries';
import { message } from 'antd';

/**
 * Custom hook for Risk Summary operations with global state management
 * @param {Object} projectData - Current project data
 * @returns {Object} - Risk Summary operations and state
 */
export const useRiskSummaryOperations = (projectData) => {
  const queryClient = useQueryClient();
  const {
    startRiskSummaryProcessing,
    stopRiskSummaryProcessing,
    isRiskSummaryProcessing,
    getRiskSummaryStatus,
  } = useAIAssessment();

  // Regenerate risk summary mutation
  const regenerateRiskSummaryMutation = useMutation({
    mutationFn: () => ProjectApiService.regenerateRiskSummary(projectData?.project_id),
    onMutate: async () => {
      // Start processing state
      await startRiskSummaryProcessing(
        projectData?.project_id,
        projectData?.project_name || 'Unknown Project'
      );
    },
    onSuccess: (response) => {
      // Stop processing with success
      stopRiskSummaryProcessing(
        projectData?.project_id,
        projectData?.project_name || 'Unknown Project',
        'Completed',
        true
      );

      // Invalidate and refetch risk summary to show the new data
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.riskSummary(projectData?.project_id),
      });

      // Show success message
      message.success(
        response?.data?.message ||
        'Risk assessment regenerated successfully!'
      );
    },
    onError: (error) => {
      // Stop processing with error
      stopRiskSummaryProcessing(
        projectData?.project_id,
        projectData?.project_name || 'Unknown Project',
        'Failed',
        false
      );

      // Show error message
      message.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to regenerate risk assessment. Please try again.'
      );
    },
  });

  // Handle Risk Summary regeneration
  const handleRegenerateRiskSummary = useCallback(async () => {
    if (!projectData?.project_id) {
      message.error('No project selected');
      return;
    }

    if (isRiskSummaryProcessing(projectData.project_id)) {
      message.warning('Risk assessment is already being regenerated for this project');
      return;
    }

    // Execute the mutation
    regenerateRiskSummaryMutation.mutate();
  }, [
    projectData,
    isRiskSummaryProcessing,
    regenerateRiskSummaryMutation,
  ]);

  return {
    isRiskSummaryLoading: isRiskSummaryProcessing(projectData?.project_id),
    currentRiskSummaryStatus: getRiskSummaryStatus(projectData?.project_id),
    handleRegenerateRiskSummary,
    regenerateRiskSummaryMutation, // Expose mutation object for advanced usage
  };
};
