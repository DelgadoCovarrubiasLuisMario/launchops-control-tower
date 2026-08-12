import type { AuditEvent, AuthUser, DashboardOverview, Deployment, FeatureFlag, Incident } from '../lib/types';
import {
  buildDemoOverview,
  demoAudit,
  demoDeployments,
  demoFlags,
  demoIncidents,
  demoLogin
} from '../data/demoData';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const useDemo = import.meta.env.VITE_USE_DEMO === 'true';

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
  login: async (email: string, password: string) => {
    if (useDemo) return demoLogin(email || 'admin@launchops.dev');
    return request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  overview: async (): Promise<DashboardOverview> => {
    if (useDemo) return buildDemoOverview();
    return request<DashboardOverview>('/dashboard/overview');
  },
  deployments: async () => {
    if (useDemo) return demoDeployments;
    return request<Deployment[]>('/deployments');
  },
  incidents: async () => {
    if (useDemo) return demoIncidents;
    return request<Incident[]>('/incidents');
  },
  flags: async () => {
    if (useDemo) return demoFlags;
    return request<FeatureFlag[]>('/flags');
  },
  audit: async () => {
    if (useDemo) return demoAudit;
    return request<AuditEvent[]>('/audit');
  },
  createDeployment: async (payload: Pick<Deployment, 'service' | 'version' | 'environment' | 'commitSha' | 'owner'>) => {
    if (useDemo) {
      const created: Deployment = {
        id: Date.now(),
        ...payload,
        status: 'queued',
        durationMs: 0,
        createdAt: new Date().toISOString()
      };
      demoDeployments.unshift(created);
      return created;
    }
    return request<Deployment>('/deployments', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateDeploymentStatus: async (id: number, status: Deployment['status']) => {
    if (useDemo) {
      const target = demoDeployments.find((item) => item.id === id);
      if (!target) throw new ApiError('Deployment not found', 404);
      target.status = status;
      return target;
    }
    return request<Deployment>(`/deployments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  toggleFlag: async (id: number) => {
    if (useDemo) {
      const target = demoFlags.find((item) => item.id === id);
      if (!target) throw new ApiError('Flag not found', 404);
      target.enabled = !target.enabled;
      return target;
    }
    return request<FeatureFlag>(`/flags/${id}/toggle`, { method: 'PATCH' });
  },
  createIncident: async (payload: Pick<Incident, 'title' | 'severity' | 'service' | 'summary'>) => {
    if (useDemo) {
      const created: Incident = {
        id: Date.now(),
        ...payload,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      demoIncidents.unshift(created);
      return created;
    }
    return request<Incident>('/incidents', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateIncidentStatus: async (id: number, status: Incident['status']) => {
    if (useDemo) {
      const target = demoIncidents.find((item) => item.id === id);
      if (!target) throw new ApiError('Incident not found', 404);
      target.status = status;
      return target;
    }
    return request<Incident>(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
};
