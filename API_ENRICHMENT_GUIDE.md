# API Payload Enrichment Utility Guide

This document explains the logic behind the automatic payload enrichment system implemented in the API layer.

## Overview
The goal of this utility is to ensure that critical fields (specifically `user_id`) are present in API payloads for sensitive routes before they are dispatched to the server. If the data is missing from the Redux store or Session Storage, the system will automatically fetch it and enrich the request on-the-fly.

## Implementation Details

### 1. Global Store Access
Modified `src/store/index.js` to expose the Redux store instance.
- **Why?** Axios interceptors run outside the React component lifecycle and cannot use hooks like `useDispatch` or `useSelector`. By exposing `getStoreInstance()`, we can dispatch actions directly from the interceptor.

### 2. The Interceptor Logic
Located in `src/services/api/axiosInstance.js`, the request interceptor performs the following steps:
1. **Identification**: Checks if the outgoing request matches a predefined list of "restricted" URLs (e.g., `/api/v1/payment/restrict-user`).
2. **Validation**: Checks if `user_id` is missing from the payload (`config.data`).
3. **Data Fetching**: If missing, it triggers an asynchronous call to `/api/v1/me`.
4. **State Update**: Dispatches `setAuthentication` to update the Redux store and Session Storage with the newly fetched user details.
5. **Enrichment**: Injects the `user_id` into the original request's `config.data`.
6. **Continuation**: Allows the original request to proceed with the now-complete payload.

## Loop Prevention Mechanism
A critical requirement was ensuring this logic does not cause infinite request loops. We have implemented three layers of protection:

1. **Global Axios for Recovery**: The call to `/api/v1/me` inside the interceptor uses the **global `axios` object**, not the custom `instance`. Since the interceptor is only attached to `instance`, the recovery call never triggers the interceptor itself.
2. **URL Exclusion**: The interceptor explicitly returns early if the requested URL contains `/api/v1/me`.
3. **State Check**: The logic only executes if `user_id` is missing. Once the payload is enriched, the condition `!config.data?.user_id` becomes false, preventing any re-triggering for the same request.

## How to Add New Restricted Routes
To protect a new API route, simply add it to the `restrictedApis` array inside `src/services/api/axiosInstance.js`:

```javascript
const restrictedApis = [
  "/api/v1/payment/restrict-user",
  "/api/v1/your-new-route" // Add here
];
```

## Error Handling
If the attempt to fetch user details via `/api/v1/me` fails (e.g., the session has expired), the interceptor will automatically dispatch the `logout()` action to clear the client state and redirect the user to the login page.
