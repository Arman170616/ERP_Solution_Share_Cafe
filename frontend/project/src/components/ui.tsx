import { type ReactNode, type ButtonHTMLAttributes } from 'react';

/* ---------- GlassCard ---------- */
type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'dark' | 'tint';
  sheen?: boolean;
  hover?: boolean;
  style?: React.CSSProperties;
};

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  sheen = false,
  hover = false,
  style,
}: GlassCardProps) {
  const variantClass =
    variant === 'strong'
      ? 'glass-strong'
      : variant === 'dark'
      ? 'glass-dark'
      : variant === 'tint'
      ? 'glass-tint'
      : 'glass';

  return (
    <div
      style={style}
      className={[
        variantClass,
        sheen ? 'glass-sheen' : '',
        hover ? 'transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-lg' : '',
        'rounded-3xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/* ---------- GlassButton ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'glass' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

export function GlassButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants: Record<string, string> = {
    primary:
      'text-white bg-gradient-to-br from-brand-500 to-brand-700 border border-white/30 shadow-glow hover:shadow-lg hover:from-brand-400 hover:to-brand-600',
    glass:
      'glass text-ink-800 hover:bg-white/60 hover:-translate-y-0.5',
    ghost:
      'text-ink-700 hover:text-ink-950 hover:bg-white/40',
    dark:
      'glass-dark text-white hover:bg-ink-900/60',
  };

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60',
        sizes[size],
        variants[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  className = '',
  tone = 'brand',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'brand' | 'accent' | 'neutral' | 'warning';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    accent: 'bg-accent-100/70 text-accent-700 border-accent-200/60',
    neutral: 'bg-white/60 text-ink-600 border-white/70',
    warning: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
  };
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md',
        tones[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

/* ---------- SectionHeading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  light?: boolean;
}) {
  return (
    <div
      className={[
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
      ].join(' ')}
    >
      {eyebrow && (
        <div
          className={[
            'mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
            light
              ? 'border-white/20 bg-white/10 text-white/80'
              : 'border-brand-200/60 bg-brand-50/60 text-brand-700',
          ].join(' ')}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </div>
      )}
      <h2
        className={[
          'font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.6rem] md:leading-[1.1]',
          light ? 'text-white' : 'text-ink-900',
        ].join(' ')}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={[
            'mt-4 text-base leading-relaxed sm:text-lg',
            light ? 'text-white/70' : 'text-ink-500',
          ].join(' ')}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
