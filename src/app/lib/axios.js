import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://mhid03gncc.execute-api.us-east-1.amazonaws.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (for attaching tokens)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); // or get from Redux/Clerk
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (for handling errors globally)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
        // Example: window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
