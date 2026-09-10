import axios from "axios";
import { clearSession, getRefreshToken, getToken, updateSessionTokens } from "./auth";

const BASE_URL = "/api";

const api = axios.create({
    baseURL : BASE_URL,
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

let refreshPromise = null;

function refresh() {
    if (!refreshPromise) {
        const refreshTk = getRefreshToken();

        if (!refreshTk) return Promise.reject(new Error("no-refresh-token"));

        // Axios puro sem interceptors
        refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, { refreshToken: refreshTk }, { timeout: 15000 })
            .then((res) => {
                updateSessionTokens({
                    token: res.data.token,
                    refreshToken: res.data.refreshToken
                });
                return res.data.token;
            })
            .catch((error) => {
                clearSession();
                // Avisa AuthContext que tem "setUser" sem acoplar router
                window.dispatchEvent(new CustomEvent("auth:session-expired"));
                throw error;
            })
            .finally(() => {
                // Finally roda somente após then/catch propagarem liberando próxima expiração
                const propagate = refreshPromise;
                refreshPromise = null;
                return propagate;
            });
    }
    return refreshPromise;
}

const includeAuthUrl = (url = "") =>
    url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;

        if (!error.response || status !== 401 || !original || original._retry || includeAuthUrl(original.url)) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            const newToken = await refresh();
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original); // retry 1x

        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;