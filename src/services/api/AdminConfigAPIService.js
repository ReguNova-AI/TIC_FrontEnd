import BaseApiService from "./BaseApiService";

const _sectorCreate = (payload) => {
  return BaseApiService.post(`/api/v1/sectors/create`, null, payload);
};

const _sectorListing = (userid) => {
  return BaseApiService.get(`/api/v1/sectors`, null, null);
};

const _industryCreate = (payload) => {
  return BaseApiService.post(`/api/v1/industries/create`, null, payload);
};

const _industryListing = (userid) => {
  return BaseApiService.get(`/api/v1/industries`, null, null);
};

const _roleListing = (userid) => {
  return BaseApiService.get(`/api/v1/roles`, null, null);
};

export const AdminConfigAPIService = {
  sectorCreate: _sectorCreate,
  sectorListing: _sectorListing,
  industryCreate: _industryCreate,
  industryListing: _industryListing,
  roleListing: _roleListing,
};
