import { Guide } from './types';
import { getToken, clearAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  // Auto-logout on 401 (expired token)
  if (res.status === 401 && token) {
    clearAuth();
    window.location.href = '/login';
  }

  return res;
}

export async function login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; name: string; role: 'admin' | 'user' } }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Erreur de connexion' }));
    throw new Error(data.message || 'Erreur de connexion');
  }

  return res.json();
}

export async function fetchGuides(): Promise<Guide[]> {
  const res = await authFetch(`${API_URL}/guides`);

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des guides');
  }

  return res.json();
}

export async function fetchGuide(id: string): Promise<Guide> {
  const res = await authFetch(`${API_URL}/guides/${id}`);

  if (!res.ok) {
    throw new Error('Erreur lors du chargement du guide');
  }

  return res.json();
}
