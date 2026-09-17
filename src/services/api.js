import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const getApiError = (error, fallback) =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED"
    ? "The server took too long to respond."
    : fallback);

export default api;
