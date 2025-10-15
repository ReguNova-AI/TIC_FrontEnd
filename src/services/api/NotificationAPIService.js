import BaseApiService from "./BaseApiService";

const _notificationRead = (payload) => {
  return BaseApiService.post(`/api/v1/notifications/markAsRead`, null, payload);
};

const _notification = (userid) => {
  return BaseApiService.get(`/api/v1/notifications`, null, null);
};

const _createNotification = (notificationData) => {
  return BaseApiService.post(`/api/v1/notifications/create`, null, notificationData);
};

export const NotificationApiService = {
  notificationRead: _notificationRead,
  notification: _notification,
  createNotification: _createNotification,
};
