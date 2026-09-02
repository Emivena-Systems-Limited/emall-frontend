import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Package, Store } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import { formatCount } from '../../utils/formatters'
import { formatOrderDate, getOrderApiId } from '../../utils/normalizeAdminOrders'
import { isPendingDelivery } from '../../constants/adminOrders'
import { prefetchAdminOrder } from '../../hooks/useAdminOrders'
import OrderActions from './OrderActions'
import OrderIdTooltip from './OrderIdTooltip'
import OrderItemPrice from './OrderItemPrice'
import PaymentStatusBadge from './PaymentStatusBadge'
import DeliveryStatusBadge from './DeliveryStatusBadge'

export function OrderRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading orders"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function extraProductCount(order) {
  return Math.max(0, (order.items?.length ?? 0) - 1)
}

function ProductSummary({ order }) {
  const extra = extraProductCount(order)
  const variantLabel = order.items?.[0]?.variantLabel || order.items?.[0]?.variantName || ''

  return (
    <div className="flex min-w-0 max-w-[18rem] items-center gap-3">
      <ProductThumbnail src={order.image} alt="" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate font-semibold text-slate-900" title={order.productName}>
          {order.productName || 'Order items'}
        </p>
        {variantLabel ? (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{variantLabel}</p>
        ) : null}
        {extra > 0 ? (
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            +{extra} more product{extra === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default function OrderRoster({
  orders,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onPayment,
  onDelivery,
  onCancel,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminOrder(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Package}
          title={hasFilters ? 'No orders match these filters' : 'No orders yet'}
          description={
            hasFilters
              ? 'Try a different status, payment, store, or search, or clear the current filters.'
              : 'Marketplace checkouts will appear here as shoppers place them.'
          }
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : null}
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
              <th className="px-5 py-2.5">Listing</th>
              <th className="px-5 py-2.5">Order</th>
              <th className="px-5 py-2.5">Customer</th>
              <th className="px-5 py-2.5">Store</th>
              <th className="px-5 py-2.5">Total</th>
              <th className="px-5 py-2.5">Payment</th>
              <th className="px-5 py-2.5">Delivery</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const pending = isPendingDelivery(order)
              const apiId = getOrderApiId(order)
              return (
                <tr
                  key={apiId || order.id}
                  className={pending ? 'bg-brand-light/20 shadow-[inset_5px_0_0_0_var(--color-brand)]' : 'hover:bg-slate-50/80'}
                >
                  <td className={`px-5 py-3 ${pending ? 'border-l-[5px] border-l-brand' : 'border-l-[5px] border-l-transparent'}`}>
                    <Link
                      to={`/orders/${encodeURIComponent(apiId)}`}
                      onMouseEnter={() => prefetch(apiId)}
                      onFocus={() => prefetch(apiId)}
                      className="block rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <ProductSummary order={order} />
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <OrderIdTooltip value={order.orderNumber} highlight={pending} />
                    <p className="mt-1 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{order.customer?.name || '—'}</p>
                    {order.customer?.phone ? (
                      <p className="mt-0.5 text-xs text-slate-500">{order.customer.phone}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {order.vendorName || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <OrderItemPrice amount={order.totalAmount} />
                  </td>
                  <td className="px-5 py-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OrderActions
                      order={order}
                      onView={() => navigate(`/orders/${encodeURIComponent(apiId)}`)}
                      onPayment={onPayment}
                      onDelivery={onDelivery}
                      onCancel={onCancel}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {orders.map((order) => {
          const pending = isPendingDelivery(order)
          const apiId = getOrderApiId(order)
          const extra = extraProductCount(order)
          return (
            <li
              key={apiId || order.id}
              className={`px-4 py-4 ${pending ? 'border-l-[5px] border-l-brand bg-brand-light/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/orders/${encodeURIComponent(apiId)}`}
                  onMouseEnter={() => prefetch(apiId)}
                  onFocus={() => prefetch(apiId)}
                  className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <ProductSummary order={order} />
                  <div className="mt-2">
                    <OrderIdTooltip value={order.orderNumber} highlight={pending} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
                </Link>
                <OrderActions
                  order={order}
                  onView={() => navigate(`/orders/${encodeURIComponent(apiId)}`)}
                  onPayment={onPayment}
                  onDelivery={onDelivery}
                  onCancel={onCancel}
                />
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-semibold text-slate-800">{order.customer?.name || '—'}</p>
                {order.vendorName ? (
                  <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Store className="size-3" aria-hidden="true" />
                    {order.vendorName}
                  </p>
                ) : null}
                {extra > 0 ? (
                  <p className="text-xs text-slate-500">+{extra} more product{extra === 1 ? '' : 's'}</p>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <DeliveryStatusBadge status={order.deliveryStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <OrderItemPrice amount={order.totalAmount} />
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
