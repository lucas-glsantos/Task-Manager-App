
const TOKEN_KEY = "tm_token";
const REFRESH_KEY = "tm_refresh";
const USER_KEY = "tm_user";
const META_KEY = "tm_meta";

const memoryFallback = new Map(); // Fallback Se localStorage bloqueado
let localMemory = probe("local");
let sessionMemory = probe("session");

function probe(type) {
  try {
    const mode = type === "local" ? localStorage : sessionStorage;
    
    mode.setItem("__tm_probe", "1");
    mode.removeItem("__tm_probe");
    
    return true;
  } catch {
    return false;
  }
};

function clean(cleaning) {
  if (!cleaning || cleaning === "undefined" || cleaning === "null" || cleaning === "") return null;

  return cleaning;
};

// Reading, primeira camada que tiver valor vale, permite recuperar pós-falha parcial
function getValue(key) {
  if (localMemory) {
    try {
      const value = localStorage.getItem(key);

      if (value != null)
        return value;

    } catch {
      localMemory = false;
    }
  };

  if (sessionMemory) {
    try {
      const value = sessionStorage.getItem(key);

      if (value != null)
        return value;

    } catch {
      sessionMemory = false;
    }
  };

  return memoryFallback.get(key) ?? null;
};


// Writing, primeira camada disponível, se degradou, marca para migração futura
function setValue(key, value) {
  if (localMemory) {
    try {
      localStorage.setItem(key, value);
      return "local";

    } catch {
      localMemory = false;
    }
  };

  if (sessionMemory) {
    try {
      sessionStorage.setItem(key, value);
      return "session";
    
    } catch {
      sessionMemory = false;
    }
  };

  try {
    memoryFallback.set(key, value);
    return "memory";

  } catch {
    return null;
  }
};

// Função Deletar dados de Sessão do armazenamento do Navegador
function delValue(key) {
  try {
    localStorage.removeItem(key);
  } catch { 
    // Ignorado Intencionalmente
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignorado Intencionalmente
  }

  memoryFallback.delete(key);
};


// Função Definir JSON
function setJSON(key, value) {
  try {
    return setValue(key, JSON.stringify(value));

  } catch {
    delValue(key);
    return null;
  }
};


// Função Obter JSON
function getJSON(key) {
  const data = getValue(key);

  if (!data) return null;

  try {
    return JSON.parse(data);

  } catch {
    delValue(key);
    return null; // Se data corrompido auto-limpa
  }
};

function decodeExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

    return payload.exp ? payload.exp * 1000 : null;

  } catch {
    return null;
  }
};

export function isDegraded() {
  return !localMemory;
};


// Função tryRecover tenta restaurar o uso do localStorage caso ele tenha ficado indisponível
export function tryRecover() {
  if (localMemory) return true;

  if (!probe("local")) return false;

  localMemory = true;

  for (const key of [TOKEN_KEY, REFRESH_KEY, USER_KEY, META_KEY]) {
    const value = getValue(key);

    if (value != null) {
      try {
        localStorage.setItem(key, value);

      } catch {
        localMemory = false; break;
      }
    }
  };

  if (localMemory) window.dispatchEvent(new CustomEvent("auth:storage-recovered"));
  return localMemory;
};

// Sincronização multi-aba, Logout/Rotação 15min numa aba reflete nas outras
export function initAuthSync(onSync) {
  const sync = (event) => {
    if (!event.key || [TOKEN_KEY, REFRESH_KEY, USER_KEY].includes(event.key))onSync?.();
  };

  window.addEventListener("storage", sync);
  return () => window.removeEventListener("storage", sync);
};

// Função saveSession responsável por Salvar e Gerenciar os dados de Autenticação (Sessão) do Usuário no armazenamento do navegador
export function saveSession({ token, refreshToken, user } = {}) {
  if (!token || !refreshToken) { 
    clearSession();
    return false;
  }
  tryRecover();

  const tokenKey = setValue(TOKEN_KEY, token);
  const refreshTokenKey = setValue(REFRESH_KEY, refreshToken);

  if (user) setJSON(USER_KEY, user);
  setJSON(META_KEY, {
    accessExp: decodeExp(token),
    savedAt: Date.now()
  });

  if (tokenKey === null || refreshTokenKey === null) {
    window.dispatchEvent(new CustomEvent("auth:storage-unavailable"));
    return false;
  }

  if (isDegraded()) window.dispatchEvent(new CustomEvent("auth:storage-degraded"));
  return true;
};

// Função updateSessionTokens responsável por Atualizar exclusivamente os Tokens de Autenticação de uma Sessão já ativa, mantendo intactos os dados do Usuário
export function updateSessionTokens({ token, refreshToken } = {}) {
  if (!token || !refreshToken) return false;
  tryRecover();

  const tokenKey = setValue(TOKEN_KEY, token);
  const refreshTokenKey = setValue(REFRESH_KEY, refreshToken);

  setJSON(META_KEY, {
    accessExp: decodeExp(token),
    savedAt: Date.now()
  });

  return tokenKey !== null && refreshTokenKey !== null;
};

// Função clearSession responsável por Excluir todos os dados de Autenticação (Sessão) do Usuário no armazenamento do navegador
export function clearSession() {
  delValue(TOKEN_KEY);
  delValue(REFRESH_KEY);
  delValue(USER_KEY);
  delValue(META_KEY);
};


export function getToken() {
  return clean(getValue(TOKEN_KEY));
};

export function getRefreshToken() {
  return clean(getValue(REFRESH_KEY));
};

export function getStoredUser() {
  return getJSON(USER_KEY);
};

export function isAuthenticated() {
  return !!getToken() && !!getStoredUser();
};

// Função isAccessExpired verifica se o Token de accesso já expirou ou está prestes a expirar
export function isAccessExpired(timeout = 30000) {
  const meta = getJSON(META_KEY);

  if (!meta?.accessExp) return false;

  return Date.now() + timeout >= meta.accessExp;
};

export function mapAuthError(error, { context = "login" } = {}) {
  if (error?.message === "SessionUnavailable" || error?.message === "no-refresh-token") {
    return "Não foi possível salvar a sessão neste navegador. Limpe o cache ou Tente outro navegador.";
  }

  if (!error?.response) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  
  const status = error.response.status;
  const data = error.response.data || {};

  // Código de Status HTTP 400 Bad Request
  if (status === 400) {
    if (data.message === "Email já cadastrado") {
      return "Este email já está cadastrado. Tente fazer login.";
    };
    if (Array.isArray(data.details) && data.details.length > 0) {
      return data.details.join(" ");
    };
    return data.message || "Verifique os dados informados.";
  };

  // Código de Status HTTP 401 Unauthorized
  if (status === 401) {
    if (context === "login") return "Email ou senha incorretos.";
    return data.message || "Sessão expirada. Faça login novamente.";
  };

  // Código de Status HTTP 403 Forbidden
  if (status === 403) {
    return "Sessão expirada. Faça login novamente.";
  };

  // Código de Status HTTP 429 Too Many Requests
  if (status === 429) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  };

  return data.message || "Ocorreu um erro inesperado. Tente novamente.";
};