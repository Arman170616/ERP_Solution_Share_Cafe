import { useEffect, useState, type FormEvent } from 'react';
import { Wallet, TrendingUp, TrendingDown, Landmark, Scale, FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { GlassCard, Badge, GlassButton } from '../../ui';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

type RevenueProfit = { gross_revenue: string; expenses: string; net_profit: string };
type CashflowRow = { method: string; total: string; count: number };
type Expense = { id: number; category: string; amount: string; date: string; note: string };
type Payment = { id: number; order: number; method: string; amount: string; paid_at: string };

function unwrap<T>(res: { results?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : res.results ?? [];
}

export function AccountingPage() {
  const { user } = useAuth();
  // Manager gets read-only visibility into Accounting for oversight; only Admin can
  // add/delete expenses, matching the backend's ReadWriteRolePermission on ExpenseViewSet.
  const canEdit = user?.role === 'admin';
  const [rp, setRp] = useState<RevenueProfit | null>(null);
  const [cashflow, setCashflow] = useState<CashflowRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const monthStart = new Date(new Date().setDate(1)).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<RevenueProfit>('/analytics/revenue-profit/', { start: monthStart, end: today }),
      api.get<{ results: CashflowRow[] }>('/analytics/cashflow/', { start: monthStart, end: today }),
      api.get<{ results?: Expense[] } | Expense[]>('/analytics/expenses/'),
      api.get<{ results?: Payment[] } | Payment[]>('/pos/payments/'),
    ]).then(([r, c, e, p]) => {
      setRp(r);
      setCashflow(c.results);
      setExpenses(unwrap(e));
      setPayments(unwrap(p).sort((a, b) => b.id - a.id).slice(0, 8));
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function deleteExpense(id: number) {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/analytics/expenses/${id}/`);
    load();
  }

  const cashCollected = cashflow.reduce((s, c) => s + Number(c.total), 0);

  if (loading || !rp) {
    return <div className="grid h-96 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  const kpis = [
    { label: 'Revenue (this month)', value: `OMR ${Number(rp.gross_revenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: TrendingUp },
    { label: 'Expenses (this month)', value: `OMR ${Number(rp.expenses).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: TrendingDown },
    { label: 'Net Profit (this month)', value: `OMR ${Number(rp.net_profit).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Wallet },
    { label: 'Cash collected (this month)', value: `OMR ${cashCollected.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Landmark },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <GlassCard key={k.label} sheen hover className="p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 font-display text-2xl font-bold text-ink-900">{k.value}</div>
              <div className="text-xs text-ink-500">{k.label}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Expenses ledger — a real record, unlike a fabricated chart of accounts */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Expenses</h3>
              <p className="text-xs text-ink-500">Feeds "Net Profit" above · SRS expense analysis</p>
            </div>
            {canEdit && (
              <GlassButton variant="primary" size="sm" onClick={() => setShowAddExpense((v) => !v)}>
                <Plus className="h-3.5 w-3.5" /> Add expense
              </GlassButton>
            )}
          </div>

          {canEdit && showAddExpense && <AddExpenseForm onSaved={() => { setShowAddExpense(false); load(); }} onCancel={() => setShowAddExpense(false)} />}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Note</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                  {canEdit && <th className="pb-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {expenses.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-white/30">
                    <td className="py-3 text-ink-600">{e.date}</td>
                    <td className="py-3"><TypePill category={e.category} /></td>
                    <td className="py-3 text-ink-600">{e.note || '—'}</td>
                    <td className="py-3 text-right font-semibold text-ink-900">OMR {Number(e.amount).toFixed(3)}</td>
                    {canEdit && (
                      <td className="py-3 text-right">
                        <button onClick={() => deleteExpense(e.id)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={canEdit ? 5 : 4} className="py-6 text-center text-sm text-ink-400">No expenses recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Statements — no PDF/statement generator exists, so these are honestly disabled */}
        <GlassCard className="p-5">
          <h3 className="font-display text-base font-bold text-ink-900">Statements</h3>
          <p className="text-xs text-ink-500">Not available in this build</p>
          <div className="mt-4 space-y-2.5">
            {[
              { name: 'Profit & Loss', desc: 'Income vs expenses', icon: TrendingUp },
              { name: 'Balance Sheet', desc: 'Assets, liabilities, equity', icon: Scale },
              { name: 'Cash Flow', desc: 'Operating, investing, financing', icon: Wallet },
              { name: 'Trial Balance', desc: 'All accounts, debits & credits', icon: FileText },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.name}
                  disabled
                  title="Statement generation isn't built yet — use the Reports page for real revenue/expense/VAT numbers."
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-2xl border border-white/40 bg-white/20 p-3 text-left opacity-60"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ink-300 to-ink-400 text-white"><Icon className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-700">{s.name}</div>
                    <div className="text-xs text-ink-500">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-brand-200/50 bg-brand-50/50 p-4">
            <div className="flex items-center gap-2"><Badge tone="brand">Real data</Badge></div>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              The KPIs above and Expenses ledger are live from the backend. Formal financial statements (P&L,
              balance sheet) aren't part of this system's scope yet — see the Reports page for detailed real
              breakdowns instead.
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div>
          <h3 className="font-display text-base font-bold text-ink-900">Recent payments</h3>
          <p className="text-xs text-ink-500">Latest POS payments received</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-ink-400">
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {payments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/30">
                  <td className="py-3 font-mono text-xs text-ink-500">#{p.id}</td>
                  <td className="py-3 text-ink-600">Order #{p.order}</td>
                  <td className="py-3 capitalize text-ink-600">{p.method}</td>
                  <td className="py-3 text-right font-semibold text-ink-900">OMR {Number(p.amount).toFixed(3)}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-sm text-ink-400">No payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function AddExpenseForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/analytics/expenses/', { category, amount, date, note });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <input required placeholder="Category (e.g. Rent, Utilities)" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="number" step="0.001" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function TypePill({ category }: { category: string }) {
  return <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold bg-amber-100/70 text-amber-700 border-amber-200/60">{category}</span>;
}
