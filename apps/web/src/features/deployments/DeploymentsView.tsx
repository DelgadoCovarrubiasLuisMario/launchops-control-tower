import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Rocket } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../lib/auth-store';
import { formatDate, formatDuration } from '../../lib/format';
import { canMutateOps } from '../../lib/rbac';
import { deploymentStatusStyles } from '../../lib/status';
import type { Deployment } from '../../lib/types';

const deploymentSchema = z.object({
  service: z.string().min(2),
  version: z.string().min(2),
  environment: z.enum(['staging', 'production']),
  commitSha: z.string().min(7).max(12),
  owner: z.string().min(2)
});

type DeploymentForm = z.infer<typeof deploymentSchema>;

export function DeploymentsView() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const canMutate = canMutateOps(role);
  const deploymentsQuery = useQuery({ queryKey: ['deployments'], queryFn: api.deployments });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeploymentForm>({
    resolver: zodResolver(deploymentSchema),
    defaultValues: {
      service: 'web-dashboard',
      version: 'v2.9.0',
      environment: 'staging',
      commitSha: 'a7c91f2',
      owner: 'Luis Mario'
    }
  });

  const createMutation = useMutation({
    mutationFn: api.createDeployment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployments'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      reset();
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Deployment['status'] }) => api.updateDeploymentStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployments'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    }
  });

  const onSubmit = (values: DeploymentForm) => createMutation.mutate(values);
  const mutationError = createMutation.error ?? statusMutation.error;

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-200">Release engineering</p>
            <h2 className="text-3xl font-black text-white">Deployment control</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Queue deploys, track status changes and keep audit-visible release workflows.
            </p>
            {!canMutate ? (
              <p className="mt-3 text-sm text-amber-200">Viewer role: read-only. Ask an admin or engineer to mutate deployments.</p>
            ) : null}
          </div>
          <Rocket className="text-cyan-300" size={42} />
        </div>
      </Card>

      {mutationError ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{mutationError.message}</p>
      ) : null}

      <div className={`grid gap-5 ${canMutate ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {canMutate ? (
          <Card>
            <h3 className="text-xl font-bold text-white">Queue deployment</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
              <Input label="Service" {...register('service')} />
              {errors.service ? <p className="text-xs text-rose-300">{errors.service.message}</p> : null}
              <Input label="Version" {...register('version')} />
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Environment</span>
                <select {...register('environment')} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400">
                  <option value="staging">staging</option>
                  <option value="production">production</option>
                </select>
              </label>
              <Input label="Commit SHA" {...register('commitSha')} />
              <Input label="Owner" {...register('owner')} />
              <Button disabled={createMutation.isPending}>{createMutation.isPending ? 'Queuing...' : 'Queue deploy'}</Button>
            </form>
          </Card>
        ) : null}

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <GitBranch className="text-cyan-300" />
            <h3 className="text-xl font-bold text-white">Deployment timeline</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th>Service</th>
                  <th>Env</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Owner</th>
                  <th>Created</th>
                  {canMutate ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {deploymentsQuery.data?.map((deployment) => (
                  <tr key={deployment.id} className="bg-slate-950/50">
                    <td className="rounded-l-2xl p-4">
                      <p className="font-semibold text-white">{deployment.service}</p>
                      <p className="text-xs text-slate-500">{deployment.version} · {deployment.commitSha}</p>
                    </td>
                    <td className="p-4 text-slate-300">{deployment.environment}</td>
                    <td className="p-4"><Badge className={deploymentStatusStyles[deployment.status]}>{deployment.status}</Badge></td>
                    <td className="p-4 text-slate-300">{formatDuration(deployment.durationMs)}</td>
                    <td className="p-4 text-slate-300">{deployment.owner}</td>
                    <td className={`p-4 text-slate-400 ${canMutate ? '' : 'rounded-r-2xl'}`}>{formatDate(deployment.createdAt)}</td>
                    {canMutate ? (
                      <td className="rounded-r-2xl p-4">
                        <div className="flex flex-wrap gap-2">
                          {(['running', 'success', 'failed', 'rolled_back'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => statusMutation.mutate({ id: deployment.id, status })}
                              className="rounded-xl border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
