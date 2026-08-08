import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { MeshBackground } from '../../components/MeshBackground';
import { BrandMark } from '../../components/BrandMark';
import { Badge, GlassButton, GlassCard } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm text-ink-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}

export function AuthPage() {
  const { login, signup } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<{ needs_setup: boolean }>('/accounts/bootstrap-status/')
      .then((res) => {
        setNeedsSetup(res.needs_setup);
        setMode(res.needs_setup ? 'signup' : 'login');
      })
      .catch(() => setNeedsSetup(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(username, password, email || undefined);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <MeshBackground />
      <div className="relative w-full max-w-md">

        <GlassCard variant="strong" sheen className="p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="relative block h-10 w-10">
              <BrandMark className="h-10 w-10 rounded-xl" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/40" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink-900">
              Share<span className="text-brand-600">.</span>
            </span>
          </div>

          {needsSetup && (
            <Badge tone="accent" className="mb-4">
              First-time setup
            </Badge>
          )}

          <h1 className="font-display text-2xl font-bold text-ink-900">
            {mode === 'signup' ? 'Create the owner account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {mode === 'signup'
              ? "This runs once, for a brand-new Share Cafe deployment — it creates the Admin account. Every other login afterward is provisioned by an admin."
              : "Sign in with the account your admin set up for you."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {mode === 'signup' && (
              <Field
                label="Email (optional)"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <GlassButton type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'signup' ? (
                'Create admin account'
              ) : (
                'Sign in'
              )}
            </GlassButton>
          </form>

          {needsSetup === false && mode === 'login' && (
            <p className="mt-5 text-center text-xs text-ink-500">
              Don't have an account? Ask your cafe's admin to create one for you.
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
