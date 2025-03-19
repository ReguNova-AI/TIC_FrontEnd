import BaseApiService from "./BaseApiService";

const _login = (payload) => {
  return BaseApiService.post(`/api/v1/login`, null, payload);
};

const _forgotPassword = (payload) => {
  return BaseApiService.post(`/api/v1/forgotPassword/sendOtp`, null, payload);
};

const _verifyOtp = (payload) => {
  return BaseApiService.post(`/api/v1/forgotPassword/verifyOtp`, null, payload);
};

const _resetPassword = (payload) => {
  return BaseApiService.post(`/api/v1/resetPassword`, null, payload);
};
const _logout = (payload) => {
  // console.log("payload",payload)
  return BaseApiService.post(`/api/v1/logout`,null,payload);
};

export const AuthApiService = {
  login: _login,
  logout: _logout,
  forgotPassword:_forgotPassword,
  verifyOtp: _verifyOtp,
  resetPassword:_resetPassword,

};
