import { useMutation } from '@tanstack/react-query';
import { Boxes, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../api/client';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../lib/auth-store';

type LoginForm = {
  email: string;
  password: string;
};

const DEMO_PASSWORD = 'password123';

export function LoginScreen() {
  const { setSession } = useAuthStore();
  const { register, handleSubmit, setValue } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginForm) => api.login(email, password),
    onSuccess: (data) => setSession(data.user, data.token)
  });

  const onSubmit = (values: LoginForm) => loginMutation.mutate(values);

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="glass-panel rounded-[2rem] p-8 md:p-12">
          <div className="mb-8 grid size-16 place-items-center rounded-3xl bg-cyan-400 text-slate-950">
            <Boxes size={32} />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Portfolio star project</p>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">LaunchOps Control Tower</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Full-stack SaaS command center with realtime operations, RBAC, audit trails, feature flags, deployment tracking and operational intelligence.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Realtime Socket.IO', 'JWT + RBAC', 'MySQL + Sequelize'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm font-semibold text-slate-200">{item}</div>
            ))}
          </div>
        </div>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-800 text-cyan-300"><LockKeyhole size={22} /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="text-sm text-slate-400">Use a seeded demo account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Password" type="password" {...register('password')} />
            {loginMutation.error && <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{loginMutation.error.message}</p>}
            <Button disabled={loginMutation.isPending}>{loginMutation.isPending ? 'Signing in...' : 'Enter control tower'}</Button>
          </form>

          <p className="mt-5 text-xs text-slate-500">Demo password for all seeded users: {DEMO_PASSWORD}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            {[
              ['Admin', 'admin@launchops.dev'],
              ['Engineer', 'engineer@launchops.dev'],
              ['Viewer', 'viewer@launchops.dev']
            ].map(([role, email]) => (
              <button
                key={email}
                type="button"
                onClick={() => {
                  setValue('email', email);
                  setValue('password', DEMO_PASSWORD);
                }}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-left transition hover:border-cyan-400 hover:text-cyan-200"
              >
                {role}: {email}
              </button>
            ))}
          </div>
          {import.meta.env.VITE_USE_DEMO === 'true' ? (
            <p className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-xs text-cyan-100">
              Public demo mode is on — sample data runs in the browser without a live API.
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
