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
    <div className="grid min-h-screen place-items-center p-4 text-[var(--lo-ink)]">
      <div className="grid w-full max-w-5xl gap-0 border border-[var(--lo-line)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="lo-panel border-0 p-8 sm:p-10">
          <div className="mb-6 grid size-12 place-items-center border border-[var(--lo-ink)] bg-[var(--lo-ink)] text-[var(--lo-panel-2)]">
            <Boxes size={22} />
          </div>
          <p className="lo-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--lo-muted)]">Industrial ops console</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">LaunchOps Control Tower</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--lo-muted)] sm:text-base">
            High-density operations surface for deployments, incidents, flags and audit events — with JWT roles and org scoping.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Auth', 'JWT + RBAC'],
              ['Realtime', 'Socket.IO pulse'],
              ['Data', 'MySQL + Sequelize']
            ].map(([label, value]) => (
              <div key={label} className="lo-panel-flat p-3">
                <dt className="lo-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--lo-muted)]">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Card className="border-0 border-l border-[var(--lo-line)] lg:rounded-none">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center border border-[var(--lo-line)] bg-[var(--lo-panel-2)]">
              <LockKeyhole size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Operator sign-in</h2>
              <p className="text-sm text-[var(--lo-muted)]">Enter your account credentials.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Password" type="password" {...register('password')} />
            {loginMutation.error && (
              <p className="border border-[var(--lo-danger)] bg-[#fef3f2] p-3 text-sm text-[var(--lo-danger)]">
                {loginMutation.error.message}
              </p>
            )}
            <Button disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Authenticating...' : 'Enter control tower'}
            </Button>
          </form>

          <p className="lo-mono mt-5 text-[0.7rem] uppercase tracking-[0.08em] text-[var(--lo-muted)]">
            Quick fill
          </p>
          <div className="mt-3 grid gap-2">
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
                className="lo-panel-flat px-3 py-2 text-left text-sm transition hover:border-[var(--lo-ink)]"
              >
                <span className="lo-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">{role}</span>
                <span className="mt-0.5 block">{email}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
