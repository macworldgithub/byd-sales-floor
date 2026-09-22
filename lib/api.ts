/**
 * api.ts – Frontend API Client
 * Wraps fetch to automatically include JWT and handle JSON/errors.
 * Token is persisted in localStorage so it survives page refreshes.
 */

import {
  Lead,
  Delivery,
  Appointment,
  ConversationThread,
  DuplicateCheckResult,
} from './types';
import { TemplatePack } from './templateEngine';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://byd-sales-floor-backend.vercel.app/api';

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
    return fetchApi<Lead[]>(`/leads${qs}`);
  },
  getLead: (id: string) => fetchApi<Lead>(`/leads/${id}`),
  createLead: (data: Partial<Lead>) =>
    fetchApi<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: Partial<Lead>) =>
    fetchApi<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTimeline: (id: string) => fetchApi<any>(`/leads/${id}/timeline`),
  addNote: (id: string, note: string) =>
    fetchApi<Lead>(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }),
};

// ─── Delivery Centre Methods ───────────────────────────────────────────────────

export const deliveryApi = {
  getClients: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<Delivery[]>(`/clients${qs}`);
  },
  getClient: (id: string) => fetchApi<Delivery>(`/clients/${id}`),
  updateClient: (id: string, data: Partial<Delivery>) =>
    fetchApi<Delivery>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addComment: (id: string, text: string) =>
    fetchApi(`/clients/${id}/comments`, { method: 'POST', body: JSON.stringify({ body: text }) }),
};

// ─── Appointments / Calendar Methods ──────────────────────────────────────────

export const appointmentApi = {
  getAppointments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<Appointment[]>(`/appointments${qs}`);
  },
  createAppointment: (data: Partial<Appointment>) =>
    fetchApi<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: Partial<Appointment>) =>
    fetchApi<Appointment>(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Conversations & Messaging Methods ─────────────────────────────────────────

export const conversationApi = {
  getConversations: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<ConversationThread[]>(`/conversations${qs}`);
  },
  getConversation: (id: string) => fetchApi<ConversationThread>(`/conversations/${id}`),
  sendMessage: (id: string, text: string) =>
    fetchApi(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
};

export const messageApi = {
  sendMessage: (data: {
    phone: string;
    body: string;
    client_id?: string;
    client_name?: string;
    template_id?: string;
  }) => fetchApi('/messages/send', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Templates Methods ────────────────────────────────────────────────────────

export const templateApi = {
  getTemplates: () => fetchApi<TemplatePack[]>('/templates'),
  createTemplate: (data: Partial<TemplatePack>) =>
    fetchApi<TemplatePack>('/templates', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Search & Duplicate Check Methods ──────────────────────────────────────────

export const searchApi = {
  search: (q: string) =>
    fetchApi<{ leads: Lead[]; clients: Delivery[]; appointments: Appointment[] }>(
      `/search?q=${encodeURIComponent(q)}`
    ),
  checkDuplicate: (phone?: string, email?: string) => {
    const params = new URLSearchParams();
    if (phone) params.set('phone', phone);
    if (email) params.set('email', email);
    return fetchApi<DuplicateCheckResult>(`/search/check-duplicate?${params.toString()}`);
  },
};

// ─── Stats / Summary Methods ───────────────────────────────────────────────────

export const statsApi = {
  getSummary: () => fetchApi<any>('/stats/summary'),
};
