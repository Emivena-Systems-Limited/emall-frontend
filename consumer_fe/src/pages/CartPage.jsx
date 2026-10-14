import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Bookmark,
  Check,
  Loader2,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { formatCedi } from '../utils/formatCurrency'
import { calculateOrderTotal, computeCartOrderTotals } from '../utils/checkoutTotals'
import { selectCartItems, selectCartSyncStatus, selectGuestCartId, selectSavedCartItems } from '../store/slices/cartSlice'
import { useCartActions } from '../hooks/useCartActions'
import { useAuthenticatedCart } from '../hooks/useAuthenticatedCart'
import { useGuestCart } from '../hooks/useGuestCart'
import { isValidGuestCartId } from '../utils/guestCartId'
import { notify } from '../lib/notify'
import { collectSelectedCartItemIds, persistCheckoutCartItemIds } from '../utils/checkoutCartItems'
import { formatCartItemOptions, resolveCartItemDisplayImage } from '../utils/normalizeCart'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { useLatestProducts } from '../hooks/useLatestProducts'
import { getPromotionsFilterHref, PROMOTION_FILTER_FLASH_SALES } from '../constants/categoryQuickFilters'
import CartRecommendationSection from '../components/cart/CartRecommendationSection'
import CartPageSkeleton from '../components/cart/CartPageSkeleton'

const clampQuantity = (value) => Math.max(1, value)
const CART_RAIL_LIMIT = 6

function listingKeys(product) {
  return [product?.backendId, product?.id, product?.href]
    .filter((value) => value != null && value !== '')
    .map(String)
}

function takeUnseen(products, seen, limit = CART_RAIL_LIMIT) {
  const next = []

  for (const product of products) {
    const keys = listingKeys(product)
    if (!keys.length || keys.some((key) => seen.has(key))) continue
    next.push(product)
    keys.forEach((key) => seen.add(key))
    if (next.length >= limit) break
  }

  return next
}

function resolveProductHref(item) {
  return item.href?.replace(/^\/products\//, '/') ?? '/'
}

async function shareCartItem(item) {
  const productPath = resolveProductHref(item)
  const url = new URL(productPath, window.location.origin).href
  const shareData = {
    title: item.name,
    text: `Check out ${item.name} on EZ-Stores!`,
    url,
  }

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(url)
      notify.success('Product link copied to clipboard!')
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(url)
        notify.success('Product link copied to clipboard!')
      } catch {
        notify.error('Could not copy link to clipboard')
      }
    }
  }
}

function resolveOptionLabel(item) {
  const label = formatCartItemOptions(item)
  if (!label || /^default$/i.test(label)) return 'Color: Default'
  return label
}

function lineTotalFor(item) {
  const quantity = Math.max(1, Number(item.quantity) || 1)
  const stored = Number(item.displaySubtotal)
  if (Number.isFinite(stored) && stored >= 0) return stored
  return (Number(item.price) || 0) * quantity
}

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-0.5">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={value <= 1}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-6 text-center text-xs font-semibold tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:text-slate-800"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function ItemActions({ saved = false, showSaveForLater = true, onDelete, onSave, onShare, isSavingWishlist = false }) {
  const actionClass = 'inline-flex cursor-pointer items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-wait disabled:opacity-60 sm:px-2.5'

  return (
    <div className="flex flex-wrap items-center max-md:w-full max-md:justify-between">
      <button type="button" onClick={onDelete} className={`${actionClass} max-md:pl-0 sm:pl-0`}>
        <Trash2 className="size-3.5" strokeWidth={1.75} />
        Remove
      </button>
      {showSaveForLater ? (
        <>
          <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
          <button type="button" onClick={onSave} disabled={isSavingWishlist} className={actionClass}>
            <Bookmark className="size-3.5" strokeWidth={1.75} />
            {isSavingWishlist ? 'Saving…' : saved ? 'Add to cart' : 'Save for Later'}
          </button>
        </>
      ) : null}
      <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
      <button type="button" onClick={onShare} className={`${actionClass} max-md:pr-0`}>
        <Share2 className="size-3.5" strokeWidth={1.75} />
        Share
      </button>
    </div>
  )
}

function CartItemPrice({ lineTotal, unitPrice }) {
  return (
    <div className="min-w-20 text-right">
      <p className="text-base font-bold tabular-nums text-slate-950 sm:text-lg">
        {formatCedi(lineTotal)}
      </p>
      <p className="mt-0.5 text-xs tabular-nums text-slate-500">
        {formatCedi(unitPrice)} each
      </p>
    </div>
  )
}

function CartItemRow({
  item,
  selected,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
  showSaveForLater = true,
  readOnlyQuantity = false,
  selectable = true,
  isSavingWishlist = false,
}) {
  const optionLabel = resolveOptionLabel(item)
  const displayImage = resolveCartItemDisplayImage(item)
  const productHref = resolveProductHref(item)
  const quantity = Math.max(1, Number(item.quantity) || 1)
  const lineTotal = lineTotalFor(item)
  const unitPrice = Number(item.price) || 0

  const quantityControl = readOnlyQuantity ? (
    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold tabular-nums text-slate-900">
      {quantity}
    </span>
  ) : (
    <QuantityStepper value={quantity} onChange={onQuantityChange} />
  )

  const actions = (
    <ItemActions
      saved={saved}
      showSaveForLater={showSaveForLater}
      onDelete={onDelete}
      onSave={onSave}
      onShare={() => shareCartItem(item)}
      isSavingWishlist={isSavingWishlist}
    />
  )

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-3.5 py-4 shadow-sm shadow-slate-200/40 sm:px-5 sm:py-6">
      <div className="flex items-start gap-3 sm:gap-5">
        {selectable ? (
          <label className="group relative mt-8 hidden size-5 shrink-0 cursor-pointer items-center justify-center sm:mt-10 sm:inline-flex">
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => onSelect(event.target.checked)}
              aria-label={`Select ${item.name}`}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex size-4.5 items-center justify-center rounded-[0.3rem] border-2 border-slate-300 bg-white transition-colors duration-200 group-hover:border-nav-red peer-checked:border-nav-red peer-checked:bg-nav-red peer-focus-visible:ring-2 peer-focus-visible:ring-nav-red/35 peer-focus-visible:ring-offset-2"
            >
              <Check
                className={`size-3 stroke-3 text-white transition-opacity duration-150 ${
                  selected ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </span>
          </label>
        ) : null}
        <Link to={productHref} aria-label={item.name} className="shrink-0">
          <img
            src={displayImage}
            alt=""
            className="size-[4.5rem] rounded-xl bg-slate-50 object-contain sm:size-28 sm:rounded-2xl"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0">
            <Link
              to={productHref}
              className="block text-sm font-semibold leading-snug text-slate-950 line-clamp-2 wrap-anywhere hover:text-nav-red sm:text-base"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-slate-500">{optionLabel}</p>
            {item.freeDelivery ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-600">
                <Truck className="size-3" strokeWidth={2} />
                Free Shipping
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
            {quantityControl}
            <CartItemPrice lineTotal={lineTotal} unitPrice={unitPrice} />
          </div>

          <div className="mt-auto hidden items-end justify-between gap-5 pt-5 sm:flex">
            {actions}
            <div className="flex shrink-0 items-center justify-end gap-5">
              {quantityControl}
              <CartItemPrice lineTotal={lineTotal} unitPrice={unitPrice} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 sm:hidden">
        {actions}
      </div>
    </article>
  )
}

function CartItemList({
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
  showSaveForLater = true,
  readOnlyQuantity = false,
  selectable = true,
  savingWishlistId = null,
  clearLabel,
  onClear,
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item) => (
        <CartItemRow
          key={item.key ?? item.id}
          item={item}
          saved={saved}
          showSaveForLater={showSaveForLater}
          readOnlyQuantity={readOnlyQuantity}
          selectable={selectable}
          selected={selectedIds.has(item.id)}
          onSelect={(checked) => onSelect(item.id, checked)}
          onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
          onDelete={() => onDelete(item.id)}
          onSave={() => onSave(item.id)}
          isSavingWishlist={savingWishlistId === item.id}
        />
      ))}
      {onClear ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-nav-red hover:text-nav-red"
          >
            {clearLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ItemTable({
  title,
  subtitle,
  headerAction,
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
  showSaveForLater = true,
  readOnlyQuantity = false,
  selectable = true,
  clearLabel,
  onClear,
  savingWishlistId = null,
  showHeader = true,
}) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`

  return (
    <section className="min-w-0" aria-labelledby={showHeader ? headingId : undefined}>
      {showHeader ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="text-lg font-bold text-slate-950 sm:text-xl">
              {title}
            </h2>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          </div>
          {headerAction}
        </div>
      ) : null}

      <CartItemList
        items={items}
        selectedIds={selectedIds}
        onSelect={onSelect}
        onQuantityChange={onQuantityChange}
        onDelete={onDelete}
        onSave={onSave}
        saved={saved}
        showSaveForLater={showSaveForLater}
        readOnlyQuantity={readOnlyQuantity}
        selectable={selectable}
        savingWishlistId={savingWishlistId}
        clearLabel={clearLabel}
        onClear={onClear}
      />
    </section>
  )
}

function CartBreadcrumb() {
  const linkClass = 'cursor-pointer text-slate-400 transition-colors hover:text-slate-700'

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
        <li>
          <Link to="/" className={linkClass}>Home</Link>
        </li>
        <li aria-hidden="true" className="text-slate-300">/</li>
        <li>
          <Link to="/products" className={linkClass}>Products</Link>
        </li>
        <li aria-hidden="true" className="text-slate-300">/</li>
        <li aria-current="page" className="text-slate-500">Shopping Cart</li>
      </ol>
    </nav>
  )
}

function CartSectionHeader({ title, numberOfItems=0 }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
    <h2 className="text-lg font-bold text-slate-950 sm:text-xl">{title}</h2>
    <span className="text-xs text-slate-500 p-1 bg-gray-100 rounded-full">{numberOfItems} items</span>
    </div>
  )
}

function CartWithSummaryLayout({ cartHeader, cartItems, summary, savedSection }) {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-stretch lg:gap-x-6">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">{cartHeader}</div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">{cartItems}</div>
        <div className="mt-5 min-w-0 lg:col-start-2 lg:row-start-2 lg:mt-0">
          <div className="lg:sticky lg:top-[7.75rem]">{summary}</div>
        </div>
      </div>
      {savedSection}
    </div>
  )
}

const summaryAssurances = [
  { icon: ShieldCheck, label: 'Secure Payment' },
  { icon: RotateCcw, label: '30 Day Returns' },
  { icon: Truck, label: 'Fast Delivery' },
]

function CartSummary({
  itemCount,
  listSubtotal,
  discountTotal,
  totals,
  total,
  isLoadingTotals = false,
  hasSelectedItems,
  onOpenDelivery,
  onProceedCheckout,
}) {
  const { deliveryFee, freeDelivery } = totals
  const netDelivery = Math.max(0, Number(deliveryFee) - Number(freeDelivery))
  const isFreeDelivery = netDelivery === 0
  const itemLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>
        {isLoadingTotals && (
          <Loader2 className="size-3.5 animate-spin text-nav-red" aria-label="Updating totals" />
        )}
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Subtotal ({itemLabel})</dt>
          <dd className="font-medium tabular-nums text-slate-900">{formatCedi(listSubtotal)}</dd>
        </div>
        {discountTotal > 0 ? (
          <div className="flex items-center justify-between gap-4 text-emerald-700">
            <dt>Product Savings</dt>
            <dd className="font-medium tabular-nums">-{formatCedi(discountTotal)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Shipping</dt>
          <dd className={isFreeDelivery ? 'font-semibold text-emerald-700' : 'font-medium tabular-nums text-slate-900'}>
            {isFreeDelivery ? 'Free' : formatCedi(netDelivery)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <span className="text-sm font-bold text-slate-950">Estimated Total</span>
        <span className="text-xl font-bold tabular-nums text-slate-950">{formatCedi(total)}</span>
      </div>
      <button
        type="button"
        onClick={onProceedCheckout}
        disabled={!hasSelectedItems}
        className="mt-5 hidden h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-nav-red text-sm font-semibold text-white transition-colors hover:bg-nav-red-deep disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
      >
        <Lock className="size-3.5" strokeWidth={2.25} />
        Proceed to Checkout
      </button>
      <ul className="mt-4 hidden grid-cols-3 gap-2 lg:grid">
        {summaryAssurances.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label} className="text-center">
              <Icon className="mx-auto size-3.5 text-slate-500" strokeWidth={1.75} />
              <p className="mt-1 text-[0.5625rem] leading-tight text-slate-500">{item.label}</p>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 hidden flex-wrap items-center gap-1.5 lg:flex">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] text-slate-600">Card</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.625rem] font-medium text-amber-800">Mobile</span>
        <span className="text-[0.625rem] text-slate-400">All major cards accepted</span>
      </div>
      <button
        type="button"
        onClick={onOpenDelivery}
        className="mt-3 hidden cursor-pointer text-[0.6875rem] font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-800 lg:inline"
      >
        Delivery information
      </button>
    </aside>
  )
}

function EmptyCartState() {
  return (
    <section className="bg-white px-4 py-14 text-center sm:px-6 sm:py-18 lg:py-20">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-red-50 text-auth-primary shadow-sm ring-1 ring-red-100 sm:size-28">
          <ShoppingBag className="size-11 sm:size-13" strokeWidth={1.8} />
        </span>
        <h2 className="mt-6 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
          Your cart is empty!
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Browse our categories and discover our best deals.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-auth-primary px-7 text-sm font-bold text-white shadow-sm transition-colors hover:bg-auth-primary-hover"
        >
          Start Shopping
        </Link>
      </div>
    </section>
  )
}

function MobileCheckoutBar({
  itemCount,
  discountTotal = 0,
  total,
  hasSelectedItems,
  onProceedCheckout,
}) {
  if (!hasSelectedItems) return null

  const itemLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {itemLabel}
            {discountTotal > 0 ? (
              <>
                {' · '}
                <span className="font-medium text-emerald-600">Save {formatCedi(discountTotal)}</span>
              </>
            ) : null}
          </p>
          <p className="truncate text-xl font-bold tabular-nums text-slate-950">{formatCedi(total)}</p>
        </div>
        <button
          type="button"
          onClick={onProceedCheckout}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-nav-red px-5 text-sm font-semibold text-white hover:bg-nav-red-deep"
        >
          <Lock className="size-3.5" strokeWidth={2.25} />
          Checkout
        </button>
      </div>
    </div>
  )
}

function DeliveryModal({ open, onClose, onProceedCheckout }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-5 sm:px-4 sm:py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-6">
          <h2 className="text-xl font-bold text-slate-950 sm:text-3xl">Delivery Information</h2>
          <button type="button" onClick={onClose} aria-label="Close delivery information">
            <X className="size-7 text-black sm:size-9" strokeWidth={2.6} />
          </button>
        </div>

        <div className="grid gap-5 pt-5 text-slate-950 sm:gap-6 sm:pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Delivery Method</h3>
              <p className="mt-1 text-sm text-slate-500">Method of delivery used by seller</p>
            </div>
            <span className="inline-flex h-10 items-center justify-center bg-black px-4 text-sm font-bold text-white sm:h-11">
              Uber
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Driver Name</h3>
              <p className="mt-1 text-sm text-slate-500">Name of delivery driver</p>
            </div>
            <p className="text-sm font-bold text-slate-700 sm:text-base">Victor Mensah</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Phone Number</h3>
              <p className="mt-1 text-sm text-slate-500">Contact driver via displayed number</p>
            </div>
            <p className="text-sm font-bold text-slate-700 sm:text-base">0244123456</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
            <div>
              <h3 className="text-base font-bold sm:text-lg">Expected Delivery Date</h3>
              <p className="mt-1 text-sm text-slate-500">
                Estimated day product is expected to be delivered
              </p>
            </div>
            <p className="text-sm font-bold text-slate-700 sm:text-right sm:text-base">
              Estimated Delivery (1 - 2 days)
              <span className="mt-0.5 block font-normal text-slate-500">(23 - 25 June)</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-600 sm:w-auto sm:px-10"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onProceedCheckout}
            className="w-full rounded-full bg-auth-primary px-6 py-3 text-center text-sm font-bold text-white sm:w-auto sm:px-10"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  )
}

function SavedForLaterSection() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const savedItems = useSelector(selectSavedCartItems)
  const { restoreSavedItem, deleteSaved, clearSaved } = useCartActions()

  if (!isAuthenticated || savedItems.length === 0) return null

  return (
    <ItemTable
      title="Saved For Later"
      subtitle="Items you saved for later"
      items={savedItems}
      saved
      selectable={false}
      showSaveForLater
      readOnlyQuantity
      selectedIds={new Set()}
      onSelect={() => {}}
      onQuantityChange={() => {}}
      onDelete={deleteSaved}
      onSave={restoreSavedItem}
      clearLabel="Clear saved items"
      onClear={clearSaved}
    />
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const { data: landingData } = useLandingPageData()
  const { data: latestProducts } = useLatestProducts()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const guestCartId = useSelector(selectGuestCartId)
  const syncStatus = useSelector(selectCartSyncStatus)
  const cartSyncReady = syncStatus !== 'syncing'

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  
  const authenticatedCartQuery = useAuthenticatedCart({
    enabled: isAuthenticated && cartSyncReady,
    strategy: 'replace',
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const guestCartQuery = useGuestCart({
    enabled: !isAuthenticated && cartSyncReady && isValidGuestCartId(guestCartId),
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const cartQuery = isAuthenticated ? authenticatedCartQuery : guestCartQuery
  const isLoadingCart = !cartSyncReady || cartQuery.isLoading || cartQuery.isFetching

  const {
    updateQuantity,
    deleteItem,
    selectItem,
    saveItem,
  } = useCartActions()
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [savingWishlistId, setSavingWishlistId] = useState(null)

  const handleSaveToWishlist = async (itemId) => {
    setSavingWishlistId(itemId)
    try {
      await saveItem(itemId)
    } finally {
      setSavingWishlistId(null)
    }
  }

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items],
  )

  const orderAmounts = useMemo(
    () => computeCartOrderTotals(items),
    [items],
  )

  const cartRails = useMemo(() => {
    const recommended = normalizeLandingProducts(landingData?.recommended_products, {
      prefix: 'recommended',
    })
    const flashSales = normalizeLandingProducts(landingData?.flash_sales, {
      prefix: 'flash-sale',
      isHot: true,
    })
    const bestSellers = normalizeLandingProducts(landingData?.best_sellers, {
      prefix: 'best-seller',
    })
    const randomProducts = normalizeLandingProducts(landingData?.random_products, {
      prefix: 'random',
    })
    const newArrivals = normalizeLandingProducts(latestProducts, {
      prefix: 'new-arrival',
    })
    const discounted = recommended.filter((product) => (
      Number(product.compareAt) > Number(product.price) && Number(product.price) > 0
    ))
    // Dedupe across rails only — products stay listed after they are added to cart.
    const seen = new Set()

    return {
      deals: takeUnseen(flashSales.length ? flashSales : discounted, seen),
      related: takeUnseen(recommended, seen),
      other: takeUnseen([...randomProducts, ...bestSellers, ...newArrivals], seen),
      dealsHref: flashSales.length
        ? getPromotionsFilterHref(PROMOTION_FILTER_FLASH_SALES)
        : '/promotions',
    }
  }, [landingData, latestProducts])

  const orderTotals = {
    tax: 0,
    deliveryFee: 0,
    freeDelivery: 0,
    couponDiscount: 0,
  }
  const orderTotal = calculateOrderTotal(orderAmounts.payableTotal, orderTotals)

  const handleProceedCheckout = () => {
    if (selectedItems.length === 0) {
      notify.error('Select at least one item to checkout.')
      return
    }

    const cartItemIds = collectSelectedCartItemIds(selectedItems)
    if (cartItemIds.length === 0 || cartItemIds.length !== selectedItems.length) {
      notify.error('Those items are not ready for checkout yet. Please try again.')
      return
    }

    persistCheckoutCartItemIds(cartItemIds)
    navigate('/checkout', { state: { cartItemIds } })
  }


  return (
    <SiteLayout>
      <main className={!isLoadingCart && items.length > 0 ? 'pb-24 lg:pb-0' : ''}>
        <div className="hidden border-y border-slate-200 bg-white sm:block">
          <Container className="py-2.5">
            <CartBreadcrumb />
          </Container>
        </div>
        <div className="bg-[#f4f4f5] py-4 sm:py-6 lg:bg-white lg:py-8">
        <Container className="min-w-0 space-y-5 sm:space-y-8">
          {isLoadingCart ? (
            <CartPageSkeleton rows={Math.max(2, Math.min(items.length || 3, 4))} />
          ) : items.length === 0 ? (
            <div className="min-w-0 space-y-6 sm:space-y-8">
              <section className="min-w-0">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Shopping Cart</h2>
                </div>
                <EmptyCartState />
              </section>
              <SavedForLaterSection />
            </div>
          ) : (
            <CartWithSummaryLayout
              cartHeader={(
                <CartSectionHeader
                  title="Shopping Cart"
                  numberOfItems={items.length}
                />
                
              )}
              cartItems={(
                <div className="min-w-0">
                  <CartItemList
                    items={items}
                    showSaveForLater
                    selectedIds={new Set(items.filter((item) => item.selected !== false).map((item) => item.id))}
                    onSelect={selectItem}
                    onQuantityChange={updateQuantity}
                    onDelete={deleteItem}
                    onSave={handleSaveToWishlist}
                    savingWishlistId={savingWishlistId}
                  />
                  <Link
                    to="/"
                    className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
                  >
                    <ArrowLeft className="size-4" strokeWidth={2.25} aria-hidden />
                    Continue Shopping
                  </Link>
                </div>
              )}
              summary={(
                <CartSummary
                  itemCount={orderAmounts.itemCount}
                  listSubtotal={orderAmounts.listSubtotal}
                  discountTotal={orderAmounts.discountTotal}
                  totals={orderTotals}
                  total={orderTotal}
                  isLoadingTotals={false}
                  hasSelectedItems={selectedItems.length > 0}
                  onOpenDelivery={() => setDeliveryOpen(true)}
                  onProceedCheckout={handleProceedCheckout}
                />
              )}
              savedSection={<SavedForLaterSection />}
            />
          )}

          <div className="hidden min-w-0 space-y-8 sm:space-y-10 lg:block">
            <CartRecommendationSection
              title="Best Deals From Seller"
              products={cartRails.deals}
              ctaHref={cartRails.dealsHref}
              ctaLabel="View Promotions"
            />
            <CartRecommendationSection
              title="Products Related to this item"
              products={cartRails.related}
              ctaHref="/products/recommended"
            />
            <CartRecommendationSection
              title="See Other Amazing Products"
              products={cartRails.other}
              ctaHref="/products/explore"
            />
          </div>
        </Container>
        </div>
      </main>

      {!isLoadingCart ? (
        <MobileCheckoutBar
          itemCount={orderAmounts.itemCount}
          discountTotal={orderAmounts.discountTotal}
          total={orderTotal}
          hasSelectedItems={selectedItems.length > 0 && items.length > 0}
          onProceedCheckout={handleProceedCheckout}
        />
      ) : null}

      <DeliveryModal
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        onProceedCheckout={() => {
          setDeliveryOpen(false)
          handleProceedCheckout()
        }}
      />
    </SiteLayout>
  )
}
