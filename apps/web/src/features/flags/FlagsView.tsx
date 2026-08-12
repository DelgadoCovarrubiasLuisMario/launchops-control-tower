import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuthStore } from '../../lib/auth-store';
import { canMutateOps } from '../../lib/rbac';

export function FlagsView() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const canMutate = canMutateOps(role);
  const flagsQuery = useQuery({ queryKey: ['flags'], queryFn: api.flags });
  const toggleMutation = useMutation({
    mutationFn: api.toggleFlag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['flags'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    }
  });

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex items-center gap-4">
          <Flag className="text-cyan-300" size={36} />
          <div>
            <p className="text-sm text-cyan-200">Release safety</p>
            <h2 className="text-3xl font-black text-white">Feature flags</h2>
            <p className="mt-2 text-sm text-slate-400">Controlled rollouts with environment, ownership and audit-backed toggles.</p>
            {!canMutate ? (
              <p className="mt-3 text-sm text-amber-200">Viewer role: flag toggles are disabled.</p>
            ) : null}
          </div>
        </div>
      </Card>

      {toggleMutation.error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{toggleMutation.error.message}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {flagsQuery.data?.map((flag) => (
          <Card key={flag.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{flag.name}</h3>
                  <Badge className={flag.environment === 'production' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'}>
                    {flag.environment}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-slate-500">{flag.key}</p>
              </div>
              <Badge className={flag.enabled ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}>
                {flag.enabled ? 'enabled' : 'disabled'}
              </Badge>
            </div>
            <p className="mt-4 leading-7 text-slate-300">{flag.description}</p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm text-slate-400">
                <span>Rollout</span>
                <span>{flag.rollout}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${flag.rollout}%` }} />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Owner: {flag.owner}</p>
              {canMutate ? (
                <Button variant="ghost" onClick={() => toggleMutation.mutate(flag.id)} disabled={toggleMutation.isPending}>
                  Toggle
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
