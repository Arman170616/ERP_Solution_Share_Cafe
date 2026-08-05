import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../../lib/api';

type NotificationT = { id: number; notif_type: string; message: string; is_read: boolean; created_at: string };

function unwrap<T>(res: { results?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : res.results ?? [];
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationT[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    api.get<{ results?: NotificationT[] } | NotificationT[]>('/notifications/notifications/').then((res) =>
      setItems(unwrap(res))
    );
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // no websockets in scope — poll instead
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    await api.post('/notifications/notifications/mark_all_read/');
    load();
  }

  async function markRead(n: NotificationT) {
    if (n.is_read) return;
    await api.post(`/notifications/notifications/${n.id}/mark_read/`);
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/40 text-ink-600 hover:bg-white/60"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-80 rounded-2xl glass-strong p-3 shadow-glass-lg">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                Mark all read
              </button>
            )}
          </div>
          <div className="no-scrollbar max-h-80 space-y-1 overflow-y-auto">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={[
                  'block w-full rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-white/60',
                  n.is_read ? 'text-ink-500' : 'bg-brand-50/60 font-medium text-ink-900',
                ].join(' ')}
              >
                <div>{n.message}</div>
                <div className="mt-0.5 text-[10px] text-ink-400">{new Date(n.created_at).toLocaleString()}</div>
              </button>
            ))}
            {items.length === 0 && <p className="px-3 py-6 text-center text-xs text-ink-400">No notifications.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
