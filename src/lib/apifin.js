import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update to your backend base URL
});

// Add token for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
