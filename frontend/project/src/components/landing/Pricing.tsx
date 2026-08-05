import { Check, Sparkles, ArrowRight, Star } from 'lucide-react';
import { SectionHeading, GlassCard, GlassButton, Badge } from '../ui';

const plans = [
  {
    name: 'Starter',
    tagline: 'For single-location shops getting digital.',
    price: '19',
    period: '/mo',
    cta: 'Start free trial',
    featured: false,
    features: [
      '1 branch',
      'Up to 5 employees',
      'POS + Inventory + Accounting',
      'Basic AI insights',
      'Oman VAT 5%',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    tagline: 'For scaling SMEs with multiple branches.',
    price: '49',
    period: '/mo',
    cta: 'Start free trial',
    featured: true,
    features: [
      'Up to 3 branches',
      'Up to 25 employees',
      'All 11 modules',
      'Full AI engine + chat assistant',
      'CRM + Supplier management',
      'Stripe online payments',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For multi-branch operations & franchises.',
    price: 'Custom',
    period: '',
    cta: 'Talk to sales',
    featured: false,
    features: [
      'Unlimited branches',
      'Unlimited employees',
      'White-label support',
      'Custom AI models',
      'Dedicated success manager',
      'SLA & disaster recovery',
      'Onboarding & training',
    ],
  },
];

export function Pricing({ onLaunchApp }: { onLaunchApp: () => void }) {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Simple, transparent{' '}
              <span className="text-gradient">SaaS pricing</span>
            </>
          }
          subtitle="Start free for 14 days. No credit card required. Upgrade, downgrade or cancel anytime — your data is always yours."
        />

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className="reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <GlassCard
                variant={p.featured ? 'strong' : 'default'}
                sheen
                hover
                className={[
                  'relative flex h-full flex-col p-7',
                  p.featured ? 'ring-2 ring-brand-500/50' : '',
                ].join(' ')}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="brand" className="shadow-glow">
                      <Star className="h-3.5 w-3.5 fill-current" /> Most popular
                    </Badge>
                  </div>
                )}

                <h3 className="font-display text-xl font-bold text-ink-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-ink-500">{p.tagline}</p>

                <div className="mt-5 flex items-end gap-1">
                  {p.price === 'Custom' ? (
                    <span className="font-display text-4xl font-extrabold text-ink-900">
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold text-ink-500">
                        OMR
                      </span>
                      <span className="font-display text-5xl font-extrabold text-ink-900">
                        {p.price}
                      </span>
                      <span className="mb-1.5 text-sm text-ink-500">
                        {p.period}
                      </span>
                    </>
                  )}
                </div>

                <GlassButton
                  variant={p.featured ? 'primary' : 'glass'}
                  size="md"
                  className="mt-6 w-full"
                  onClick={onLaunchApp}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </GlassButton>

                <ul className="mt-7 space-y-3">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-ink-700"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="reveal mt-8 flex items-center justify-center gap-2 text-sm text-ink-500">
          <Sparkles className="h-4 w-4 text-brand-600" />
          All plans include the AI engine, Oman VAT compliance and multi-branch
          support.
        </div>
      </div>
    </section>
  );
}
