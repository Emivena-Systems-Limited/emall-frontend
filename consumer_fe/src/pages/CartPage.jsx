import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { formatCedi } from '../utils/formatCurrency'
import { calculateOrderTotal, computeCartOrderTotals } from '../utils/checkoutTotals'
import { selectCartItems, selectSavedCartItems, selectCartSyncStatus, selectGuestCartId } from '../store/slices/cartSlice'
import { useCartActions } from '../hooks/useCartActions'
import { useAuthenticatedCart } from '../hooks/useAuthenticatedCart'
import { useGuestCart } from '../hooks/useGuestCart'
import { isValidGuestCartId } from '../utils/guestCartId'
import { notify } from '../lib/notify'
import CartSavedItemsEmptyState from '../components/cart/CartSavedItemsEmptyState'
import CartRecommendationSection from '../components/cart/CartRecommendationSection'

const clampQuantity = (value) => Math.max(1, value)

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

function formatCartItemOptions(item) {
  const variant = String(item.variant ?? '').trim()
  const storage = String(item.storage ?? '').trim()
  const parts = []

  if (variant && variant.toLowerCase() !== 'default') {
    parts.push(variant)
  }
  if (storage && storage !== variant && storage !== String(item.sku ?? '').trim()) {
    parts.push(storage)
  }

  return parts.join(' · ')
}

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-7 min-w-23 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={value <= 1}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-6 text-center text-xs font-bold tabular-nums text-auth-primary">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex size-5 items-center justify-center rounded-full text-auth-primary"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function ItemActions({ saved = false, showSaveForLater = true, onDelete, onSave, onShare }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] font-semibold">
      <button type="button" onClick={onDelete} className="underline hover:text-auth-primary">
        Delete
      </button>
      {showSaveForLater && (
        <button type="button" onClick={onSave} className="underline hover:text-auth-primary">
          {saved ? 'Add to cart' : 'Save For Later'}
        </button>
      )}
      <button type="button" onClick={onShare} className="underline hover:text-auth-primary">
        Share
      </button>
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
}) {
  const subtotal = item.displaySubtotal ?? item.price * item.quantity
  const optionLabel = formatCartItemOptions(item)
  const productHref = resolveProductHref(item)

  return (
    <article className="min-w-0 overflow-hidden border-b border-slate-200 px-3 py-4 last:border-b-0 sm:px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_120px_140px_110px] lg:items-center lg:gap-4 lg:px-5 lg:py-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
          aria-label={`Select ${item.name}`}
          className="mt-1 size-3.5 shrink-0 rounded border-slate-300 text-auth-primary focus:ring-auth-primary lg:mt-0"
        />
        <Link to={productHref} className="shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="size-16 rounded-md border border-red-100 object-cover sm:size-20"
          />
        </Link>
        <div className="min-w-0 flex-1 overflow-hidden">
          <Link
            to={productHref}
            className="block text-sm font-bold leading-snug text-slate-900 hover:text-auth-primary line-clamp-2 wrap-anywhere"
          >
            {item.name}
          </Link>
          {optionLabel && (
            <p className="mt-1 text-[0.625rem] leading-relaxed text-slate-500 wrap-anywhere">
              {optionLabel}
            </p>
          )}
          {item.freeDelivery && (
            <p className="mt-1 w-fit max-w-full rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[0.5625rem] font-bold text-emerald-700">
              Free Delivery
            </p>
          )}
          {item.seller && (
            <p className="mt-1 text-[0.5625rem] text-slate-500 wrap-anywhere">
              Sold by <span className="font-semibold text-slate-700">{item.seller}</span>
            </p>
          )}
          <ItemActions
            saved={saved}
            showSaveForLater={showSaveForLater}
            onDelete={onDelete}
            onSave={onSave}
            onShare={() => shareCartItem(item)}
          />
        </div>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-3 gap-2 border-t border-slate-100 pt-3 sm:gap-3 lg:mt-0 lg:contents lg:border-0 lg:pt-0">
      <div className="min-w-0">
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 lg:hidden">Price</p>
        <p className="text-sm font-extrabold text-slate-900">{formatCedi(item.price)}</p>
        {item.compareAt && item.compareAt > item.price && (
          <p className="mt-1 text-[0.5625rem] font-semibold text-slate-400 line-through">
            {formatCedi(item.compareAt)}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 lg:hidden">Quantity</p>
        {readOnlyQuantity ? (
          <p className="text-sm font-bold text-slate-900">{item.quantity}</p>
        ) : (
          <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
        )}
      </div>

      <div className="min-w-0 text-right lg:text-left">
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 lg:hidden">Subtotal</p>
        <p className="text-sm font-extrabold text-slate-900">{formatCedi(subtotal)}</p>
      </div>
      </div>
    </article>
  )
}

function ItemTable({
  title,
  subtitle,
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
  showSaveForLater = true,
  readOnlyQuantity = false,
  clearLabel,
  onClear,
}) {
  return (
    <section className="min-w-0" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <div className="mb-4">
        <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-lg font-bold text-slate-950 sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white">
        <div className="hidden bg-auth-primary px-4 py-3 text-sm font-bold text-white lg:grid lg:grid-cols-[minmax(0,1fr)_120px_140px_110px] lg:gap-4 lg:px-5">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
        </div>
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            saved={saved}
            showSaveForLater={showSaveForLater}
            readOnlyQuantity={readOnlyQuantity}
            selected={selectedIds.has(item.id)}
            onSelect={(checked) => onSelect(item.id, checked)}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
            onDelete={() => onDelete(item.id)}
            onSave={() => onSave(item.id)}
          />
        ))}
        {/* Clear cart button — hidden for now */}
        {onClear && (
          <div className="flex justify-end px-4 py-5 lg:px-5">
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-slate-400 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-auth-primary hover:text-auth-primary"
            >
              {clearLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

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
  const { tax, deliveryFee, freeDelivery } = totals
  const netDelivery = Math.max(0, Number(deliveryFee) - Number(freeDelivery))
  const isFreeDelivery = netDelivery === 0

  return (
    <aside className="rounded-xl bg-white p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Order Total</h2>
        {isLoadingTotals && (
          <Loader2 className="size-4 animate-spin text-auth-primary" aria-label="Updating totals" />
        )}
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Items</span>
          <span className="font-bold text-slate-900">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-bold text-slate-900">{formatCedi(listSubtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Discount</span>
            <span className="font-bold text-emerald-700">-{formatCedi(discountTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Tax</span>
          <span className="font-bold text-slate-900">{formatCedi(tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Delivery</span>
          {isFreeDelivery ? (
            <span className="font-bold text-emerald-700">Free</span>
          ) : (
            <span className="font-bold text-slate-900">{formatCedi(netDelivery)}</span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-base">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-extrabold text-slate-950">{formatCedi(total)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onProceedCheckout}
        disabled={!hasSelectedItems}
        className="mt-5 flex w-full items-center justify-center rounded-md bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        Proceed to checkout
      </button>
      <button
        type="button"
        onClick={onOpenDelivery}
        className="mt-3 block w-full text-right text-[0.625rem] font-semibold text-auth-primary underline"
      >
        View Delivery Information
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

function MobileCheckoutBar({ itemCount, total, hasSelectedItems, onProceedCheckout }) {
  if (!hasSelectedItems) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-slate-500">
            {itemCount} item{itemCount === 1 ? '' : 's'} selected
          </p>
          <p className="truncate text-lg font-extrabold text-slate-950">{formatCedi(total)}</p>
        </div>
        <button
          type="button"
          onClick={onProceedCheckout}
          className="shrink-0 rounded-lg bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover"
        >
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

export default function CartPage() {
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const savedItems = useSelector(selectSavedCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const guestCartId = useSelector(selectGuestCartId)
  const syncStatus = useSelector(selectCartSyncStatus)
  const cartSyncReady = syncStatus !== 'syncing'

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  
  useAuthenticatedCart({
    enabled: isAuthenticated && cartSyncReady,
    strategy: 'replace',
    refetchOnMount: 'always',
    staleTime: 0,
  })

  useGuestCart({
    enabled: !isAuthenticated && cartSyncReady && isValidGuestCartId(guestCartId),
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const {
    updateQuantity,
    deleteItem,
    selectItem,
    saveItem,
    restoreSavedItem,
    deleteSaved,
    clearSaved,
  } = useCartActions()
  const [savedSelectedIds, setSavedSelectedIds] = useState(() => new Set())
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items],
  )

  const orderAmounts = useMemo(
    () => computeCartOrderTotals(items),
    [items],
  )

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

    navigate('/checkout')
  }

  const savedItemsSection = isAuthenticated && savedItems.length > 0 ? (
    <ItemTable
      title="Saved items"
      subtitle="View your shopping cart online and checkout"
      items={savedItems}
      selectedIds={savedSelectedIds}
      onSelect={(itemId, checked) => {
        setSavedSelectedIds((current) => {
          const next = new Set(current)
          if (checked) next.add(itemId)
          else next.delete(itemId)
          return next
        })
      }}
      onQuantityChange={() => {}}
      onDelete={deleteSaved}
      onSave={restoreSavedItem}
      saved
      readOnlyQuantity
      clearLabel="Clear Saved Items"
      onClear={clearSaved}
    />
  ) : (
    <CartSavedItemsEmptyState />
  )

  return (
    <SiteLayout>
      <main className={`bg-[#f2f2f2] py-4 sm:py-8 ${items.length > 0 ? 'pb-24 lg:pb-8' : ''}`}>
        <Container className="min-w-0 space-y-6 sm:space-y-8">
          {items.length === 0 ? (
            <div className="min-w-0 space-y-6 sm:space-y-8">
              <EmptyCartState />
              {savedItemsSection}
            </div>
          ) : (
            /* Sticky scope: Order Total sticks only while cart + saved items are in view */
            <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
              <div className="min-w-0 space-y-6 sm:space-y-8">
                <ItemTable
                  title="Shopping Cart"
                  subtitle="View your shopping cart and proceed to checkout"
                  items={items}
                  showSaveForLater={isAuthenticated}
                  selectedIds={new Set(items.filter((item) => item.selected).map((item) => item.id))}
                  onSelect={selectItem}
                  onQuantityChange={updateQuantity}
                  onDelete={deleteItem}
                  onSave={saveItem}
                />
                {savedItemsSection}
              </div>

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
            </div>
          )}

          <div className="min-w-0 space-y-6 sm:space-y-8">
            <CartRecommendationSection
              title="Best Deals From Seller"
              description="Top offers from sellers in your cart will show up here soon."
              ctaHref="/promotions"
              ctaLabel="View Promotions"
            />

            <CartRecommendationSection
              title="Products Related to this item"
              description="Related picks based on your cart will appear here once product data is ready."
            />

            <CartRecommendationSection
              title="See Other Amazing Products"
              description="More products to explore will land here. Browse the store while we prepare them."
              ctaHref="/categories"
              ctaLabel="Browse Categories"
            />
          </div>
        </Container>
      </main>

      <MobileCheckoutBar
        itemCount={orderAmounts.itemCount}
        total={orderTotal}
        hasSelectedItems={selectedItems.length > 0 && items.length > 0}
        onProceedCheckout={handleProceedCheckout}
      />

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
