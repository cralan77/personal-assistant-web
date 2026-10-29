import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: "", // Utiliza o proxy relativo do Next.js (/api/proxy/...)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s para suportar chamadas e sintese de IA sem abortar precocemente
});

// Request Interceptor: adiciona Bearer token do storage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("personal-assistant-auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.token;
          const user = parsed?.state?.user;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          if (user?.username || user?.id) {
            config.headers["X-User-Id"] = user.username || user.id;
          }
        }
      } catch (err) {
        console.error("Erro ao recuperar token do localStorage:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: captura 401 e limpa sessão
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/register");
        if (!isAuthPage) {
          localStorage.removeItem("personal-assistant-auth");
          document.cookie = "pa_token=; path=/; max-age=0";
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);
