import BaseApiService from "./BaseApiService";

const _upload = (filepayload) => {
  return BaseApiService.post(`/api/v1/uploadToS3`, null, filepayload);
};

const _getFile = (filepayload) => {
  return BaseApiService.post(`/api/v1/getFromS3`, null , filepayload );
};

export const FileUploadApiService = {
  fileUpload: _upload,
  fileget: _getFile,
};
