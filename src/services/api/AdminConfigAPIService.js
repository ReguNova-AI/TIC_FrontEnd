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

const _roleCreate = (payload) => {
  return BaseApiService.post(`/api/v1/roles/create`, null, payload);
};

const _roleListing = (userid) => {
  return BaseApiService.get(`/api/v1/roles`, null, null);
};

const _permissionListing =()=>{
  return BaseApiService.get(`api/v1/permissions`,null,null);
}

export const AdminConfigAPIService = {
  sectorCreate: _sectorCreate,
  sectorListing: _sectorListing,
  industryCreate: _industryCreate,
  industryListing: _industryListing,
  roleCreate:_roleCreate,
  roleListing: _roleListing,
  permissionListing:_permissionListing,
};
