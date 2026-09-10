
import { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "../lib/axios";
import { clearSession, getStoredUser, getToken, mapAuthError, saveSession } from "../lib/auth";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    // Revalida sessão no boot via GET /me, Se acesso Expirou, Interceptor renova e faz Retry
    useEffect(() => {
        let cancelled = false;
        const boot = async () => {
            if (!getToken()) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get("/auth/me");
                if (!cancelled) setUser(res.data);

            } catch {
                if (!cancelled) {
                    clearSession();
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        boot();
        return () => { cancelled = true; };
    }, []);

    // Se Refresh de 7d falhar no meio da Sessão com Home já montada, Axios avisa via event e derruba User -> ProtectedRoute redireciona
    useEffect(() => {
        const tokenExpired = () => setUser(null);
        window.addEventListener("auth:session-expired", tokenExpired);
        return () => window.removeEventListener("auth:session-expired", tokenExpired);
    }, []);


    const login = useCallback(async ({ email, password }) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            saveSession(res.data);
            setUser(res.data.user);
            return { ok: true };

        } catch (error) {
            return { 
                ok: false, 
                message: mapAuthError(error, { context: "login" })
            };
        }
    }, []);


    const register = useCallback(async ({ name, email, password }) => {
        try {
            const res = await api.post("/auth/register", { name, email, password });
            saveSession(res.data);
            setUser(res.data.user);
            return { ok: true };

        } catch (error) {
            return {
                ok: false,
                message: mapAuthError(error, { context: "register" })
            };
        }
    }, []);


    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Mesmo sem rede, a sessão LOCAL sempre é encerrada
        } finally {
            clearSession();
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    return context;
}