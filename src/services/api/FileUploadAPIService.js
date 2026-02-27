import BaseApiService from "./BaseApiService";

const _upload = (filepayload) => {
  return BaseApiService.post(`/api/v1/uploadToStorage`, null, filepayload);
};

const _getFile = (filepayload) => {
  return BaseApiService.post(`/api/v1/getFromStorage`, null , filepayload );
};

const _deleteFile = (filepayload) => {
  return BaseApiService.post(`/api/v1/deleteFromStorage`, null, filepayload);
};

export const FileUploadApiService = {
  fileUpload: _upload,
  fileget: _getFile,
  fileDelete : _deleteFile,
};
