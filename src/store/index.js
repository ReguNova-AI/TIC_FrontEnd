import { createStore, applyMiddleware, compose } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './reducers'; // Ensure you have this reducer setup correctly

// Setup composeEnhancers to support Redux DevTools extension in development
let composeEnhancers =
  process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose; // Fallback to regular compose if Redux DevTools isn't available

// Add middleware here (in this case, we only have redux-thunk)
const middlewares = [thunk];

// ... (existing code above)
// Create the Redux store with the rootReducer and initialState (if provided)
let storeInstance;

export const getStore = (initialState = {}) => {
  const store = createStore(
    rootReducer,          // The root reducer (combineReducers)
    initialState,         // Optional initial state
    composeEnhancers(     // Apply middleware and dev tools composition
      applyMiddleware(...middlewares) // Middleware applied here
    )
  );

  storeInstance = store;
  return store;
};

export const getStoreInstance = () => storeInstance;

