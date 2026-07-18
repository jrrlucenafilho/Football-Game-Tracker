const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      request<{ token: string; usuario: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
    register: (data: { nome: string; email: string; senha: string; nivel_acesso?: string }) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  times: {
    list: () => request<any[]>('/times'),
    get: (id: number) => request<any>(`/times/${id}`),
    create: (data: { nome: string; cidade?: string; tecnico?: string }) =>
      request<any>('/times', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { nome?: string; cidade?: string; tecnico?: string }) =>
      request<any>(`/times/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/times/${id}`, { method: 'DELETE' }),
  },
  jogos: {
    list: () => request<any[]>('/jogos'),
    get: (id: number) => request<any>(`/jogos/${id}`),
    create: (data: {
      data_hora?: string;
      time_casa_id: number;
      time_visitante_id: number;
      gols_casa?: number;
      gols_visitante?: number;
      estadio?: string;
    }) =>
      request<any>('/jogos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/jogos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/jogos/${id}`, { method: 'DELETE' }),
  },
  usuarios: {
    list: () => request<any[]>('/usuarios'),
    get: (id: number) => request<any>(`/usuarios/${id}`),
    create: (data: { nome: string; email: string; senha: string; nivel_acesso?: string }) =>
      request<any>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { nome?: string; email?: string; senha?: string; nivel_acesso?: string }) =>
      request<any>(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/usuarios/${id}`, { method: 'DELETE' }),
  },
  classificacao: {
    get: () => request<any[]>('/classificacao'),
  },
};
