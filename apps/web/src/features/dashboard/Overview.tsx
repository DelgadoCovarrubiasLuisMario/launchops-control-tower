import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { deploymentStatusStyles, severityStyles } from '../../lib/status';
import { formatDate, formatDuration } from '../../lib/format';
import type { DashboardOverview, PulsePayload } from '../../lib/types';
import { KpiCard } from './KpiCard';

type OverviewProps = {
  data: DashboardOverview;
  pulse: PulsePayload | null;
  connected: boolean;
};

export function Overview({ data, pulse, connected }: OverviewProps) {
  const metrics = pulse?.metrics?.length ? pulse.metrics : data.metrics;
  const chartData = data.releaseRhythm?.length
    ? data.releaseRhythm
    : [
        { day: 'Mon', deploys: 0, incidents: 0 },
        { day: 'Tue', deploys: 0, incidents: 0 },
        { day: 'Wed', deploys: 0, incidents: 0 },
        { day: 'Thu', deploys: 0, incidents: 0 },
        { day: 'Fri', deploys: 0, incidents: 0 },
        { day: 'Sat', deploys: 0, incidents: 0 },
        { day: 'Sun', deploys: 0, incidents: 0 }
      ];

  return (
    <div className="grid gap-4">
      <header className="lo-panel p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge className="rounded-none border-[var(--lo-line)] bg-[var(--lo-panel-2)] text-[var(--lo-ink)]">Ops floor</Badge>
              <span className={`lo-mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] ${connected ? 'text-[var(--lo-ok)]' : 'text-[var(--lo-warn)]'}`}>
                <span className="size-2 rounded-none bg-current" />
                {connected ? 'Socket linked' : 'Socket retry'}
              </span>
            </div>
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Deployment, incident and flag telemetry in one operator surface.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--lo-muted)]">
              Dense layout on purpose: color is reserved for status, not decoration. RBAC, audit trails and org-scoped APIs stay in the same console.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lo-panel-flat grid grid-cols-2 gap-3 p-3"
          >
            <div>
              <p className="lo-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">Success</p>
              <p className="mt-1 text-2xl font-semibold">{data.summary.deploymentSuccessRate}%</p>
            </div>
            <div>
              <p className="lo-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">Risks</p>
              <p className="mt-1 text-2xl font-semibold">{data.summary.criticalIncidents}</p>
            </div>
            <div>
              <p className="lo-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">Running</p>
              <p className="mt-1 text-2xl font-semibold">{data.summary.runningDeployments}</p>
            </div>
            <div>
              <p className="lo-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">Flags on</p>
              <p className="mt-1 text-2xl font-semibold">{data.summary.enabledFlags}</p>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <KpiCard key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Release rhythm</h3>
            <p className="lo-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--lo-muted)]">Deploys vs incidents</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="2 4" stroke="#b7c0cc" />
                <XAxis dataKey="day" stroke="#5b6575" />
                <YAxis stroke="#5b6575" />
                <Tooltip contentStyle={{ background: '#f7f8fa', border: '1px solid #b7c0cc', borderRadius: 0 }} />
                <Area type="monotone" dataKey="deploys" stroke="#175cd3" fill="#175cd3" fillOpacity={0.12} />
                <Area type="monotone" dataKey="incidents" stroke="#b42318" fill="#b42318" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Latest production signal</h3>
          <div className="mt-4 grid gap-2">
            {data.deployments.slice(0, 4).map((deployment) => (
              <div key={deployment.id} className="lo-panel-flat p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{deployment.service}</p>
                    <p className="lo-mono text-[0.7rem] text-[var(--lo-muted)]">
                      {deployment.version} · {deployment.commitSha} · {formatDuration(deployment.durationMs)}
                    </p>
                  </div>
                  <Badge className={deploymentStatusStyles[deployment.status]}>{deployment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Incident radar</h3>
          <p className="lo-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--lo-muted)]">Open risk by service</p>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          {data.incidents.map((incident) => (
            <div key={incident.id} className="lo-panel-flat p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{incident.title}</p>
                <Badge className={severityStyles[incident.severity]}>{incident.severity}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--lo-muted)]">{incident.summary}</p>
              <p className="lo-mono mt-3 text-[0.7rem] text-[var(--lo-muted)]">
                {incident.service} · {incident.status} · {formatDate(incident.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
