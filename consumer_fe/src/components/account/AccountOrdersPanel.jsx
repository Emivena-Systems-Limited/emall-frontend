import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  ArrowRight,
  ChevronRight,
  Grid2X2,
  List,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { useCancelOrderMutation } from '../../hooks/useCancelOrderMutation'
import { useOrdersQuery } from '../../hooks/useOrdersQuery'
import { notify } from '../../lib/notify'
import {
  findOrderById,
  formatOrderNumber,
  normalizeOrdersResponse,
  orderMatchesDeliveryFilter,
  resolveOrderApiId,
} from '../../utils/normalizeOrders'
import CancelOrderModal from './CancelOrderModal'
import OrderDetailsView from './OrderDetailsView'

const orderStatusFilters = ['All Orders', 'Pending Delivery', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const deliveryStatusStyles = {
  'Pending Delivery': 'bg-amber-50 text-amber-700',
  Processing: 'bg-sky-50 text-sky-700',
  Shipped: 'bg-violet-50 text-violet-700',
  'Partially Shipped': 'bg-violet-50 text-violet-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
  'Partially Delivered': 'bg-teal-50 text-teal-700',
  Cancelled: 'bg-red-50 text-red-600',
  Refunded: 'bg-slate-100 text-slate-700',
}

const currency = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
})

function ProductStack({ images = [], remaining = 0, compact = false }) {
  const tileClass = compact ? 'size-11 border-[3px]' : 'size-14 border-4'
  const overlapClass = compact ? '-ml-2.5' : '-ml-3'
  const iconSize = compact ? 'size-4' : 'size-5'
  const countText = compact ? 'text-[0.625rem]' : 'text-xs'

  if (!images.length) {
    return (
      <span className={`flex ${tileClass} shrink-0 items-center justify-center rounded-lg border-white bg-slate-100 text-slate-400`}>
        <Package className={iconSize} strokeWidth={1.8} aria-hidden />
      </span>
    )
  }

  return (
    <div className="flex shrink-0 items-center">
      {images.slice(0, 2).map((image, index) => (
        <span key={`${image}-${index}`} className={`${index ? overlapClass : ''} relative flex ${tileClass} overflow-hidden rounded-lg border-white bg-slate-100`}>
          <img src={image} alt="" className="size-full object-cover" />
        </span>
      ))}
      {remaining > 0 ? (
        <span className={`${overlapClass} flex ${tileClass} items-center justify-center rounded-lg border-white bg-slate-100 ${countText} font-bold text-slate-500`}>
          +{remaining}
        </span>
      ) : null}
    </div>
  )
}

function OrderStatusBadges({ order }) {
  const deliveryStatus = order.deliveryStatus || 'Pending Delivery'
  const deliveryStyle = deliveryStatusStyles[deliveryStatus] ?? 'bg-slate-100 text-slate-600'
  const summary = order.fulfillment?.summary

  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${deliveryStyle}`}>
        {deliveryStatus}
      </span>
      {summary ? (
        <span className="text-[0.65rem] font-medium text-slate-500">{summary}</span>
      ) : null}
    </span>
  )
}

function OrderActions({ order, onOpen, onTrack, viewMode }) {
  const deliveryStatus = order.deliveryStatus || 'Pending Delivery'
  const inProgressStatuses = ['Pending Delivery', 'Processing', 'Shipped', 'Partially Shipped', 'Partially Delivered']
  const isCancelled = deliveryStatus === 'Cancelled' || order.status === 'Cancelled'
  const canTrack = !isCancelled && (
    viewMode === 'cards'
      ? inProgressStatuses.includes(deliveryStatus)
      : inProgressStatuses.includes(deliveryStatus) || deliveryStatus === 'Delivered'
  )
  const showInfo = viewMode === 'list' && isCancelled
  const isCompact = viewMode === 'cards'

  const actionClass = isCompact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-xs'

  return (
    <div className={`flex w-full flex-wrap items-center gap-2 ${isCompact ? 'sm:w-auto' : 'sm:w-auto sm:justify-end'}`}>
      {canTrack ? (
        <button
          type="button"
          onClick={() => onTrack(order)}
          className={`group/track inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white font-bold text-slate-700 shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:translate-y-0 sm:flex-none ${actionClass}`}
        >
          <Truck className="size-3.5 shrink-0 text-slate-500 transition-colors group-hover/track:text-slate-700" strokeWidth={2.2} aria-hidden />
          Track order
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onOpen(order.id)}
        className={`group/details inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full font-bold transition-all hover:-translate-y-px active:translate-y-0 sm:flex-none ${actionClass} ${
          showInfo
            ? 'border border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
            : 'bg-auth-primary text-white shadow-[0_10px_20px_-8px_rgba(199,59,45,0.65)] ring-1 ring-white/20 hover:bg-auth-primary-hover hover:shadow-[0_14px_24px_-8px_rgba(199,59,45,0.75)]'
        }`}
      >
        {showInfo ? 'View Info' : 'View Details'}
        <ArrowRight
          className="size-3.5 shrink-0 transition-transform duration-200 group-hover/details:translate-x-0.5"
          strokeWidth={2.4}
          aria-hidden
        />
      </button>
    </div>
  )
}

function OrderCard({ order, onOpen, onTrack }) {
  const orderNumber = formatOrderNumber(order.id, { withHash: true })

  return (
    <article className="min-w-0 w-full max-w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-5 py-3.5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:px-6 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">
              Order <span className="tabular-nums">{orderNumber}</span>
            </h3>
            <OrderStatusBadges order={order} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{order.date}</p>
        </div>
      </div>
      <div className="mt-3.5 flex min-w-0 items-center gap-3 sm:gap-4">
        <ProductStack images={order.images} remaining={Math.max(0, order.items - order.images.length)} />
        <div className="min-w-0 border-l border-slate-200 pl-4">
          <p className="truncate text-sm font-semibold text-slate-900">{order.title}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{order.delivery}</p>
        </div>
      </div>
      <div className="mt-3.5 flex flex-col items-start gap-2.5 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-medium text-slate-500">
            {order.items} {order.items === 1 ? 'Item' : 'Items'} • Total Amount
          </p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">{currency.format(order.amount)}</p>
          {order.discountTotal > 0 ? (
            <p className="mt-0.5 text-[0.7rem] font-semibold text-auth-primary">
              Saved {currency.format(order.discountTotal)}
            </p>
          ) : null}
        </div>
        <OrderActions order={order} onOpen={onOpen} onTrack={onTrack} viewMode="cards" />
      </div>
    </article>
  )
}

function OrderListRow({ order, onOpen, onTrack }) {
  const orderNumber = formatOrderNumber(order.id, { withHash: true })

  return (
    <article className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:border-auth-primary/25 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-950">
            Order <span className="tabular-nums">{orderNumber}</span>
          </h3>
          <OrderStatusBadges order={order} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{order.date}</p>
        <div className="mt-4 grid min-w-0 gap-5 border-t border-slate-100 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:grid-cols-[minmax(16rem,1.25fr)_minmax(9rem,0.6fr)_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <ProductStack images={order.images} remaining={Math.max(0, order.items - order.images.length)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{order.title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{order.delivery}</p>
            </div>
          </div>
          <div className="md:justify-self-start lg:justify-self-auto">
            <p className="text-[0.68rem] font-medium text-slate-500">
              {order.items} {order.items === 1 ? 'Item' : 'Items'} • Total Amount
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">{currency.format(order.amount)}</p>
            {order.discountTotal > 0 ? (
              <p className="mt-0.5 text-[0.7rem] font-semibold text-auth-primary">
                Saved {currency.format(order.discountTotal)}
              </p>
            ) : null}
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <OrderActions order={order} onOpen={onOpen} onTrack={onTrack} viewMode="list" />
          </div>
        </div>
      </div>
    </article>
  )
}

function SkeletonBlock({ className = '' }) {
  return <div className={`rounded bg-slate-200 ${className}`} />
}

function OrderCardSkeleton() {
  return (
    <article className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-5 py-3.5 sm:px-6 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-3.5 flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="flex shrink-0 items-center">
          <SkeletonBlock className="size-14 rounded-lg" />
          <SkeletonBlock className="-ml-3 size-14 rounded-lg ring-4 ring-white" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 border-l border-slate-100 pl-4">
          <SkeletonBlock className="h-4 w-4/5 max-w-56" />
          <SkeletonBlock className="h-3 w-2/5 max-w-36" />
        </div>
      </div>
      <div className="mt-3.5 flex flex-col items-start gap-2.5 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-6 w-24" />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <SkeletonBlock className="h-9 flex-1 rounded-full sm:w-28 sm:flex-none" />
          <SkeletonBlock className="h-9 flex-1 rounded-full sm:w-32 sm:flex-none" />
        </div>
      </div>
    </article>
  )
}

function OrdersListSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading orders">
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:mt-6 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden min-w-0 flex-1 gap-2 sm:flex">
            {['w-20', 'w-32', 'w-24', 'w-20', 'w-24', 'w-24'].map((width, index) => (
              <SkeletonBlock key={index} className={`h-8 shrink-0 rounded-full ${width}`} />
            ))}
          </div>
          <SkeletonBlock className="h-9 w-full rounded-xl sm:hidden" />
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <SkeletonBlock className="hidden h-9 w-40 rounded-xl sm:block" />
            <SkeletonBlock className="h-11 w-[5.25rem] rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function OrderDetailsSkeleton() {
  return (
    <section className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading order details">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-12" />
        <SkeletonBlock className="size-3.5 rounded-full" />
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="size-3.5 rounded-full" />
        <SkeletonBlock className="h-4 w-28" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-7 w-48 sm:h-8" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <SkeletonBlock className="h-10 w-40 rounded-lg" />
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <SkeletonBlock className="size-9 rounded-full" />
              <SkeletonBlock className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden h-11 bg-slate-100 sm:block" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-t border-slate-100 px-4 py-5 first:border-t-0 sm:first:border-t">
            <SkeletonBlock className="size-16 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/5 max-w-64" />
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
            <div className="hidden space-y-2 sm:block">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
          </div>
        ))}
        <div className="space-y-3 border-t border-slate-200 px-4 py-4">
          <div className="flex justify-between">
            <SkeletonBlock className="h-3.5 w-20" />
            <SkeletonBlock className="h-3.5 w-16" />
          </div>
          <div className="flex justify-between">
            <SkeletonBlock className="h-3.5 w-16" />
            <SkeletonBlock className="h-3.5 w-12" />
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-4 w-36" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-16 rounded-xl" />
          <SkeletonBlock className="h-16 rounded-xl" />
        </div>
      </div>
    </section>
  )
}

function OrdersErrorState({ message, onRetry }) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-2xl border border-red-200 bg-white px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Package className="size-7" strokeWidth={1.8} aria-hidden />
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-950">Couldn&apos;t load orders</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message ?? 'Something went wrong while fetching your orders. Please try again.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white"
        >
          Try again
        </button>
      ) : null}
    </section>
  )
}

function OrdersNoResultsState({ onClearFilters }) {
  return (
    <section className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:min-h-64">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Search className="size-6" strokeWidth={1.8} aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">No matching orders</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Nothing matched your current search or filter. Try a different status or clear your filters.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-5 inline-flex rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-auth-primary hover:text-auth-primary"
      >
        Clear filters
      </button>
    </section>
  )
}

function OrdersEmptyState() {
  return (
    <section className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-14 text-center sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-red-50/80 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 left-8 size-40 rounded-full bg-amber-50/80 blur-2xl" aria-hidden />

      <div className="relative mx-auto flex size-20 items-center justify-center rounded-[1.35rem] bg-linear-to-br from-red-50 to-white shadow-[0_12px_40px_rgba(199,59,45,0.12)] ring-1 ring-red-100">
        <ShoppingBag className="size-9 text-auth-primary" strokeWidth={1.7} aria-hidden />
      </div>

      <h3 className="relative mt-6 text-2xl font-bold tracking-tight text-slate-950">No orders yet</h3>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
        When you place an order, it will appear here so you can track delivery, view details, and manage your purchases.
      </p>

      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex min-w-44 items-center justify-center rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-auth-primary-hover"
        >
          Start shopping
        </Link>
        <Link
          to="/cart"
          className="inline-flex min-w-44 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-auth-primary hover:text-auth-primary"
        >
          View cart
        </Link>
      </div>
    </section>
  )
}

function OrdersToolbar({ filter, onFilterChange, viewMode, onViewModeChange }) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:mt-6 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div
          className="hidden min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none sm:flex [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter orders by status"
        >
          {orderStatusFilters.map((item) => {
            const active = filter === item

            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(item)}
                className={`shrink-0 snap-start rounded-full px-3.5 py-2 text-xs font-bold transition sm:px-4 ${
                  active
                    ? 'bg-auth-primary text-white shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-auth-primary/30 hover:bg-red-50 hover:text-auth-primary'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        <label className="flex w-full min-w-0 items-center gap-2 sm:hidden">
          <span className="shrink-0 text-xs font-bold text-slate-600">Status:</span>
          <select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"
            aria-label="Filter orders by status"
          >
            {orderStatusFilters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <label className="hidden items-center gap-2 sm:flex">
            <span className="shrink-0 text-xs font-bold text-slate-600">Status:</span>
            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              className="h-9 min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"
              aria-label="Filter orders by status"
            >
              {orderStatusFilters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
            aria-label="Order view"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              aria-pressed={viewMode === 'cards'}
              aria-label="Cards view"
              title="Cards view"
              className={`inline-flex size-9 items-center justify-center rounded-lg transition ${
                viewMode === 'cards' ? 'bg-red-50 text-auth-primary' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Grid2X2 className="size-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
              title="List view"
              className={`inline-flex size-9 items-center justify-center rounded-lg transition ${
                viewMode === 'list' ? 'bg-red-50 text-auth-primary' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <List className="size-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrdersList({ ordersQuery }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All Orders')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('cards')

  const openOrderTracking = (order) => {
    navigate(`/account/orders/${order.id}#order-tracking`)
  }

  const orders = useMemo(
    () => normalizeOrdersResponse(ordersQuery.data),
    [ordersQuery.data],
  )

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus = orderMatchesDeliveryFilter(order, filter)
        const needle = search.trim().toLowerCase()
        return matchesStatus && (!needle || `${order.id} ${order.title} ${order.delivery}`.toLowerCase().includes(needle))
      }),
    [filter, orders, search],
  )

  useEffect(() => {
    if (ordersQuery.isError) {
      notify.fromError(ordersQuery.error, 'Unable to load orders')
    }
  }, [ordersQuery.error, ordersQuery.isError])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const clearFilters = () => {
    setFilter('All Orders')
    setSearch('')
  }

  return (
    <section>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition hover:text-auth-primary">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-slate-900">Orders</span>
      </nav>

      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Orders</h2>
          <p className="mt-2 text-sm text-slate-500">Track, view and manage all your orders in one place.</p>
        </div>
        {ordersQuery.isPending ? (
          <div className="h-10 w-full animate-pulse rounded-full bg-slate-200 lg:max-w-md" aria-hidden />
        ) : orders.length > 0 ? (
          <label className="flex h-10 w-full min-w-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 shadow-[0_6px_24px_rgba(15,23,42,0.05)] sm:px-4 lg:max-w-md">
            <Search className="size-3.5 shrink-0 text-slate-500" />
            <span className="sr-only">Search orders</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders…"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm"
            />
          </label>
        ) : null}
      </div>

      {ordersQuery.isPending ? (
        <OrdersListSkeleton />
      ) : ordersQuery.isError ? (
        <OrdersErrorState
          message={ordersQuery.error?.message}
          onRetry={() => ordersQuery.refetch()}
        />
      ) : orders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <>
          <OrdersToolbar
            filter={filter}
            onFilterChange={setFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {visibleOrders.length ? (
            <div className={`mt-5 grid gap-4 sm:gap-5 ${viewMode === 'cards' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {visibleOrders.map((order) => (
                viewMode === 'cards' ? (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpen={(orderId) => navigate(`/account/orders/${orderId}`)}
                    onTrack={openOrderTracking}
                  />
                ) : (
                  <OrderListRow
                    key={order.id}
                    order={order}
                    onOpen={(orderId) => navigate(`/account/orders/${orderId}`)}
                    onTrack={openOrderTracking}
                  />
                )
              ))}
            </div>
          ) : (
            <OrdersNoResultsState onClearFilters={clearFilters} />
          )}
        </>
      )}
    </section>
  )
}

function OrderDetails({ id, ordersQuery, onCancelRequest }) {
  const orders = useMemo(
    () => normalizeOrdersResponse(ordersQuery.data),
    [ordersQuery.data],
  )
  const order = findOrderById(orders, id)

  useEffect(() => {
    if (window.location.hash === '#order-tracking') {
      window.requestAnimationFrame(() => {
        document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }

    window.scrollTo(0, 0)
  }, [id])

  if (ordersQuery.isPending) {
    return <OrderDetailsSkeleton />
  }

  if (ordersQuery.isError) {
    return (
      <OrdersErrorState
        message={ordersQuery.error?.message}
        onRetry={() => ordersQuery.refetch()}
      />
    )
  }

  if (!order) {
    return <OrderDetailsNotFound id={id} />
  }

  return <OrderDetailsView order={order} onCancelRequest={onCancelRequest} />
}

function OrderDetailsNotFound({ id }) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-14 text-center sm:px-10 sm:py-16">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Package className="size-7" strokeWidth={1.8} aria-hidden />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-950">Order not found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        We couldn&apos;t find order{' '}
        <span className="font-semibold tabular-nums text-slate-800">
          {formatOrderNumber(id, { withHash: true })}
        </span>{' '}
        in your order history.
      </p>
      <Link
        to="/account/orders"
        className="mt-8 inline-flex rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white"
      >
        Back to orders
      </Link>
    </section>
  )
}

export default function AccountOrdersPanel() {
  const { pathname } = useLocation()
  const ordersQuery = useOrdersQuery()
  const cancelMutation = useCancelOrderMutation()
  const [cancelTarget, setCancelTarget] = useState(null)
  const id = pathname
    .split('/account/orders/')[1]
    ?.split('/')[0]
    ?.split('?')[0]

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return

    try {
      await cancelMutation.mutateAsync(resolveOrderApiId(cancelTarget.raw))
      notify.success(`Order ${formatOrderNumber(cancelTarget.id, { withHash: true })} was cancelled successfully`)
      setCancelTarget(null)
    } catch (error) {
      notify.fromError(error, 'Unable to cancel order')
    }
  }

  return (
    <>
      {id ? (
        <OrderDetails
          id={decodeURIComponent(id)}
          ordersQuery={ordersQuery}
          onCancelRequest={setCancelTarget}
        />
      ) : (
        <OrdersList ordersQuery={ordersQuery} />
      )}

      <CancelOrderModal
        order={cancelTarget}
        isPending={cancelMutation.isPending}
        onClose={() => {
          if (!cancelMutation.isPending) {
            setCancelTarget(null)
          }
        }}
        onConfirm={handleCancelConfirm}
      />
    </>
  )
}
