const DEFAULT_API_BASE = '/api'

const normalizedBaseUrl = (() => {
  const base = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE
  return base.endsWith('/') ? base.slice(0, -1) : base
})()

export const API_BASE_URL = normalizedBaseUrl
export const USE_MOCK_API = (import.meta.env.VITE_API_USE_MOCK ?? 'true') === 'true'

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`
  }
  return `${API_BASE_URL}${path}`
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    method: 'GET',
    credentials: 'include',
    ...init,
  })
  return parseJson<T>(response)
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  })
  return parseJson<T>(response)
}
