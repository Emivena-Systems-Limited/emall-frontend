import { formatMoney, formatShortDate } from './financeUtils'

function buildPrintHtml(customer) {
  const reviewsHtml = customer.reviews.length
    ? customer.reviews
      .map(
        (review) => `
          <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0;font-size:13px;font-weight:600;">${review.productName || 'Product'}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${review.rating}/5 — ${formatShortDate(review.date)}</p>
            <p style="margin:6px 0 0;font-size:13px;">&ldquo;${review.comment}&rdquo;</p>
          </div>
        `,
      )
      .join('')
    : '<p style="font-size:13px;color:#64748b;">No reviews submitted yet.</p>'

  const ordersHtml = customer.orderHistory
    .map(
      (order) => `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${formatShortDate(order.orderDate)}</td>
          <td>${order.productsPurchased.join(', ')}</td>
          <td>${formatMoney(order.orderTotal)}</td>
          <td>${order.orderStatus.replaceAll('_', ' ')}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${customer.name} — Customer Profile</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
          p { margin: 4px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 4px; font-size: 12px; text-align: left; vertical-align: top; }
          th { color: #64748b; font-weight: 600; }
          .stats { display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap; }
          .stat { font-size: 13px; min-width: 120px; }
          .stat strong { display: block; font-size: 16px; margin-bottom: 2px; }
          @media print {
            body { margin: 16px; }
          }
        </style>
      </head>
      <body>
        <h1>${customer.name}</h1>
        <p>${customer.email} · ${customer.phone}</p>
        <p>${customer.address}, ${customer.city}, ${customer.region}${customer.country ? `, ${customer.country}` : ''}</p>

        <div class="stats">
          <div class="stat"><strong>${customer.totalOrders}</strong>Total orders</div>
          <div class="stat"><strong>${formatMoney(customer.totalSpend)}</strong>Total spend</div>
          <div class="stat"><strong>${formatShortDate(customer.firstPurchaseDate)}</strong>First purchase</div>
          <div class="stat"><strong>${formatShortDate(customer.lastOrderDate)}</strong>Last purchase</div>
        </div>

        <h2>Order history</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${ordersHtml}</tbody>
        </table>

        <h2>Reviews</h2>
        ${reviewsHtml}
      </body>
    </html>
  `
}

export function printCustomerProfile(customer) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!printWindow) return false

  printWindow.document.write(buildPrintHtml(customer))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}
