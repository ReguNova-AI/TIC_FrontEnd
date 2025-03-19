import BaseApiService from "./BaseApiService";



const _topprojectIndustryVise = (userid) => {
  return BaseApiService.get(`/api/v1/sa/industries/top-projects`, null, null);
};

const _userWeeklyCreatedProject = (todayFormatted,lastDateFormatted) => {
  return BaseApiService.get(`/api/v1/user/top-projects?from=${lastDateFormatted}&to=${todayFormatted}`, null, null);
};

export const DashboardApiService = {
  topprojectIndustryVise: _topprojectIndustryVise,
  userWeeklyCreatedProject: _userWeeklyCreatedProject,
};
