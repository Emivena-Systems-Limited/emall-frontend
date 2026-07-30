import { forwardRef } from 'react'
import { DELIVERY_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants/orders'
import './orderReceiptSheet.css'

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReceiptMeta({ label, value }) {
  return (
    <div>
      <p className="receipt-sheet__meta-label">{label}</p>
      <p className="receipt-sheet__meta-value">{value || '—'}</p>
    </div>
  )
}

const OrderReceiptSheet = forwardRef(function OrderReceiptSheet({ order, storeName }, ref) {
  if (!order) return null

  const orderStatus = ORDER_STATUSES[order.orderStatus]?.label ?? order.orderStatus
  const paymentStatus = PAYMENT_STATUSES[order.paymentStatus]?.label ?? order.paymentStatus
  const deliveryStatus = DELIVERY_STATUSES[order.deliveryStatus]?.label ?? order.deliveryStatus
  const cityRegion = [order.delivery.city, order.delivery.region].filter(Boolean).join(', ')

  return (
    <article ref={ref} id="order-receipt-sheet" className="receipt-sheet">
      <header className="receipt-sheet__header">
        <div className="receipt-sheet__header-row">
          <div>
            <p className="receipt-sheet__eyebrow">Sales Receipt</p>
            <h1 className="receipt-sheet__title">{storeName || 'Store'}</h1>
            <p className="receipt-sheet__subtitle">Order fulfilment document</p>
          </div>
          <div className="receipt-sheet__header-right">
            <p className="receipt-sheet__label">Order No.</p>
            <p className="receipt-sheet__order-number">{order.orderNumber}</p>
            <p className="receipt-sheet__date">{formatDate(order.orderDate)}</p>
          </div>
        </div>

        <div className="receipt-sheet__status-grid">
          <ReceiptMeta label="Order status" value={orderStatus} />
          <ReceiptMeta label="Payment" value={paymentStatus} />
          <ReceiptMeta label="Delivery" value={deliveryStatus} />
        </div>
      </header>

      <div className="receipt-sheet__addresses">
        <section>
          <h2 className="receipt-sheet__section-title">Bill to</h2>
          <p className="receipt-sheet__name">{order.customer.name}</p>
          {order.customer.email ? <p className="receipt-sheet__line">{order.customer.email}</p> : null}
          {order.customer.phone ? <p className="receipt-sheet__line">{order.customer.phone}</p> : null}
        </section>

        <section>
          <h2 className="receipt-sheet__section-title">Ship to</h2>
          <p className="receipt-sheet__name">{order.delivery.address || '—'}</p>
          {cityRegion ? <p className="receipt-sheet__line">{cityRegion}</p> : null}
          {order.delivery.country ? <p className="receipt-sheet__line">{order.delivery.country}</p> : null}
          <p className="receipt-sheet__line">{order.deliveryMethod}</p>
        </section>
      </div>

      <div className="receipt-sheet__table-wrap">
        <table className="receipt-sheet__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th className="receipt-sheet__col-center">Qty</th>
              <th className="receipt-sheet__col-right">Unit</th>
              <th className="receipt-sheet__col-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <p className="receipt-sheet__product-name">{item.productName}</p>
                  {item.variantLabel ? <p className="receipt-sheet__variant">{item.variantLabel}</p> : null}
                </td>
                <td className="receipt-sheet__sku">{item.sku}</td>
                <td className="receipt-sheet__col-center receipt-sheet__num">{item.quantity}</td>
                <td className="receipt-sheet__col-right receipt-sheet__num">{formatMoney(item.unitPrice)}</td>
                <td className="receipt-sheet__col-right receipt-sheet__num receipt-sheet__line-total">
                  {formatMoney(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="receipt-sheet__footer">
        <div className="receipt-sheet__footer-row">
          <div className="receipt-sheet__notes">
            {order.transactionReference ? (
              <p>
                <span className="receipt-sheet__notes-strong">Ref:</span>
                {' '}
                {order.transactionReference}
              </p>
            ) : null}
            {order.delivery.notes ? (
              <p>
                <span className="receipt-sheet__notes-strong">Notes:</span>
                {' '}
                {order.delivery.notes}
              </p>
            ) : null}
            <p style={{ marginTop: '0.5rem' }}>Thank you for your purchase.</p>
          </div>

          <dl className="receipt-sheet__totals">
            <div className="receipt-sheet__total-row">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="receipt-sheet__total-row">
                <dt>Discount</dt>
                <dd className="receipt-sheet__discount">−{formatMoney(order.discount)}</dd>
              </div>
            ) : null}
            <div className="receipt-sheet__total-row">
              <dt>Delivery fee</dt>
              <dd>{formatMoney(order.deliveryFee)}</dd>
            </div>
            {order.taxTotal > 0 ? (
              <div className="receipt-sheet__total-row">
                <dt>Tax</dt>
                <dd>{formatMoney(order.taxTotal)}</dd>
              </div>
            ) : null}
            <div className="receipt-sheet__total-row receipt-sheet__grand-total">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </footer>
    </article>
  )
})

export default OrderReceiptSheet
