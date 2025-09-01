// hooks/useOrganizations.js
import { useQuery } from "@tanstack/react-query";
import { OrganisationApiService } from "services/api/OrganizationAPIService";

const fetchOrganizations = async ({ queryKey }) => {
  // TanStack Query passes an object with the query key to the query function
  const [_key, { page, limit }] = queryKey;
  const response = await OrganisationApiService.organisationListing(
    page,
    limit
  );
  return response?.data;
};

export const useOrganizations = (page, limit) => {
  return useQuery({
    // 1. The queryKey must include the page and limit to be unique for each page
    queryKey: ["organizations", { page, limit }],

    // 2. The queryFn is passed the full queryKey object
    queryFn: fetchOrganizations,

    // 3. This is essential for a good user experience. It keeps the
    //    previous data on screen while the new data is being fetched.
    keepPreviousData: true,
    // 4. Stale time and cache time can be adjusted based on how often
    staleTime: 5 * 60 * 1000, // fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
    refetchOnMount: false, // don’t refetch on mount if cached
    refetchOnReconnect: false, // don’t refetch on reconnect
  });
};
