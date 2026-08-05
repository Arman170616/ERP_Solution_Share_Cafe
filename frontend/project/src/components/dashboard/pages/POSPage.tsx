import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Wallet,
  Printer,
  ShoppingCart,
  X,
  Check,
  Receipt,
  Clock,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  Coffee,
  Smartphone,
  Store,
  TrendingUp,
  Award,
  Users,
  User,
  Loader2,
  Ban,
  Pencil,
} from 'lucide-react';
import { GlassCard, GlassButton } from '../../ui';
import { printThermalReceipt, type ReceiptData } from '../../../utils/thermalPrint';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

/* ─── API types ──────────────────────────────────────────────────────────── */

type Category = { id: number; name: string };
type Product = { id: number; name: string; price: string; category: number | null; category_name: string | null; is_active: boolean };

const canEditMenu = (role: string | undefined) => role === 'admin';

type OrderItemT = { id: number; product: number; product_name: string; quantity: number; unit_price: string };
type PaymentT = { id: number; method: string; amount: string };
type OrderT = {
  id: number;
  order_type: string;
  status: string;
  table_number: string;
  created_by: number | null;
  created_by_username: string | null;
  served_by: number | null;
  served_by_username: string | null;
  subtotal: string;
  tax_amount: string;
  total: string;
  items: OrderItemT[];
  payments: PaymentT[];
  created_at: string;
};

type StaffMember = { id: number; username: string; role: string };

type EmployeePerf = { user_id: number; username: string; orders_served: number; revenue_generated: string; average_rating: number | null; rank: number };

const ORDER_STATUS: Record<string, { label: string; color: string; icon: typeof Clock; bg: string; next: string | null; nextLabel: string }> = {
  pending: { label: 'New', color: 'text-rose-600', icon: AlertCircle, bg: 'bg-rose-100/70 border-rose-200/60', next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { label: 'Preparing', color: 'text-amber-600', icon: Clock, bg: 'bg-amber-100/70 border-amber-200/60', next: 'ready', nextLabel: 'Mark Ready' },
  ready: { label: 'Ready', color: 'text-brand-700', icon: CheckCircle2, bg: 'bg-brand-100/70 border-brand-200/60', next: 'delivered', nextLabel: 'Mark Served' },
  delivered: { label: 'Served', color: 'text-ink-500', icon: Check, bg: 'bg-ink-100/70 border-ink-200/60', next: null, nextLabel: 'Completed' },
};
const STATUS_LANES = ['pending', 'preparing', 'ready', 'delivered'];

type CartLine = { product: Product; qty: number };
type Tab = 'pos' | 'orders' | 'performance';

/* ─── Component ─────────────────────────────────────────────────────────── */

export function POSPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pos');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cat, setCat] = useState('__all__');
  const [query, setQuery] = useState('');

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [servedBy, setServedBy] = useState<number | null>(null);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Wallet'>('Cash');
  const [tableNote, setTableNote] = useState('');
  const [orderSource, setOrderSource] = useState<'In Person' | 'Talabat'>('In Person');
  const [charging, setCharging] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<ReceiptData | null>(null);

  const [orders, setOrders] = useState<OrderT[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [empStats, setEmpStats] = useState<EmployeePerf[]>([]);
  const [perfLoading, setPerfLoading] = useState(false);

  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Only Admin has Reports/analytics access on the backend — Manager's scope is limited
  // to Sales & POS operations and Inventory, not performance analytics.
  const canSeePerformance = user?.role === 'admin';

  const loadMenu = () => {
    setMenuLoading(true);
    Promise.all([
      api.get<{ results?: Category[] } | Category[]>('/inventory/categories/'),
      api.get<{ results?: Product[] } | Product[]>('/inventory/products/', { is_active: true }),
    ])
      .then(([c, p]) => {
        setCategories(Array.isArray(c) ? c : c.results ?? []);
        setProducts(Array.isArray(p) ? p : p.results ?? []);
      })
      .finally(() => setMenuLoading(false));
  };

  useEffect(loadMenu, []);

  useEffect(() => {
    api.get<StaffMember[]>('/accounts/staff/').then(setStaffList);
  }, []);

  useEffect(() => {
    if (user && servedBy === null) setServedBy(user.id);
  }, [user, servedBy]);

  // "Taken by" options: whoever is logged in (so a shared terminal can self-attribute),
  // plus every other Manager/Staff account, so a cashier can ring up a colleague's sale.
  const takenByOptions = useMemo(() => {
    if (!user) return staffList;
    const list = staffList.some((s) => s.id === user.id)
      ? staffList
      : [{ id: user.id, username: user.username, role: user.role }, ...staffList];
    return list;
  }, [staffList, user]);

  const loadOrders = () => {
    api
      .get<{ results?: OrderT[] } | OrderT[]>('/pos/orders/')
      .then((res) => setOrders((Array.isArray(res) ? res : res.results ?? []).filter((o) => o.status !== 'cancelled')))
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, 10000); // no websockets in scope — poll instead
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeTab !== 'performance' || !canSeePerformance) return;
    setPerfLoading(true);
    api
      .get<EmployeePerf[]>('/analytics/employee-performance/')
      .then(setEmpStats)
      .finally(() => setPerfLoading(false));
  }, [activeTab, canSeePerformance]);

  const tabCategories = useMemo(
    () => [{ id: '__all__', name: 'All' }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))],
    [categories]
  );

  const displayed = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : cat === '__all__'
    ? products
    : products.filter((p) => String(p.category) === cat);

  const add = (product: Product) => {
    setCart((c) => {
      const found = c.find((l) => l.product.id === product.id);
      if (found) return c.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { product, qty: 1 }];
    });
  };
  const dec = (id: number) => setCart((c) => c.map((l) => (l.product.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0));
  const remove = (id: number) => setCart((c) => c.filter((l) => l.product.id !== id));

  const subtotal = cart.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const takenByName = takenByOptions.find((s) => s.id === servedBy)?.username ?? user?.username ?? '';

  const handlePrintPreview = () => {
    if (cart.length === 0) return;
    printThermalReceipt({
      orderId: 'PREVIEW',
      counter: tableNote || (orderSource === 'Talabat' ? 'Talabat' : 'Counter'),
      cashier: takenByName,
      lines: cart.map((l) => ({ name: l.product.name, qty: l.qty, unitPrice: Number(l.product.price) })),
      subtotal,
      vat,
      total,
      paymentMethod,
    });
  };

  async function handleCharge() {
    if (cart.length === 0 || charging) return;
    setCharging(true);
    try {
      const order = await api.post<OrderT>('/pos/orders/', {
        order_type: orderSource === 'Talabat' ? 'talabat' : 'dine_in',
        table_number: tableNote,
        served_by: servedBy,
        items: cart.map((l) => ({ product: l.product.id, quantity: l.qty })),
      });
      const methodMap = { Cash: 'cash', Card: 'card', Wallet: 'mobile' } as const;
      await api.post(`/pos/orders/${order.id}/add_payment/`, { method: methodMap[paymentMethod], amount: order.total });
      const invoice = await api.post<{ invoice_number: string }>('/invoices/invoices/', { order: order.id });

      setLastOrder({
        orderId: invoice.invoice_number,
        counter: tableNote || (orderSource === 'Talabat' ? 'Talabat' : 'Counter'),
        cashier: takenByName,
        lines: cart.map((l) => ({ name: l.product.name, qty: l.qty, unitPrice: Number(l.product.price) })),
        subtotal: Number(order.subtotal),
        vat: Number(order.tax_amount),
        total: Number(order.total),
        paymentMethod,
      });
      setShowReceipt(true);
      setCart([]);
      setTableNote('');
      loadOrders();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to charge order.');
    } finally {
      setCharging(false);
    }
  }

  async function advanceStatus(order: OrderT) {
    const next = ORDER_STATUS[order.status]?.next;
    if (!next) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    try {
      await api.patch(`/pos/orders/${order.id}/`, { status: next });
    } catch {
      loadOrders();
    }
  }

  async function cancelOrder(order: OrderT) {
    if (!window.confirm(`Cancel order #${order.id}?`)) return;
    try {
      await api.post(`/pos/orders/${order.id}/cancel/`);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to cancel order.');
    }
  }

  const activeOrders = orders.filter((o) => STATUS_LANES.includes(o.status));
  const servedOrders = orders.filter((o) => o.status === 'delivered');
  const talabatTotal = servedOrders.filter((o) => o.order_type === 'talabat').length;
  const inPersonTotal = servedOrders.length - talabatTotal;
  const perfTotals = {
    orders: empStats.reduce((s, e) => s + e.orders_served, 0),
    revenue: empStats.reduce((s, e) => s + Number(e.revenue_generated), 0),
    talabat: orders.filter((o) => o.order_type === 'talabat').length,
  };

  return (
    <div className="space-y-4">
      {/* Top tabs */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-2xl bg-white/40 p-1">
          {(['pos', 'orders', ...(canSeePerformance ? (['performance'] as Tab[]) : [])] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={[
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all',
                activeTab === t ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow' : 'text-ink-600 hover:bg-white/60',
              ].join(' ')}
            >
              {t === 'pos' ? <ShoppingCart className="h-4 w-4" /> : t === 'orders' ? <ChefHat className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              {t === 'pos' ? 'Point of Sale' : t === 'orders' ? 'Order Management' : 'Performance'}
              {t === 'orders' && (
                <span className={['rounded-full px-1.5 py-0.5 text-[9px] font-bold', activeTab === 'orders' ? 'bg-white/25 text-white' : 'bg-brand-100 text-brand-700'].join(' ')}>
                  {activeOrders.filter((o) => o.status !== 'delivered').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-700" />
          <span className="font-display text-base font-bold text-ink-900">Share Cafe</span>
          <span className="text-xs text-ink-500">· Al Saada, Salalah, Oman</span>
        </div>
      </div>

      {/* ── POS Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'pos' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu items…"
                  className="flex-1 bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-ink-400 hover:text-ink-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {tabCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCat(c.id); setQuery(''); }}
                    className={[
                      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap',
                      cat === c.id && !query ? 'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-glow' : 'border border-white/50 bg-white/40 text-ink-600 hover:bg-white/60',
                    ].join(' ')}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-ink-900">
                  {query ? `Search results (${displayed.length})` : tabCategories.find((c) => c.id === cat)?.name}
                </h3>
                <div className="flex items-center gap-2">
                  {canEditMenu(user?.role) && (
                    <GlassButton variant="glass" size="sm" onClick={() => setShowAddMenuItem((v) => !v)}>
                      <Plus className="h-3.5 w-3.5" /> Add menu item
                    </GlassButton>
                  )}
                </div>
              </div>

              {showAddMenuItem && (
                <MenuItemForm
                  categories={categories}
                  onSaved={() => { setShowAddMenuItem(false); loadMenu(); }}
                  onCancel={() => setShowAddMenuItem(false)}
                />
              )}
              {editingProduct && (
                <MenuItemForm
                  categories={categories}
                  product={editingProduct}
                  onSaved={() => { setEditingProduct(null); loadMenu(); }}
                  onCancel={() => setEditingProduct(null)}
                />
              )}

              {menuLoading ? (
                <div className="grid h-32 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
              ) : displayed.length === 0 ? (
                <div className="grid h-32 place-items-center text-sm text-ink-400">No items found.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {displayed.map((product) => (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => add(product)}
                      onKeyDown={(e) => e.key === 'Enter' && add(product)}
                      className="group relative flex flex-col rounded-2xl border border-white/50 bg-white/40 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:bg-white/60 hover:shadow-glass cursor-pointer"
                    >
                      <div className="grid h-16 w-full place-items-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-2xl font-bold text-amber-700">
                        {product.name[0]}
                      </div>
                      <div className="mt-2 text-xs font-semibold leading-tight text-ink-900 line-clamp-2">{product.name}</div>
                      <div className="mt-1 font-display text-sm font-bold text-amber-700">OMR {Number(product.price).toFixed(3)}</div>
                      {canEditMenu(user?.role) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                          className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink-600 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                          title="Edit menu item"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right: cart */}
          <div>
            <GlassCard variant="strong" className="flex max-h-[calc(100vh-12rem)] flex-col p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-glow">
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink-900">Current Order</h3>
                    <p className="text-xs text-ink-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Clear</button>
                )}
              </div>

              <div className="mt-3">
                <input
                  value={tableNote}
                  onChange={(e) => setTableNote(e.target.value)}
                  placeholder="Table no. or name (optional)"
                  className="w-full rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-xs text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {(['In Person', 'Talabat'] as const).map((src) => {
                  const Icon = src === 'Talabat' ? Smartphone : Store;
                  return (
                    <button
                      key={src}
                      onClick={() => setOrderSource(src)}
                      className={[
                        'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-semibold transition-all',
                        orderSource === src
                          ? src === 'Talabat' ? 'border-rose-400 bg-rose-50/60 text-rose-700' : 'border-amber-400 bg-amber-50/60 text-amber-700'
                          : 'border-white/50 bg-white/40 text-ink-600 hover:bg-white/60',
                      ].join(' ')}
                    >
                      <Icon className="h-3.5 w-3.5" /> {src}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">Taken by</label>
                <div className="flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/40 px-2.5 py-2">
                  <User className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <select
                    value={servedBy ?? ''}
                    onChange={(e) => setServedBy(Number(e.target.value))}
                    className="flex-1 bg-transparent text-xs font-medium text-ink-700 focus:outline-none"
                  >
                    {takenByOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.username}
                        {s.id === user?.id ? ' (me)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="no-scrollbar mt-3 flex-1 space-y-2 overflow-y-auto pr-0.5">
                {cart.length === 0 && (
                  <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-white/50 text-xs text-ink-400">Tap an item to add it here</div>
                )}
                {cart.map((l) => (
                  <div key={l.product.id} className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 p-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-sm font-bold text-amber-700">{l.product.name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-ink-900">{l.product.name}</div>
                      <div className="text-[10px] text-ink-500">OMR {Number(l.product.price).toFixed(3)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => dec(l.product.id)} className="grid h-6 w-6 place-items-center rounded-lg bg-white/60 text-ink-600 hover:bg-white"><Minus className="h-3 w-3" /></button>
                      <span className="w-5 text-center text-xs font-bold text-ink-900">{l.qty}</span>
                      <button onClick={() => add(l.product)} className="grid h-6 w-6 place-items-center rounded-lg bg-white/60 text-ink-600 hover:bg-white"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => remove(l.product.id)} className="ml-0.5 grid h-6 w-6 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1.5 border-t border-white/40 pt-3 text-sm">
                <Row label="Subtotal" value={`OMR ${subtotal.toFixed(3)}`} />
                <Row label="VAT (5%)" value={`OMR ${vat.toFixed(3)}`} muted />
                <div className="flex items-center justify-between pt-1">
                  <span className="font-display text-base font-bold text-ink-900">Total</span>
                  <span className="font-display text-xl font-extrabold text-amber-700">OMR {total.toFixed(3)}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {([{ icon: Banknote, label: 'Cash' }, { icon: CreditCard, label: 'Card' }, { icon: Wallet, label: 'Wallet' }] as const).map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setPaymentMethod(m.label)}
                    className={[
                      'flex flex-col items-center gap-1 rounded-xl border py-2 text-[11px] font-semibold transition-all',
                      paymentMethod === m.label ? 'border-amber-400 bg-amber-50/60 text-amber-700' : 'border-white/50 bg-white/40 text-ink-600 hover:bg-white/60',
                    ].join(' ')}
                  >
                    <m.icon className="h-4 w-4" /> {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <GlassButton variant="glass" size="sm" className="w-full" onClick={handlePrintPreview}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </GlassButton>
                <GlassButton variant="primary" size="sm" className="w-full !from-amber-500 !to-orange-600" onClick={handleCharge} disabled={charging || cart.length === 0}>
                  {charging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Charge ${total > 0 ? `OMR ${total.toFixed(3)}` : ''}`}
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── Order Management Tab ──────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="grid h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATUS_LANES.map((status) => {
                  const count = activeOrders.filter((o) => o.status === status).length;
                  const cfg = ORDER_STATUS[status];
                  const Icon = cfg.icon;
                  return (
                    <GlassCard key={status} hover className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="mr-1 h-3.5 w-3.5" /> {cfg.label}
                        </span>
                        <span className={`ml-auto font-display text-2xl font-black ${cfg.color}`}>{count}</span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              <GlassCard className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100/70 text-amber-700"><Store className="h-5 w-5" /></span>
                    <div>
                      <div className="text-xs text-ink-500">In Person Orders</div>
                      <div className="font-display text-xl font-bold text-ink-900">{inPersonTotal}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100/70 text-rose-700"><Smartphone className="h-5 w-5" /></span>
                    <div>
                      <div className="text-xs text-ink-500">Talabat Orders</div>
                      <div className="font-display text-xl font-bold text-ink-900">{talabatTotal}</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeOrders.map((order) => {
                  const s = ORDER_STATUS[order.status];
                  const SourceIcon = order.order_type === 'talabat' ? Smartphone : Store;
                  return (
                    <GlassCard key={order.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-black text-ink-900">#{order.id}</span>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.color}`}>{s.label}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-ink-500">{order.table_number || order.order_type}</div>
                        </div>
                        <span className="font-display text-sm font-bold text-amber-700">OMR {Number(order.total).toFixed(3)}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={['inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', order.order_type === 'talabat' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700'].join(' ')}>
                          <SourceIcon className="h-3 w-3" /> {order.order_type === 'talabat' ? 'Talabat' : 'In Person'}
                        </span>
                        {order.served_by_username && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/40 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                            <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[8px] font-bold text-white">
                              {order.served_by_username[0]?.toUpperCase()}
                            </span>
                            Taken by {order.served_by_username}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs text-ink-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {item.product_name} x{item.quantity}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => advanceStatus(order)}
                          disabled={!s.next}
                          className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${s.next ? 'bg-brand-100 text-brand-700 hover:bg-brand-200' : 'bg-ink-50 text-ink-400 cursor-default'}`}
                        >
                          {s.nextLabel}
                        </button>
                        {user?.role !== 'manager' && (
                          <button onClick={() => cancelOrder(order)} className="rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-rose-500 hover:bg-rose-50" title="Cancel order">
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
                {activeOrders.length === 0 && <p className="text-sm text-ink-400">No active orders.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Performance Tab (Manager/Admin only, matches backend permission) ── */}
      {activeTab === 'performance' && canSeePerformance && (
        <div className="space-y-4">
          {/* These tiles sum the same /analytics/employee-performance/ data as the leaderboard
              below (all non-cancelled orders in the last 30 days) so the two never disagree —
              deliberately not scoped to "delivered" status like the Order Management tab's tiles,
              which answer a different question (orders fully completed right now). */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100/70 text-brand-700"><CheckCircle2 className="h-5 w-5" /></span>
                <div><div className="text-xs text-ink-500">Total Orders Served</div><div className="font-display text-xl font-bold text-ink-900">{perfTotals.orders}</div></div>
              </div>
            </GlassCard>
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100/70 text-amber-700"><TrendingUp className="h-5 w-5" /></span>
                <div><div className="text-xs text-ink-500">Total Revenue</div><div className="font-display text-xl font-bold text-ink-900">OMR {perfTotals.revenue.toFixed(3)}</div></div>
              </div>
            </GlassCard>
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100/70 text-amber-700"><Store className="h-5 w-5" /></span>
                <div><div className="text-xs text-ink-500">In Person</div><div className="font-display text-xl font-bold text-ink-900">{orders.length - perfTotals.talabat}</div></div>
              </div>
            </GlassCard>
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100/70 text-rose-700"><Smartphone className="h-5 w-5" /></span>
                <div><div className="text-xs text-ink-500">Talabat</div><div className="font-display text-xl font-bold text-ink-900">{perfTotals.talabat}</div></div>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              <h3 className="font-display text-base font-bold text-ink-900">Employee Performance</h3>
              <span className="ml-auto text-xs text-ink-500">Last 30 days</span>
            </div>
            {perfLoading ? (
              <div className="grid h-32 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
            ) : (
              <div className="space-y-3">
                {empStats.map((stat, idx) => (
                  <div key={stat.user_id} className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/30 p-3">
                    <span className={['grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black', idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-ink-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-white/60 text-ink-500'].join(' ')}>
                      {idx + 1}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                      {stat.username[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{stat.username}</div>
                      {stat.average_rating != null && <div className="text-xs text-ink-500">★ {stat.average_rating} avg rating</div>}
                    </div>
                    <div className="flex shrink-0 gap-4 text-right">
                      <div><div className="font-display text-sm font-bold text-ink-900">{stat.orders_served}</div><div className="text-[10px] text-ink-400">Orders</div></div>
                      <div><div className="font-display text-sm font-bold text-amber-700">{Number(stat.revenue_generated).toFixed(2)}</div><div className="text-[10px] text-ink-400">OMR</div></div>
                    </div>
                    {idx === 0 && (
                      <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700"><Award className="h-3 w-3" /> Top</span>
                    )}
                  </div>
                ))}
                {empStats.length === 0 && <p className="text-sm text-ink-400">No completed orders in this period yet.</p>}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {showReceipt && lastOrder && (
        <ReceiptModal data={lastOrder} onClose={() => setShowReceipt(false)} onPrint={() => printThermalReceipt(lastOrder)} />
      )}
    </div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────────── */

function MenuItemForm({
  categories,
  product,
  onSaved,
  onCancel,
}: {
  categories: Category[];
  product?: Product;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? '0');
  const [category, setCategory] = useState(product?.category != null ? String(product.category) : '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { name, price, category: category ? Number(category) : null, is_active: isActive };
    try {
      if (product) await api.patch(`/inventory/products/${product.id}/`, body);
      else await api.post('/inventory/products/', body);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="number" step="0.001" placeholder="Price (OMR)" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2">
        <option value="">No category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {product && (
        <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-ink-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
        </label>
      )}
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add item'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={muted ? 'text-ink-500' : 'font-semibold text-ink-900'}>{value}</span>
    </div>
  );
}

function ReceiptModal({ data, onClose, onPrint }: { data: ReceiptData; onClose: () => void; onPrint: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-sm rounded-3xl p-6 shadow-glass-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Receipt className="h-5 w-5" /></span>
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Order Sent</h3>
              <p className="text-xs text-ink-500">{data.orderId} · {data.counter}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-white/60"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-3">
          <Check className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">OMR {data.total.toFixed(3)} · {data.paymentMethod}</span>
        </div>

        <div className="mt-4 max-h-[260px] overflow-y-auto rounded-2xl border border-white/40 bg-white p-4 font-mono text-[11px] leading-relaxed text-ink-900">
          <div className="text-center">
            <div className="font-sans text-sm font-black">Share Cafe ☕</div>
            <div className="text-[10px]">Al Saada, Salalah, Oman</div>
          </div>
          <div className="my-2 border-t border-dashed border-ink-300" />
          <div className="flex justify-between"><span>Invoice</span><span>{data.orderId}</span></div>
          <div className="flex justify-between"><span>Table</span><span>{data.counter}</span></div>
          <div className="my-2 border-t border-dashed border-ink-300" />
          {data.lines.map((l, i) => (
            <div key={i} className="mb-1 flex justify-between">
              <span className="truncate pr-2">{l.name}</span>
              <span className="whitespace-nowrap font-bold">{l.qty}x OMR {(l.unitPrice * l.qty).toFixed(3)}</span>
            </div>
          ))}
          <div className="my-2 border-t border-solid border-ink-400" />
          <div className="flex justify-between"><span>Subtotal</span><span>OMR {data.subtotal.toFixed(3)}</span></div>
          <div className="flex justify-between"><span>VAT (5%)</span><span>OMR {data.vat.toFixed(3)}</span></div>
          <div className="mt-1 flex justify-between text-sm font-black"><span>TOTAL</span><span>OMR {data.total.toFixed(3)}</span></div>
          <div className="my-2 border-t border-dashed border-ink-300" />
          <div className="text-center font-bold">{data.paymentMethod.toUpperCase()}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <GlassButton variant="glass" size="md" className="w-full" onClick={onClose}>Close</GlassButton>
          <GlassButton variant="primary" size="md" className="w-full" onClick={onPrint}><Printer className="h-4 w-4" /> Print receipt</GlassButton>
        </div>
      </div>
    </div>
  );
}
