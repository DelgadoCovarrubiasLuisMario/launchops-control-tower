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
    <div className="grid gap-5">
      <header className="glass-panel overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">Realtime SaaS Ops</Badge>
              <span className={`inline-flex items-center gap-2 text-sm ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
                <span className="status-dot size-2 rounded-full bg-current" />
                {connected ? 'Socket connected' : 'Socket reconnecting'}
              </span>
            </div>
            <h2 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Engineering command center for deployments, incidents and release risk.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Built as a portfolio-grade product with RBAC, audit logs, feature flags, deployment intelligence, realtime pulses and secure API boundaries.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-5"
          >
            <p className="text-sm text-cyan-100">Operational summary</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-white">{data.summary.deploymentSuccessRate}%</p>
                <p className="text-xs text-slate-400">deploy success</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{data.summary.criticalIncidents}</p>
                <p className="text-xs text-slate-400">active risks</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{data.summary.runningDeployments}</p>
                <p className="text-xs text-slate-400">running deploys</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{data.summary.enabledFlags}</p>
                <p className="text-xs text-slate-400">enabled flags</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <KpiCard key={metric.key} metric={metric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Release rhythm</h3>
              <p className="text-sm text-slate-400">Deploys vs incidents this week</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.16)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 16 }} />
                <Area type="monotone" dataKey="deploys" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.16} />
                <Area type="monotone" dataKey="incidents" stroke="#fb7185" fill="#fb7185" fillOpacity={0.14} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white">Latest production signal</h3>
          <div className="mt-5 grid gap-4">
            {data.deployments.slice(0, 4).map((deployment) => (
              <div key={deployment.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{deployment.service}</p>
                    <p className="text-xs text-slate-500">{deployment.version} · {deployment.commitSha} · {formatDuration(deployment.durationMs)}</p>
                  </div>
                  <Badge className={deploymentStatusStyles[deployment.status]}>{deployment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Incident radar</h3>
            <p className="text-sm text-slate-400">Open risk with service ownership</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.incidents.map((incident) => (
            <div key={incident.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">{incident.title}</p>
                <Badge className={severityStyles[incident.severity]}>{incident.severity}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{incident.summary}</p>
              <p className="mt-3 text-xs text-slate-500">{incident.service} · {incident.status} · {formatDate(incident.createdAt)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
