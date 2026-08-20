import axios from 'axios';

// Por defecto usamos una ruta relativa ('/api'), que Vite redirige internamente
// al backend (ver proxy en vite.config.ts). Esto evita tener que configurar
// la IP de la PC manualmente y evita problemas de "contenido mixto" al
// probar desde el celular por HTTPS. Solo se necesita VITE_API_URL si el
// backend está en otro servidor (ej. producción).
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
    if (error.message) return error.message;
  }
  return 'Ocurrió un error inesperado';
}
