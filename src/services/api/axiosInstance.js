import axios from 'axios';
import { apiHost } from '../../config';
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';

// const server = process.env.NODE_ENV === 'production' ? apiProxyHost : apiHost;

// const apiRoot = apiHost + apiPath;

const postHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const instance = axios.create({
  // Use baseURL as apiHost for development
  baseURL: apiHost,
  // baseURL: window.location?.hostname?.includes('localhost') ? apiHost : '/',
  headers: { ...postHeaders },
});

instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;


const AxiosInterceptor = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {

      const interceptor =  instance.interceptors.response.use(null, async err => {
         if (err?.response?.status === 403) {
          enqueueSnackbar("You don't have access. Please check with admin to get the access", {
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: 1500,
          });
          // Add condition for that specific error code
          //API call to refetch the permissions and return that data in response while rejecting the Promise itself. Ex: Promise.reject(data) and set the data in component
        } 
        return Promise.reject(err);
      });
     

      return () => instance.interceptors.response.eject(interceptor);

  }, [])
  return children;
}



export default instance;
export { AxiosInterceptor }