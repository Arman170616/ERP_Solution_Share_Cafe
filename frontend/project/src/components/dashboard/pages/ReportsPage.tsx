import { useEffect, useMemo, useState } from 'react';
import {
  TrendingDown,
  DollarSign,
  Receipt,
  Boxes,
  Wallet,
  Calendar,
  Star,
  Sparkles,
  PieChart,
  Activity,
  Loader2,
} from 'lucide-react';
import { GlassCard, Badge } from '../../ui';
import { api } from '../../../lib/api';

type RangeKey = 'daily' | 'monthly' | 'yearly';
type CatKey = 'sales' | 'expenses' | 'profit' | 'inventory' | 'vat' | 'cashflow';

type SalesBucket = { period: string; revenue: string; order_count: number; tax_collected: string };
type RevenueProfit = { gross_revenue: string; cost_of_goods_sold: string; expenses: string; net_profit: string };
type Expense = { id: number; category: string; amount: string; date: string };
type CashflowRow = { method: string; total: string; count: number };
type BestSeller = { product__id: number; product__name: string; quantity_sold: number; revenue: number };
type LowStockItem = { id: number; name: string; unit: string; quantity_on_hand: string; reorder_threshold: string };
type Overview = { inventory_value: string; low_stock_count: number };

const RANGE_DAYS_BACK: Record<RangeKey, number> = { daily: 13, monthly: 365, yearly: 365 * 6 };

function rangeStart(range: RangeKey) {
  const d = new Date();
  if (range === 'daily') d.setDate(d.getDate() - RANGE_DAYS_BACK.daily);
  else if (range === 'monthly') d.setMonth(d.getMonth() - 12);
  else d.setFullYear(d.getFullYear() - 6);
  return d.toISOString().slice(0, 10);
}

function formatPeriodLabel(period: string, range: RangeKey) {
  // TruncWeek/TruncMonth/TruncYear all return full ISO datetimes, not plain date/year
  // strings, so labels are always derived via Date parsing rather than string-slicing.
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return period;
  if (range === 'yearly') return String(d.getFullYear());
  if (range === 'daily') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

function kpiRangeStart(range: RangeKey) {
  const d = new Date();
  if (range === 'daily') return d.toISOString().slice(0, 10);
  if (range === 'monthly') return new Date(d.setDate(1)).toISOString().slice(0, 10);
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

const categories: { key: CatKey; label: string; icon: typeof DollarSign; desc: string }[] = [
  { key: 'sales', label: 'Sales', icon: DollarSign, desc: 'Revenue trend & best sellers' },
  { key: 'expenses', label: 'Expenses', icon: TrendingDown, desc: 'Cost breakdown by category' },
  { key: 'profit', label: 'Profit', icon: Wallet, desc: 'Revenue, COGS & margins' },
  { key: 'inventory', label: 'Inventory', icon: Boxes, desc: 'Stock value & low-stock items' },
  { key: 'vat', label: 'VAT', icon: Receipt, desc: '5% VAT collected by period' },
  { key: 'cashflow', label: 'Cash Flow', icon: Activity, desc: 'Payments received by method' },
];

export function ReportsPage() {
  const [range, setRange] = useState<RangeKey>('monthly');
  const [cat, setCat] = useState<CatKey>('sales');
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState<SalesBucket[]>([]);
  const [rp, setRp] = useState<RevenueProfit | null>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashflow, setCashflow] = useState<CashflowRow[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    setLoading(true);
    const kpiStart = kpiRangeStart(range);
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      api.get<{ results: SalesBucket[] }>('/analytics/sales/', { period: range, start: rangeStart(range) }),
      api.get<RevenueProfit>('/analytics/revenue-profit/', { start: kpiStart, end: today }),
      api.get<{ results: CashflowRow[] }>('/analytics/cashflow/', { start: kpiStart, end: today }),
      api.get<{ results?: Expense[] } | Expense[]>('/analytics/expenses/'),
      api.get<BestSeller[]>('/analytics/best-sellers/', { limit: 5, start: kpiStart, end: today }),
      api.get<LowStockItem[]>('/inventory/ingredients/low_stock/'),
      api.get<Overview>('/analytics/overview/'),
    ]).then(([s, r, c, e, b, l, ov]) => {
      setSales(s.results);
      setRp(r);
      setCashflow(c.results);
      setExpenses(Array.isArray(e) ? e : e.results ?? []);
      setBestSellers(b);
      setLowStock(l);
      setOverview(ov);
      setOrdersCount(s.results.reduce((sum, bucket) => sum + bucket.order_count, 0));
    }).finally(() => setLoading(false));
  }, [range]);

  const kpiTax = sales.reduce((s, b) => s + Number(b.tax_collected), 0);
  const kpis = useMemo(() => {
    if (!rp) return [];
    if (range === 'daily') {
      return [
        { label: 'Sales Today', value: `OMR ${Number(rp.gross_revenue).toFixed(2)}`, icon: DollarSign },
        { label: 'Expenses Today', value: `OMR ${Number(rp.expenses).toFixed(2)}`, icon: TrendingDown },
        { label: 'Profit Today', value: `OMR ${Number(rp.net_profit).toFixed(2)}`, icon: Wallet },
        { label: 'Transactions', value: String(ordersCount), icon: Activity },
      ];
    }
    if (range === 'monthly') {
      return [
        { label: 'Sales (MTD)', value: `OMR ${Number(rp.gross_revenue).toFixed(2)}`, icon: DollarSign },
        { label: 'Expenses (MTD)', value: `OMR ${Number(rp.expenses).toFixed(2)}`, icon: TrendingDown },
        { label: 'Net Profit', value: `OMR ${Number(rp.net_profit).toFixed(2)}`, icon: Wallet },
        { label: 'VAT Collected', value: `OMR ${kpiTax.toFixed(2)}`, icon: Receipt },
      ];
    }
    return [
      { label: 'Sales (YTD)', value: `OMR ${Number(rp.gross_revenue).toFixed(2)}`, icon: DollarSign },
      { label: 'Expenses (YTD)', value: `OMR ${Number(rp.expenses).toFixed(2)}`, icon: TrendingDown },
      { label: 'Net Profit (YTD)', value: `OMR ${Number(rp.net_profit).toFixed(2)}`, icon: Wallet },
      { label: 'Inventory Value', value: `OMR ${Number(overview?.inventory_value ?? 0).toFixed(0)}`, icon: Boxes },
    ];
  }, [rp, range, ordersCount, kpiTax, overview]);

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount));
    const total = [...map.values()].reduce((s, v) => s + v, 0) || 1;
    const colors = ['from-brand-400 to-brand-600', 'from-accent-400 to-accent-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600', 'from-ink-400 to-ink-600'];
    return [...map.entries()].map(([label, value], i) => ({ label, value, pct: (value / total) * 100, color: colors[i % colors.length] }));
  }, [expenses]);

  if (loading) {
    return <div className="grid h-96 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-600" />
          <span className="font-display text-base font-bold text-ink-900">Reporting Period</span>
        </div>
        <div className="flex gap-1 rounded-2xl bg-white/40 p-1">
          {(['daily', 'monthly', 'yearly'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={['rounded-xl px-4 py-1.5 text-sm font-semibold capitalize transition-all', range === r ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow' : 'text-ink-600 hover:bg-white/60'].join(' ')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <GlassCard key={k.label} sheen hover className="p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow"><Icon className="h-5 w-5" /></span>
              <div className="mt-4 font-display text-2xl font-bold text-ink-900">{k.value}</div>
              <div className="text-xs text-ink-500">{k.label}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">Sales Trend</h3>
            <p className="text-xs text-ink-500 capitalize">{range} revenue</p>
          </div>
          <MiniBarChart data={sales.map((b) => Number(b.revenue))} labels={sales.map((b) => formatPeriodLabel(b.period, range))} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-display text-base font-bold text-ink-900">Report Category</h3>
          <p className="text-xs text-ink-500">Pick a domain</p>
          <div className="mt-4 space-y-2">
            {categories.map((c) => {
              const Icon = c.icon;
              const isActive = cat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={['group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all', isActive ? 'border-brand-300 bg-brand-50/60' : 'border-white/40 bg-white/30 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white/50'].join(' ')}
                >
                  <span className={['grid h-10 w-10 place-items-center rounded-xl text-white shadow-glow transition-all', isActive ? 'bg-gradient-to-br from-brand-400 to-brand-700' : 'bg-gradient-to-br from-ink-400 to-ink-600'].join(' ')}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">{c.label}</div>
                    <div className="text-xs text-ink-500">{c.desc}</div>
                  </div>
                  {isActive && <Sparkles className="h-4 w-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-ink-900">{categories.find((c) => c.key === cat)?.label} detail</h3>
          <div className="mt-4">
            <CategoryDetail cat={cat} rp={rp} expenseByCategory={expenseByCategory} cashflow={cashflow} lowStock={lowStock} bestSellers={bestSellers} sales={sales} />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">Top Selling Products</h3>
            <Badge tone="brand"><PieChart className="h-3 w-3" /> Top 5</Badge>
          </div>
          <p className="mt-0.5 text-xs text-ink-500">By quantity · this period</p>
          <div className="mt-4 space-y-3">
            {bestSellers.map((b) => {
              const max = bestSellers[0]?.quantity_sold || 1;
              return (
                <div key={b.product__id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-700">{b.product__name}</span>
                    <span className="font-semibold text-ink-900">{b.quantity_sold} sold</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700" style={{ width: `${(b.quantity_sold / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {bestSellers.length === 0 && <p className="text-sm text-ink-400">No sales in this period yet.</p>}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">Expense Breakdown</h3>
            <p className="text-xs text-ink-500">Where money went · all recorded expenses</p>
          </div>
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-white/50">
            {expenseByCategory.map((e) => <div key={e.label} className={`h-full bg-gradient-to-r ${e.color}`} style={{ width: `${e.pct}%` }} title={`${e.label} · ${e.pct.toFixed(1)}%`} />)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {expenseByCategory.map((e) => (
              <div key={e.label} className="rounded-xl border border-white/40 bg-white/30 p-3">
                <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${e.color}`} /><span className="text-xs font-semibold text-ink-700">{e.label}</span></div>
                <div className="mt-1.5 font-display text-base font-bold text-ink-900">OMR {e.value.toLocaleString()}</div>
                <div className="text-[10px] text-ink-400">{e.pct.toFixed(1)}% of total</div>
              </div>
            ))}
            {expenseByCategory.length === 0 && <p className="col-span-full text-sm text-ink-400">No expenses recorded yet.</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Named report exports</h3>
              <p className="text-xs text-ink-500">Not available in this build</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-200/50 bg-brand-50/50 p-4">
            <div className="flex items-center gap-2"><Badge tone="neutral"><Star className="h-3 w-3" /> Not built</Badge></div>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Named PDF/XLSX exports (P&L statement, VAT return filing, etc.) aren't generated by this system yet.
              Every number on this page is live from the backend — use it directly instead of a downloaded file.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function CategoryDetail({ cat, rp, expenseByCategory, cashflow, lowStock, bestSellers, sales }: {
  cat: CatKey;
  rp: RevenueProfit | null;
  expenseByCategory: { label: string; value: number; pct: number }[];
  cashflow: CashflowRow[];
  lowStock: LowStockItem[];
  bestSellers: BestSeller[];
  sales: SalesBucket[];
}) {
  if (cat === 'sales') {
    return (
      <div className="space-y-2">
        {bestSellers.map((b) => (
          <Row key={b.product__id} label={b.product__name} value={`${b.quantity_sold} sold · OMR ${Number(b.revenue).toFixed(2)}`} />
        ))}
        {bestSellers.length === 0 && <p className="text-sm text-ink-400">No sales yet.</p>}
      </div>
    );
  }
  if (cat === 'expenses') {
    return (
      <div className="space-y-2">
        {expenseByCategory.map((e) => <Row key={e.label} label={e.label} value={`OMR ${e.value.toFixed(2)} (${e.pct.toFixed(1)}%)`} />)}
        {expenseByCategory.length === 0 && <p className="text-sm text-ink-400">No expenses recorded yet.</p>}
      </div>
    );
  }
  if (cat === 'profit' && rp) {
    return (
      <div className="space-y-2">
        <Row label="Gross revenue" value={`OMR ${Number(rp.gross_revenue).toFixed(2)}`} />
        <Row label="Cost of goods sold" value={`OMR ${Number(rp.cost_of_goods_sold).toFixed(2)}`} />
        <Row label="Expenses" value={`OMR ${Number(rp.expenses).toFixed(2)}`} />
        <Row label="Net profit" value={`OMR ${Number(rp.net_profit).toFixed(2)}`} bold />
      </div>
    );
  }
  if (cat === 'inventory') {
    return (
      <div className="space-y-2">
        {lowStock.map((i) => <Row key={i.id} label={i.name} value={`${Number(i.quantity_on_hand).toFixed(1)} / reorder ${Number(i.reorder_threshold).toFixed(1)} ${i.unit}`} />)}
        {lowStock.length === 0 && <p className="text-sm text-ink-400">Nothing low on stock right now.</p>}
      </div>
    );
  }
  if (cat === 'vat') {
    return (
      <div className="space-y-2">
        {sales.map((b) => <Row key={b.period} label={formatPeriodLabel(b.period, 'monthly')} value={`OMR ${Number(b.tax_collected).toFixed(3)} VAT`} />)}
        {sales.length === 0 && <p className="text-sm text-ink-400">No sales yet.</p>}
      </div>
    );
  }
  if (cat === 'cashflow') {
    return (
      <div className="space-y-2">
        {cashflow.map((c) => <Row key={c.method} label={c.method} value={`OMR ${Number(c.total).toFixed(2)} (${c.count} payments)`} />)}
        {cashflow.length === 0 && <p className="text-sm text-ink-400">No payments in this period.</p>}
      </div>
    );
  }
  return null;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/40 bg-white/30 px-3 py-2 text-sm capitalize">
      <span className="text-ink-600">{label}</span>
      <span className={bold ? 'font-bold text-brand-700' : 'font-semibold text-ink-900'}>{value}</span>
    </div>
  );
}

function MiniBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="mt-6">
      <div className="flex h-44 items-end gap-2">
        {data.map((v, i) => {
          const h = Math.round((v / max) * 100);
          const isHover = hover === i;
          return (
            <div key={i} className="group relative flex h-44 flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {isHover && (
                <div className="absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
                  OMR {v.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              )}
              <div className={['w-full max-w-[28px] rounded-t-lg transition-all duration-500', isHover ? 'bg-gradient-to-t from-brand-500 to-brand-300' : 'bg-gradient-to-t from-brand-600 to-brand-400 opacity-80 group-hover:opacity-100'].join(' ')} style={{ height: `${h}%` }} />
            </div>
          );
        })}
        {data.length === 0 && <p className="w-full text-center text-sm text-ink-400">No data in this period.</p>}
      </div>
      <div className="mt-2 flex gap-2">
        {labels.map((l, i) => <div key={i} className="flex-1 text-center text-[10px] font-medium text-ink-400">{l}</div>)}
      </div>
    </div>
  );
}
