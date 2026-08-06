import { useEffect, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { type NavKey } from './components/dashboard/Sidebar';
import { OverviewPage } from './components/dashboard/pages/OverviewPage';
import { POSPage } from './components/dashboard/pages/POSPage';
import { InventoryPage } from './components/dashboard/pages/InventoryPage';
import { AccountingPage } from './components/dashboard/pages/AccountingPage';
import { HRPage } from './components/dashboard/pages/HRPage';
import { StaffHRPage } from './components/dashboard/pages/StaffHRPage';
import { ReportsPage } from './components/dashboard/pages/ReportsPage';
import { PlaceholderPage } from './components/dashboard/pages/PlaceholderPage';
import { AuthPage } from './pages/auth/AuthPage';
import { RequireRole } from './components/RequireRole';
import { useAuth } from './contexts/AuthContext';

type View = 'landing' | 'auth' | 'app';

const meta: Record<NavKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Real-time overview of your cafe' },
  pos: { title: 'Sales & POS', subtitle: 'Process sales, returns and refunds' },
  inventory: { title: 'Inventory', subtitle: 'Products, ingredients and stock' },
  accounting: { title: 'Accounting', subtitle: 'Revenue, expenses and financial summary' },
  hr: { title: 'HR & Payroll', subtitle: 'Employees, attendance and payroll' },
  reports: { title: 'Reports', subtitle: 'Financial and operational reports' },
  settings: { title: 'Settings', subtitle: 'Workspace, roles and integrations' },
};

// Settings/user management is covered by the Django admin already, not duplicated here.
const placeholderContent: Partial<
  Record<NavKey, { description: string; icon: typeof Settings; features: string[] }>
> = {
  settings: {
    description: 'User accounts, roles, IP whitelist and system activity logs are managed in the Django admin panel for now.',
    icon: Settings,
    features: ['Users & roles (Django admin)', 'IP whitelist/blacklist (Django admin)', 'Activity logs (Django admin)'],
  },
};

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [active, setActive] = useState<NavKey>('dashboard');

  useEffect(() => {
    if (!loading && user && view !== 'app') setView('app');
    // Only Admin has Dashboard access on the backend — land Manager/Staff on POS, the
    // module they're actually scoped to, instead of a 403'd page.
    if (user && user.role !== 'admin' && active === 'dashboard') setActive('pos');
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onLaunchApp={() => setView(user ? 'app' : 'auth')} />;
  }

  if (view === 'auth' || !user) {
    return <AuthPage onBack={() => setView('landing')} />;
  }

  const m = meta[active];
  return (
    <DashboardLayout active={active} onNavigate={setActive} title={m.title} subtitle={m.subtitle}>
      {active === 'dashboard' && (
        <RequireRole roles={['admin']}>
          <OverviewPage onViewReports={() => setActive('reports')} />
        </RequireRole>
      )}
      {active === 'pos' && <POSPage />}
      {active === 'inventory' && (
        <RequireRole roles={['admin', 'manager']}>
          <InventoryPage />
        </RequireRole>
      )}
      {active === 'accounting' && (
        <RequireRole roles={['admin']}>
          <AccountingPage />
        </RequireRole>
      )}
      {active === 'hr' && (
        user?.role === 'staff' ? (
          <StaffHRPage />
        ) : (
          <RequireRole roles={['admin', 'manager']}>
            <HRPage />
          </RequireRole>
        )
      )}
      {active === 'reports' && (
        <RequireRole roles={['admin']}>
          <ReportsPage />
        </RequireRole>
      )}
      {placeholderContent[active] && (
        <PlaceholderPage
          title={m.title}
          description={placeholderContent[active]!.description}
          icon={placeholderContent[active]!.icon}
          features={placeholderContent[active]!.features}
        />
      )}
    </DashboardLayout>
  );
}

export default App;
