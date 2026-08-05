const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

let accessToken: string | null = localStorage.getItem('access');
let refreshToken: string | null = localStorage.getItem('refresh');

export function setTokens(tokens: { access: string; refresh?: string } | null) {
  if (tokens) {
    accessToken = tokens.access;
    localStorage.setItem('access', tokens.access);
    if (tokens.refresh) {
      refreshToken = tokens.refresh;
      localStorage.setItem('refresh', tokens.refresh);
    }
  } else {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }
}

export function isLoggedIn() {
  return !!accessToken;
}

let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(cb: () => void) {
  onAuthExpired = cb;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    const detail =
      body && typeof body === 'object' && 'detail' in body ? String((body as { detail: unknown }).detail) : null;
    super(detail || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/accounts/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        setTokens({ access: data.access, refresh: data.refresh });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

type Params = Record<string, string | number | boolean | undefined | null>;
type RequestOptions = { method?: string; body?: unknown; params?: Params; skipAuth?: boolean };

function buildUrl(path: string, params?: Params) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function request<T>(path: string, opts: RequestOptions = {}, isRetry = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!opts.skipAuth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(buildUrl(path, opts.params), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && !opts.skipAuth && !isRetry) {
    const refreshed = await doRefresh();
    if (refreshed) return request<T>(path, opts, true);
    setTokens(null);
    onAuthExpired?.();
    throw new ApiError(401, { detail: 'Session expired. Please log in again.' });
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  const parsed = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) throw new ApiError(res.status, parsed);
  return parsed as T;
}

export const api = {
  get: <T>(path: string, params?: Params) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: 'POST', body, ...opts }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** Downloads a binary response (PDF invoices/payslips) and saves it via the browser. */
export async function downloadFile(path: string, filename: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(buildUrl(path), { headers });
  if (!res.ok) throw new ApiError(res.status, null);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
