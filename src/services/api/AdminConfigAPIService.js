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
  return BaseApiService.get(`/api/v1/permissions`,null,null);
}

const _standardCreate = (payload) => {
  return BaseApiService.post(`/api/v1/regulatories/create`, null, payload);
};

const _standardListing =()=>{
  return BaseApiService.get(`/api/v1/regulatories`,null,null);
}

const _sectorDelete = (id) => {
  const payload={id:id};
  return BaseApiService.delete(`/api/v1/sectors/${id}/delete`, null, payload);
};

const _industryDelete = (id) => {
  const payload={id:id};
  return BaseApiService.delete(`/api/v1/industries/${id}/delete`, null, payload);
};

const _roleDelete = (id) => {
  const payload={id:id};
  return BaseApiService.delete(`/api/v1/roles/${id}/delete`, null, payload);
};

const _standardDelete = (id) => {
  const payload={id:id};
  return BaseApiService.delete(`/api/v1/regulatories/${id}/delete`, null, payload);
};

const _standardChecklistUpdate = (payload) => {
  return BaseApiService.post(`/api/v1/regulatories/update`, null, payload);
};

export const AdminConfigAPIService = {
  sectorCreate: _sectorCreate,
  sectorListing: _sectorListing,
  sectorDelete: _sectorDelete,
  industryCreate: _industryCreate,
  industryListing: _industryListing,
  industryDelete:_industryDelete,
  roleCreate:_roleCreate,
  roleListing: _roleListing,
  roleDelete:_roleDelete,
  permissionListing:_permissionListing,
  standardCreate: _standardCreate,
  standardListing: _standardListing,
  standardDelete:_standardDelete,
  standardChecklistUpdate:_standardChecklistUpdate,
};
