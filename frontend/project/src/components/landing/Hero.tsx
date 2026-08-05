import {
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  Receipt,
  Boxes,
  Brain,
  TrendingUp,
  Users,
  Store,
  Zap,
} from 'lucide-react';
import { GlassButton, Badge } from '../ui';

const stats = [
  { value: '11', label: 'Core modules' },
  { value: '8+', label: 'AI engines' },
  { value: '5%', label: 'GCC VAT ready' },
  { value: '24/7', label: 'Real-time' },
];

const floatingChips = [
  { icon: TrendingUp, label: 'Sales +18%', tone: 'brand', pos: 'top-[14%] left-[6%]' },
  { icon: Brain, label: 'AI Insight', tone: 'accent', pos: 'top-[26%] right-[7%]' },
  { icon: Boxes, label: 'Low stock alert', tone: 'warning', pos: 'bottom-[24%] left-[4%]' },
  { icon: Receipt, label: 'VAT 5%', tone: 'brand', pos: 'bottom-[12%] right-[6%]' },
];

export function Hero({ onLaunchApp }: { onLaunchApp: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <div className="reveal is-visible">
              <Badge tone="brand" className="mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered ERP for SMEs in Oman & GCC
              </Badge>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl text-balance">
              Run your entire business on{' '}
              <span className="text-gradient">one intelligent platform</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500 text-balance">
              Share unifies Accounting, POS, Inventory, HR, CRM and AI analytics
              into a single cloud system — built for SMEs, ready for Oman VAT,
              and designed to scale across the GCC.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GlassButton variant="primary" size="lg" onClick={onLaunchApp}>
                Launch the app
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
              <GlassButton variant="glass" size="lg">
                <Play className="h-4 w-4" />
                Watch 2-min demo
              </GlassButton>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-600" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-brand-600" /> Free 14-day trial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Store className="h-4 w-4 text-brand-600" /> Multi-branch ready
              </span>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="glass rounded-2xl px-4 py-3.5 text-center"
                >
                  <div className="font-display text-2xl font-bold text-ink-900">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-ink-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: glass dashboard preview */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Floating chips */}
              {floatingChips.map((c) => {
                const Icon = c.icon;
                const tone =
                  c.tone === 'brand'
                    ? 'text-brand-600 bg-brand-50/80'
                    : c.tone === 'accent'
                    ? 'text-accent-600 bg-accent-50/80'
                    : 'text-amber-600 bg-amber-50/80';
                return (
                  <div
                    key={c.label}
                    className={[
                      'absolute z-20 hidden animate-float items-center gap-2 rounded-full border border-white/60 px-3 py-1.5 text-xs font-semibold shadow-glass backdrop-blur-md sm:flex',
                      c.pos,
                    ].join(' ')}
                    style={{ animationDelay: `${Math.random() * 2}s` }}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-full ${tone}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {c.label}
                  </div>
                );
              })}

              {/* Main glass card */}
              <div className="glass-strong relative z-10 rounded-[28px] p-5 shadow-glass-lg">
                {/* Window chrome */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <span className="h-3 w-3 rounded-full bg-brand-400/80" />
                  </div>
                  <div className="rounded-full bg-white/50 px-3 py-1 text-[11px] font-medium text-ink-500">
                    share.app/dashboard
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Revenue', value: 'OMR 48.2k', delta: '+18%', icon: TrendingUp },
                    { label: 'Orders', value: '1,284', delta: '+7%', icon: Receipt },
                    { label: 'Customers', value: '642', delta: '+12%', icon: Users },
                  ].map((k) => {
                    const Icon = k.icon;
                    return (
                      <div
                        key={k.label}
                        className="glass rounded-2xl p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100/70 text-brand-700">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-[10px] font-semibold text-brand-600">
                            {k.delta}
                          </span>
                        </div>
                        <div className="mt-2 font-display text-base font-bold text-ink-900">
                          {k.value}
                        </div>
                        <div className="text-[10px] text-ink-500">{k.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart */}
                <div className="glass mt-3 rounded-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-ink-700">
                        Revenue this week
                      </div>
                      <div className="text-[10px] text-ink-400">
                        Across 3 branches
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <span className="rounded-full bg-brand-100/70 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                        7D
                      </span>
                      <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                        30D
                      </span>
                    </div>
                  </div>
                  <MiniChart />
                </div>

                {/* AI insight */}
                <div className="glass mt-3 flex items-start gap-3 rounded-2xl p-4">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-700 text-white shadow-glow">
                    <Brain className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-ink-800">
                      AI Business Consultant
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                      Sales dropped 15% this week. Restock 5 fast-moving items
                      and follow up on OMR 3,200 in overdue invoices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-6 -z-0 rounded-[40px] bg-gradient-to-br from-brand-300/40 via-accent-300/30 to-transparent blur-2xl" />
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-16 sm:mt-24">
          <div className="reveal text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Trusted by modern businesses across the GCC
          </div>
          <div className="reveal mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {['AlMadina Retail', 'GulfTech Trading', 'Nizwa Foods', 'Muscat Logistics', 'Dhofar Pharmacy', 'Sohar Mart'].map(
              (n) => (
                <span
                  key={n}
                  className="font-display text-base font-semibold text-ink-500"
                >
                  {n}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Tiny inline SVG chart */
function MiniChart() {
  const bars = [38, 52, 44, 68, 58, 82, 72];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div>
      <div className="flex h-28 items-end justify-between gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative w-full">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-700"
                style={{ height: `${h * 1.4}px` }}
              />
              {i === 5 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  Peak
                </span>
              )}
            </div>
            <span className="text-[9px] text-ink-400">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
