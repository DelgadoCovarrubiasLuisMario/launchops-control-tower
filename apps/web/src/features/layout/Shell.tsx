import { Activity, Boxes, Command, Flag, Gauge, GitBranch, LogOut, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../lib/auth-store';
import { canViewAudit } from '../../lib/rbac';
import { CommandPalette } from '../command/CommandPalette';

const allNavItems = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'deployments', label: 'Deployments', icon: GitBranch },
  { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'audit', label: 'Audit', icon: Activity }
] as const;

export type ViewId = (typeof allNavItems)[number]['id'];

type ShellProps = {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  children: React.ReactNode;
};

export function Shell({ activeView, onViewChange, children }: ShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navItems = useMemo(
    () => allNavItems.filter((item) => item.id !== 'audit' || canViewAudit(user?.role)),
    [user?.role]
  );

  return (
    <div className="min-h-screen p-4 text-slate-100 md:p-6">
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onNavigate={onViewChange} />

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel flex flex-col rounded-[2rem] p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Boxes size={24} />
            </div>
            <div>
              <p className="text-sm text-cyan-200">LaunchOps</p>
              <h1 className="text-xl font-bold tracking-tight">Control Tower</h1>
            </div>
          </div>

          <button
            onClick={() => setCommandOpen(true)}
            className="mb-5 flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-400 transition hover:border-cyan-400 hover:text-slate-100"
          >
            <span className="flex items-center gap-2"><Command size={16} /> Search actions</span>
            <kbd className="rounded-lg border border-slate-700 px-2 py-0.5 text-xs">⌘K</kbd>
          </button>

          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    active ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{user?.role}</p>
            </div>
            <Button onClick={logout} variant="ghost" className="mt-3 w-full">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
