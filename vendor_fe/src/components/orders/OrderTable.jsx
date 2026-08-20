import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronDown, Layers3, Package } from 'lucide-react'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import { mergeOrderGroup } from '../../utils/orderCatalogFilters'
import { buildViewProductPath } from '../../utils/orderProductNavigation'
import { mergeOrderNavigationState, resolveOrdersReturnTo } from '../../utils/orderNavigation'
import OrderActionsMenu from './OrderActionsMenu'
import OrderIdTooltip from './OrderIdTooltip'
import OrderItemPrice from './OrderItemPrice'
import PaymentStatusBadge from './PaymentStatusBadge'
import DeliveryStatusBadge from './DeliveryStatusBadge'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'
const TABLE_COLUMN_COUNT = 10

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
  const location = useLocation()
  const name = order.productName || 'Product'
  const productId = order.productId || order.items?.[0]?.productId
  const orderId = order.orderId || order.id
  const ordersReturnTo = resolveOrdersReturnTo(location)

  if (!productId) {
    return (
      <p className={className} title={name}>
        {name}
      </p>
    )
  }

  return (
    <Link
      to={buildViewProductPath(productId, orderId)}
      state={mergeOrderNavigationState(location.state, { returnTo: ordersReturnTo })}
      title={name}
      className={`transition-colors hover:text-brand ${className}`}
    >
      {name}
    </Link>
  )
}

function extraProductCount(order) {
  return Math.max(0, (order.items?.length ?? 0) - 1)
}

function resolveGroupQuantity(orders) {
  return orders.reduce((sum, order) => sum + Math.max(1, Number(order.quantity) || 1), 0)
}

function resolveGroupTotal(orders) {
  return orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
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

function resolveGroupCompareTotal(orders) {
  const list = orders.reduce((sum, order) => {
    const compare = resolveOrderCompareTotal(order)
    return sum + (compare ?? Number(order.totalAmount || 0))
  }, 0)
  const paid = resolveGroupTotal(orders)
  return list > paid ? list : null
}

function resolveOrderVariantLabel(order) {
  return order?.items?.[0]?.variantLabel || order?.items?.[0]?.variantName || ''
}

function uniqueStatuses(orders, key) {
  return [...new Set(orders.map((order) => order[key]).filter(Boolean))]
}

function MixedStatusBadge({ label = 'Mixed status' }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      <span className="size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
      {label}
    </span>
  )
}

function MultiItemBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_6px_14px_rgba(199,59,45,0.22)]">
      <Layers3 className="size-3" strokeWidth={2.25} />
      Multi-item · {count}
    </span>
  )
}

function GroupPaymentBadge({ orders }) {
  const statuses = uniqueStatuses(orders, 'paymentStatus')
  if (statuses.length === 1) return <PaymentStatusBadge status={statuses[0]} />
  return <MixedStatusBadge label="Mixed payment" />
}

function GroupDeliveryBadge({ orders }) {
  const statuses = uniqueStatuses(orders, 'deliveryStatus')
  if (statuses.length === 1) return <DeliveryStatusBadge status={statuses[0]} />
  return <MixedStatusBadge label="Mixed delivery" />
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

function StackedThumbnails({ orders }) {
  const visible = orders.slice(0, 3)
  const overflow = Math.max(0, orders.length - visible.length)

  return (
    <div className="flex shrink-0 items-center">
      {visible.map((order, index) => (
        <span
          key={order.id || order.itemId || `${order.productName}-${index}`}
          className="rounded-xl ring-2 ring-white"
          style={{ marginLeft: index === 0 ? 0 : -10, zIndex: visible.length - index }}
        >
          <ProductThumbnail src={order.image} alt={order.productName} />
        </span>
      ))}
      {overflow > 0 ? (
        <span className="relative z-0 -ml-2 flex size-11 items-center justify-center rounded-xl bg-brand text-[11px] font-bold text-white ring-2 ring-white">
          +{overflow}
        </span>
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

function OrderItemCard({ order, onUpdateDeliveryStatus }) {
  const variantLabel = resolveOrderVariantLabel(order)

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-brand/10 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ring-1 ring-white">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3 overflow-hidden">
          <ProductThumbnail src={order.image} alt={order.productName} />
          <div className="min-w-0 max-w-[18rem] flex-1 overflow-hidden">
            <ProductNameLink order={order} className="block truncate text-sm font-bold text-slate-900" />
            {variantLabel ? (
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500" title={variantLabel}>
                {variantLabel}
              </p>
            ) : null}
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">SKU {order.sku || '—'}</p>
          </div>
        </div>
        <OrderActionsMenu order={order} onUpdateDeliveryStatus={onUpdateDeliveryStatus} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            Qty {order.quantity || 1}
          </span>
          <OrderItemPrice amount={order.unitPrice} compareAmount={resolveOrderCompareUnit(order)} align="left" />
        </div>
        <OrderItemPrice amount={order.totalAmount} compareAmount={resolveOrderCompareTotal(order)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PaymentStatusBadge status={order.paymentStatus} />
        <DeliveryStatusBadge status={order.deliveryStatus} />
      </div>
    </article>
  )
}

function GroupedOrderMobileCard({
  group,
  expanded,
  onToggle,
  onUpdateDeliveryStatus,
}) {
  const { orders } = group
  const first = orders[0]
  const merged = useMemo(() => mergeOrderGroup(orders), [orders])

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-brand/20 bg-white shadow-[0_12px_28px_rgba(199,59,45,0.08)]">
      <div className="border-l-4 border-brand bg-linear-to-br from-brand-light/50 via-white to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <MultiItemBadge count={orders.length} />
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              className="mt-3 flex w-full min-w-0 cursor-pointer items-start gap-3 text-left"
            >
              <span
                className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-brand/20 transition-colors ${
                  expanded ? 'bg-brand text-white' : 'bg-white text-brand'
                }`}
                aria-hidden
              >
                <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </span>
              <span className="min-w-0 flex-1">
                <StackedThumbnails orders={orders} />
                <span className="mt-2 block text-sm font-bold text-slate-900">
                  {orders.length} products in this order
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-brand">
                  {expanded ? 'Hide items' : 'View items'}
                </span>
              </span>
            </button>
            <div className="mt-2 pl-11">
              <OrderIdTooltip value={first.orderNumber} />
              <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(first.orderDate)}</p>
            </div>
          </div>
          <OrderActionsMenu
            order={merged}
            hideUpdateDeliveryStatus
            onUpdateDeliveryStatus={onUpdateDeliveryStatus}
          />
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <p className="font-semibold text-slate-800">{first.customer?.name || '—'}</p>
          {first.customer?.phone ? (
            <p className="truncate text-xs text-slate-500">{first.customer.phone}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            Qty {resolveGroupQuantity(orders)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <GroupDeliveryBadge orders={orders} />
            <GroupPaymentBadge orders={orders} />
          </div>
          <OrderItemPrice
            amount={resolveGroupTotal(orders)}
            compareAmount={resolveGroupCompareTotal(orders)}
          />
        </div>
      </div>

      {expanded ? (
        <div className="space-y-2 border-t border-brand/10 bg-brand-light/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">Ordered products</p>
          {orders.map((order) => (
            <OrderItemCard
              key={order.id}
              order={order}
              onUpdateDeliveryStatus={onUpdateDeliveryStatus}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function OrderMobileCard({ order, onUpdateDeliveryStatus }) {
  const extra = extraProductCount(order)
  const variantLabel = resolveOrderVariantLabel(order)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
              <OrderIdTooltip value={order.orderNumber} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
          </div>
        </div>
        <OrderActionsMenu order={order} onUpdateDeliveryStatus={onUpdateDeliveryStatus} />
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

function SingleOrderRow({ order, onUpdateDeliveryStatus }) {
  return (
    <tr className="text-sm text-slate-700">
      <td className="w-[18rem] max-w-[18rem] overflow-hidden px-5 py-4">
        <ProductSummary order={order} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <OrderIdTooltip value={order.orderNumber} />
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
        <OrderActionsMenu order={order} onUpdateDeliveryStatus={onUpdateDeliveryStatus} />
      </td>
    </tr>
  )
}

function GroupedOrderRows({
  group,
  expanded,
  onToggle,
  onUpdateDeliveryStatus,
}) {
  const { orders } = group
  const first = orders[0]
  const merged = useMemo(() => mergeOrderGroup(orders), [orders])
  const panelId = `order-group-${String(group.key).replace(/[^a-zA-Z0-9_-]/g, '-')}`

  return (
    <tr className="bg-slate-50/80">
      <td colSpan={TABLE_COLUMN_COUNT} className="px-4 py-3">
        <div
          className={`overflow-hidden rounded-2xl border-2 bg-white shadow-[0_12px_28px_rgba(199,59,45,0.08)] transition-colors ${
            expanded ? 'border-brand/35 ring-1 ring-brand/15' : 'border-brand/20'
          }`}
        >
          <div className="border-l-4 border-brand bg-linear-to-r from-brand-light/45 via-white to-white">
            <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-brand/20 transition-colors ${
                    expanded ? 'bg-brand text-white' : 'bg-white text-brand'
                  }`}
                  aria-hidden
                >
                  <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <StackedThumbnails orders={orders} />
                    <MultiItemBadge count={orders.length} />
                  </span>
                  <span className="mt-2 block text-sm font-bold text-slate-900">
                    {orders.length} products in this order
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-brand">
                    {expanded ? 'Hide items' : 'View items'}
                  </span>
                </span>
              </button>

              <div className="flex shrink-0 items-start gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Order total</p>
                  <div className="mt-0.5">
                    <OrderItemPrice
                      amount={resolveGroupTotal(orders)}
                      compareAmount={resolveGroupCompareTotal(orders)}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Qty {resolveGroupQuantity(orders)}</p>
                </div>
                <OrderActionsMenu
                  order={merged}
                  hideUpdateDeliveryStatus
                  onUpdateDeliveryStatus={onUpdateDeliveryStatus}
                />
              </div>
            </div>

            <div className="grid gap-3 border-t border-brand/10 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Order number</p>
                <div className="mt-1">
                  <OrderIdTooltip value={first.orderNumber} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Order date</p>
                <p className="mt-1 text-xs font-medium text-slate-700">{formatOrderDate(first.orderDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Customer</p>
                <div className="mt-1">
                  <CustomerCell customer={first.customer} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <GroupPaymentBadge orders={orders} />
                  <GroupDeliveryBadge orders={orders} />
                </div>
              </div>
            </div>
          </div>

          {expanded ? (
            <div id={panelId} className="space-y-3 border-t border-brand/10 bg-brand-light/20 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
                Ordered products
              </p>
              <div className="grid min-w-0 gap-3">
                {orders.map((order) => (
                  <OrderItemCard
                    key={order.id}
                    order={order}
                    onUpdateDeliveryStatus={onUpdateDeliveryStatus}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

export default function OrderTable({ orders, onUpdateDeliveryStatus }) {
  const [expandedKeys, setExpandedKeys] = useState(() => new Set())
  const groups = Array.isArray(orders) && orders[0]?.orders
    ? orders
    : (orders ?? []).map((order) => ({
        key: String(order.id),
        orders: [order],
      }))

  const toggleGroup = (key) => {
    setExpandedKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (groups.length === 0) {
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
        {groups.map((group) => (
          group.orders.length > 1 ? (
            <GroupedOrderMobileCard
              key={group.key}
              group={group}
              expanded={expandedKeys.has(group.key)}
              onToggle={() => toggleGroup(group.key)}
              onUpdateDeliveryStatus={onUpdateDeliveryStatus}
            />
          ) : (
            <OrderMobileCard
              key={group.key}
              order={group.orders[0]}
              onUpdateDeliveryStatus={onUpdateDeliveryStatus}
            />
          )
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={`${TABLE_HEAD_CLASS} w-[18rem]`}>Product</th>
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
            {groups.map((group) => (
              group.orders.length > 1 ? (
                <GroupedOrderRows
                  key={group.key}
                  group={group}
                  expanded={expandedKeys.has(group.key)}
                  onToggle={() => toggleGroup(group.key)}
                  onUpdateDeliveryStatus={onUpdateDeliveryStatus}
                />
              ) : (
                <SingleOrderRow
                  key={group.key}
                  order={group.orders[0]}
                  onUpdateDeliveryStatus={onUpdateDeliveryStatus}
                />
              )
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
