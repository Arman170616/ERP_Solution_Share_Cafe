import { useState, type ReactNode } from 'react';
import { Sidebar, type NavKey } from './Sidebar';
import { Topbar } from './Topbar';
import { MeshBackground } from '../MeshBackground';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardLayout({
  active,
  onNavigate,
  title,
  subtitle,
  children,
}: {
  active: NavKey;
  onNavigate: (k: NavKey) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen">
      <MeshBackground />
      <Sidebar
        active={active}
        onNavigate={(k) => {
          onNavigate(k);
          setOpen(false);
        }}
        open={open}
        onClose={() => setOpen(false)}
        onSignOut={logout}
        role={user?.role}
      />

      <div className="lg:pl-72">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setOpen(true)} user={user} onSignOut={logout} />
        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
