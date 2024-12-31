import BaseApiService from "./BaseApiService";

const _certificateCreate = (payload) => {
  return BaseApiService.post(`/api/v1/certificate/create`, null, payload);
};

const _certificateListing = (userid) => {
  return BaseApiService.get(`/api/v1/certificates?user_id=${userid}`, null, null);
};

const _certificateDetails = (id) => {
  return BaseApiService.get(`/api/v1/certificates/${id}`, null, null);
};

export const CertificateApiService = {
  certificateCreate: _certificateCreate,
  certificateListing: _certificateListing,
  certificateDetails: _certificateDetails,


};
