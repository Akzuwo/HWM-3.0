const PRODUCTION_API_BASE_URL = 'https://hwm-api.akzuwo.ch';
const DEVELOPMENT_API_BASE_URL = 'http://localhost:5000';

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function resolveApiBase() {
  const envBase =
    import.meta.env?.VITE_API_BASE_URL
    || import.meta.env?.VITE_HWM_API_BASE
    || '';
  const base = normalizeBaseUrl(
    envBase || (import.meta.env?.DEV ? DEVELOPMENT_API_BASE_URL : PRODUCTION_API_BASE_URL)
  );
  return base || PRODUCTION_API_BASE_URL;
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

export function installApiBaseGlobals() {
  if (typeof window === 'undefined') {
    return resolveApiBase();
  }
  const base = resolveApiBase();
  window.__HM_RESOLVED_API_BASE__ = base;
  window.__HM_API_DEBUG_MODE__ = base.includes('localhost') || base.includes('127.0.0.1');
  window.hmResolveApiBase = () => base;
  window.hmResolveApiUrl = resolveApiUrl;
  window.hmApiFetch = apiFetch;
  return base;
}

installApiBaseGlobals();
