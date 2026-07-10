import axios from "axios";
import { apiHost } from "../../config";
import { _signOutUser } from "./BaseApiService";

const instance = axios.create({
  baseURL: apiHost,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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
