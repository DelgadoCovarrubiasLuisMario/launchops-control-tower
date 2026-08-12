import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../lib/auth-store';
import { formatDate } from '../../lib/format';
import { canMutateOps } from '../../lib/rbac';
import { severityStyles } from '../../lib/status';
import type { Incident } from '../../lib/types';

const incidentSchema = z.object({
  title: z.string().min(6),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  service: z.string().min(2),
  summary: z.string().min(12)
});

type IncidentForm = z.infer<typeof incidentSchema>;

export function IncidentsView() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const canMutate = canMutateOps(role);
  const incidentsQuery = useQuery({ queryKey: ['incidents'], queryFn: api.incidents });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncidentForm>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: 'Elevated checkout latency',
      severity: 'high',
      service: 'payments-api',
      summary: 'p95 latency crossed the alert threshold in production.'
    }
  });

  const createMutation = useMutation({
    mutationFn: api.createIncident,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      reset();
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Incident['status'] }) => api.updateIncidentStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    }
  });

  const mutationError = createMutation.error ?? statusMutation.error;

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-rose-300" size={36} />
          <div>
            <p className="text-sm text-rose-200">Incident management</p>
            <h2 className="text-3xl font-black text-white">Risk radar</h2>
            <p className="mt-2 text-sm text-slate-400">Shows severity, ownership, current status and operational summaries.</p>
            {!canMutate ? (
              <p className="mt-3 text-sm text-amber-200">Viewer role: read-only incident board.</p>
            ) : null}
          </div>
        </div>
      </Card>

      {mutationError ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{mutationError.message}</p>
      ) : null}

      <div className={`grid gap-5 ${canMutate ? 'xl:grid-cols-[360px_1fr]' : ''}`}>
        {canMutate ? (
          <Card>
            <h3 className="text-xl font-bold text-white">Open incident</h3>
            <form
              onSubmit={handleSubmit((values) => createMutation.mutate(values))}
              className="mt-5 grid gap-4"
            >
              <Input label="Title" {...register('title')} />
              {errors.title ? <p className="text-xs text-rose-300">{errors.title.message}</p> : null}
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Severity</span>
                <select {...register('severity')} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400">
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </label>
              <Input label="Service" {...register('service')} />
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Summary</span>
                <textarea
                  {...register('summary')}
                  rows={4}
                  className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              {errors.summary ? <p className="text-xs text-rose-300">{errors.summary.message}</p> : null}
              <Button disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Opening...' : 'Open incident'}
              </Button>
            </form>
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {incidentsQuery.data?.map((incident) => (
            <Card key={incident.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{incident.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{incident.service} · {formatDate(incident.createdAt)}</p>
                </div>
                <Badge className={severityStyles[incident.severity]}>{incident.severity}</Badge>
              </div>
              <p className="mt-4 leading-7 text-slate-300">{incident.summary}</p>
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                Current status: <span className="font-semibold text-white">{incident.status}</span>
              </div>
              {canMutate ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['open', 'investigating', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => statusMutation.mutate({ id: incident.id, status })}
                      className="rounded-xl border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
