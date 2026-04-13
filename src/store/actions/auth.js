import * as actionTypes from "./actionTypes";
import { AuthApiService } from "../../services/api/AuthApiService";
import { UserApiService } from "services/api/UserAPIService";
import SessionService from "services/SessionService";

const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

const authSuccess = (authInfo) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    authInfo: authInfo,
  };
};

const authFail = (error) => {
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

export const authRole = () => {
  return {
    type: actionTypes.AUTH_ROLE,
  };
};

// Called on app boot to rehydrate auth state from cookie
export const rehydrateAuth = () => async (dispatch) => {
  dispatch(authStart());
  try {
    const response = await UserApiService.getMe(); // GET /api/v1/me
    console.log(response,"response");
    
    dispatch(authSuccess(response.data));
  } catch {
    dispatch(authFail()); // 401 → stays logged out
  }
};  

// Called after login form success
export const setAuthentication = (authResponse) => (dispatch) => {
  SessionService.setItem(
    "userDetails",
    JSON.stringify(authResponse.data.userDetails),
    "session",
  );
  dispatch(authSuccess(authResponse.data)); // Redux only, no storage
};

// Called on logout button
export const logout = () => (dispatch) => {
  AuthApiService.logout().then(() => {
    // clears cookie server-side
    dispatch(logoutSuccess());
    window.location.href = "/login";
  });
};
