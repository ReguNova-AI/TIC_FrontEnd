// hooks/useExternalUsers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserApiService } from "services/api/UserAPIService";

// fetch external users
const fetchExternalUsers = async () => {
  const response = await UserApiService.externalUserListing();
  return response?.data;
};

// custom hook
export const useExternalUsers = () => {
  return useQuery({
    queryKey: ["external-users"],
    queryFn: fetchExternalUsers,
    staleTime: 5 * 60 * 1000, // fresh for 5 mins
    cacheTime: 30 * 60 * 1000, // keep in cache for 30 mins
    refetchOnWindowFocus: false,
  });
};

// mutation for enabling/disabling user
export const useToggleUserAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }) =>
      UserApiService.userAccess(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries(["external-users"]); // refetch cached data
    },
  });
};

// mutation for assigning projects
export const useAssignProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserApiService.addProjectsToExternalUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["external-users"]);
    },
  });
};
