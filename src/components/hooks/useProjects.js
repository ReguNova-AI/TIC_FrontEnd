// hooks/useProjects.js
import { useQuery } from "@tanstack/react-query";
import { ProjectApiService } from "services/api/ProjectAPIService";

const fetchProjects = async () => {
  const response = await ProjectApiService.projectListing();
  return response?.data;
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"], // unique cache key
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // data considered fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
  });
};
