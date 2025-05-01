import Axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
Axios.defaults.baseURL = API_URL;

export class HttpService {
  _axios = Axios.create();

  addRequestInterceptor = (onFulfilled, onRejected) => {
    this._axios.interceptors.request.use(onFulfilled, onRejected);
  };

  addResponseInterceptor = (onFulfilled, onRejected) => {
    this._axios.interceptors.response.use(onFulfilled, onRejected);
  };

  get = async (url) => await this.request(this.getOptionsConfig("get", url));

  post = async (url, data) => await this.request(this.getOptionsConfig("post", url, data));

  put = async (url, data) => await this.request(this.getOptionsConfig("put", url, data));

  patch = async (url, data) => await this.request(this.getOptionsConfig("patch", url, data));

  delete = async (url) => await this.request(this.getOptionsConfig("delete", url));

  getOptionsConfig = (method, url, data) => {
    return {
      method,
      url,
      data,
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json", 
        'Access-Control-Allow-Credentials': true 
      },
    };
  };

  request(options) {
    return new Promise((resolve, reject) => {
      this._axios
        .request(options)
        .then((res) => {
          // Check if response has data property
          if (res && res.data) {
            resolve({ data: res.data });
          } else {
            reject(new Error('Invalid response format'));
          }
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            reject(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            reject(new Error('No response received from server'));
          } else {
            // Something happened in setting up the request that triggered an Error
            reject(new Error(error.message || 'Request failed'));
          }
        });
    });
  }
}

export default new HttpService();
