import BaseApiService from "./BaseApiService";

const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
const user_id = userdetails?.[0]?.user_id;
const role = userdetails?.[0]?.role_name;
const industry_id = userdetails?.[0]?.industry_id;

const _projectCreate = (payload) => {
  return BaseApiService.post(`/api/v1/project/create`, null, payload);
};

const _projectUpdate = (payload) => {
  return BaseApiService.put(`/api/v1/project/update`, null, payload);
};

const _projectListing = () => {
  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/projects`, null, null);
  } else {
    if (
      role !== "Super Admin" && role !== "Org Super Admin" && role !== "Admin") {
      return BaseApiService.get(`/api/v1/user/projects`,null,null);
    } else {
      return BaseApiService.get(`/api/v1/org/projects?industry_id=${industry_id}`, null, null);
    }
  }

  
};

const _projectDetails = (id) => {
  return BaseApiService.get(`/api/v1/projects/${id}`, null, null);
};

const _projectCounts = (id) => {

  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/sa/projects/counts`, null, null);
  } else {
    if (
      role !== "Super Admin" && role !== "Org Super Admin" && role !== "Admin") {
      return BaseApiService.get(`/api/v1/org/projects/counts?industry_id=${industry_id}`,null,null);
    } else {
      return BaseApiService.get(`/api/v1/projects/counts?user_id=${id}`, null, null);
    }
  }


};

const _projectChat = (query)=>{
  return BaseApiService.get(`/api/v1/chat/askQuestion?user_question=${query}`, null, null);
}

const _projectChecklist = (payload) => {
  return BaseApiService.post(`/api/v1/chat/uploadStandardCheckList`, null, payload);
};


export const ProjectApiService = {
  projectCreate: _projectCreate,
  projectListing: _projectListing,
  projectDetails: _projectDetails,
  projectCounts:_projectCounts,
  projectUpdate:_projectUpdate,
  projectChat:_projectChat,
  projectChecklist : _projectChecklist,

};
