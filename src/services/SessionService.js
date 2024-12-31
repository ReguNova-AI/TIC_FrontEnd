// import * as actions from '../store/actions';
// import DispatcherService from './DispatcherService';
import { STORAGE_KEYS } from 'shared/constants';

var _memberData = {};

/**
 * @ngdoc method
 * @name isAuthenticated
 * @methodOf app.service:SessionService
 * @description
 * Determine if the active user is currently authenticated
 *
 * @returns {Boolean} true when the user is authenticated
 */
function _isAuthenticated(stateName = '') {
  const sessionId = _getItem(STORAGE_KEYS.AUTH_MPOWERED_TOKEN);

  return sessionId ? true : false;
}

/**
 * @ngdoc method
 * @name getItem
 * @methodOf app.service:SessionService
 * @description
 * Retrieve a key from the browser storage. Function will first look in
 * Local Storage; if it is not found there it will look in Session Storage
 *
 * @param {String} key Name of key to get from storage
 */
function _getItem(key) {
  if (!_memberData[key]) {
    _memberData[key] =
      window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
  }

  return _memberData[key];
}

/**
 * @ngdoc method
 * @name setItem
 * @methodOf app.service:SessionService
 * @description
 * Set or replace a key in browser storage. Default storage area will
 * be Session Storage, unless storage location of 'local' is specified
 * then it will be Local Storage.
 *
 * @param {String} key Name of value being placed in storage
 * @param {Mixed} val Value to place in storage
 * @param {String=} storage Which storage area to use (session/local; Default:local)
 *
 * @returns {Mixed} Value placed in storage
 */
function _setItem(key, val, storage) {
  _memberData[key] = val;

  if (storage === 'session') {
    window.sessionStorage.setItem(key, val);
  } else {
    window.localStorage.setItem(key, val);
  }

  return _memberData[key];
}

/**
 * @ngdoc method
 * @name removeItem
 * @methodOf app.service:SessionService
 * @description
 * Delete a key from Session or Local Storage
 *
 * @param {String} key Name of key to remove from storage
 * @param {String=} storage Name of storage area (session/local; Default: session)
 */

function _removeItem(key, storage) {
  delete _memberData[key];

  if (storage === 'session') {
    window.sessionStorage.removeItem(key);
  } else {
    window.localStorage.removeItem(key);
  }
}

/**
 * @ngdoc method
 * @name clear
 * @methodOf app.service:SessionService
 * @description
 * Completely erase all values from local storage that are not prefixed with '__'
 */
function _clear() {
  var i;

  _memberData = {};

  for (i in window.localStorage) {
    if (i.indexOf('__') !== 0) {
      _removeItem(i);
    }
  }

  window.sessionStorage.clear();
}

/**
 * @ngdoc method
 * @name clearAll
 * @methodOf app.service:SessionService
 * @description
 * Completely erase ALL values from local storage, EVEN those that are prefixed with '_'
 */
function _clearAll() {
  _memberData = {};
  window.localStorage.clear();
}

function _sessionTimedOut() {
  _clear();
  // DispatcherService.dispatchAction(actions.invalidateSession());
}

const SessionService = {
  isAuthenticated: _isAuthenticated,
  clear: _clear,
  clearAll: _clearAll,
  getItem: _getItem,
  setItem: _setItem,
  removeItem: _removeItem,
  sessionTimedOut: _sessionTimedOut,
};

export default SessionService;
