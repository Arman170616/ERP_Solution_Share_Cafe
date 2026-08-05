import {
  LayoutDashboard,
  Users,
  Calculator,
  ShoppingCart,
  Boxes,
  UserCircle,
  Truck,
  Briefcase,
  FileBarChart,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { SectionHeading, GlassCard, Badge } from '../ui';

const modules = [
  {
    n: '01',
    icon: LayoutDashboard,
    title: 'Dashboard',
    color: 'from-brand-400 to-brand-700',
    items: [
      'Real-time sales monitoring',
      'Revenue & profit analytics',
      'Business Health Score',
      'AI business insights',
      'Daily / weekly / monthly reports',
    ],
  },
  {
    n: '02',
    icon: Users,
    title: 'User & Role Management',
    color: 'from-accent-400 to-accent-700',
    items: [
      'Super Admin, Owner, Manager',
      'Accountant, Cashier, Sales',
      'Warehouse, HR, Customer portal',
      'Role-based permissions',
      'Complete access control',
    ],
  },
  {
    n: '03',
    icon: Calculator,
    title: 'Accounting',
    color: 'from-brand-400 to-brand-700',
    items: [
      'General ledger & journal entries',
      'Chart of accounts',
      'Income & expense tracking',
      'Bank & cash flow management',
      'Trial balance, P&L, balance sheet',
    ],
  },
  {
    n: '04',
    icon: ShoppingCart,
    title: 'Sales & POS',
    color: 'from-accent-400 to-accent-700',
    items: [
      'Barcode & QR code support',
      'Invoice generation',
      'Returns, refunds, discounts, coupons',
      'Multiple payment methods',
      'Thermal printing, offline & mobile POS',
    ],
  },
  {
    n: '05',
    icon: Boxes,
    title: 'Inventory Management',
    color: 'from-brand-400 to-brand-700',
    items: [
      'Product, category & brand management',
      'Warehouse & multi-branch inventory',
      'Stock adjustments',
      'Low stock alerts',
      'Batch tracking & expiry management',
    ],
  },
  {
    n: '06',
    icon: UserCircle,
    title: 'CRM',
    color: 'from-accent-400 to-accent-700',
    items: [
      'Customer profiles & purchase history',
      'Loyalty points & memberships',
      'Credit management',
      'Customer wallet',
      'Marketing campaign support',
    ],
  },
  {
    n: '07',
    icon: Truck,
    title: 'Supplier Management',
    color: 'from-brand-400 to-brand-700',
    items: [
      'Supplier database',
      'Purchase orders',
      'Supplier payments',
      'Due tracking',
      'Supplier performance reports',
    ],
  },
  {
    n: '08',
    icon: Briefcase,
    title: 'Human Resource',
    color: 'from-accent-400 to-accent-700',
    items: [
      'Employee management',
      'Attendance & payroll',
      'Commission & leave management',
      'Shift scheduling',
      'Employee performance',
    ],
  },
  {
    n: '09',
    icon: FileBarChart,
    title: 'Financial Reports',
    color: 'from-brand-400 to-brand-700',
    items: [
      'Daily, monthly & yearly reports',
      'Sales & expense reports',
      'Profit reports',
      'Inventory reports',
      'VAT & cash flow reports',
    ],
  },
  {
    n: '10',
    icon: Receipt,
    title: 'Oman VAT Compliance',
    color: 'from-accent-400 to-accent-700',
    items: [
      '5% VAT support',
      'VAT invoice generation',
      'VAT reports & summary',
      'VAT audit support',
      'VAT registration management',
    ],
  },
  {
    n: '11',
    icon: CreditCard,
    title: 'Online Payment',
    color: 'from-brand-400 to-brand-700',
    items: [
      'Stripe integration',
      'Bank transfer',
      'Payment links',
      'Multi-method checkout',
      'Reconciliation ready',
    ],
  },
];

export function Modules() {
  return (
    <section id="modules" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Core Modules"
          title={
            <>
              11 modules.{' '}
              <span className="text-gradient">One source of truth.</span>
            </>
          }
          subtitle="Every part of the cafe — from the cash register to the balance sheet — lives in Share. No more exports, imports, or reconciliation nightmares."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="reveal"
                style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              >
                <GlassCard sheen hover className="group h-full p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-glow`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <Badge tone="neutral" className="font-display">
                      {m.n}
                    </Badge>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900">
                    {m.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {m.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-2 text-sm text-ink-500"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            );
          })}

          {/* CTA tile */}
          <div className="reveal" style={{ transitionDelay: '140ms' }}>
            <div className="glass-dark relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 text-white">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  And more
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight">
                  Notifications, security & multi-branch built in.
                </h3>
                <p className="mt-3 text-sm text-white/70">
                  Email, SMS, WhatsApp and push alerts. Two-factor auth, audit
                  logs, device management, encrypted backups and disaster
                  recovery — all included.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Email', 'SMS', 'WhatsApp', 'Push', '2FA', 'Audit logs'].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand-400/30 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
