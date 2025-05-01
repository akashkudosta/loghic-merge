import HttpService from "./htttp.service";

export const setupAxiosInterceptors = (onUnauthenticated) => {
  const onRequestSuccess = async (config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  };
  const onRequestFail = (error) => Promise.reject(error);

  HttpService.addRequestInterceptor(onRequestSuccess, onRequestFail);

  const onResponseSuccess = (response) => response;

  const onResponseFail = (error) => {
    if (error && error.response) {
      const status = error.response.status;
      if ((status === 403 || status === 401) && 
          error.response.data && 
          (error.response.data.message?.toLowerCase().includes('token') || 
           error.response.data.error?.toLowerCase().includes('token'))) {
        onUnauthenticated();
      }
    }
    return Promise.reject(error);
  };
  HttpService.addResponseInterceptor(onResponseSuccess, onResponseFail);
};
