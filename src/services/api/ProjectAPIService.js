import BaseApiService from "./BaseApiService";

const _projectCreate = (payload) => {
  return BaseApiService.post(`/api/v1/project/create`, null, payload);
};

const _projectUpdate = (payload) => {
  return BaseApiService.put(`/api/v1/project/update`, null, payload);
};

const _projectChatUpdate = (payload) => {
  return BaseApiService.post(`/api/v2/chat/updateChatResponse`, null, payload);
};

const _projectListing = () => {
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const user_id = userdetails?.[0]?.user_id;
  const role = userdetails?.[0]?.role_name;
  const industry_id = userdetails?.[0]?.industry_id;

  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/projects`, null, null);
  } else {
    if (role !== "Super Admin" && role !== "Org Super Admin" && role !== "Admin") {
      return BaseApiService.get(`/api/v1/user/projects`, null, null);
    } else {
      let pathname = window.location.pathname;
      // console.log(pathname)

      // return BaseApiService.get(`/api/v1/org/projects?industry_id=${industry_id}`, null, null);
      if (pathname === "/dashboard/default" || pathname === "/dashboard") {
        return BaseApiService.get(`/api/v1/org/recent-projects?limit=10`,null,null);
      } else {
        return BaseApiService.get(`/api/v1/org/projects`, null, null);
      }
    }
  }
};

const _projectDetails = (id) => {
  return BaseApiService.get(`/api/v1/projects/${id}`, null, null);
};

const _projectCounts = (id) => {
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const user_id = userdetails?.[0]?.user_id;
  const role = userdetails?.[0]?.role_name;
  const industry_id = userdetails?.[0]?.industry_id;

  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/sa/projects/counts`, null, null);
  } else {
    if (
      role !== "Super Admin" &&
      role !== "Org Super Admin" &&
      role !== "Admin"
    ) {
      return BaseApiService.get(
        `/api/v1/projects/counts?user_id=${id}`,
        null,
        null
      );
    } else {
      return BaseApiService.get(
        `/api/v1/org/projects/counts?industry_id=${industry_id}`,
        null,
        null
      );
    }
  }
};

const _projectChat = (query,projectId) => {
  return BaseApiService.get(
    `/api/v1/chat/askQuestion?user_question=${query}&project_id=${projectId}`,
    null,
    null
  );
};

const _projectComplianceAssessment = (payload1) => {
  return BaseApiService.post(
    `/api/v1/chat/runComplainceAssessment`,
    null,
    payload1
  );
};

const _projectUploadStandardChat = (payload) => {
  // return BaseApiService.post(`/api/v1/chat/uploadStandardChat`, null, payload);
  return BaseApiService.post(`/api/v2/chat/uploadStandardChat`, null, payload);
};

const _projectStandardChecklist = (payload) => {
  // return BaseApiService.post(`/api/v1/chat/uploadStandardCheckList`, null, payload);
  return BaseApiService.post(
    `/api/v2/chat/uploadStandardCheckList`,
    null,
    payload
  );
};

const _projectDocumentUpload = (payload,type) => {
  if(type === "full")
  {
    return BaseApiService.post(`/api/v2/chat/runFullAssessment`, null, payload);

  }
  else{
    return BaseApiService.post(`/api/v2/chat/uploadProjectDocs`, null, payload);

  }
};

export const ProjectApiService = {
  projectCreate: _projectCreate,
  projectListing: _projectListing,
  projectDetails: _projectDetails,
  projectCounts: _projectCounts,
  projectUpdate: _projectUpdate,
  projectChatUpdate:_projectChatUpdate,
  projectChat: _projectChat,
  projectUploadStandardChat: _projectUploadStandardChat,
  projectStandardChecklist: _projectStandardChecklist,
  projectComplianceAssessment: _projectComplianceAssessment,
  projectDocumentUpload: _projectDocumentUpload,
};
