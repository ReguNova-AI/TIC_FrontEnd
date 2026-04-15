import axios from "axios";
import { apiHost } from "../../config";
import { _signOutUser } from "./BaseApiService";
import { getStoreInstance } from "../../store";
import { setAuthentication, logout } from "../../store/actions";

const instance = axios.create({
  baseURL: apiHost,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Payload enrichment interceptor
instance.interceptors.request.use(async (config) => {
  // List of restricted APIs that require user_id
  const restrictedApis = ["/api/v1/payment/restrict-user"];
  const isTargetApi = restrictedApis.some(api => config.url?.includes(api));

  if (isTargetApi && !config.data?.user_id) {
    const store = getStoreInstance();
    if (store) {
      try {
        // Prevent infinite loops by checking if we are already fetching /me
        if (config.url.includes("/api/v1/me")) return config;

        // Fetch user details
        const response = await axios.get(`${apiHost}/api/v1/me`, { withCredentials: true });
        
        // Update store and session storage
        store.dispatch(setAuthentication(response));

        // Enrich the current request payload
        const userDetails = response.data?.userDetails;
        const userId = userDetails?.[0]?.user_id || userDetails?.user_id;

        if (userId) {
          config.data = { ...config.data, user_id: userId };
        }
      } catch (err) {
        // Global logout if user fetch fails
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }
  }
  return config;
}, (error) => Promise.reject(error));


instance.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (err?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${apiHost}/api/v1/refreshToken`,
          {},
          { withCredentials: true },
        );

        return instance(originalRequest);
      } catch (refreshError) {
        _signOutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  },
);

export default instance;
