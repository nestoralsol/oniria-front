// src/services/avatarCatalog.js
import { API_BASE } from './config';

export async function getAvatarCatalog() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/oniria/v1/character-sheets/bootstrap`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'No se pudo cargar el catálogo');
  }

  return res.json();
}
