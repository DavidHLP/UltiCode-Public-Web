import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
});

import { getToken, removeToken } from "@/utils/auth";

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      removeToken();
      // Option: Redirect to login page if not already there
      // if (window.location.pathname !== '/login') {
      //    window.location.href = '/login';
      // }
    }
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function apiGet<T>(
  path: string,
  init?: AxiosRequestConfig,
): Promise<T> {
  return service.get<T, T>(path, { ...init });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  init?: AxiosRequestConfig,
): Promise<T> {
  return service.post<T, T, unknown>(path, body, { ...init });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  init?: AxiosRequestConfig,
): Promise<T> {
  return service.patch<T, T, unknown>(path, body, { ...init });
}

export async function apiDelete<T>(
  path: string,
  init?: AxiosRequestConfig,
): Promise<T> {
  return service.delete<T, T>(path, { ...init });
}

export default service;
