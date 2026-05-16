import { resolveApiBase } from './api-client.js';

function resolveUrl(path) {
  const base = resolveApiBase().replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || 'request_failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function getGradeVault() {
  const response = await fetch(resolveUrl('/api/grades/vault'), {
    method: 'GET',
    credentials: 'include',
  });
  return readResponse(response);
}

export async function putGradeVault(vaultJson, baseRevision) {
  const response = await fetch(resolveUrl('/api/grades/vault'), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vault_json: vaultJson, baseRevision }),
  });
  return readResponse(response);
}

export async function deleteGradeVault() {
  const response = await fetch(resolveUrl('/api/grades/vault'), {
    method: 'DELETE',
    credentials: 'include',
  });
  return readResponse(response);
}
