import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.token) {
        token = user.token;
      }
    } catch (e) {}
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
