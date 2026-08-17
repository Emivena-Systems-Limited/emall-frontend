import { Package } from 'lucide-react'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import OrderActionsMenu from './OrderActionsMenu'
import OrderIdTooltip from './OrderIdTooltip'
import PaymentStatusBadge from './PaymentStatusBadge'
import DeliveryStatusBadge from './DeliveryStatusBadge'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function formatOrderDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function extraProductCount(order) {
  const extra = Math.max(0, (order.items?.length ?? 0) - 1)
  return extra
}

function OrderMobileCard({ order, onUpdateDeliveryStatus }) {
  const extra = extraProductCount(order)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ProductThumbnail src={order.image} alt={order.productName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{order.productName || 'Product'}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">SKU {order.sku || '—'}</p>
            <div className="mt-1">
              <OrderIdTooltip value={order.orderNumber} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
          </div>
        </div>
        <OrderActionsMenu order={order} onUpdateDeliveryStatus={onUpdateDeliveryStatus} />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-semibold text-slate-800">{order.customer?.name || '—'}</p>
        {order.customer?.email ? (
          <p className="truncate text-xs text-slate-500">{order.customer.email}</p>
        ) : null}
        <p className="text-xs text-slate-500">
          {formatMoney(order.unitPrice)} · Qty {order.quantity || 1}
          {extra > 0 ? ` · +${extra} more product${extra === 1 ? '' : 's'}` : ''}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <DeliveryStatusBadge status={order.deliveryStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <p className="whitespace-nowrap text-sm font-bold text-slate-900">{formatMoney(order.totalAmount)}</p>
      </div>
    </article>
  )
}

export default function OrderTable({ orders, onUpdateDeliveryStatus }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No orders match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try adjusting your search or status filters to find the orders you are looking for.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {orders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            onUpdateDeliveryStatus={onUpdateDeliveryStatus}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TABLE_HEAD_CLASS}>Product</th>
              <th className={TABLE_HEAD_CLASS}>Order Number</th>
              <th className={TABLE_HEAD_CLASS}>Order Date</th>
              <th className={TABLE_HEAD_CLASS}>Customer</th>
              <th className={TABLE_HEAD_CLASS}>Unit Price</th>
              <th className={TABLE_HEAD_CLASS}>Qty</th>
              <th className={TABLE_HEAD_CLASS}>Total</th>
              <th className={TABLE_HEAD_CLASS}>Payment Status</th>
              <th className={TABLE_HEAD_CLASS}>Delivery Status</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const extra = extraProductCount(order)

              return (
                <tr key={order.id} className="text-sm text-slate-700">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <ProductThumbnail src={order.image} alt={order.productName} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900" title={order.productName}>
                          {order.productName || 'Product'}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">SKU {order.sku || '—'}</p>
                        {extra > 0 ? (
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            +{extra} more product{extra === 1 ? '' : 's'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderIdTooltip value={order.orderNumber} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                    {formatOrderDate(order.orderDate)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap font-semibold text-slate-800">
                      {order.customer?.name || '—'}
                    </p>
                    {order.customer?.email ? (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer.email}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-800">
                    {formatMoney(order.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums">{order.quantity || 1}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderActionsMenu order={order} onUpdateDeliveryStatus={onUpdateDeliveryStatus} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
