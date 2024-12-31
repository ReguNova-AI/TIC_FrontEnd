import * as actionTypes from './actionTypes';
import {AuthApiService} from '../../services/api/AuthApiService';
import SessionService from '../../services/SessionService';
import { STORAGE_KEYS } from '../../shared/constants';
import { fetchUserInfo } from './userInfo';

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

export const authSuccess = authInfo => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    authInfo: authInfo,
  };
};

export const authFail = error => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

const logoutSuccess = () => {
  return {
    type: actionTypes.AUTH_LOGOUT,
  };
};

export const logout = () => {
  return dispatch => {
    AuthApiService.logout().then(() => {
      dispatch(logoutSuccess());
    });
  };
};

export const checkAuthTimeout = expirationTime => {
  return dispatch => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 1000);
  };
};

export const auth = (
  username,
  password,
  tenantId,
  successCallback,
  failureCallback
) => {
  return dispatch => {
    dispatch(authStart());

    AuthApiService.login({ username, password, tenantId })
      .then(response => {
        dispatch(authSuccess(response.authInfo));

        if (successCallback) {
          successCallback(response.authInfo.reset_password);
        }
      })
      .catch(err => {
        if (failureCallback) {
          failureCallback(err);
        }
        dispatch(authFail(err));
      });
  };
};

export const setAuthentication = authResponse => dispatch => {

  const { refreshToken, token } = authResponse.data;
 
  SessionService.setItem(
    STORAGE_KEYS.AUTH_INFO,
    JSON.stringify({ refreshToken, token })
  );
  SessionService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  SessionService.setItem(STORAGE_KEYS.USER_INFO, authResponse.data.userDetails);
  sessionStorage.setItem("token",token);
  sessionStorage.setItem("userDetails",JSON.stringify(authResponse.data.userDetails));

  dispatch(authSuccess(authResponse.data));

  // dispatch(fetchUserInfo(authResponse.data));
};

export const updateAuthentication = (authResponse) => dispatch =>{
  const { refreshToken, token } = authResponse;
  SessionService.setItem(
    STORAGE_KEYS.AUTH_INFO,
    JSON.stringify({ refreshToken, token })
  );
  SessionService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

  dispatch(authSuccess(authResponse));
}

export const setAuthRedirectPath = path => {
  return {
    type: actionTypes.SET_AUTH_REDIRECT_PATH,
    path: path,
  };
};

const invalidateSessionSuccess = () => {
  return {
    type: actionTypes.AUTH_INVALID_SESSION,
  };
};

export const invalidateSession = () => {
  return dispatch => {
    let authInfo = SessionService.getItem(STORAGE_KEYS.AUTH_INFO);

    if (authInfo !== null && authInfo !== undefined) {
      AuthApiService.logout().then(() => {
        dispatch(invalidateSessionSuccess());
      });
    } else {
      dispatch(invalidateSessionSuccess());
    }
  };
};
