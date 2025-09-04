import _ from "lodash";
import BaseApiService from "./BaseApiService";

const _userCreate = (payload) => {
  return BaseApiService.post(`/api/v1/user/create`, null, payload);
};
const _userUpdate = (payload) => {
  return BaseApiService.put(`/api/v1/user/update`, null, payload);
};

const _userListing = (page, limit) => {
  const params = {
    page: page,
    limit: limit,
  };
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const user_id = userdetails?.[0]?.user_id;
  const role = userdetails?.[0]?.role_name;
  const industry_id = userdetails?.[0]?.industry_id;
  if (role === "Super Admin") {
    return BaseApiService.get(`/api/v1/users`, params, null);
  } else {
    if (
      role !== "Super Admin" &&
      role !== "Org Super Admin" &&
      role !== "Admin"
    ) {
      return BaseApiService.get(
        `/api/v1/org/users?industry_id=${industry_id}`,
        params,
        null
      );
    } else {
      return BaseApiService.get(`/api/v1/org/users`, params, null);
    }
  }
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

const _userEmailCheck = (email) => {
  return BaseApiService.get(`api/v1/users/exist?email=${email}`, null, null);
};

const _userDetails = (userId) => {
  return BaseApiService.get(`/api/v1/users/${userId}`, null, null);
};

const _roleDetails = () => {
  return BaseApiService.get(`/api/v1/roles`, null, null);
};

const _userAccess = (id, active) => {
  const payload = { id: id };
  return BaseApiService.post(
    `/api/v1/users/${id}/updateActive?is_active=${active}`,
    null,
    payload
  );
};

const _externalUserListing = (page, limit) => {
  const params = {
    page: page,
    limit: limit,
  };
  return BaseApiService.get(`/api/v2/external-users`, params, null);
};

const _addProjectsToExternalUser = (payload) => {
  return BaseApiService.post(
    `/api/v2/project/assign-user-to-external-project`,
    null,
    payload
  );
};

const _externalUserProjects = (userId, orgId, page, limit) => {
  const params = {
    page: page,
    limit: limit,
  };
  return BaseApiService.get(
    `/api/v2/external-users-projects?userId=${userId}&orgId=${orgId}`,
    params,
    null
  );
};

export const UserApiService = {
  userCreate: _userCreate,
  userUpdate: _userUpdate,
  userListing: _userListing,
  userDetails: _userDetails,
  orgDetails: _orgDetails,
  sectorDetails: _sectorDetails,
  industryDetails: _industryDetails,
  userEmailCheck: _userEmailCheck,
  roleDetails: _roleDetails,
  userAccess: _userAccess,
  externalUserListing: _externalUserListing,
  getExternalUserPeojects: _externalUserProjects,
  addProjectsToExternalUser: _addProjectsToExternalUser,
};
