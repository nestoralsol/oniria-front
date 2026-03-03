import { API_BASE } from './config';

export async function getMasterGameConfig() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/oniria/v1/masters-workshops/bootstrap`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(raw || 'No se pudo cargar el JSON del master');
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Respuesta no es JSON. Inicio: ${raw.slice(0, 120)}`
    );
  }
}