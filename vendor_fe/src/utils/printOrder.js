import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/orders'

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildPrintHtml(order) {
  const orderStatus = ORDER_STATUSES[order.orderStatus]?.label ?? order.orderStatus
  const paymentStatus = PAYMENT_STATUSES[order.paymentStatus]?.label ?? order.paymentStatus

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.sku}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${formatMoney(item.unitPrice)}</td>
          <td style="text-align:right">${formatMoney(item.totalPrice)}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${order.orderNumber} — Order Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
          p { margin: 4px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 4px; font-size: 12px; text-align: left; }
          th { color: #64748b; font-weight: 600; }
          .summary { margin-top: 16px; width: 280px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .summary-row.total { font-weight: 700; border-top: 1px solid #cbd5e1; margin-top: 8px; padding-top: 8px; }
        </style>
      </head>
      <body>
        <h1>Order ${order.orderNumber}</h1>
        <p>${formatDate(order.orderDate)}</p>
        <p>Status: ${orderStatus} · Payment: ${paymentStatus}</p>

        <h2>Customer</h2>
        <p>${order.customer.name}</p>
        <p>${order.customer.email}</p>
        <p>${order.customer.phone}</p>

        <h2>Delivery</h2>
        <p>${order.delivery.address}</p>
        <p>${order.delivery.city}, ${order.delivery.region}</p>
        <p>${order.deliveryMethod}</p>
        ${order.delivery.notes ? `<p>Notes: ${order.delivery.notes}</p>` : ''}

        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Unit</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div class="summary">
          <div class="summary-row"><span>Subtotal</span><span>${formatMoney(order.subtotal)}</span></div>
          <div class="summary-row"><span>Delivery fee</span><span>${formatMoney(order.deliveryFee)}</span></div>
          <div class="summary-row"><span>Discount</span><span>-${formatMoney(order.discount)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${formatMoney(order.totalAmount)}</span></div>
        </div>
      </body>
    </html>
  `
}

export function printOrderReceipt(order) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!printWindow) return false

  printWindow.document.write(buildPrintHtml(order))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}
