import axios from "axios";

const configuredApiUrl = process.env.REACT_APP_API_URL;
const apiBaseUrl = (configuredApiUrl || "http://localhost:8080/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // Public auth requests should not carry a stale token from an earlier session.
  const isPublicAuthRequest =
    config.url?.includes("/auth/login") || config.url?.includes("/auth/register");

  if (isPublicAuthRequest) {
    delete config.headers.Authorization;
    return config;
  }

  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.token) token = user.token;
    } catch {
      // Ignore malformed local session data and continue without a token.
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
