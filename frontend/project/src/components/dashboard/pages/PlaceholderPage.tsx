import { Sparkles, ArrowRight, type LucideIcon } from 'lucide-react';
import { GlassCard, GlassButton, Badge } from '../../ui';

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div className="space-y-5">
      <GlassCard variant="strong" sheen className="relative overflow-hidden p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <Badge tone="brand" className="mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Module
              </Badge>
              <h2 className="font-display text-2xl font-bold text-ink-900">
                {title}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-ink-500">{description}</p>
            </div>
          </div>
          <GlassButton variant="primary" size="md">
            Configure <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <GlassCard key={f} sheen hover className="p-5" >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100/70 text-brand-700">
                <span className="text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3 className="text-sm font-semibold text-ink-900">{f}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-ink-500">
          This module is part of the Share platform. Full interactive screens
          ship in the next release — the Dashboard, POS, Inventory and
          Accounting screens are live now.
        </p>
      </GlassCard>
    </div>
  );
}
