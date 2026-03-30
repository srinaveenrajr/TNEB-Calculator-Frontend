import axios from "axios";

const API = "https://tneb-calculator-backend.onrender.com";

export const api = axios.create({
  baseURL: API,
  withCredentials: false,
});

const TOKEN_KEY = "eb_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export { API };
