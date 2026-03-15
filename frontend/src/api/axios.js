import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — normalize FormData headers
API.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Content-Type", undefined);
      } else if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
