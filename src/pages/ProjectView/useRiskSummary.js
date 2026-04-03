import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { message } from "antd";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";
import { extractApiError } from "shared/utility";

export const RISK_SUMMARY_QUERY_KEYS = {
  getRiskSummary: (projectId) => ["projects", "riskSummary", projectId],
  downloadRiskSummary: (projectId) => ["projects", "riskSummary", projectId],
};

export const useDownloadRiskSummary = (version_id) => {
  return useQuery({
    queryKey: RISK_SUMMARY_QUERY_KEYS.downloadRiskSummary(version_id),
    queryFn: () => ProjectApiService.downloadRiskSummary(version_id),
    enabled: !!version_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // refetchOnWindowFocus: false,
    select: (response) => {
      console.log("Risk download response:", response);
      return response;
    },
    onError: (error) => {
      console.error("Failed to fetch download response:", error);
    },
  });
};

export const useRiskSummaries = (projectId) => {
  return useQuery({
    queryKey: RISK_SUMMARY_QUERY_KEYS.getRiskSummary(projectId),
    queryFn: () => ProjectApiService.getRiskSummary(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    select: (response) => {
      console.log("Risk summary response:", response);
      // console.error("Risk summary doc path:", response?.data?.risk_summary?.doc_path_aws);
      // Handle different response formats
      return response.data.risk_summaries ?? [];
    },
    onError: (error) => {
      console.error("Failed to fetch risk summary:", error);
    },
  });
};
