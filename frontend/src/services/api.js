import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const roomAPI = {
  getAll: () => api.get("/rooms"),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post("/rooms", data),
  join: (roomId) => api.post(`/rooms/${roomId}/join`),
  leave: (roomId) => api.post(`/rooms/${roomId}/leave`),
};

export const messageAPI = {
  send: (data) => api.post("/messages", data),
  getByRoom: (roomId) => api.get(`/messages/room/${roomId}/all`),
};

export default api;
