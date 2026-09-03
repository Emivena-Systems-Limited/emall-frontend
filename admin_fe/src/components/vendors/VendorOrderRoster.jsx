import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import SmartNavLink from '../navigation/SmartNavLink'
import { formatCount } from '../../utils/formatters'
import { formatOrderDate, getOrderApiId } from '../../utils/normalizeAdminOrders'
import { prefetchAdminOrder } from '../../hooks/useAdminOrders'
import DeliveryStatusBadge from '../orders/DeliveryStatusBadge'
import OrderIdTooltip from '../orders/OrderIdTooltip'
import OrderItemPrice from '../orders/OrderItemPrice'
import PaymentStatusBadge from '../orders/PaymentStatusBadge'

function resolveVendorOrderDetailId(order) {
  return order?.orderId || getOrderApiId(order)
}

function getLineMeta(order) {
  const line = order.items?.[0] ?? {}
  return {
    variantLabel: line.variantLabel || line.variantName || '',
    brandName: line.brandName || '',
    categoryName: line.categoryName || '',
    sku: order.sku || line.sku || '—',
  }
}

function SaleLineSummary({ order }) {
  const { variantLabel, brandName, sku } = getLineMeta(order)

  return (
    <div className="flex min-w-0 max-w-[22rem] items-start gap-3">
      <ProductThumbnail src={order.image} alt={order.productName || 'Product'} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900" title={order.productName}>
          {order.productName || 'Product'}
        </p>
        {variantLabel ? (
          <p className="mt-1 truncate text-xs font-medium text-slate-600">{variantLabel}</p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
          <span className="font-semibold uppercase tracking-wide">SKU</span>
          <span className="truncate font-medium text-slate-700">{sku}</span>
          {brandName ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{brandName}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function VendorOrderRosterSkeleton({ rows = 5 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading vendor orders"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3 w-32 rounded-md" />
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function VendorOrderRoster({
  orders,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
}) {
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminOrder(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Checkouts attributed to this store will appear here once shoppers place them."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="min-w-[18rem] px-5 py-2.5">Product</th>
              <th className="px-5 py-2.5">Order</th>
              <th className="px-5 py-2.5">Customer</th>
              <th className="px-5 py-2.5">Qty</th>
              <th className="px-5 py-2.5">Line total</th>
              <th className="px-5 py-2.5">Payment</th>
              <th className="px-5 py-2.5">Delivery</th>
              <th className="px-5 py-2.5">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const detailId = resolveVendorOrderDetailId(order)
              const compareTotal = order.discount > 0 ? order.subtotal : null

              return (
                <tr key={order.id || detailId} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <SmartNavLink
                      to={`/orders/${encodeURIComponent(detailId)}`}
                      onMouseEnter={() => prefetch(detailId)}
                      onFocus={() => prefetch(detailId)}
                      className="block rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <SaleLineSummary order={order} />
                    </SmartNavLink>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <OrderIdTooltip value={order.orderNumber} />
                  </td>
                  <td className="px-5 py-3 align-top">
                    <p className="font-semibold text-slate-800">{order.customer?.name || '—'}</p>
                    {order.customer?.phone ? (
                      <p className="mt-0.5 text-xs text-slate-500">{order.customer.phone}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 align-top tabular-nums text-slate-700">
                    {order.quantity || 1}
                  </td>
                  <td className="px-5 py-3 align-top">
                    <OrderItemPrice amount={order.totalAmount} compareAmount={compareTotal} align="left" />
                    {order.discount > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                        Discount applied
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 align-top">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-3 align-top">
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </td>
                  <td className="px-5 py-3 align-top text-slate-500">{formatOrderDate(order.orderDate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {orders.map((order) => {
          const detailId = resolveVendorOrderDetailId(order)
          const compareTotal = order.discount > 0 ? order.subtotal : null
          const { sku, brandName } = getLineMeta(order)

          return (
            <li key={order.id || detailId} className="px-4 py-4">
              <SmartNavLink
                to={`/orders/${encodeURIComponent(detailId)}`}
                onMouseEnter={() => prefetch(detailId)}
                onFocus={() => prefetch(detailId)}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <SaleLineSummary order={order} />
              </SmartNavLink>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <OrderIdTooltip value={order.orderNumber} />
                  <span className="text-xs text-slate-500">{formatOrderDate(order.orderDate)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{order.customer?.name || 'Shopper'}</p>
                    {order.customer?.phone ? (
                      <p className="text-xs text-slate-500">{order.customer.phone}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Qty {order.quantity || 1}
                  </span>
                </div>
                {(sku !== '—' || brandName) ? (
                  <p className="text-xs text-slate-500">
                    {[sku !== '—' ? `SKU ${sku}` : null, brandName].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </div>
                  <OrderItemPrice amount={order.totalAmount} compareAmount={compareTotal} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </button>
          <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Next
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
