import { API_BASE } from './config';

export async function createGameSession(payload) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/oniria/v1/characters-sheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(raw || 'No se pudo crear la sesión');
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}