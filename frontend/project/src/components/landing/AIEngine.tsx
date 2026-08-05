import {
  Brain,
  TrendingUp,
  Boxes,
  ShoppingCart,
  PieChart,
  Users,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { SectionHeading, GlassCard, GlassButton, Badge } from '../ui';

const aiFeatures = [
  {
    icon: TrendingUp,
    title: 'AI Sales Forecasting',
    desc: 'Predict future sales from historical trends and seasonality.',
  },
  {
    icon: Boxes,
    title: 'AI Inventory Recommendation',
    desc: 'Suggests which products need replenishment before you stock out.',
  },
  {
    icon: ShoppingCart,
    title: 'AI Smart Purchase Planning',
    desc: 'Automatically recommends purchase quantities and timing.',
  },
  {
    icon: PieChart,
    title: 'AI Profit Analysis',
    desc: 'Identifies your most and least profitable products instantly.',
  },
  {
    icon: Users,
    title: 'AI Customer Insights',
    desc: 'Analyzes buying behavior to power targeted campaigns.',
  },
  {
    icon: Sparkles,
    title: 'AI Staff Performance',
    desc: 'Measures employee productivity and sales contribution.',
  },
  {
    icon: ShieldAlert,
    title: 'AI Fraud Detection',
    desc: 'Flags unusual discounts, refunds and suspicious transactions.',
  },
  {
    icon: Brain,
    title: 'AI Business Consultant',
    desc: 'Daily recommendations to improve performance and cash flow.',
  },
];

export function AIEngine({ onLaunchApp }: { onLaunchApp: () => void }) {
  return (
    <section id="ai" className="relative overflow-hidden py-24 sm:py-32">
      {/* Dark hero band */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950" />
      <div className="absolute inset-0 -z-10 grid-pattern opacity-20" />
      <div className="absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          light
          eyebrow="The AI Engine"
          title={
            <>
              Your business gets a{' '}
              <span className="text-gradient-light">personal AI consultant</span>
            </>
          }
          subtitle="Share's AI engine turns your daily transactions into clear, actionable recommendations — so you spend less time reporting and more time growing."
        />

        {/* AI grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal"
                style={{ transitionDelay: `${(i % 4) * 70}ms` }}
              >
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-600 text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Consultant + Chat showcase */}
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* Consultant card */}
          <div className="reveal">
            <GlassCard variant="dark" sheen className="h-full p-7">
              <div className="flex items-center gap-3">
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-600 text-white shadow-glow">
                  <Brain className="h-6 w-6" />
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-brand-400/40 animate-pulse-ring" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Today's briefing
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    AI Business Consultant
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    tone: 'down',
                    text: 'Sales have decreased by 15% this week.',
                  },
                  {
                    tone: 'warn',
                    text: 'Inventory value is higher than normal.',
                  },
                  {
                    tone: 'warn',
                    text: 'Five products are close to stockout.',
                  },
                  {
                    tone: 'down',
                    text: 'Outstanding customer dues have increased.',
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <span
                      className={[
                        'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                        row.tone === 'down'
                          ? 'bg-rose-400'
                          : 'bg-amber-400',
                      ].join(' ')}
                    />
                    <p className="text-sm text-white/80">{row.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-brand-400/30 bg-brand-400/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Recommended action
                </div>
                <p className="mt-1.5 text-sm text-white/90">
                  Restock fast-moving products and follow up on overdue
                  payments to recover OMR 3,200 this week.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Chat assistant */}
          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <GlassCard variant="dark" sheen className="h-full p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-700 text-white shadow-glow">
                  <MessageSquare className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Natural language
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    AI Chat Assistant
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <ChatBubble
                  role="user"
                  text="Show today's sales."
                />
                <ChatBubble
                  role="ai"
                  text="Today's sales are OMR 7,840 across 3 branches — up 12% vs yesterday. Top seller: Nizwa Dates (84 units)."
                />
                <ChatBubble
                  role="user"
                  text="Which products generated the highest profit this month?"
                />
                <ChatBubble
                  role="ai"
                  text="Top profit this month: 1) Omani Honey (OMR 2,140), 2) Premium Frankincense (OMR 1,680), 3) Khareef Dates (OMR 1,210)."
                />
                <ChatBubble
                  role="user"
                  text="Which branch has the best performance?"
                />
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 text-sm text-white/40">
                  Ask anything about your business…
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="reveal mt-10 text-center">
          <Badge tone="brand" className="!bg-white/10 !text-brand-300 !border-white/15">
            <Sparkles className="h-3.5 w-3.5" /> AI included on every paid plan
          </Badge>
          <div className="mt-5">
            <GlassButton variant="primary" size="lg" onClick={onLaunchApp}>
              Try the AI engine
              <ArrowRight className="h-4 w-4" />
            </GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ role, text }: { role: 'user' | 'ai'; text: string }) {
  const isUser = role === 'user';
  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-brand-500 to-brand-700 text-white'
            : 'rounded-bl-sm border border-white/10 bg-white/5 text-white/85',
        ].join(' ')}
      >
        {text}
      </div>
    </div>
  );
}
