// hooks/useUserProjects.js
import { useQuery } from "@tanstack/react-query";
import { UserApiService } from "services/api/UserAPIService";

// Query function (TanStack will pass queryKey here)
const fetchUserProjects = async ({ queryKey }) => {
  const [_key, { userId, orgId, page, limit }] = queryKey;

  const response = await UserApiService.getExternalUserPeojects(
    userId,
    orgId,
    page,
    limit
  );

  return response?.data;
};

// Custom Hook
export const useExternalUserProjects = (userId, orgId, page, limit) => {
  return useQuery({
    queryKey: ["userProjects", { userId, orgId, page, limit }],
    queryFn: fetchUserProjects,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 min fresh
    cacheTime: 30 * 60 * 1000, // 30 min in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
