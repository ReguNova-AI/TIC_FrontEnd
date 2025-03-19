import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
  info: {},
  error: null,
  loading: true,
  resourcePermissions: [],
  solutionPermissions:new Map(),
  subFeaturePermissions:new Map(),
  roles:[]
};

const userInfoStart = (state, action) => {
  return updateObject(state, {
    invalidSession: false,
    error: null,
    loading: true,
  });
};

const userInfoSuccess = (state, action) => {
  return updateObject(state, {
    info: action.info,
    resourcePermissions: action.permissions,
    error: null,
    loading: false,
  });
};

const userInfoFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const saveRole = (state,action)=>{
  return updateObject(state,{
    roles:action,
  });
}

const saveSolutionPermissions = (state,action) => {
  return updateObject(state,{
    solutionPermissions:action.solutionPermissions,
    subFeaturePermissions:action.subFeaturePermissions
  })
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.USER_INFO_FETCH_START:
      return userInfoStart(state, action);
    case actionTypes.USER_INFO_FETCH_SUCCESS:
      return userInfoSuccess(state, action);
    case actionTypes.USER_INFO_FETCH_FAILURE:
      return userInfoFail(state, action);
    case actionTypes.SAVE_SOLUTION_PERMISSIONS:
      return saveSolutionPermissions(state,action);
      case actionTypes.AUTH_ROLE:
        return saveRole(state,action);
    default:
      return state;
  }
};

export default reducer;
