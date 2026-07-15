import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

// configure axios instance for backend apis
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// intercept request to inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// intercept response to clear expired session and parse validation errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // concatenate detailed zod field errors into the main message property
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const detailedMessages = error.response.data.errors.map((e) => e.message).join(", ");
      error.response.data.message = detailedMessages;
    }

    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
