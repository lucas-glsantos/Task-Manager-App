import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
    baseURL : "http://localhost:5000/api",
    timeout: 15000,
});

// Anexa Bearer em toda requisição Autenticada
api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;