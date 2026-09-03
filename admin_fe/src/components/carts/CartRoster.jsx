import { Fragment, useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import CartIdentity, { CartItemRow, CartRosterSkeleton } from './CartIdentity'

export { CartRosterSkeleton }

function ShopperCell({ cart }) {
  if (cart.shopperId) {
    return (
      <div className="max-w-40">
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
    )
  }

  return <span className="text-sm text-slate-500">{cart.shopperName || 'Guest'}</span>
}

function CartItems({ cart }) {
  if (cart.items.length === 0) {
    return <p className="px-5 py-3 text-xs text-slate-500">Nothing has been added to this basket.</p>
  }

  return (
    <ul className="divide-y divide-slate-100 bg-slate-50/70">
      {cart.items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
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
        </li>
      ))}
    </ul>
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
  const [openId, setOpenId] = useState('')

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
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Basket</th>
              <th className="px-5 py-2.5">Shopper</th>
              <th className="px-5 py-2.5">Who</th>
              <th className="px-5 py-2.5 text-right">Total</th>
              <th className="w-12 px-5 py-2.5"><span className="sr-only">Items</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((cart) => {
              const expanded = openId === cart.id
              return (
                <Fragment key={cart.id}>
                  <tr className={expanded ? 'bg-slate-50/40' : 'hover:bg-slate-50/80'}>
                    <td className="px-5 py-3">
                      <CartIdentity cart={cart} />
                    </td>
                    <td className="px-5 py-3">
                      <ShopperCell cart={cart} />
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{cart.kindLabel}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {cart.itemsCount > 0 ? formatOrderMoney(cart.total) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setOpenId(expanded ? '' : cart.id)}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Hide basket items' : 'Show basket items'}
                      >
                        <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <CartItems cart={cart} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((cart) => {
          const expanded = openId === cart.id
          return (
            <li key={cart.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <CartIdentity cart={cart} />
                <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                  {cart.itemsCount > 0 ? formatOrderMoney(cart.total) : '—'}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <ShopperCell cart={cart} />
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? '' : cart.id)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  aria-expanded={expanded}
                >
                  {expanded ? 'Hide' : 'Items'}
                  <ChevronDown className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expanded ? (
                <div className="-mx-4 mt-3 border-t border-slate-100">
                  <CartItems cart={cart} />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
