import BaseApiService from "./BaseApiService";

const _organisationCreate = (payload) => {
  return BaseApiService.post(`/api/v1/organizations/create`, null, payload);
};

const _organisationUpdate = (payload) => {
  return BaseApiService.post(`/api/v1/organizations/update`, null, payload);
};

const _organisationListing = (userid) => {
  return BaseApiService.get(`/api/v1/organizations`, null, null);
};

const _organisationDetails = (id) => {
  return BaseApiService.get(`/api/v1/organizations/${id}`, null, null);
};

const _orgAccess = (orgId,active) => {
  let payload = {}
  return BaseApiService.post(`/api/v1/organizations/${orgId}/users/toggle-active?is_active=${active}`, null, payload);
};


export const OrganisationApiService = {
  organisationCreate: _organisationCreate,
  organisationUpdate:_organisationUpdate,
  organisationListing: _organisationListing,
  organisationDetails: _organisationDetails,
  orgAccess:_orgAccess,

};
