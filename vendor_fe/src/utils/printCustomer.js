import { formatDateTime, formatMoney } from './financeUtils'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPrintHtml(customer) {
  const reviews = customer.reviews ?? []
  const reviewsHtml = reviews.length
    ? reviews
      .map(
        (review) => `
          <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0;font-size:13px;font-weight:600;">${escapeHtml(review.productName || 'Product')}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${review.rating}/5 — ${escapeHtml(formatDateTime(review.date))}</p>
            ${review.comment ? `<p style="margin:6px 0 0;font-size:13px;">&ldquo;${escapeHtml(review.comment)}&rdquo;</p>` : ''}
          </div>
        `,
      )
      .join('')
    : '<p style="font-size:13px;color:#64748b;">No reviews submitted yet.</p>'

  const locationParts = [customer.address, customer.city, customer.region, customer.country].filter(Boolean)

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(customer.name)} — Customer Profile</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
          p { margin: 4px 0; font-size: 13px; }
          .stats { display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap; }
          .stat { font-size: 13px; min-width: 120px; }
          .stat strong { display: block; font-size: 16px; margin-bottom: 2px; }
          @media print {
            body { margin: 16px; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(customer.name)}</h1>
        <p>${escapeHtml(customer.email)} · ${escapeHtml(customer.phone)}</p>
        <p>${escapeHtml(locationParts.join(', '))}</p>

        <div class="stats">
          <div class="stat"><strong>${customer.totalOrders}</strong>Total orders</div>
          <div class="stat"><strong>${escapeHtml(formatMoney(customer.totalSpend))}</strong>Total spend</div>
          <div class="stat"><strong>${escapeHtml(formatDateTime(customer.firstPurchaseDate))}</strong>First purchase</div>
          <div class="stat"><strong>${escapeHtml(formatDateTime(customer.lastOrderDate))}</strong>Last purchase</div>
          <div class="stat"><strong>${customer.reviewsCount ?? reviews.length}</strong>Reviews</div>
        </div>

        <h2>Reviews</h2>
        ${reviewsHtml}
      </body>
    </html>
  `
}

function printHtmlDocument(html) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'

  document.body.appendChild(iframe)

  const frameWindow = iframe.contentWindow
  const frameDocument = frameWindow?.document

  if (!frameWindow || !frameDocument) {
    iframe.remove()
    return false
  }

  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove()
    }, 1000)
  }

  const runPrint = () => {
    try {
      frameWindow.focus()
      frameWindow.print()
      return true
    } catch {
      return false
    } finally {
      cleanup()
    }
  }

  if (frameDocument.readyState === 'complete') {
    return runPrint()
  }

  iframe.onload = () => runPrint()
  return true
}

export function printCustomerProfile(customer) {
  if (!customer) return false

  return printHtmlDocument(buildPrintHtml(customer))
}
