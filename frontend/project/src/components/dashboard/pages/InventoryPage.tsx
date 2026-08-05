import { useEffect, useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  TrendingDown,
  Boxes,
  ArrowUpDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { GlassCard, GlassButton } from '../../ui';
import { api, ApiError } from '../../../lib/api';

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  quantity_on_hand: string;
  reorder_threshold: string;
  cost_per_unit: string;
  expiry_date: string | null;
  is_low_stock: boolean;
};

function statusOf(i: Ingredient): 'in' | 'low' | 'out' {
  if (Number(i.quantity_on_hand) <= 0) return 'out';
  if (i.is_low_stock) return 'low';
  return 'in';
}

export function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<{ results?: Ingredient[] } | Ingredient[]>('/inventory/ingredients/')
      .then((res) => setIngredients(Array.isArray(res) ? res : res.results ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load inventory.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const shown = ingredients.filter((i) => {
    const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase());
    const status = statusOf(i);
    const matchesFilter = filter === 'all' || status === filter;
    return matchesQuery && matchesFilter;
  });

  const stockValue = ingredients.reduce((s, i) => s + Number(i.quantity_on_hand) * Number(i.cost_per_unit), 0);
  const lowCount = ingredients.filter((i) => statusOf(i) === 'low').length;
  const outCount = ingredients.filter((i) => statusOf(i) === 'out').length;

  const stats = [
    { label: 'Total ingredients', value: String(ingredients.length), icon: Package, tone: 'brand' },
    { label: 'Stock value', value: `OMR ${stockValue.toFixed(2)}`, icon: Boxes, tone: 'accent' },
    { label: 'Low stock', value: String(lowCount), icon: AlertTriangle, tone: 'amber' },
    { label: 'Out of stock', value: String(outCount), icon: TrendingDown, tone: 'rose' },
  ];

  async function restock(ingredient: Ingredient) {
    const qty = window.prompt(`Purchase quantity for ${ingredient.name} (${ingredient.unit}):`, '10');
    if (!qty || Number(qty) <= 0) return;
    try {
      await api.post('/inventory/stock-movements/', {
        ingredient: ingredient.id,
        movement_type: 'purchase',
        quantity: qty,
      });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to record stock movement.');
    }
  }

  async function deleteIngredient(ingredient: Ingredient) {
    if (!window.confirm(`Delete "${ingredient.name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/inventory/ingredients/${ingredient.id}/`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete ingredient.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const tone =
            s.tone === 'brand'
              ? 'from-brand-400 to-brand-700'
              : s.tone === 'accent'
              ? 'from-accent-400 to-accent-700'
              : s.tone === 'amber'
              ? 'from-amber-400 to-amber-600'
              : 'from-rose-400 to-rose-600';
          return (
            <GlassCard key={s.label} sheen hover className="p-5">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 font-display text-2xl font-bold text-ink-900">{s.value}</div>
              <div className="text-xs text-ink-500">{s.label}</div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">Ingredients</h3>
            <p className="text-xs text-ink-500">{ingredients.length} tracked · {shown.length} shown</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="w-44 bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-1 rounded-full bg-white/40 p-0.5">
              {(['all', 'low', 'out'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                    filter === f ? 'bg-brand-500 text-white' : 'text-ink-500 hover:text-ink-800',
                  ].join(' ')}
                >
                  {f === 'all' ? 'All' : f === 'low' ? 'Low' : 'Out'}
                </button>
              ))}
            </div>
            <GlassButton variant="glass" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={() => setShowAdd((v) => !v)}>
              <Plus className="h-3.5 w-3.5" /> Add ingredient
            </GlassButton>
          </div>
        </div>

        {showAdd && <IngredientForm onSaved={() => { setShowAdd(false); load(); }} onCancel={() => setShowAdd(false)} />}
        {editingIngredient && (
          <IngredientForm
            ingredient={editingIngredient}
            onSaved={() => { setEditingIngredient(null); load(); }}
            onCancel={() => setEditingIngredient(null)}
          />
        )}

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <div className="mt-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-3 font-semibold"><span className="inline-flex items-center gap-1">SKU <ArrowUpDown className="h-3 w-3" /></span></th>
                  <th className="pb-3 font-semibold">Ingredient</th>
                  <th className="pb-3 font-semibold">Unit</th>
                  <th className="pb-3 text-right font-semibold">Stock</th>
                  <th className="pb-3 text-right font-semibold">Cost/unit</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {shown.map((i) => {
                  const status = statusOf(i);
                  return (
                    <tr key={i.id} className="transition-colors hover:bg-white/30">
                      <td className="py-3 font-mono text-xs text-ink-500">#{i.id}</td>
                      <td className="py-3 font-semibold text-ink-900">{i.name}</td>
                      <td className="py-3 text-ink-600">{i.unit}</td>
                      <td className="py-3 text-right">
                        <span className={['font-semibold', status === 'out' ? 'text-rose-500' : status === 'low' ? 'text-amber-600' : 'text-ink-900'].join(' ')}>
                          {Number(i.quantity_on_hand).toFixed(2)}
                        </span>
                        <span className="text-xs text-ink-400"> / {Number(i.reorder_threshold).toFixed(2)}</span>
                      </td>
                      <td className="py-3 text-right font-medium text-ink-900">OMR {Number(i.cost_per_unit).toFixed(3)}</td>
                      <td className="py-3"><StockStatus status={status} /></td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <GlassButton variant="glass" size="sm" onClick={() => restock(i)}>Restock</GlassButton>
                          <button
                            onClick={() => setEditingIngredient(i)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/60 hover:text-ink-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteIngredient(i)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-sm text-ink-400">No ingredients match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function IngredientForm({
  ingredient,
  onSaved,
  onCancel,
}: {
  ingredient?: Ingredient;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(ingredient?.name ?? '');
  const [unit, setUnit] = useState(ingredient?.unit ?? 'kg');
  const [reorder, setReorder] = useState(ingredient?.reorder_threshold ?? '0');
  const [cost, setCost] = useState(ingredient?.cost_per_unit ?? '0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { name, unit, reorder_threshold: reorder, cost_per_unit: cost };
    try {
      if (ingredient) await api.patch(`/inventory/ingredients/${ingredient.id}/`, body);
      else await api.post('/inventory/ingredients/', body);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ingredient.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-5">
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required placeholder="Unit (kg, l, pcs)" value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      <input required type="number" step="0.001" placeholder="Reorder threshold" value={reorder} onChange={(e) => setReorder(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      <input required type="number" step="0.001" placeholder="Cost per unit" value={cost} onChange={(e) => setCost(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      {error && <p className="sm:col-span-5 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-5">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving…' : ingredient ? 'Save changes' : 'Save'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function StockStatus({ status }: { status: 'in' | 'low' | 'out' }) {
  const map = {
    in: { label: 'In stock', cls: 'bg-brand-100/70 text-brand-700 border-brand-200/60' },
    low: { label: 'Low', cls: 'bg-amber-100/70 text-amber-700 border-amber-200/60' },
    out: { label: 'Out', cls: 'bg-rose-100/70 text-rose-600 border-rose-200/60' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}
