import { Link } from 'react-router'
import { ExternalLink, Package, RefreshCw } from 'lucide-react'
import { buildViewProductPath } from '../../utils/orderProductNavigation'
import OrderStatusBadge from './OrderStatusBadge'

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function OrderItemPrice({ amount, compareAmount, align = 'right' }) {
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-0.5 ${alignClass}`}>
      <span className="text-sm font-bold tabular-nums text-slate-900">{formatMoney(amount)}</span>
      {compareAmount != null && compareAmount > amount ? (
        <span className="text-xs tabular-nums text-slate-400 line-through">{formatMoney(compareAmount)}</span>
      ) : null}
    </div>
  )
}

function OrderLineItemCard({ item, orderId, onUpdateItemStatus }) {
  const productHref = item.productId ? buildViewProductPath(item.productId, orderId) : null
  const metaParts = [item.brandName, item.categoryName].filter(Boolean)

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 transition-colors hover:border-slate-300 hover:bg-white lg:rounded-none lg:border-0 lg:border-b lg:border-slate-100 lg:bg-transparent lg:p-0 lg:py-4 lg:last:border-b-0 lg:hover:bg-slate-50/50">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(5rem,6rem)_minmax(6.5rem,7.5rem)_minmax(6.5rem,7.5rem)_minmax(7rem,8rem)_minmax(6.5rem,7.5rem)] lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          {item.image ? (
            <span className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
              <img src={item.image} alt="" className="size-full object-contain p-1.5" />
            </span>
          ) : (
            <span className="flex size-18 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
              <Package className="size-6" strokeWidth={1.5} aria-hidden />
            </span>
          )}

          <div className="min-w-0 flex-1 space-y-1.5">
            {productHref ? (
              <Link
                to={productHref}
                title={item.productName}
                className="group flex min-w-0 items-center gap-1.5 text-sm font-bold text-slate-900 transition hover:text-brand"
              >
                <span className="min-w-0 truncate">{item.productName}</span>
                <ExternalLink className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            ) : (
              <p className="truncate text-sm font-bold text-slate-900" title={item.productName}>
                {item.productName}
              </p>
            )}

            {metaParts.length ? (
              <p className="text-xs text-slate-500">{metaParts.join(' · ')}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {item.variantLabel ? (
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item.variantLabel}
                </span>
              ) : item.variantName ? (
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item.variantName}
                </span>
              ) : null}
            </div>

            <p className="font-mono text-[11px] text-slate-400">SKU {item.sku}</p>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:sr-only">Variant</p>
          <p className="text-sm text-slate-700">{item.variantLabel ?? item.variantName ?? '—'}</p>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Qty</span>
          <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-white px-2.5 py-1 text-sm font-bold tabular-nums text-slate-900 ring-1 ring-slate-200 lg:bg-slate-100 lg:ring-slate-200/80">
            {item.quantity}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Unit price</span>
          <OrderItemPrice amount={item.unitPrice} compareAmount={item.comparePrice} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Line total</span>
          <OrderItemPrice
            amount={item.totalPrice}
            compareAmount={item.comparePrice != null ? item.comparePrice * item.quantity : null}
          />
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Status</span>
          <OrderStatusBadge status={item.orderStatus} />
        </div>

        <div className="flex items-center justify-end lg:justify-end">
          {onUpdateItemStatus ? (
            <button
              type="button"
              onClick={() => onUpdateItemStatus(item)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand/30 hover:bg-brand-light/30 hover:text-brand"
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Update
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function OrderLineItems({ items, orderId, onUpdateItemStatus }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No items in this order</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">Line items will appear here once the order is loaded.</p>
      </div>
    )
  }

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const linesSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div>
      <div className="mb-3 hidden rounded-xl bg-slate-50 px-4 py-2.5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(5rem,6rem)_minmax(6.5rem,7.5rem)_minmax(6.5rem,7.5rem)_minmax(7rem,8rem)_minmax(6.5rem,7.5rem)] lg:gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Product</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Variant</span>
        <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Qty</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Unit price</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Line total</span>
        <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action</span>
      </div>

      <div className="space-y-3 lg:space-y-0">
        {items.map((item) => (
          <OrderLineItemCard
            key={item.id}
            item={item}
            orderId={orderId}
            onUpdateItemStatus={onUpdateItemStatus}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{items.length}</span>
          {' '}
          {items.length === 1 ? 'product' : 'products'}
          {' · '}
          <span className="font-semibold text-slate-800">{totalUnits}</span>
          {' '}
          {totalUnits === 1 ? 'unit' : 'units'}
        </p>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Items subtotal</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-950">{formatMoney(linesSubtotal)}</p>
        </div>
      </div>
    </div>
  )
}
