import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { GlassButton } from '../ui';

export function CTA({ onLaunchApp }: { onLaunchApp: () => void }) {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 p-10 text-center shadow-glass-lg sm:p-16">
          {/* Decorative */}
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-400/40 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-20" />

          <div className="relative">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Get started today
            </div>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl text-balance">
              Bring every part of your business into one intelligent platform
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75 sm:text-lg">
              Join modern cafes across Oman and the GCC running on Share. Free for
              14 days — no credit card, no setup fees.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <GlassButton
                variant="glass"
                size="lg"
                onClick={onLaunchApp}
                className="!text-ink-900"
              >
                Launch the app
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
              <GlassButton variant="dark" size="lg">
                Book a demo
              </GlassButton>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
              {['14-day free trial', 'No credit card', 'Cancel anytime'].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-brand-300" /> {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
