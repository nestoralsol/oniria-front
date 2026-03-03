// src/services/avatar.js
import { API_BASE } from './config';

export async function createAvatar(payload) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/arkano/v1/avatars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creando avatar');
  }

  return res.json();
}
