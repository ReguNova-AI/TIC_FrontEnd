import BaseApiService from "./BaseApiService";

const _organisationCreate = (payload) => {
  return BaseApiService.post(`/api/v1/organizations/create`, null, payload);
};

const _organisationListing = (userid) => {
  return BaseApiService.get(`/api/v1/organizations`, null, null);
};

const _organisationDetails = (id) => {
  return BaseApiService.get(`/api/v1/organisations/${id}`, null, null);
};

export const OrganisationApiService = {
  organisationCreate: _organisationCreate,
  organisationListing: _organisationListing,
  organisationDetails: _organisationDetails,


};
