// hooks/useRolesListing.js
import { useQuery } from "@tanstack/react-query";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";

const fetchRolesList = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  const response = await AdminConfigAPIService.roleListing(page, limit);
  return response?.data;
};

export const useRolesListing = (page, limit) => {
  return useQuery({
    queryKey: ["roles", { page, limit }], // unique cache key
    queryFn: fetchRolesList,
    staleTime: 5 * 60 * 1000, // data considered fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
  });
};
