import BaseApiService from "./BaseApiService";

const _markPaymentDone = (payload) => {
  return BaseApiService.put(`/api/v1/payment/allow-user`, null, payload);
};

const _getisProjectCreationAllowed = (payload) => {
  return BaseApiService.post(`/api/v1/payment/restrict-user`, null, payload);
};

export const PaymentApiService = {
  markPaymentDone: _markPaymentDone,
  isProjectCreationAllowed: _getisProjectCreationAllowed,
};
