import BaseApiService from "./BaseApiService";



const _topprojectIndustryVise = (userid) => {
  return BaseApiService.get(`/api/v1/sa/industries/top-projects`, null, null);
};

const _certificateDetails = (id) => {
  return BaseApiService.get(`/api/v1/certificates/${id}`, null, null);
};

export const DashboardApiService = {
  topprojectIndustryVise: _topprojectIndustryVise,
  certificateDetails: _certificateDetails,
};
