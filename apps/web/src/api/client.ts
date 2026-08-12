import type { AuditEvent, AuthUser, DashboardOverview, Deployment, FeatureFlag, Incident } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem('launchops.token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed', response.status);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  overview: () => request<DashboardOverview>('/dashboard/overview'),
  deployments: () => request<Deployment[]>('/deployments'),
  incidents: () => request<Incident[]>('/incidents'),
  flags: () => request<FeatureFlag[]>('/flags'),
  audit: () => request<AuditEvent[]>('/audit'),
  createDeployment: (payload: Pick<Deployment, 'service' | 'version' | 'environment' | 'commitSha' | 'owner'>) =>
    request<Deployment>('/deployments', { method: 'POST', body: JSON.stringify(payload) }),
  updateDeploymentStatus: (id: number, status: Deployment['status']) =>
    request<Deployment>(`/deployments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleFlag: (id: number) => request<FeatureFlag>(`/flags/${id}/toggle`, { method: 'PATCH' }),
  createIncident: (payload: Pick<Incident, 'title' | 'severity' | 'service' | 'summary'>) =>
    request<Incident>('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  updateIncidentStatus: (id: number, status: Incident['status']) =>
    request<Incident>(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
