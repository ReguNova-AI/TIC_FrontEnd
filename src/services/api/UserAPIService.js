import BaseApiService from "./BaseApiService";

const _userCreate = (payload) => {
  return BaseApiService.post(`/api/v1/user/create`, null, payload);
};

const _userListing = () => {
  return BaseApiService.get(`/api/v1/users`, null, null);
};

const _orgDetails = () => {
    return BaseApiService.get(`/api/v1/organizations`, null, null);
};

const _sectorDetails = () => {
    return BaseApiService.get(`/api/v1/sectors`, null, null);
};

const _industryDetails = () => {
    return BaseApiService.get(`/api/v1/industries`, null, null);
};

const _userEmailCheck =(email)=>{
  return BaseApiService.get(`api/v1/users/exist?email=${email}`, null, null);
}

const _userDetails = (id) => {
  return BaseApiService.get(`/api/v1/users/${id}`, null, null);
};

export const UserApiService = {
  userCreate: _userCreate,
  userListing: _userListing,
  userDetails: _userDetails,
  orgDetails:_orgDetails,
  sectorDetails: _sectorDetails,
  industryDetails: _industryDetails,
  userEmailCheck: _userEmailCheck,


};
