// hooks/useProjects.js
import { useQuery } from "@tanstack/react-query";
import { ProjectApiService } from "services/api/ProjectAPIService";

const fetchProjects = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  const response = await ProjectApiService.projectListing(page, limit);
  return response?.data;
};

export const useProjects = (page, limit) => {
  return useQuery({
    queryKey: ["projects", { page, limit }], // unique cache key
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // data considered fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
  });
};
