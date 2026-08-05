import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { GlassButton } from '../ui';
import { BrandMark } from '../BrandMark';

const links = [
  { label: 'Platform', href: '#platform' },
  { label: 'Modules', href: '#modules' },
  { label: 'AI Engine', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Why Share', href: '#why' },
];

export function Navbar({ onLaunchApp }: { onLaunchApp: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
      <nav
        className={[
          'mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5',
          scrolled
            ? 'glass-strong shadow-glass'
            : 'border border-transparent bg-transparent',
        ].join(' ')}
      >
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative block h-9 w-9">
            <BrandMark className="h-9 w-9 rounded-xl" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/40" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">
            Share<span className="text-brand-600">.</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-white/50 hover:text-ink-900"
            >
              {l.label}
            </a>
          ))}
          <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-white/50 hover:text-ink-900">
            Resources <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          <GlassButton variant="ghost" size="sm" onClick={onLaunchApp}>
            Sign in
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={onLaunchApp}>
            Launch App
          </GlassButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-xl glass text-ink-800 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-2 max-w-7xl lg:hidden">
          <div className="glass-strong rounded-2xl p-4 shadow-glass-lg">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-white/60"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/40 pt-3">
              <GlassButton variant="glass" size="md" onClick={onLaunchApp}>
                Sign in
              </GlassButton>
              <GlassButton variant="primary" size="md" onClick={onLaunchApp}>
                Launch App
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
