import router, {LOGIN_ROUTE_NAME, REGISTER_ROUTE_NAME} from '@/router/index';
import {useAuthStore} from '@/stores/auth';
import {
  ensureSensitiveActionToken,
  SensitiveActionCancelledError,
  type SensitiveActionContext
} from '@/utils/sensitive-action-guard';
import axios, {
  type AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  data?: T;
  error?: ApiError | null;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface RequestConfig extends AxiosRequestConfig {
  sensitiveToken?: string;
  requireSensitiveVerification?: boolean;
  skipSensitiveVerification?: boolean;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? (import.meta.env?.DEV ? 'http://localhost:9999' : '/');
const AUTH_REFRESH_ENDPOINT = '/api/auth/refresh';
const REFRESH_FAILURE_MESSAGE = '登录状态已过期，请重新登录';
const PUBLIC_AUTH_ROUTE_NAMES = new Set<string>([LOGIN_ROUTE_NAME, REGISTER_ROUTE_NAME]);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  sensitiveToken?: string;
  requireSensitiveVerification?: boolean;
  skipSensitiveVerification?: boolean;
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const authStore = useAuthStore();
  if (authStore.refreshTokenExpiresAt === null) {
    throw new Error('缺少刷新上下文');
  }
  if (authStore.refreshTokenExpired) {
    authStore.clearAuthData();
    throw new Error('刷新令牌已过期，请重新登录');
  }
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = authStore
    .refresh()
    .then(() => {
      /* refreshed */
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function shouldSkipRefresh(url?: string | null): boolean {
  if (!url) {
    return false;
  }
  return url.includes(AUTH_REFRESH_ENDPOINT);
}

function ensureAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  authorization: string | null
) {
  if (!authorization) {
    return;
  }
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);
  headers.set('Authorization', authorization);
  config.headers = headers;
}

function redirectToLogin() {
  const authStore = useAuthStore();
  authStore.clearAuthData();
  const currentRoute = router.currentRoute.value;
  const currentName = typeof currentRoute.name === 'string' ? currentRoute.name : null;
  if (currentName && PUBLIC_AUTH_ROUTE_NAMES.has(currentName)) {
    return;
  }
  const redirect = currentRoute.fullPath;
  router.push({name: LOGIN_ROUTE_NAME, query: {redirect}}).catch(() => {
    /* noop */
  });
}

const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000
});

service.defaults.withCredentials = true;

const SENSITIVE_METHODS = new Set(['post', 'put', 'delete', 'patch']);
const SENSITIVE_PATH_PATTERNS = [/^\/api\/admin\//i, /^\/api\/judge\//i];

function normalizePath(url?: string | null): string {
  if (!url) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  if (url.startsWith(API_BASE_URL)) {
    return url.slice(API_BASE_URL.length);
  }
  return url;
}

function matchesSensitivePath(url?: string | null): boolean {
  const path = normalizePath(url);
  if (!path) {
    return false;
  }
  return SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function shouldTriggerSensitiveGuard(config: RetryableRequestConfig): boolean {
  if (config.skipSensitiveVerification) {
    return false;
  }
  if (config.requireSensitiveVerification) {
    return true;
  }
  const method = (config.method ?? 'get').toLowerCase();
  if (!SENSITIVE_METHODS.has(method)) {
    return false;
  }
  return matchesSensitivePath(config.url);
}

service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();

    if (!shouldSkipRefresh(config.url) && authStore.accessToken && authStore.accessTokenExpiresSoon) {
      try {
        await refreshAccessToken();
      } catch (error) {
        redirectToLogin();
        throw error;
      }
    }

    const authorization = authStore.authorizationHeader;
    ensureAuthorizationHeader(config, authorization);
    const retryableConfig = config as RetryableRequestConfig;
    if (!retryableConfig.sensitiveToken && shouldTriggerSensitiveGuard(retryableConfig)) {
      try {
        const context: SensitiveActionContext = {
          method: config.method?.toUpperCase(),
          url: normalizePath(config.url)
        };
        retryableConfig.sensitiveToken = await ensureSensitiveActionToken(context);
      } catch (error) {
        if (error instanceof SensitiveActionCancelledError) {
          return Promise.reject(error);
        }
        throw error;
      }
    }
    if (retryableConfig.sensitiveToken) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);
      headers.set('X-Sensitive-Action-Token', retryableConfig.sensitiveToken);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function isApiResponse<T = unknown>(payload: unknown): payload is ApiResponse<T> {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const record = payload as Record<string, unknown>;
  return 'isSuccess' in record && typeof record.isSuccess === 'boolean';
}

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (isApiResponse(res) && !res.isSuccess) {
      const message = res.error?.message ?? '请求失败';
      const rejection = new Error(message);
      Object.assign(rejection, {apiError: res.error, metadata: res.metadata});
      return Promise.reject(rejection);
    }
    return response;
  },
  async (error: AxiosError<ApiResponse | { message?: string }>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    let messageFromResponse: string | undefined;
    if (isApiResponse(responseData)) {
      messageFromResponse = responseData.error?.message;
    } else if (responseData && typeof responseData === 'object' && 'message' in responseData) {
      messageFromResponse = (responseData as { message?: string }).message;
    }
    const fallbackMessage = messageFromResponse ?? error.message ?? '请求失败';

    if (status === 401) {
      const originalConfig = error.config as RetryableRequestConfig | undefined;
      const authStore = useAuthStore();
      const hasRefreshContext = authStore.refreshTokenExpiresAt !== null;
      if (
        originalConfig &&
        !originalConfig._retry &&
        !shouldSkipRefresh(originalConfig.url) &&
        hasRefreshContext &&
        !authStore.refreshTokenExpired
      ) {
        originalConfig._retry = true;
        try {
          await refreshAccessToken();
          ensureAuthorizationHeader(originalConfig, authStore.authorizationHeader);
          return service.request(originalConfig);
        } catch (refreshError) {
          redirectToLogin();
          const reason =
            refreshError instanceof Error
              ? refreshError
              : new Error(REFRESH_FAILURE_MESSAGE);
          return Promise.reject(reason);
        }
      }

      redirectToLogin();
      return Promise.reject(new Error(REFRESH_FAILURE_MESSAGE));
    }

    return Promise.reject(new Error(fallbackMessage));
  }
);

export function unwrapResponse<T>(payload: unknown): T {
  if (isApiResponse<T>(payload)) {
    const wrapped = payload;
    return (wrapped.data ?? (wrapped as unknown as T)) as T;
  }
  return payload as T;
}

export function requestData<T = unknown>(config: RequestConfig): Promise<T> {
  return service.request<ApiResponse<T> | T>(config).then((response) => unwrapResponse<T>(response.data));
}

export default service;
