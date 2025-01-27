import BaseApiService from "./BaseApiService";



const _topprojectIndustryVise = (userid) => {
  return BaseApiService.get(`/api/v1/sa/industries/top-projects`, null, null);
};

const _userWeeklyCreatedProject = (id) => {
  return BaseApiService.get(`/api/v1/user/top-projects?from=2025-01-20&to=2025-01-24`, null, null);
};

export const DashboardApiService = {
  topprojectIndustryVise: _topprojectIndustryVise,
  userWeeklyCreatedProject: _userWeeklyCreatedProject,
};
