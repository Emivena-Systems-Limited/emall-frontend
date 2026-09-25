import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import CartIdentity, { CartItemRow, CartKindBadge, CartRosterSkeleton } from './CartIdentity'

export { CartRosterSkeleton }

function itemsLabel(count) {
  if (count === 1) return '1 item'
  return `${formatCount(count)} items`
}

function ShopperCell({ cart }) {
  if (cart.shopperId) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <CartKindBadge cart={cart} />
        <div className="min-w-0 max-w-44">
          <OverflowTooltip text={cart.shopperName}>
            <Link
              to={`/users/${encodeURIComponent(cart.shopperId)}`}
              className="block w-full truncate whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-brand"
            >
              {cart.shopperName}
            </Link>
          </OverflowTooltip>
          {cart.shopperEmail ? (
            <p className="mt-0.5 truncate text-xs text-slate-400">{cart.shopperEmail}</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <CartKindBadge cart={cart} />
      <span className="text-sm text-slate-500">Browsing without an account</span>
    </div>
  )
}

function CartLine({ item }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {item.productId ? (
        <Link
          to={`/products/${encodeURIComponent(item.productId)}`}
          className="min-w-0 flex-1 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
        >
          <CartItemRow item={item} />
        </Link>
      ) : (
        <div className="min-w-0 flex-1">
          <CartItemRow item={item} />
        </div>
      )}
      <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
        {formatOrderMoney(item.lineTotal)}
      </p>
    </div>
  )
}

function CartCard({ cart, expanded, onToggle }) {
  const itemCount = Math.max(cart.itemsCount ?? 0, cart.items.length)
  const canExpand = itemCount > 1
  const panelId = `cart-panel-${cart.id}`
  const triggerId = `cart-trigger-${cart.id}`
  const onlyItem = cart.items[0]

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-shadow ${
        expanded ? 'border-slate-300 shadow-[0_18px_40px_rgba(15,23,42,0.07)]' : 'border-slate-200/80'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${cart.isGuest ? 'bg-sky-400' : 'bg-slate-800'}`}
      />
      <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
        {canExpand ? (
          <button
            type="button"
            id={triggerId}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-1 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-300 ${
                expanded
                  ? 'bg-brand-light text-brand ring-brand-muted'
                  : 'bg-slate-100 text-slate-500 ring-slate-200'
              }`}
            >
              <ChevronDown className={`size-4 transition-transform duration-300 ease-out motion-reduce:transition-none ${expanded ? '' : '-rotate-90'}`} />
            </span>
            <CartIdentity cart={cart} />
            <span
              className={`ml-auto hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 sm:inline-flex ${
                expanded
                  ? 'bg-brand-light text-brand ring-brand-muted'
                  : 'bg-slate-50 text-slate-600 ring-slate-200'
              }`}
            >
              {expanded ? 'Hide' : 'Show'} · {itemsLabel(itemCount)}
            </span>
          </button>
        ) : (
          <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 px-1">
            <span className="flex size-9 shrink-0 items-center justify-center">
              <span className="size-1.5 rounded-full bg-slate-300" aria-hidden="true" />
            </span>
            {onlyItem ? (
              <div className="min-w-0 flex-1">
                <CartLine item={onlyItem} />
              </div>
            ) : (
              <CartIdentity cart={cart} />
            )}
          </div>
        )}

        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-semibold tabular-nums text-slate-900">
            {itemCount > 0 ? formatOrderMoney(cart.total) : '—'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {cart.isGuest ? 'Guest basket' : 'Shopper basket'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 sm:hidden">
        <ShopperCell cart={cart} />
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-slate-900">
            {itemCount > 0 ? formatOrderMoney(cart.total) : '—'}
          </p>
          {canExpand ? (
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              {expanded ? 'Hide' : 'Show'} · {itemsLabel(itemCount)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="hidden items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 sm:flex">
        <ShopperCell cart={cart} />
        {canExpand ? (
          <span className="text-[11px] font-semibold text-slate-400">
            {itemsLabel(itemCount)} in the basket
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400">Single listing</span>
        )}
      </div>

      {canExpand ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!expanded}
          inert={!expanded}
          data-open={expanded ? 'true' : 'false'}
          className="category-accordion"
        >
          <div className="category-accordion-inner">
            <div className="category-accordion-body border-t border-slate-100 bg-slate-50/90 px-3 py-3 sm:px-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                In this basket
              </p>
              <ul className="space-y-2 border-l-2 border-brand/40 pl-3">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-dashed border-brand/25 bg-white px-3 py-2.5"
                  >
                    <CartLine item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default function CartRoster({
  items,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  status = 'active',
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggle = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (total === 0) {
    const emptyTitle = status === 'active' ? 'No open baskets' : 'No baskets yet'
    const emptyCopy = status === 'active'
      ? 'Open carts will appear here while shoppers are still adding listings.'
      : 'Carts will appear here once they are returned by the API.'

    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={ShoppingBag}
          title={emptyTitle}
          description={emptyCopy}
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Show open baskets
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="space-y-3">
        {items.map((cart) => (
          <CartCard
            key={cart.id}
            cart={cart}
            expanded={expandedIds.has(cart.id)}
            onToggle={() => toggle(cart.id)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        {totalPages > 1 ? (
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
        ) : null}
      </div>
    </section>
  )
}
