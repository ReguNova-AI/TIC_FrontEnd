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

const _uploadProjectDocument = (payload, versionId) => {
  return BaseApiService.put(
    `/api/v1/project_document/update/${versionId}`,
    null,
    payload,
  );
};

const _createProjectDocument = (payload) => {
  return BaseApiService.post(`/api/v1/project_document/create`, null, payload);
};

const _deleteProjectDocument = (documentId, versionId) => {
  return BaseApiService.delete(
    `/api/v1/project_document/delete/${documentId}/${versionId}`,
    null,
    null,
  );
};

const _deleteRiskSummary = (versionId) => {
  return BaseApiService.delete(
    `/api/v1/risk_summary/${versionId}`,
    null,
    null,
  );
};

const _extractParameters = (payload) => {
  return BaseApiService.post(`/api/v3/parameters/extract`, null, payload);
};

const _getRiskSummary = (projectId) => {
  return BaseApiService.get(
    `/api/v1/project_document/risk-summary/${projectId}`,
    null,
    null,
  );
};

const _getChatHistory = (projectId) => {
  return BaseApiService.get(
    `/api/v1/project_document/chat-history/${projectId}`,
    null,
    null,
  );
};

const _getExtractedInfo = (projectId) => {
  return BaseApiService.get(
    `/api/v1/project_document/extracted-info/${projectId}`,
    null,
    null,
  );
};

const _projectListing = (page, limit, sortBy, sortOrder, searchText, statusFilter) => {
  const params = {
    page: page,
    limit: limit,
  };
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  if (searchText) params.search = searchText;
  if (statusFilter?.length) params.status = statusFilter.join(",");
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const user_id = userdetails?.[0]?.user_id;
  const role = userdetails?.[0]?.role_name;
  const industry_id = userdetails?.[0]?.industry_id;

  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/projects`, params, null);
  } else {
    if (
      role !== "Super Admin" &&
      role !== "Org Super Admin" &&
      role !== "Admin"
    ) {
      return BaseApiService.get(`/api/v1/user/projects`, params, null);
    } else {
      let pathname = window.location.pathname;
      // console.log(pathname)

      // return BaseApiService.get(`/api/v1/org/projects?industry_id=${industry_id}`, null, null);
      if (pathname === "/dashboard") {
        return BaseApiService.get(
          `/api/v1/org/recent-projects?limit=10`,
          null,
          null,
        );
      } else {
        return BaseApiService.get(`/api/v1/org/projects`, params, null);
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
        null,
      );
    } else {
      return BaseApiService.get(
        `/api/v1/org/projects/counts?industry_id=${industry_id}`,
        null,
        null,
      );
    }
  }
};

// const _projectChat = (query, projectId) => {
//   return BaseApiService.get(
//     `/api/v1/chat/askQuestion?user_question=${query}&project_id=${projectId}`,
//     null,
//     null
//   );
// };

// New API for chat
const _projectChat = (query, projectId) => {
  const encodedQuery = encodeURIComponent(query);
  return BaseApiService.get(
    `/api/v3/chat/ask/question?project_id=${projectId}&user_question=${encodedQuery}`,
    //`/api/v3/chat/ask/question?project_id=1&user_question=${encodedQuery}`,
    null,
    null,
  );
};

const _projectComplianceAssessment = (payload1) => {
  return BaseApiService.post(
    `/api/v1/chat/runComplainceAssessment`,
    null,
    payload1,
  );
};

const _projectUploadStandardChat = (payload) => {
  // return BaseApiService.post(`/api/v1/chat/uploadStandardChat`, null, payload);
  return BaseApiService.post(`/api/v2/chat/uploadStandardChat`, null, payload);
};

const _projectStandardChecklist = (payload) => {
  //  old api // return BaseApiService.post(`/api/v1/chat/uploadStandardCheckList`, null, payload);
  // last implementation  // return BaseApiService.post(
  //   `/api/v2/chat/uploadStandardCheckList`,
  //   null,
  //   payload
  // );

  // new api
  return BaseApiService.post(
    `/api/v2/chat/newUploadStandardCheckList?num_segments=7&chunksize=6000&chunkoverlap=200`,
    null,
    payload,
  );
};

const _projectDocumentUpload = (payload, type) => {
  if (type === "full") {
    return BaseApiService.post(`/api/v2/chat/runFullAssessment`, null, payload);
  } else {
    return BaseApiService.post(`/api/v2/chat/uploadProjectDocs`, null, payload);
  }
};

const _projectUpdateComplianceAssessment = (payload) => {
  return BaseApiService.put(
    `/api/v2/project/update-compliance-assessment`,
    null,
    payload,
  );
};
const _projectUpdateChecklist = (payload) => {
  return BaseApiService.put(
    `/api/v2/project/update-checklist-response`,
    null,
    payload,
  );
};

const _externalProjectListing = () => {
  return BaseApiService.get(`/api/v2/project/external-projects`, null, null);
};

const _uploadFilesToAIserver = (payload) => {
  return BaseApiService.post(`/api/v3/run-assessment`, null, payload);
};

const _downloadRiskSummary = (versionId) => {
  return BaseApiService.get(
    `/api/v1/project_document/download-risk-summary/${versionId}`,
    null,
    null,
    { responseType: "blob" },
  );
};

export const ProjectApiService = {
  projectCreate: _projectCreate,
  projectListing: _projectListing,
  projectDetails: _projectDetails,
  projectCounts: _projectCounts,
  projectUpdate: _projectUpdate,
  projectChatUpdate: _projectChatUpdate,
  projectChat: _projectChat,
  projectUploadStandardChat: _projectUploadStandardChat,
  projectStandardChecklist: _projectStandardChecklist,
  projectComplianceAssessment: _projectComplianceAssessment,
  projectDocumentUpload: _projectDocumentUpload,
  projectUpdateComplianceAssessment: _projectUpdateComplianceAssessment,
  projectUpdateChecklist: _projectUpdateChecklist,
  externalProjectListing: _externalProjectListing,
  uploadProjectDocument: _uploadProjectDocument,
  createProjectDocument: _createProjectDocument,
  deleteProjectDocument: _deleteProjectDocument,
  deleteRiskSummary: _deleteRiskSummary,
  extractParameters: _extractParameters,
  getRiskSummary: _getRiskSummary,
  downloadRiskSummary: _downloadRiskSummary,
  getChatHistory: _getChatHistory,
  getExtractedInfo: _getExtractedInfo,
  uploadFilesToAIserver: _uploadFilesToAIserver,
};
