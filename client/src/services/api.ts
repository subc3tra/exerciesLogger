import type {
  LoginResponse,
  MeResponse,
  ProgramsResponse,
  ProgramResponse,
  StartSessionResponse,
  SessionResponse,
  CompleteSessionResponse,
  UpdateSetResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'nordcore_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event('nordcore:unauthorized'));
    }
    throw new ApiError(data.message ?? 'Request failed', res.status);
  }

  return data as T;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => apiFetch<MeResponse>('/auth/me'),
};

export const programsApi = {
  getAll: () => apiFetch<ProgramsResponse>('/programs'),
  getById: (id: number) => apiFetch<ProgramResponse>(`/programs/${id}`),
};

export const sessionsApi = {
  start: (programId: number) =>
    apiFetch<StartSessionResponse>('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ programId }),
    }),
  getById: (id: number) => apiFetch<SessionResponse>(`/sessions/${id}`),
  complete: (id: number) =>
    apiFetch<CompleteSessionResponse>(`/sessions/${id}/complete`, { method: 'POST' }),
  updateSet: (
    sessionId: number,
    setId: number,
    data: Partial<{ reps: number; weight: number; duration: number; distance: number; completed: boolean; notes: string }>
  ) =>
    apiFetch<UpdateSetResponse>(`/sessions/${sessionId}/sets/${setId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  removeSet: (sessionId: number, setId: number) =>
    apiFetch<void>(`/sessions/${sessionId}/sets/${setId}`, { method: 'DELETE' }),
  addSet: (
    sessionId: number,
    sessionExerciseId: number,
    data: Partial<{ reps: number; weight: number; duration: number; distance: number; completed: boolean; notes: string }>
  ) =>
    apiFetch<UpdateSetResponse>(`/sessions/${sessionId}/exercises/${sessionExerciseId}/sets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const feedbackApi = {
  send: (message: string) =>
    apiFetch<{ message: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
