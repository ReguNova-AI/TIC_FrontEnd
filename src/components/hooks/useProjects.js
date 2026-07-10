import { useQuery } from "@tanstack/react-query";
import { ProjectApiService } from "services/api/ProjectAPIService";

const fetchProjects = async ({ queryKey }) => {
  const [_key, { page, limit, sortBy, sortOrder, searchText, statusFilter }] =
    queryKey;
  const response = await ProjectApiService.projectListing({
    page,
    limit,
    sortBy,
    sortOrder,
    searchText,
    statusFilter,
  });
  return response?.data;
};

export const useProjects = (
  page,
  limit,
  sortBy,
  sortOrder,
  searchText,
  statusFilter,
) => {
  return useQuery({
    queryKey: [
      "projects",
      { page, limit, sortBy, sortOrder, searchText, statusFilter },
    ],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
