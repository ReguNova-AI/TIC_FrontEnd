// hooks/useIndustryListing.js
import { useQuery } from "@tanstack/react-query";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";

const fetchIndustryList = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  const response = await AdminConfigAPIService.industryListing(page, limit);
  return response?.data;
};

export const useIndustryListing = (page, limit) => {
  return useQuery({
    queryKey: ["industry", { page, limit }], // unique cache key
    queryFn: fetchIndustryList,
    staleTime: 5 * 60 * 1000, // data considered fresh for 5 min
    cacheTime: 30 * 60 * 1000, // stays in cache for 30 min
    refetchOnWindowFocus: false,
  });
};
