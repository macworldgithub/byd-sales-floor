/**
 * api.ts – Frontend API Client
 * Wraps fetch to automatically include JWT and handle JSON/errors.
 * Token is persisted in localStorage so it survives page refreshes.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'byd_auth_token';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY) || '';
  }
  return '';
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, clear stale token and redirect to login
  if (response.status === 401) {
    clearToken();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `API Error: ${response.status}`);
  }
  return json;
}

// ─── Auth Methods ─────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Login failed');
    }
    return json as { success: boolean; data: { access_token: string; user: any; must_change_password: boolean } };
  },

  me: () => fetchApi<any>('/auth/me'),

  logout: () => fetchApi<void>('/auth/logout', { method: 'POST' }).catch(() => {}),
};

// ─── Lead Centre Methods ──────────────────────────────────────────────────────

export const leadApi = {
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`/leads${qs}`);
  },
  createLead: (data: any) => fetchApi('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => fetchApi(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTimeline: (id: string) => fetchApi(`/leads/${id}/timeline`),
};

// ─── Delivery Centre Methods ───────────────────────────────────────────────────

export const deliveryApi = {
  getClients: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`/clients${qs}`);
  },
  updateClient: (id: string, data: any) => fetchApi(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addComment: (id: string, text: string) =>
    fetchApi(`/clients/${id}/comments`, { method: 'POST', body: JSON.stringify({ body: text }) }),
};

// ─── Shared Methods ────────────────────────────────────────────────────────────

export const statsApi = {
  getSummary: () => fetchApi<any>('/stats/summary'),
};

export const conversationApi = {
  getConversations: () => fetchApi<any[]>('/conversations'),
  sendMessage: (id: string, text: string) =>
    fetchApi(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
};

export const appointmentApi = {
  getAppointments: () => fetchApi<any[]>('/appointments'),
  createAppointment: (data: any) => fetchApi('/appointments', { method: 'POST', body: JSON.stringify(data) }),
};
