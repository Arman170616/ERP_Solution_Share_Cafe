import {
  Globe2,
  ShieldCheck,
  Building2,
  Cpu,
  Wallet,
  Headphones,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { SectionHeading, GlassCard, Badge } from '../ui';

const reasons = [
  {
    icon: Globe2,
    title: 'Built for Oman & the GCC',
    desc: '5% VAT, Arabic-ready, multi-branch and currency aware — designed for the region from day one.',
  },
  {
    icon: Cpu,
    title: 'AI that actually helps',
    desc: 'Not a chatbot bolted on. Forecasting, fraud detection and a consultant that reads your real numbers.',
  },
  {
    icon: Building2,
    title: 'Multi-branch by default',
    desc: 'Branch-wise sales, inventory and profit with inter-branch stock transfers out of the box.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    desc: 'Role-based access, 2FA, audit logs, device management, encryption and automatic backups.',
  },
  {
    icon: Wallet,
    title: 'Affordable for SMEs',
    desc: 'Tiered SaaS pricing with employee, branch and storage limits that scale with you.',
  },
  {
    icon: Layers,
    title: 'SaaS & white-label',
    desc: 'Multi-tenant architecture with white-label support for partners and franchises.',
  },
];

const stats = [
  { value: '11', suffix: '', label: 'Integrated modules' },
  { value: '8', suffix: '+', label: 'AI engines' },
  { value: '99.9', suffix: '%', label: 'Uptime SLA' },
  { value: '3', suffix: 'x', label: 'Faster month-end close' },
];

export function WhyNuva() {
  return (
    <section id="why" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why Share"
          title={
            <>
              The system that grows{' '}
              <span className="text-gradient">with your cafe</span>
            </>
          }
          subtitle="Traditional ERPs are expensive, rigid and built for enterprises. Share is modern, affordable and made for cafes like ours — with the depth to scale as we grow."
        />

        {/* Stats band */}
        <div className="reveal mt-12">
          <GlassCard variant="strong" className="p-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/30 p-7 text-center backdrop-blur-md"
                >
                  <div className="font-display text-4xl font-extrabold text-ink-900">
                    {s.value}
                    <span className="text-brand-600">{s.suffix}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Reasons grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="reveal"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <GlassCard sheen hover className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-base font-bold text-ink-900">
                      {r.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {r.desc}
                  </p>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* SaaS features strip */}
        <div className="reveal mt-12">
          <GlassCard className="flex flex-col items-start gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="accent" className="mb-3">
                <RefreshCw className="h-3.5 w-3.5" /> SaaS Platform
              </Badge>
              <h3 className="font-display text-2xl font-bold text-ink-900">
                Subscribe monthly or annually — scale on your terms
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-ink-500">
                Multi-tenant architecture, white-label support, subscription
                management, and configurable limits for storage, employees and
                branches.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Monthly subscription',
                'Annual subscription',
                'Multi-tenant',
                'White-label',
                'Storage limits',
                'Employee limits',
                'Branch limits',
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-brand-200/60 bg-brand-50/60 px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Support note */}
        <div className="reveal mt-6 flex items-center justify-center gap-2 text-sm text-ink-500">
          <Headphones className="h-4 w-4 text-brand-600" />
          Local onboarding & support across the GCC region.
        </div>
      </div>
    </section>
  );
}
