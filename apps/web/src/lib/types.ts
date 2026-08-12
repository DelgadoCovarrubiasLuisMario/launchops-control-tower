export type UserRole = 'admin' | 'engineer' | 'viewer';

export type AuthUser = {
  sub: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number;
};

export type Metric = {
  id: number;
  key: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
};

export type Deployment = {
  id: number;
  service: string;
  version: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'rolled_back';
  environment: 'staging' | 'production';
  commitSha: string;
  owner: string;
  durationMs: number;
  createdAt: string;
};

export type Incident = {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  service: string;
  summary: string;
  createdAt: string;
};

export type FeatureFlag = {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout: number;
  environment: 'staging' | 'production';
  owner: string;
};

export type AuditEvent = {
  id: number;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'danger';
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ReleaseRhythmPoint = {
  day: string;
  deploys: number;
  incidents: number;
};

export type DashboardOverview = {
  metrics: Metric[];
  deployments: Deployment[];
  incidents: Incident[];
  flags: FeatureFlag[];
  releaseRhythm: ReleaseRhythmPoint[];
  summary: {
    deploymentSuccessRate: number;
    runningDeployments: number;
    criticalIncidents: number;
    enabledFlags: number;
  };
};

export type PulsePayload = {
  at: string;
  metrics: Metric[];
  latestDeployment?: Deployment;
  latestIncident?: Incident;
};
