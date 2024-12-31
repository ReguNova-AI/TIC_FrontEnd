import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
  authInfo: null,
  error: null,
  loading: false,
  authRedirectPath: '/',
  invalidSession: false
};

const authStart = (state, action) => {
  return updateObject(state, {
    invalidSession: false,
    error: null,
    loading: true
  });
};

const authSuccess = (state, action) => {
  return updateObject(state, {
    authInfo: action.authInfo,
    error: null,
    loading: false,
    invalidSession: false
  });
};

const authFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
    invalidSession: false
  });
};

const authLogout = (state, action) => {
  return updateObject(state, {
    authInfo: null,
    authRedirectPath: '/'
  });
};

const setAuthRedirectPath = (state, action) => {
  return updateObject(state, { authRedirectPath: action.path });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START:
      return authStart(state, action);
    case actionTypes.AUTH_SUCCESS:
      return authSuccess(state, action);
    case actionTypes.AUTH_FAIL:
      return authFail(state, action);
    case actionTypes.AUTH_LOGOUT:
      return authLogout(state, action);
    case actionTypes.SET_AUTH_REDIRECT_PATH:
      return setAuthRedirectPath(state, action);
    case actionTypes.AUTH_INVALID_SESSION:
      return {
        ...initialState,
        invalidSession: true
      };
    default:
      return state;
  }
};

export default reducer;
