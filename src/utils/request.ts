import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError, type AxiosRequestConfig } from 'axios';

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function apiGet<T>(path: string, init?: AxiosRequestConfig): Promise<T> {
  return service.get<any, T>(path, { ...init });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  init?: AxiosRequestConfig,
): Promise<T> {
  return service.post<any, T>(path, body, { ...init });
}

export default service;
