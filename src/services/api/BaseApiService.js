import axiosInstance from './axiosInstance';
import SessionService from '../SessionService';
import { STORAGE_KEYS } from '../../shared/constants';
import { apiPath } from '../../config';

const get = async (url, params, useBaseApiPath, otherConfig, noToken) => {
  return _makeRequest('GET', url, params, null, useBaseApiPath, otherConfig, {}, noToken);
};
const post = async (
  url,
  params,
  data,
  useBaseApiPath,
  otherConfig,
  otherHeaders,
  noToken
) => {
  return _makeRequest(
    'POST',
    url,
    params,
    data,
    useBaseApiPath,
    otherConfig,
    otherHeaders,
    noToken
  );
};

const put = async (url, params, data, useBaseApiPath, otherConfig) => {
  return _makeRequest('PUT', url, params, data, useBaseApiPath, otherConfig);
};

const remove = async (url, params, data, useBaseApiPath, noToken) => {
  return _makeRequest('DELETE', url, params, data, useBaseApiPath, {}, {}, noToken);
};

const _makeRequest = async (
  type,
  url,
  params,
  data,
  useBaseApiPath = true,
  otherConfig = {},
  otherHeaders = {},
  noToken = false,
) => {
  const requestType = type ? type.toUpperCase() : 'GET';

  const extraConfig = otherConfig ? otherConfig : {};

  const apiUrl = useBaseApiPath ? apiPath + url : url;

  let config = {
    url: apiUrl,
    params,
    method: requestType,
    ...extraConfig,
  };

  if (requestType !== 'GET') {
    config.data = data;
  }

  let requestHeaders = {};

  const token = SessionService.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const solutionId = localStorage.getItem('manageOrgId') || localStorage.getItem('selectedSolutionId');  

  if (token && !noToken) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  if(solutionId) {
    requestHeaders.solutionId = solutionId;
  }

  config['headers'] = {
    ...requestHeaders,
    ...otherHeaders,
  };


  return new Promise((resolve, reject) => {
    axiosInstance(config)
      .then(response => {
        if (config.responseType === 'blob') resolve(response);
        else resolve(response.data);
      })
      .catch(error => {
        if (error && error.response) {
          const status = error.response.status;
          const errCode =
            error.response.data && error.response.data.error
              ? error.response.data.error.code
              : '';

          if (status === 404 && errCode === 'BE-304') {
            // const navigation = SessionService.getNavigationInstance();
            // if (navigation && navigation.navigate) {
            //   _signOutUser(navigation);
            // }

            _signOutUser();
          }
        }

        // if (isDevModeOn) {
        //   TimerService.setMarkEnd(timerName);
        // }

        reject(error);
      });
  });
};

const _signOutUser = () => {
  //   SessionService.clear();
  //   DispatcherService.dispatchAction(actions.invalidateSession());
};



const BaseApiService = {
  get,
  post,
  put,
  delete: remove,
};

export default BaseApiService;
