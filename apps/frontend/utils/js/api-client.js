export const DEFAULT_API_BASE_URL = 'http://localhost:5000';
const devRequestStats = new Map();
const FETCH_DIAGNOSTICS_FLAG = '__hmFetchDiagnosticsInstalled__';

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function resolveApiBase() {
  const envBase =
    import.meta.env?.VITE_API_BASE_URL
    || import.meta.env?.VITE_HWM_API_BASE
    || '';
  const base = normalizeBaseUrl(envBase || DEFAULT_API_BASE_URL);
  return base || DEFAULT_API_BASE_URL;
}

export function resolveApiUrl(path = '') {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = resolveApiBase();
  const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options || {};
  const init = {
    ...rest,
    credentials: rest.credentials || 'include',
    headers: { ...(headers || {}) },
  };
  if (init.body && !(init.body instanceof FormData) && !init.headers['Content-Type']) {
    init.headers['Content-Type'] = 'application/json';
  }
  return fetch(resolveApiUrl(path), init);
}

function warnOnRequestSpam(path) {
  if (!import.meta.env?.DEV || typeof console === 'undefined') {
    return;
  }
  const now = Date.now();
  const key = String(path || '');
  const stat = devRequestStats.get(key) || { count: 0, windowStart: now, warnedAt: 0 };
  if (now - stat.windowStart > 5000) {
    stat.count = 0;
    stat.windowStart = now;
  }
  stat.count += 1;
  if (stat.count > 20 && now - stat.warnedAt > 5000) {
    stat.warnedAt = now;
    console.warn(`[HWM dev] More than 20 API calls to ${key} within 5s. Check for a render/request loop.`);
  }
  devRequestStats.set(key, stat);
}

export function installApiBaseGlobals() {
  if (typeof window === 'undefined') {
    return resolveApiBase();
  }
  installFetchDiagnostics();
  const base = resolveApiBase();
  window.__HM_RESOLVED_API_BASE__ = base;
  window.__HM_API_DEBUG_MODE__ = base.includes('localhost') || base.includes('127.0.0.1');
  window.hmResolveApiBase = () => base;
  window.hmResolveApiUrl = resolveApiUrl;
  window.hmApiFetch = apiFetch;
  return base;
}

installApiBaseGlobals();

function installFetchDiagnostics() {
  if (!import.meta.env?.DEV || typeof window === 'undefined' || window[FETCH_DIAGNOSTICS_FLAG]) {
    return;
  }
  const originalFetch = window.fetch?.bind(window);
  if (!originalFetch) {
    return;
  }
  window[FETCH_DIAGNOSTICS_FLAG] = true;
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    warnOnRequestSpam(url);
    return originalFetch(input, init);
  };
}
