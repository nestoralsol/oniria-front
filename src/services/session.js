import { API_BASE } from './config';

export async function crearPartida({ name, password, max_players }) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/oniria/v1/game-sessions`, { 
    
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name,
      ...(password ? { password } : {}), // solo si hay password
      max_players: Number(max_players),
    }),
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(raw || `No se pudo crear la sesión (${res.status})`);
  }

  // por si devuelve JSON
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}