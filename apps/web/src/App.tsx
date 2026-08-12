import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError, api } from './api/client';
import { AuditView } from './features/audit/AuditView';
import { DeploymentsView } from './features/deployments/DeploymentsView';
import { FlagsView } from './features/flags/FlagsView';
import { Overview } from './features/dashboard/Overview';
import { IncidentsView } from './features/incidents/IncidentsView';
import { LoginScreen } from './features/layout/LoginScreen';
import { Shell, type ViewId } from './features/layout/Shell';
import { useRealtimePulse } from './hooks/useRealtimePulse';
import { useAuthStore } from './lib/auth-store';
import { canViewAudit } from './lib/rbac';
import { Button } from './components/Button';

export function App() {
  const { token, user, logout } = useAuthStore();
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const { pulse, connected } = useRealtimePulse(Boolean(token));
  const overviewQuery = useQuery({ queryKey: ['overview'], queryFn: api.overview, enabled: Boolean(token) });

  useEffect(() => {
    if (overviewQuery.error instanceof ApiError && overviewQuery.error.status === 401) {
      logout();
    }
  }, [overviewQuery.error, logout]);

  useEffect(() => {
    if (activeView === 'audit' && !canViewAudit(user?.role)) {
      setActiveView('overview');
    }
  }, [activeView, user?.role]);

  if (!token) {
    return <LoginScreen />;
  }

  if (overviewQuery.isLoading) {
    return <div className="lo-mono grid min-h-screen place-items-center text-[var(--lo-muted)]">Loading LaunchOps...</div>;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    const message =
      overviewQuery.error instanceof ApiError
        ? overviewQuery.error.message
        : 'Could not load dashboard.';

    return (
      <div className="grid min-h-screen place-items-center gap-4 p-6 text-center">
        <div>
          <p className="text-[var(--lo-danger)]">{message}</p>
          <p className="mt-2 text-sm text-[var(--lo-muted)]">Check that the API is running, then sign in again.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => void overviewQuery.refetch()}>Retry</Button>
          <Button variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (activeView === 'overview') return <Overview data={overviewQuery.data} pulse={pulse} connected={connected} />;
    if (activeView === 'deployments') return <DeploymentsView />;
    if (activeView === 'incidents') return <IncidentsView />;
    if (activeView === 'flags') return <FlagsView />;
    return <AuditView />;
  };

  return (
    <Shell activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Shell>
  );
}
