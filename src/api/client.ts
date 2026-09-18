// `same-origin` resolves to an empty base, so every request below becomes
// a relative URL served by whatever reverse proxy served this page — works
// on localhost or any server IP with no rebuild, and no CORS. Unset means
// `npm run dev` against the backend's default local port (see
// kopalaicr-api's README — 8004, not 8000).
const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL =
  rawApiBase === 'same-origin'
    ? ''
    : rawApiBase
      ? rawApiBase.replace(/\/+$/, '')
      : 'http://localhost:8004';

const ACCESS_KEY = 'kicr-admin-access';
const REFRESH_KEY = 'kicr-admin-refresh';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem(ACCESS_KEY, data.access);
  return true;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;

  async function doFetch(): Promise<Response> {
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  }

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    // DRF renders a plain-string ValidationError as a raw JSON array, not
    // {detail: ...} — check for that before falling back to a raw dump.
    const arrayMessage = Array.isArray(errorBody) && typeof errorBody[0] === 'string' ? errorBody[0] : null;
    const fieldErrors =
      errorBody && typeof errorBody === 'object' && !Array.isArray(errorBody)
        ? Object.entries(errorBody)
            .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : value}`)
            .join(' ')
        : null;
    throw new Error(
      errorBody?.detail || arrayMessage || fieldErrors || `Request failed (${res.status})`
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

// For binary downloads (Excel export/template) that can't go through
// apiFetch's res.json() parsing — shares the same 401-refresh-retry flow
// so a download doesn't silently fail just because the token expired.
export async function apiFetchBlob(path: string): Promise<Blob> {
  async function doFetch(): Promise<Response> {
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${path}`, { headers });
  }

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    throw new Error(`Download failed (${res.status}).`);
  }

  return res.blob();
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body?.non_field_errors) ? body.non_field_errors[0] : null;
    throw new Error(message || 'Invalid email or password.');
  }

  const data = await res.json();
  setTokens(data.access, data.refresh);
  return data;
}

export { API_BASE_URL };
