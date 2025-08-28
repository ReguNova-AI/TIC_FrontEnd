// hooks/useOrganizations.js
import { useQuery } from "@tanstack/react-query";
import { OrganisationApiService } from "services/api/OrganizationAPIService";

const fetchOrganizations = async () => {
  const response = await OrganisationApiService.organisationListing();
  return response?.data;
};

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"], // unique cache key
    queryFn: fetchOrganizations,
    staleTime: 5 * 60 * 1000, // fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
    refetchOnMount: false, // don’t refetch on mount if cached
    refetchOnReconnect: false, // don’t refetch on reconnect
  });
};
