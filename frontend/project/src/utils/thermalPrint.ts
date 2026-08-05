export type ReceiptLine = {
  name: string;
  qty: number;
  unitPrice: number;
};

export type ReceiptData = {
  orderId: string;
  counter: string;
  cashier: string;
  lines: ReceiptLine[];
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: string;
  date?: Date;
};

export function printThermalReceipt(data: ReceiptData): void {
  const now = data.date ?? new Date();
  const dateStr = now.toLocaleDateString('en-OM', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-OM', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const linesHtml = data.lines
    .map(
      (l) => `
      <tr>
        <td class="item-name">${l.name}</td>
        <td class="item-qty">${l.qty}</td>
        <td class="item-price">OMR ${(l.unitPrice * l.qty).toFixed(3)}</td>
      </tr>
      <tr class="sub-row">
        <td colspan="3">@ OMR ${l.unitPrice.toFixed(3)} each</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${data.orderId}</title>
  <style>
    /* ── Reset & base ── */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 80mm;
      /* centers in print preview; real thermal ignores this */
      margin: 0 auto;
      padding: 4mm 3mm 8mm;
    }

    /* ── Store header ── */
    .header { text-align: center; margin-bottom: 6px; }
    .header .logo {
      font-size: 22px;
      font-weight: 900;
      font-family: Arial, sans-serif;
      letter-spacing: -0.5px;
    }
    .header .logo span { /* dot */ }
    .header .store-name { font-size: 11px; font-weight: bold; margin-top: 1px; }
    .header .address { font-size: 10px; color: #333; line-height: 1.5; margin-top: 2px; }
    .header .vat { font-size: 10px; font-weight: bold; margin-top: 2px; }

    /* ── Dividers ── */
    .dash { border: none; border-top: 1px dashed #000; margin: 5px 0; }
    .solid { border: none; border-top: 1.5px solid #000; margin: 5px 0; }

    /* ── Order meta ── */
    .meta { font-size: 10px; line-height: 1.8; }
    .meta .row { display: flex; justify-content: space-between; }
    .meta .label { color: #555; }
    .meta .value { font-weight: bold; }

    /* ── Items table ── */
    .items { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .items thead th {
      font-size: 10px;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 3px;
    }
    .items thead th.item-name { text-align: left; width: 52%; }
    .items thead th.item-qty  { text-align: center; width: 10%; }
    .items thead th.item-price{ text-align: right;  width: 38%; }

    .items td { font-size: 11px; padding: 3px 0 1px; vertical-align: top; }
    .items td.item-name { text-align: left; padding-right: 4px; }
    .items td.item-qty  { text-align: center; }
    .items td.item-price{ text-align: right; font-weight: bold; }

    .items tr.sub-row td {
      font-size: 9px;
      color: #555;
      padding-bottom: 4px;
    }

    /* ── Totals ── */
    .totals { width: 100%; font-size: 11px; margin-top: 2px; }
    .totals tr td { padding: 2px 0; }
    .totals td.t-label { color: #333; }
    .totals td.t-value { text-align: right; font-weight: bold; }
    .totals tr.total-row td {
      font-size: 14px;
      font-weight: 900;
      padding-top: 4px;
    }

    /* ── Payment method ── */
    .payment {
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      margin: 5px 0 2px;
      padding: 3px 0;
      border: 1px solid #000;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      font-size: 10px;
      line-height: 1.7;
      color: #333;
      margin-top: 6px;
    }
    .footer .thank-you {
      font-size: 13px;
      font-weight: 900;
      font-family: Arial, sans-serif;
      color: #000;
      margin-bottom: 3px;
    }

    /* ── Barcode placeholder ── */
    .barcode {
      text-align: center;
      margin-top: 6px;
      font-size: 28px;
      letter-spacing: 3px;
      /* real barcode would be an img from a barcode lib */
    }
    .barcode-text { font-size: 9px; letter-spacing: 1px; }

    /* ── Print media ── */
    @page {
      size: 80mm auto;
      margin: 0;
    }
    @media print {
      body { width: 80mm; padding: 2mm 3mm 6mm; }
    }
  </style>
</head>
<body>

  <!-- Store header -->
  <div class="header">
    <div class="logo">Share Cafe ☕</div>
    <div class="store-name">Al Sada North Branch</div>
    <div class="address">
      Al Sada North, Oman<br>
      Tel: +968 2212 3456
    </div>
    <div class="vat">VAT Reg. No: OM1100054321</div>
  </div>

  <hr class="solid" />

  <!-- Order meta -->
  <div class="meta">
    <div class="row"><span class="label">Order</span><span class="value">${data.orderId}</span></div>
    <div class="row"><span class="label">Counter</span><span class="value">${data.counter}</span></div>
    <div class="row"><span class="label">Cashier</span><span class="value">${data.cashier}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
    <div class="row"><span class="label">Time</span><span class="value">${timeStr}</span></div>
  </div>

  <hr class="dash" />

  <!-- Items -->
  <table class="items">
    <thead>
      <tr>
        <th class="item-name">Item</th>
        <th class="item-qty">Qty</th>
        <th class="item-price">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${linesHtml}
    </tbody>
  </table>

  <hr class="solid" />

  <!-- Totals -->
  <table class="totals">
    <tr>
      <td class="t-label">Subtotal</td>
      <td class="t-value">OMR ${data.subtotal.toFixed(3)}</td>
    </tr>
    <tr>
      <td class="t-label">VAT (5%)</td>
      <td class="t-value">OMR ${data.vat.toFixed(3)}</td>
    </tr>
    <tr class="total-row">
      <td class="t-label">TOTAL</td>
      <td class="t-value">OMR ${data.total.toFixed(3)}</td>
    </tr>
  </table>

  <hr class="dash" />

  <!-- Payment -->
  <div class="payment">Paid by: ${data.paymentMethod.toUpperCase()}</div>

  <hr class="dash" />

  <!-- Footer -->
  <div class="footer">
    <div class="thank-you">Thank You! شكراً</div>
    Share Cafe &middot; Al Sada North, Oman<br>
    VAT Invoice &middot; 5% VAT included<br>
    Goods once sold are not returnable<br>
    unless defective within 7 days
  </div>

  <!-- Barcode area (order number as text, replace with img for real barcode) -->
  <div class="barcode">
    <div>||| ||| || ||||| || |||</div>
    <div class="barcode-text">${data.orderId}</div>
  </div>

  <script>
    window.onload = function () {
      window.print();
      // close the window after print dialog is dismissed
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=400,height=600,toolbar=0,menubar=0,location=0');
  if (!win) {
    alert('Please allow pop-ups for this site to print receipts.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
