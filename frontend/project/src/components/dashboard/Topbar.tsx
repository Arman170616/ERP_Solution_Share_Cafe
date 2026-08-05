import { Menu, LogOut } from 'lucide-react';
import type { User } from '../../contexts/AuthContext';

function initials(user: User) {
  const source = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
  return source
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || '?';
}

export function Topbar({
  title,
  subtitle,
  onMenu,
  user,
  onSignOut,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
  user: User | null;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:px-6">
      <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-2.5 shadow-glass">
        <button
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-xl text-ink-600 hover:bg-white/50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="font-display text-lg font-bold leading-tight text-ink-900">
            {title}
          </h1>
          <p className="text-xs text-ink-500">{subtitle}</p>
        </div>

        {/* Avatar */}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-white/50 bg-white/40 py-1 pl-1 pr-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent-400 to-accent-700 text-xs font-bold text-white">
            {user ? initials(user) : '?'}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold leading-tight text-ink-900">
              {user ? user.first_name || user.username : 'Guest'}
            </span>
            <span className="block text-[10px] capitalize text-ink-500">{user?.role ?? ''}</span>
          </span>
        </div>
        <button
          onClick={onSignOut}
          title="Sign out"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/40 text-ink-600 hover:bg-white/60"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
