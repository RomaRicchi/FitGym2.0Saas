import axios from "axios";

// Configura la URL base (de .env o localhost)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5144";

const gymApi = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  //  IMPORTANTE: el backend no usa cookies, por eso se deja en false
  withCredentials: false,
});

// Interceptor de request: agrega el token JWT automáticamente
gymApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si estamos enviando FormData, eliminar el Content-Type para que axios lo establezca automáticamente
    // Esto es necesario para subir archivos (multipart/form-data)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: desenvuelve ApiResponse y captura expiraciones o 401 automáticos
gymApi.interceptors.response.use(
  (response) => {
    // Desenvolver ApiResponse automáticamente
    // Si la respuesta tiene la estructura { success, message, data }, extraer data
    const data = response.data;

    // NO desenvolver PaginatedResponse (tiene TotalCount, Page, PageSize, etc)
    if (data && typeof data === 'object' && 'totalCount' in data) {
      // Es un PaginatedResponse, no desenvolver
      return response;
    }

    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      // Es un ApiResponse, extraer data para que el frontend pueda acceder directamente
      // Pero si data es null/undefined, preservar el objeto completo con el message
      if (data.data !== null && data.data !== undefined) {
        response.data = data.data;
      }
      // Si data es null, mantener la estructura original para poder acceder a message
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || "";

    // Ignorar rutas públicas
    const rutasPublicas = [
      "/auth/login",
      "/auth/register",
      "/socios/registro-publico",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    const esPublica = rutasPublicas.some((r) => url.includes(r));

    // URLs donde el 404 es esperado y no debe loguearse como error en desarrollo
    const errores404Esperados = [
      "/caja/activa",
    ];

    // Silenciar 404s esperados en consola durante desarrollo
    if (error.response?.status === 404 && errores404Esperados.some((r) => url.includes(r))) {
      if (import.meta.env.DEV) {
        error.config!.silent = true; // Marcar como silencioso
      }
    }

    // No forzar logout automático; dejamos que cada flujo maneje el 401\n

    return Promise.reject(error);
  }
);


export default gymApi;

