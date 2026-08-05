import { ShieldAlert } from 'lucide-react';
import { useAuth, type Role } from '../contexts/AuthContext';
import { GlassCard } from './ui';

/**
 * Mirrors the backend's IsManagerOrAdmin/IsAdmin permission classes in the UI so a
 * restricted page shows an explanation instead of a blank screen full of 403 errors.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return (
      <GlassCard variant="strong" className="p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100/70 text-amber-700">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900">Restricted to {roles.join(' / ')}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Your account role ({user?.role ?? 'unknown'}) doesn't have access to this module. Ask an admin if you
          need it.
        </p>
      </GlassCard>
    );
  }
  return <>{children}</>;
}
