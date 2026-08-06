import { useEffect, useState } from 'react';
import { Receipt, X, Printer, Download, Loader2 } from 'lucide-react';
import { GlassButton } from '../ui';
import { api, downloadFile } from '../../lib/api';
import { printThermalReceipt } from '../../utils/thermalPrint';

type OrderItem = { id: number; product: number; product_name: string; quantity: number; unit_price: string; discount: string; subtotal: string };
type Payment = { id: number; order: number; method: string; amount: string; received_by: number | null; paid_at: string };
type OrderDetail = {
  id: number;
  order_type: string;
  status: string;
  table_number: string;
  served_by_username: string | null;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  amount_paid: string;
  balance_due: string;
  items: OrderItem[];
  payments: Payment[];
  created_at: string;
};
type Invoice = { id: number; invoice_number: string; order: number };

function unwrap<T>(res: { results?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : res.results ?? [];
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in: 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  talabat: 'Talabat',
};

/** Real payment receipt for a historical order — fetches the order + its payments (and
 * matching invoice, if one was issued at checkout) rather than reconstructing anything
 * from local cart state, since this is opened long after the sale happened. */
export function OrderReceiptModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get<OrderDetail>(`/pos/orders/${orderId}/`),
      api.get<{ results?: Invoice[] } | Invoice[]>('/invoices/invoices/', { order: orderId }).catch(() => []),
    ]).then(([o, inv]) => {
      if (cancelled) return;
      setOrder(o);
      setInvoice(unwrap(inv)[0] ?? null);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [orderId]);

  function handlePrint() {
    if (!order) return;
    const paymentMethod = order.payments.length
      ? order.payments.map((p) => p.method).join(' + ')
      : 'unpaid';
    printThermalReceipt({
      orderId: invoice?.invoice_number ?? `#${order.id}`,
      counter: order.table_number || ORDER_TYPE_LABEL[order.order_type] || order.order_type,
      cashier: order.served_by_username ?? '—',
      lines: order.items.map((it) => ({ name: it.product_name, qty: it.quantity, unitPrice: Number(it.unit_price) })),
      subtotal: Number(order.subtotal),
      vat: Number(order.tax_amount),
      total: Number(order.total),
      paymentMethod,
      date: new Date(order.created_at),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong w-full max-w-sm rounded-3xl p-6 shadow-glass-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Receipt className="h-5 w-5" /></span>
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Order #{orderId}</h3>
              <p className="text-xs text-ink-500">{invoice ? invoice.invoice_number : 'Payment receipt'}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-white/60"><X className="h-4 w-4" /></button>
        </div>

        {loading || !order ? (
          <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-3">
              <span className="text-sm font-semibold text-amber-700">
                OMR {Number(order.total).toFixed(3)} · {order.payments.length ? order.payments.map((p) => p.method).join(' + ') : 'Unpaid'}
              </span>
            </div>

            <div className="mt-4 max-h-[320px] overflow-y-auto rounded-2xl border border-white/40 bg-white p-4 font-mono text-[11px] leading-relaxed text-ink-900">
              <div className="text-center">
                <div className="font-sans text-sm font-black">Share Cafe ☕</div>
                <div className="text-[10px]">Al Saada, Salalah, Oman</div>
              </div>
              <div className="my-2 border-t border-dashed border-ink-300" />
              <div className="flex justify-between"><span>Order</span><span>#{order.id}</span></div>
              {invoice && <div className="flex justify-between"><span>Invoice</span><span>{invoice.invoice_number}</span></div>}
              <div className="flex justify-between"><span>Type</span><span>{ORDER_TYPE_LABEL[order.order_type] ?? order.order_type}</span></div>
              {order.table_number && <div className="flex justify-between"><span>Table</span><span>{order.table_number}</span></div>}
              <div className="flex justify-between"><span>Served by</span><span>{order.served_by_username ?? '—'}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
              <div className="my-2 border-t border-dashed border-ink-300" />
              {order.items.map((it) => (
                <div key={it.id} className="mb-1 flex justify-between">
                  <span className="truncate pr-2">{it.product_name} <span className="text-ink-400">x{it.quantity}</span></span>
                  <span className="whitespace-nowrap font-bold">OMR {Number(it.subtotal).toFixed(3)}</span>
                </div>
              ))}
              {order.items.length === 0 && <div className="text-ink-400">No items on this order.</div>}
              <div className="my-2 border-t border-solid border-ink-400" />
              <div className="flex justify-between"><span>Subtotal</span><span>OMR {Number(order.subtotal).toFixed(3)}</span></div>
              <div className="flex justify-between"><span>VAT ({(Number(order.tax_rate) * 100).toFixed(0)}%)</span><span>OMR {Number(order.tax_amount).toFixed(3)}</span></div>
              <div className="mt-1 flex justify-between text-sm font-black"><span>TOTAL</span><span>OMR {Number(order.total).toFixed(3)}</span></div>
              <div className="my-2 border-t border-dashed border-ink-300" />
              {order.payments.length > 0 ? (
                order.payments.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span className="capitalize">{p.method}</span>
                    <span>OMR {Number(p.amount).toFixed(3)} · {new Date(p.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              ) : (
                <div className="text-center font-bold text-rose-600">NOT YET PAID · balance OMR {Number(order.balance_due).toFixed(3)}</div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <GlassButton variant="glass" size="md" className="w-full" onClick={onClose}>Close</GlassButton>
              <GlassButton variant="glass" size="md" className="w-full" onClick={handlePrint}><Printer className="h-4 w-4" /> Print</GlassButton>
              {invoice ? (
                <GlassButton variant="primary" size="md" className="w-full" onClick={() => downloadFile(`/invoices/invoices/${invoice.id}/pdf/`, `${invoice.invoice_number}.pdf`)}>
                  <Download className="h-4 w-4" /> PDF
                </GlassButton>
              ) : (
                <GlassButton variant="primary" size="md" className="w-full" disabled title="No invoice was issued for this order">
                  <Download className="h-4 w-4" /> PDF
                </GlassButton>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
