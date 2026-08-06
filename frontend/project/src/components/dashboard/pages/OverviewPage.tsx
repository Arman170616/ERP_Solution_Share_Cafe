import { useEffect, useState } from 'react';
import {
  TrendingDown,
  Receipt,
  Users,
  Boxes,
  Wallet,
  Brain,
  Sparkles,
  AlertTriangle,
  ShoppingCart,
  Package,
  DollarSign,
  Activity,
  Loader2,
  FileBarChart,
  ArrowRight,
  Flame,
  Clock3,
} from 'lucide-react';
import { GlassCard, Badge, GlassButton } from '../../ui';
import { api, ApiError } from '../../../lib/api';

type Overview = {
  date: string;
  revenue_today: string;
  orders_today: number;
  customer_count: number;
  inventory_value: string;
  low_stock_count: number;
  order_type_breakdown: { order_type: string; revenue: string; order_count: number }[];
};

type SalesBucket = { period: string; revenue: string; order_count: number; tax_collected: string };
type Ingredient = { id: number; name: string; unit: string; quantity_on_hand: string; reorder_threshold: string };
type Order = { id: number; order_type: string; table_number: string; status: string; total: string; created_at: string };
type BestSeller = { product__id: number; product__name: string; quantity_sold: number; revenue: number };
type PeakHour = { hour: number; order_count: number; revenue: string };

const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in: 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  talabat: 'Talabat',
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function OverviewPage({ onViewReports }: { onViewReports: () => void }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [weeklySales, setWeeklySales] = useState<SalesBucket[]>([]);
  const [lowStock, setLowStock] = useState<Ingredient[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [monthSales, setMonthSales] = useState<SalesBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);

    Promise.all([
      api.get<Overview>('/analytics/overview/'),
      api.get<{ results: SalesBucket[] }>('/analytics/sales/', {
        period: 'weekly',
        start: eightWeeksAgo.toISOString().slice(0, 10),
      }),
      api.get<Ingredient[]>('/inventory/ingredients/low_stock/'),
      api.get<{ results?: Order[] } | Order[]>('/pos/orders/'),
      api.get<BestSeller[]>('/analytics/best-sellers/', { limit: 3, start: monthStartStr }),
      api.get<PeakHour[]>('/analytics/peak-hours/', { start: monthStartStr }),
      api.get<{ results: SalesBucket[] }>('/analytics/sales/', { period: 'monthly', start: monthStartStr }),
    ])
      .then(([ov, sales, low, orders, best, peak, month]) => {
        setOverview(ov);
        setWeeklySales(sales.results);
        setLowStock(low.slice(0, 4));
        const list = Array.isArray(orders) ? orders : orders.results ?? [];
        setRecentOrders(list.slice(0, 5));
        setBestSellers(best);
        setPeakHours(peak);
        setMonthSales(month.results);
      })
      .finally(() => setLoading(false));
  }, []);

  async function restock(ingredient: Ingredient) {
    const qty = window.prompt(`Purchase quantity for ${ingredient.name} (${ingredient.unit}):`, '10');
    if (!qty || Number(qty) <= 0) return;
    try {
      await api.post('/inventory/stock-movements/', { ingredient: ingredient.id, movement_type: 'purchase', quantity: qty });
      setLowStock((prev) => prev.filter((i) => i.id !== ingredient.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to record stock movement.');
    }
  }

  if (loading || !overview) {
    return (
      <div className="grid h-96 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const kpis = [
    { label: 'Revenue Today', value: `OMR ${Number(overview.revenue_today).toFixed(2)}`, icon: DollarSign },
    { label: 'Orders Today', value: String(overview.orders_today), icon: Receipt },
    { label: 'Customers', value: String(overview.customer_count), icon: Users },
    { label: 'Inventory Value', value: `OMR ${Number(overview.inventory_value).toFixed(0)}`, icon: Boxes },
  ];

  const totalTypeRevenue = overview.order_type_breakdown.reduce((s, b) => s + Number(b.revenue), 0) || 1;
  const topPeakHour = [...peakHours].sort((a, b) => b.order_count - a.order_count)[0] ?? null;
  const vatThisMonth = monthSales.reduce((s, b) => s + Number(b.tax_collected), 0);

  return (
    <div className="space-y-5">
      {/* KPI row */}
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

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Revenue & Profit</h3>
              <p className="text-xs text-ink-500">Last 8 weeks</p>
            </div>
            <div className="flex items-center gap-2">
              <Legend color="bg-brand-500" label="Revenue" />
              <Legend color="bg-accent-500" label="Profit (est.)" />
            </div>
          </div>
          <RevenueChart data={weeklySales} />
        </GlassCard>

        {/* AI Consultant — illustrative copy, no model call or data source behind it */}
        <GlassCard variant="dark" sheen className="p-5">
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-600 text-white shadow-glow">
              <Brain className="h-5 w-5" />
              <span className="absolute inset-0 rounded-xl ring-2 ring-brand-400/40 animate-pulse-ring" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-white">AI Consultant</h3>
              <p className="text-xs text-white/50">Today's briefing</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              { icon: TrendingDown, tone: 'rose', text: `${overview.orders_today} orders so far today.` },
              { icon: AlertTriangle, tone: 'amber', text: `${overview.low_stock_count} ingredients near stockout.` },
              { icon: Wallet, tone: 'amber', text: `OMR ${Number(overview.revenue_today).toFixed(2)} collected today.` },
            ].map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Icon className={['mt-0.5 h-4 w-4 shrink-0', row.tone === 'rose' ? 'text-rose-400' : 'text-amber-400'].join(' ')} />
                  <p className="text-xs leading-relaxed text-white/80">{row.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-brand-400/30 bg-brand-400/10 p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
              <Sparkles className="h-3 w-3" /> Recommended
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-white/90">
              Restock the {overview.low_stock_count} low ingredients before they run out.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Second row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Order type breakdown (single-location system — no multi-branch data) */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">Revenue by order type — today</h3>
            <Badge tone="brand"><Activity className="h-3 w-3" /> Live</Badge>
          </div>
          <div className="mt-4 space-y-4">
            {overview.order_type_breakdown.length === 0 && <p className="text-sm text-ink-400">No orders yet today.</p>}
            {overview.order_type_breakdown.map((b) => {
              const share = (Number(b.revenue) / totalTypeRevenue) * 100;
              return (
                <div key={b.order_type}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-800">{ORDER_TYPE_LABEL[b.order_type] ?? b.order_type}</span>
                    <span className="font-semibold text-ink-900">OMR {Number(b.revenue).toFixed(2)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${share}%` }} />
                    </div>
                    <span className="w-16 text-right text-xs font-semibold text-ink-500">{b.order_count} orders</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Low stock */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">Low stock alerts</h3>
            <Badge tone="warning"><AlertTriangle className="h-3 w-3" /> {overview.low_stock_count} items</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {lowStock.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/40 bg-white/30 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100/70 text-amber-600">
                    <Package className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-ink-800">{s.name}</div>
                    <div className="text-[11px] text-ink-500">
                      {Number(s.quantity_on_hand).toFixed(1)} left · reorder at {Number(s.reorder_threshold).toFixed(1)}
                    </div>
                  </div>
                </div>
                <button onClick={() => restock(s)} className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                  Reorder
                </button>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-ink-400">All stocked up.</p>}
          </div>
        </GlassCard>
      </div>

      {/* Reports summary */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">Reports summary</h3>
            <p className="text-xs text-ink-500">This month, at a glance</p>
          </div>
          <GlassButton variant="glass" size="sm" onClick={onViewReports}>
            <FileBarChart className="h-3.5 w-3.5" /> View full Reports <ArrowRight className="h-3.5 w-3.5" />
          </GlassButton>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/40 bg-white/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-500"><Flame className="h-3.5 w-3.5 text-amber-500" /> Best seller</div>
            {bestSellers.length > 0 ? (
              <>
                <div className="mt-2 font-display text-base font-bold text-ink-900">{bestSellers[0].product__name}</div>
                <div className="text-xs text-ink-500">{bestSellers[0].quantity_sold} sold</div>
              </>
            ) : (
              <div className="mt-2 text-sm text-ink-400">No sales yet</div>
            )}
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-500"><Clock3 className="h-3.5 w-3.5 text-brand-600" /> Peak hour</div>
            {topPeakHour ? (
              <>
                <div className="mt-2 font-display text-base font-bold text-ink-900">{String(topPeakHour.hour).padStart(2, '0')}:00</div>
                <div className="text-xs text-ink-500">{topPeakHour.order_count} orders</div>
              </>
            ) : (
              <div className="mt-2 text-sm text-ink-400">No sales yet</div>
            )}
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-500"><Receipt className="h-3.5 w-3.5 text-accent-600" /> VAT collected</div>
            <div className="mt-2 font-display text-base font-bold text-ink-900">OMR {vatThisMonth.toFixed(2)}</div>
            <div className="text-xs text-ink-500">month to date</div>
          </div>
        </div>
      </GlassCard>

      {/* Recent orders */}
      <GlassCard className="p-5">
        <div>
          <h3 className="font-display text-base font-bold text-ink-900">Recent orders</h3>
          <p className="text-xs text-ink-500">Latest transactions</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-ink-400">
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {recentOrders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-white/30">
                  <td className="py-3 font-semibold text-ink-900">#{o.id}{o.table_number ? ` · ${o.table_number}` : ''}</td>
                  <td className="py-3 text-ink-700">{ORDER_TYPE_LABEL[o.order_type] ?? o.order_type}</td>
                  <td className="py-3 font-medium text-ink-900">OMR {Number(o.total).toFixed(2)}</td>
                  <td className="py-3"><StatusPill status={o.status} /></td>
                  <td className="py-3 text-right text-ink-500">{relativeTime(o.created_at)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-ink-400">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------- helpers ---------- */
function formatPeriodLabel(period: string) {
  // TruncWeek/TruncMonth return full ISO datetimes (e.g. "2026-08-03T00:00:00+04:00"),
  // not plain dates, so this always goes through Date parsing rather than string-slicing.
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return period;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function RevenueChart({ data }: { data: SalesBucket[] }) {
  const revenue = data.map((d) => Number(d.revenue));
  // No bespoke weekly-COGS endpoint exists — profit is a flat 35% margin estimate, not a real figure.
  const profit = revenue.map((r) => r * 0.35);
  const max = Math.max(...revenue, ...profit, 1);
  return (
    <div className="mt-5">
      <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">
        {data.map((d, i) => (
          <div key={d.period} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-48 w-full items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[14px] rounded-t-md bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-700"
                style={{ height: `${(revenue[i] / max) * 100}%` }}
                title={`Revenue: OMR ${revenue[i].toFixed(2)}`}
              />
              <div
                className="w-1/2 max-w-[14px] rounded-t-md bg-gradient-to-t from-accent-600 to-accent-300 transition-all duration-700"
                style={{ height: `${(profit[i] / max) * 100}%` }}
                title={`Est. profit: OMR ${profit[i].toFixed(2)}`}
              />
            </div>
            <span className="text-[10px] text-ink-400">{formatPeriodLabel(d.period)}</span>
          </div>
        ))}
        {data.length === 0 && <p className="w-full text-center text-sm text-ink-400">No sales data yet.</p>}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    ready: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    preparing: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
    pending: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
    cancelled: 'bg-rose-100/70 text-rose-600 border-rose-200/60',
  };
  return (
    <span className={['inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', map[status] ?? map.pending].join(' ')}>
      <ShoppingCart className="h-3 w-3" /> {status}
    </span>
  );
}
