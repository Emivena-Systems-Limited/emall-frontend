import { Package } from 'lucide-react'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import SmartNavLink from '../navigation/SmartNavLink'
import { isPendingDelivery } from '../../constants/adminOrders'
import AdminVendorOrderActionsMenu from './AdminVendorOrderActionsMenu'
import OrderIdTooltip from './OrderIdTooltip'
import OrderItemPrice from './OrderItemPrice'
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

function ProductNameLink({ order, className }) {
  const name = order.productName || 'Product'
  const productId = order.productId || order.items?.[0]?.productId

  if (!productId) {
    return (
      <p className={className} title={name}>
        {name}
      </p>
    )
  }

  return (
    <SmartNavLink
      to={`/products/${encodeURIComponent(productId)}`}
      title={name}
      className={`transition-colors hover:text-brand ${className}`}
    >
      {name}
    </SmartNavLink>
  )
}

function extraProductCount(order) {
  return Math.max(0, (order.items?.length ?? 0) - 1)
}

function resolveOrderCompareUnit(order) {
  const compare = Number(order?.comparePrice ?? order?.items?.[0]?.comparePrice)
  const unit = Number(order?.unitPrice)
  return Number.isFinite(compare) && compare > unit ? compare : null
}

function resolveOrderCompareTotal(order) {
  const unitCompare = resolveOrderCompareUnit(order)
  if (unitCompare == null) return null
  return unitCompare * Math.max(1, Number(order.quantity) || 1)
}

function resolveOrderVariantLabel(order) {
  return order?.items?.[0]?.variantLabel || order?.items?.[0]?.variantName || ''
}

function CustomerCell({ customer }) {
  return (
    <div>
      <p className="whitespace-nowrap font-semibold text-slate-800">
        {customer?.name || '—'}
      </p>
      {customer?.phone ? (
        <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{customer.phone}</p>
      ) : null}
      {customer?.email ? (
        <p className="mt-0.5 truncate text-xs text-slate-500">{customer.email}</p>
      ) : null}
    </div>
  )
}

function ProductSummary({ order }) {
  const extra = extraProductCount(order)
  const variantLabel = resolveOrderVariantLabel(order)

  return (
    <div className="flex min-w-0 max-w-[18rem] items-center gap-3">
      <ProductThumbnail src={order.image} alt={order.productName} />
      <div className="min-w-0 flex-1 overflow-hidden">
        <ProductNameLink order={order} className="block truncate font-semibold text-slate-900" />
        {variantLabel ? (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500" title={variantLabel}>
            {variantLabel}
          </p>
        ) : null}
        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">SKU {order.sku || '—'}</p>
        {extra > 0 ? (
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            +{extra} more product{extra === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function OrderMobileCard({ order }) {
  const extra = extraProductCount(order)
  const variantLabel = resolveOrderVariantLabel(order)
  const pending = isPendingDelivery(order)

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        pending
          ? 'border-slate-200 border-l-[5px] border-l-brand shadow-[inset_5px_0_0_0_var(--color-brand)]'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ProductThumbnail src={order.image} alt={order.productName} />
          <div className="min-w-0 flex-1 overflow-hidden">
            <ProductNameLink order={order} className="block truncate text-sm font-bold text-slate-900" />
            {variantLabel ? (
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500" title={variantLabel}>
                {variantLabel}
              </p>
            ) : null}
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">SKU {order.sku || '—'}</p>
            <div className="mt-1">
              <OrderIdTooltip value={order.orderNumber} highlight={pending} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
          </div>
        </div>
        <AdminVendorOrderActionsMenu order={order} />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-semibold text-slate-800">{order.customer?.name || '—'}</p>
        {order.customer?.phone ? (
          <p className="truncate text-xs text-slate-500">{order.customer.phone}</p>
        ) : null}
        {order.customer?.email ? (
          <p className="truncate text-xs text-slate-500">{order.customer.email}</p>
        ) : null}
        <p className="text-xs text-slate-500">
          Qty {order.quantity || 1}
          {extra > 0 ? ` · +${extra} more product${extra === 1 ? '' : 's'}` : ''}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <DeliveryStatusBadge status={order.deliveryStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <OrderItemPrice
          amount={order.totalAmount}
          compareAmount={resolveOrderCompareTotal(order)}
        />
      </div>
    </article>
  )
}

function OrderRow({ order }) {
  const pending = isPendingDelivery(order)

  return (
    <tr className={`text-sm text-slate-700 ${
      pending ? 'bg-brand-light/25 shadow-[inset_5px_0_0_0_var(--color-brand)]' : ''
    }`}>
      <td className={`w-[18rem] max-w-[18rem] overflow-hidden px-5 py-4 ${
        pending ? 'border-l-[5px] border-l-brand' : 'border-l-[5px] border-l-transparent'
      }`}>
        <ProductSummary order={order} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <OrderIdTooltip value={order.orderNumber} highlight={pending} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
        {formatOrderDate(order.orderDate)}
      </td>
      <td className="px-5 py-4">
        <CustomerCell customer={order.customer} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <OrderItemPrice amount={order.unitPrice} compareAmount={resolveOrderCompareUnit(order)} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 tabular-nums">{order.quantity || 1}</td>
      <td className="whitespace-nowrap px-5 py-4">
        <OrderItemPrice amount={order.totalAmount} compareAmount={resolveOrderCompareTotal(order)} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <DeliveryStatusBadge status={order.deliveryStatus} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <AdminVendorOrderActionsMenu order={order} />
      </td>
    </tr>
  )
}

export function VendorCatalogOrderTableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading orders">
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
  )
}

export default function VendorCatalogOrderTable({ orders }) {
  const rows = Array.isArray(orders) ? orders : []

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No orders yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Checkouts attributed to this store will appear here once shoppers place them.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {rows.map((order) => (
          <OrderMobileCard key={order.id || order.itemId} order={order} />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full table-fixed text-left">
          <colgroup>
            <col className="w-[18rem]" />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th className={`${TABLE_HEAD_CLASS} w-[18rem] border-l-[5px] border-transparent`}>Product</th>
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
            {rows.map((order) => (
              <OrderRow key={order.id || order.itemId} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
