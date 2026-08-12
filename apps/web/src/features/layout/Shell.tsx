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
    <div className="min-h-screen text-[var(--lo-ink)]">
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onNavigate={onViewChange} />

      <header className="lo-panel sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center border border-[var(--lo-ink)] bg-[var(--lo-ink)] text-[var(--lo-panel-2)]">
              <Boxes size={18} />
            </div>
            <div>
              <p className="lo-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--lo-muted)]">LaunchOps · Ops Console</p>
              <h1 className="text-base font-semibold tracking-tight sm:text-lg">Control Tower</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="lo-mono inline-flex items-center gap-2 border border-[var(--lo-line)] bg-[var(--lo-panel-2)] px-3 py-2 text-[0.7rem] uppercase tracking-[0.08em] text-[var(--lo-muted)]"
            >
              <Command size={14} /> Search <kbd className="border border-[var(--lo-line)] px-1">⌘K</kbd>
            </button>
            <div className="lo-panel-flat hidden px-3 py-2 text-xs sm:block">
              <span className="lo-mono uppercase tracking-[0.08em] text-[var(--lo-muted)]">{user?.role}</span>
              <span className="mx-2 text-[var(--lo-line)]">|</span>
              <span>{user?.name}</span>
            </div>
            <Button onClick={logout} variant="ghost">
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-0 overflow-x-auto border-t border-[var(--lo-line)] px-1 sm:px-2" aria-label="Views">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`lo-mono inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[0.7rem] uppercase tracking-[0.1em] transition sm:px-4 ${
                  active
                    ? 'border-[var(--lo-ink)] text-[var(--lo-ink)]'
                    : 'border-transparent text-[var(--lo-muted)] hover:text-[var(--lo-ink)]'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 sm:py-5">{children}</main>
    </div>
  );
}
