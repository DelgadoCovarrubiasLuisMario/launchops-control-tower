import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { formatDate } from '../../lib/format';

const auditStyles = {
  info: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  danger: 'border-rose-400/30 bg-rose-400/10 text-rose-200'
};

export function AuditView() {
  const auditQuery = useQuery({ queryKey: ['audit'], queryFn: api.audit });

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex items-center gap-4">
          <Activity className="text-cyan-300" size={36} />
          <div>
            <p className="text-sm text-cyan-200">Security and traceability</p>
            <h2 className="text-3xl font-black text-white">Audit trail</h2>
            <p className="mt-2 text-sm text-slate-400">Every risky action should be explainable, searchable and attributable.</p>
          </div>
        </div>
      </Card>

      {auditQuery.isError ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {auditQuery.error.message}
        </p>
      ) : null}

      <Card>
        <div className="grid gap-3">
          {auditQuery.data?.map((event) => (
            <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{event.actor} <span className="text-slate-400">{event.action}</span></p>
                  <p className="mt-1 text-sm text-slate-500">{event.target} · {formatDate(event.createdAt)}</p>
                </div>
                <Badge className={auditStyles[event.severity]}>{event.severity}</Badge>
              </div>
            </div>
          ))}
          {!auditQuery.isLoading && !auditQuery.data?.length ? (
            <p className="text-sm text-slate-500">No audit events yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
