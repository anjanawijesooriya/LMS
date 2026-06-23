import axios from "axios";
import store from "../redux/store/store";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
