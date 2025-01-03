import BaseApiService from "./BaseApiService";


const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
const user_id = userdetails[0]?.user_id;
const role = userdetails[0]?.role_name;
const industry_id = userdetails[0]?.industry_id;

const _projectCreate = (payload) => {
  return BaseApiService.post(`/api/v1/project/create`, null, payload);
};

const _projectListing = () => {
  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/projects`, null, null);
  } else {
    if (
      role !== "Super Admin" && role !== "Org Super Admin" && role !== "Admin") {
      return BaseApiService.get(`/api/v1/org/projects?industry_id=${industry_id}`,null,null);
    } else {
      return BaseApiService.get(`/api/v1/org/projects?`, null, null);
    }
  }

  
};

const _projectDetails = (id) => {
  return BaseApiService.get(`/api/v1/projects/${id}`, null, null);
};

const _projectCounts = (id) => {
  return BaseApiService.get(`/api/v1/projects/counts?user_id=${id}`, null, null);
};

export const ProjectApiService = {
  projectCreate: _projectCreate,
  projectListing: _projectListing,
  projectDetails: _projectDetails,
  projectCounts:_projectCounts,


};
