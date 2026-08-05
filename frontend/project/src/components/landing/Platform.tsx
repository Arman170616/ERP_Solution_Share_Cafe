import {
  LayoutDashboard,
  Calculator,
  ShoppingCart,
  Boxes,
  Users,
  Brain,
  FileText,
  Receipt,
  CreditCard,
  Building2,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { SectionHeading, GlassCard } from '../ui';

const pillars = [
  {
    icon: LayoutDashboard,
    title: 'Real-time Dashboard',
    desc: 'Live sales, revenue, profit and a Business Health Score across every branch.',
  },
  {
    icon: Calculator,
    title: 'Full Accounting',
    desc: 'General ledger, journal entries, trial balance, P&L, balance sheet and cash flow.',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & POS',
    desc: 'Barcode, QR, invoices, returns, discounts, thermal printing and offline POS.',
  },
  {
    icon: Boxes,
    title: 'Inventory',
    desc: 'Multi-branch stock, batches, expiry, low-stock alerts and purchase orders.',
  },
  {
    icon: Users,
    title: 'HR & Payroll',
    desc: 'Attendance, shifts, payroll, commissions and performance in one place.',
  },
  {
    icon: Brain,
    title: 'AI Analytics',
    desc: 'Forecasting, smart purchase planning, fraud detection and a business consultant.',
  },
];

export function Platform() {
  return (
    <section id="platform" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Platform"
          title={
            <>
              One system for{' '}
              <span className="text-gradient">every department</span>
            </>
          }
          subtitle="Stop juggling spreadsheets and disconnected tools. Share brings every part of running the cafe into a single, intelligent workspace — so your team stays in sync and your data stays clean."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="reveal"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <GlassCard sheen hover className="h-full p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {p.desc}
                  </p>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Compliance strip */}
        <div className="reveal mt-12">
          <GlassCard variant="strong" className="overflow-hidden p-0">
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-6">
              {[
                { icon: Receipt, label: 'Oman VAT 5%' },
                { icon: FileText, label: 'Audit Reports' },
                { icon: CreditCard, label: 'Stripe Payments' },
                { icon: Building2, label: 'Multi-Branch' },
                { icon: ShieldCheck, label: 'Role-Based Access' },
                { icon: Bell, label: 'Smart Alerts' },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className={[
                      'flex items-center gap-3 px-6 py-5',
                      i !== 0 ? 'lg:border-l lg:border-white/40' : '',
                      i % 2 !== 0 ? 'sm:border-l sm:border-white/40 lg:border-l' : '',
                    ].join(' ')}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100/70 text-brand-700">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-semibold text-ink-800">
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
