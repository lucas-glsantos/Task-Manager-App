// Centraliza sessão + tradução de erros do backend para mensagens padrão de UI.
const TOKEN_KEY = "tm_token";
const REFRESH_KEY = "tm_refresh";
const USER_KEY = "tm_user";

export function saveSession({ token, refreshToken, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Traduz qualquer falha de auth em UMA mensagem padrão de UI.
 * - Sem response (rede/servidor fora/CORS) -> mensagem de conexão.
 * - 401 no login -> "Email ou senha incorretos." (nunca revela se a conta existe).
 * - 400 -> detalhes do Joi ou "Email já cadastrado".
 * - 429 -> rate limit.
 */
export function mapAuthError(error, { context = "login" } = {}) {
  if (!error?.response) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  const status = error.response.status;
  const data = error.response.data || {};

  if (status === 429) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (status === 401) {
    if (context === "login") return "Email ou senha incorretos.";
    return data.message || "Sessão expirada. Faça login novamente.";
  }
  if (status === 400) {
    if (data.message === "Email já cadastrado") {
      return "Este email já está cadastrado. Tente fazer login.";
    }
    if (Array.isArray(data.details) && data.details.length > 0) {
      return data.details.join(" ");
    }
    return data.message || "Verifique os dados informados.";
  }
  return data.message || "Ocorreu um erro inesperado. Tente novamente.";
}