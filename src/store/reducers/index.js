import { combineReducers } from 'redux';
import * as actionTypes from '../actions/';

import authReducer from './auth';
import userInfoReducer from './userInfo';


const appReducer = combineReducers({
  auth: authReducer,
  userInfo: userInfoReducer
});

const rootReducer = (state, action) => {
  if (
    action.type === actionTypes.AUTH_LOGOUT ||
    action.type === actionTypes.AUTH_INVALID_SESSION
  ) {
    state = {
      addressTypes: {
        ...state.addressTypes,
      },
      locationStates: {
        ...state.locationStates,
      },
      // phoneCodes: {
      //   ...state.phoneCodes,
      // },
      // professions: {
      //   ...state.professions,
      // },
    };
  }
  return appReducer(state, action);
};

export default rootReducer;
