import type {
  AuditEvent,
  AuthUser,
  DashboardOverview,
  Deployment,
  FeatureFlag,
  Incident,
  Metric
} from '../lib/types';

const now = new Date().toISOString();

export const demoUser: AuthUser = {
  sub: 1,
  name: 'Luis Mario',
  email: 'admin@launchops.dev',
  role: 'admin',
  organizationId: 1
};

export const demoMetrics: Metric[] = [
  { id: 1, key: 'uptime', label: 'Uptime', value: 99.94, unit: '%', trend: 0.8 },
  { id: 2, key: 'p95_latency', label: 'P95 Latency', value: 184, unit: 'ms', trend: -6.4 },
  { id: 3, key: 'deploy_frequency', label: 'Deploy Frequency', value: 18, unit: '/week', trend: 12.2 },
  { id: 4, key: 'rollback_rate', label: 'Rollback Rate', value: 4.1, unit: '%', trend: -1.7 },
  { id: 5, key: 'open_incidents', label: 'Open Incidents', value: 2, unit: '', trend: -2.0 },
  { id: 6, key: 'lead_time', label: 'Lead Time', value: 2.6, unit: 'days', trend: -9.5 }
];

export let demoDeployments: Deployment[] = [
  {
    id: 1,
    service: 'web-dashboard',
    version: 'v2.8.1',
    status: 'success',
    environment: 'production',
    commitSha: 'a91f2c7',
    owner: 'Luis Mario',
    durationMs: 153000,
    createdAt: now
  },
  {
    id: 2,
    service: 'auth-api',
    version: 'v1.17.0',
    status: 'success',
    environment: 'production',
    commitSha: 'b83de11',
    owner: 'Backend Team',
    durationMs: 209000,
    createdAt: now
  },
  {
    id: 3,
    service: 'billing-worker',
    version: 'v0.9.4',
    status: 'running',
    environment: 'staging',
    commitSha: 'c21ab43',
    owner: 'Platform Team',
    durationMs: 0,
    createdAt: now
  },
  {
    id: 4,
    service: 'notifications',
    version: 'v3.4.2',
    status: 'failed',
    environment: 'production',
    commitSha: 'e9f22da',
    owner: 'Messaging Team',
    durationMs: 71000,
    createdAt: now
  }
];

export let demoIncidents: Incident[] = [
  {
    id: 1,
    title: 'Notification delivery latency spike',
    severity: 'high',
    status: 'investigating',
    service: 'notifications',
    summary: 'Message queue delay increased after the last production deploy.',
    createdAt: now
  },
  {
    id: 2,
    title: 'Catalog API cache misses',
    severity: 'medium',
    status: 'open',
    service: 'catalog-api',
    summary: 'Cache hit rate dropped below target after schema changes.',
    createdAt: now
  },
  {
    id: 3,
    title: 'Auth service token refresh errors',
    severity: 'critical',
    status: 'resolved',
    service: 'auth-api',
    summary: 'Refresh-token validation failed for a subset of staging users.',
    createdAt: now
  }
];

export let demoFlags: FeatureFlag[] = [
  {
    id: 1,
    key: 'new_checkout_flow',
    name: 'New Checkout Flow',
    description: 'Enables the redesigned checkout journey for staged user segments.',
    enabled: true,
    rollout: 35,
    environment: 'production',
    owner: 'Commerce Team'
  },
  {
    id: 2,
    key: 'ai_summary_cards',
    name: 'AI Summary Cards',
    description: 'Displays auto-generated operational summaries in dashboards.',
    enabled: false,
    rollout: 0,
    environment: 'staging',
    owner: 'Platform Team'
  },
  {
    id: 3,
    key: 'strict_role_guard',
    name: 'Strict Role Guard',
    description: 'Enforces stricter role validation across admin-only flows.',
    enabled: true,
    rollout: 80,
    environment: 'production',
    owner: 'Security Team'
  }
];

export const demoAudit: AuditEvent[] = [
  {
    id: 1,
    actor: 'admin@launchops.dev',
    action: 'enabled feature flag',
    target: 'strict_role_guard',
    severity: 'warning',
    metadata: { rollout: 80 },
    createdAt: now
  },
  {
    id: 2,
    actor: 'engineer@launchops.dev',
    action: 'queued deployment',
    target: 'billing-worker@v0.9.4',
    severity: 'info',
    metadata: { environment: 'staging' },
    createdAt: now
  },
  {
    id: 3,
    actor: 'system',
    action: 'rollback triggered',
    target: 'catalog-api@v1.5.9',
    severity: 'danger',
    metadata: { reason: 'cache stampede risk' },
    createdAt: now
  }
];

export function buildDemoOverview(): DashboardOverview {
  const success = demoDeployments.filter((d) => d.status === 'success').length;
  const failed = demoDeployments.filter((d) => d.status === 'failed').length;
  const running = demoDeployments.filter((d) => d.status === 'running').length;

  return {
    metrics: demoMetrics,
    deployments: demoDeployments,
    incidents: demoIncidents,
    flags: demoFlags,
    releaseRhythm: [
      { day: 'Mon', deploys: 3, incidents: 1 },
      { day: 'Tue', deploys: 5, incidents: 0 },
      { day: 'Wed', deploys: 2, incidents: 2 },
      { day: 'Thu', deploys: 4, incidents: 1 },
      { day: 'Fri', deploys: 6, incidents: 0 },
      { day: 'Sat', deploys: 1, incidents: 0 },
      { day: 'Sun', deploys: 2, incidents: 1 }
    ],
    summary: {
      deploymentSuccessRate: Math.round((success / Math.max(success + failed, 1)) * 100),
      runningDeployments: running,
      criticalIncidents: demoIncidents.filter(
        (i) => (i.severity === 'high' || i.severity === 'critical') && i.status !== 'resolved'
      ).length,
      enabledFlags: demoFlags.filter((f) => f.enabled).length
    }
  };
}

export function demoLogin(email: string): { token: string; user: AuthUser } {
  const role =
    email.includes('viewer') ? 'viewer' : email.includes('engineer') ? 'engineer' : 'admin';

  return {
    token: 'demo-token',
    user: {
      ...demoUser,
      email: email || demoUser.email,
      role,
      name: role === 'admin' ? 'Luis Mario' : role === 'engineer' ? 'Frontend Engineer' : 'Stakeholder Viewer'
    }
  };
}
