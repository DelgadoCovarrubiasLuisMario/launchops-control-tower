import { Command } from 'cmdk';
import { Activity, Flag, Gauge, GitBranch, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import { useAuthStore } from '../../lib/auth-store';
import { canViewAudit } from '../../lib/rbac';
import type { ViewId } from '../layout/Shell';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: ViewId) => void;
};

const allActions: Array<{ label: string; view: ViewId; icon: React.ComponentType<{ size?: number }>; auditOnly?: boolean }> = [
  { label: 'Open overview', view: 'overview', icon: Gauge },
  { label: 'Review deployments', view: 'deployments', icon: GitBranch },
  { label: 'Inspect incidents', view: 'incidents', icon: ShieldAlert },
  { label: 'Manage feature flags', view: 'flags', icon: Flag },
  { label: 'Open audit trail', view: 'audit', icon: Activity, auditOnly: true }
];

export function CommandPalette({ open, onOpenChange, onNavigate }: CommandPaletteProps) {
  const role = useAuthStore((state) => state.user?.role);
  const actions = useMemo(
    () => allActions.filter((action) => !action.auditOnly || canViewAudit(role)),
    [role]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-slate-950/70 p-4 pt-24 backdrop-blur">
      <Command className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="border-b border-slate-800 p-4">
          <Command.Input
            autoFocus
            placeholder="Search deployments, incidents, flags..."
            className="w-full bg-transparent text-lg text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>
        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="p-6 text-center text-sm text-slate-500">No action found.</Command.Empty>
          <Command.Group heading="Navigation" className="text-xs text-slate-500">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Command.Item
                  key={action.view}
                  value={action.label}
                  onSelect={() => {
                    onNavigate(action.view);
                    onOpenChange(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 aria-selected:bg-cyan-400 aria-selected:text-slate-950"
                >
                  <Icon size={18} />
                  {action.label}
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
      </Command>
      <button className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} aria-label="Close command palette" />
    </div>
  );
}
