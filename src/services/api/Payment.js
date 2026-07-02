import BaseApiService from "./BaseApiService";

const _markPaymentDone = (payload) => {
  return BaseApiService.put(`/api/v1/payment/allow-user`, null, payload);
};

const _getisProjectCreationAllowed = (payload) => {
  return BaseApiService.post(`/api/v1/payment/restrict-user`, null, payload);
};

const _getProducts = () => {
  return BaseApiService.get(`/api/v1/payment/products`, null, null);
};

const _createCheckout = (payload) => {
  return BaseApiService.post(
    `/api/v1/payment/stripe/create-checkout`,
    null,
    payload,
  );
};

const _getCheckoutSession = (sessionId) => {
  return BaseApiService.get(
    `/api/v1/payment/stripe/session/${sessionId}`,
    null,
    null,
  );
};

const _getMyPayments = () => {
  return BaseApiService.get(`/api/v1/payment/stripe/my-payments`, null, null);
};

export const PaymentApiService = {
  markPaymentDone: _markPaymentDone,
  isProjectCreationAllowed: _getisProjectCreationAllowed,
  getProducts: _getProducts,
  createCheckout: _createCheckout,
  getCheckoutSession: _getCheckoutSession,
  getMyPayments: _getMyPayments,
};
