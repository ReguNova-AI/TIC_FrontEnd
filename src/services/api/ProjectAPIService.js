import BaseApiService from "./BaseApiService";

const _projectCreate = (payload) => {
  return BaseApiService.post(`/api/v1/project/create`, null, payload);
};

const _projectListing = () => {
  return BaseApiService.get(`/api/v1/projects`, null, null);
};

const _projectDetails = (id) => {
  return BaseApiService.get(`/api/v1/projects/${id}`, null, null);
};

export const ProjectApiService = {
  projectCreate: _projectCreate,
  projectListing: _projectListing,
  projectDetails: _projectDetails,


};
