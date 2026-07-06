import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { Heart, Loader2, Minus, Plus, ShoppingBag, ShoppingCart, Star, X } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { cartRelatedProducts } from '../constants/cartProducts'
import { formatCedi } from '../utils/formatCurrency'
import { calculateOrderTotal, normalizeCartSummary } from '../utils/checkoutTotals'
import { selectCartItems, selectSavedCartItems } from '../store/slices/cartSlice'
import { useCartActions } from '../hooks/useCartActions'
import { useCartPageQueries } from '../hooks/useCartPageQueries'
import { extractCartRecommendations } from '../utils/normalizeCart'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'
import { notify } from '../lib/notify'

const STAR_FILL = '#F59E0B'
const STAR_EMPTY_FILL = '#E2E8F0'

const clampQuantity = (value) => Math.max(1, value)

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

function ItemActions({ saved = false, onDelete, onSave }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] font-semibold">
      <button type="button" onClick={onDelete} className="underline hover:text-auth-primary">
        Delete
      </button>
      <button type="button" onClick={onSave} className="underline hover:text-auth-primary">
        {saved ? 'Add to cart' : 'Save For Later'}
      </button>
      <button type="button" className="underline hover:text-auth-primary">
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
  readOnlyQuantity = false,
}) {
  const subtotal = item.displaySubtotal ?? item.price * item.quantity
  const optionLabel = formatCartItemOptions(item)
  const productHref = item.href?.replace(/^\/products\//, '/') ?? '/'

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
          {item.sku && (
            <p className="mt-1 truncate text-[0.5625rem] font-semibold uppercase tracking-wide text-slate-400">
              SKU: {item.sku}
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
          <ItemActions saved={saved} onDelete={onDelete} onSave={onSave} />
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
            readOnlyQuantity={readOnlyQuantity}
            selected={selectedIds.has(item.id)}
            onSelect={(checked) => onSelect(item.id, checked)}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
            onDelete={() => onDelete(item.id)}
            onSave={() => onSave(item.id)}
          />
        ))}
        <div className="flex justify-end px-4 py-5 lg:px-5">
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-slate-400 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-auth-primary hover:text-auth-primary"
          >
            {clearLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

function CartSummary({
  itemCount,
  subtotal,
  totals,
  total,
  isLoadingTotals = false,
  hasSelectedItems,
  onOpenDelivery,
  onProceedCheckout,
}) {
  const { tax, deliveryFee, freeDelivery } = totals

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
          <span className="font-bold text-slate-900">{formatCedi(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Tax</span>
          <span className="font-bold text-slate-900">{formatCedi(tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Delivery Fee</span>
          <span className="font-bold text-slate-900">{formatCedi(deliveryFee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Free Delivery</span>
          <span className="font-bold text-slate-400 line-through">{formatCedi(freeDelivery)}</span>
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

function RailProductCard({ product, onAddToCart }) {
  const fullStars = Math.floor(product.rating ?? 0)

  return (
    <article className="min-w-0">
      <Link to={product.href?.replace(/^\/products\//, '/') ?? '/cart'} className="group block">
        <span className="relative block aspect-[1.18] overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.freeDelivery !== false && (
            <span className="absolute left-2 top-2 rounded-sm bg-emerald-500 px-2 py-1 text-[0.5625rem] font-bold text-white">
              Free Delivery
            </span>
          )}
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-white">
            <Heart className="size-5" strokeWidth={2.2} />
          </span>
        </span>
        <span className="mt-2 block truncate text-xs font-bold text-slate-900">{product.name}</span>
        <span className="mt-1 block text-sm font-extrabold text-slate-950">{formatCedi(product.price)}</span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className="size-3"
                fill={index < fullStars ? STAR_FILL : STAR_EMPTY_FILL}
                strokeWidth={0}
              />
            ))}
            <span className="text-[0.625rem] text-slate-500">({product.reviewCount})</span>
          </div>
        ) : (
          <span className="text-[0.625rem] text-slate-400">No reviews</span>
        )}
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          className="flex h-7 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-auth-primary hover:bg-auth-primary hover:text-white"
        >
          <ShoppingCart className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </article>
  )
}

function ProductRail({ title, products, onAddToCart }) {
  if (products.length === 0) return null

  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl bg-white px-3 py-4 sm:px-4"
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
    >
      <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-lg font-bold text-slate-900 sm:text-xl">
        {title}
      </h2>
      <div className="mt-4 -mx-1 snap-x snap-mandatory overflow-x-auto px-1 pb-1 scrollbar-none [-ms-overflow-style:none] lg:overflow-visible lg:snap-none [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 lg:grid lg:grid-cols-5 lg:gap-4">
          {products.slice(0, 5).map((product) => (
            <div
              key={`${title}-${product.id}`}
              className="w-[calc(50%-0.375rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-auto lg:shrink"
            >
              <RailProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <Link
          to="/products"
          className="rounded-full border border-slate-500 px-6 py-2 text-xs font-bold text-slate-600 hover:border-auth-primary hover:text-auth-primary sm:px-8"
        >
          View More Products
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
  const {
    addToCart,
    updateQuantity,
    deleteItem,
    selectItem,
    clearAll,
    saveItem,
    restoreSavedItem,
    deleteSaved,
    clearSaved,
  } = useCartActions()
  const [savedSelectedIds, setSavedSelectedIds] = useState(() => new Set())
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  const { summaryQuery, recommendationsQuery } = useCartPageQueries()

  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items],
  )

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  )

  const selectedItemCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems],
  )

  useEffect(() => {
    if (summaryQuery.isError) {
      notify.fromError(summaryQuery.error, 'Live cart summary is unavailable. Showing estimates.')
    }
  }, [summaryQuery.error, summaryQuery.isError])

  const cartSummary = normalizeCartSummary(summaryQuery.data)
  const displayItemCount = cartSummary.itemCount ?? selectedItemCount
  const displaySubtotal = cartSummary.subtotal ?? subtotal
  const orderTotals = {
    tax: cartSummary.tax,
    deliveryFee: cartSummary.deliveryFee,
    freeDelivery: cartSummary.freeDelivery,
    couponDiscount: cartSummary.couponDiscount,
  }
  const orderTotal = cartSummary.total ?? calculateOrderTotal(displaySubtotal, orderTotals)

  const cartRecommendations = useMemo(
    () => extractCartRecommendations(recommendationsQuery.data),
    [recommendationsQuery.data],
  )

  const apiDealsProducts = useMemo(
    () => normalizeLandingProducts(cartRecommendations.bestSellers, { prefix: 'cart-deal' }),
    [cartRecommendations.bestSellers],
  )
  const apiRelatedProducts = useMemo(
    () => normalizeLandingProducts(cartRecommendations.related, { prefix: 'cart-related' }),
    [cartRecommendations.related],
  )
  const apiRecommendedProducts = useMemo(
    () => normalizeLandingProducts(cartRecommendations.recommended, { prefix: 'cart-recommended' }),
    [cartRecommendations.recommended],
  )

  const dealsProducts = apiDealsProducts.length > 0 ? apiDealsProducts : cartRelatedProducts
  const relatedProducts = apiRelatedProducts.length > 0
    ? apiRelatedProducts
    : apiRecommendedProducts.length > 0
      ? apiRecommendedProducts
      : cartRelatedProducts.slice(1)
  const amazingProducts = apiRecommendedProducts.length > 0
    ? apiRecommendedProducts
    : cartRelatedProducts.slice(2)

  const handleProceedCheckout = () => {
    if (selectedItems.length === 0) {
      notify.error('Select at least one item to checkout.')
      return
    }

    navigate('/checkout')
  }

  return (
    <SiteLayout>
      <main className={`overflow-x-hidden bg-[#f2f2f2] py-4 sm:py-8 ${items.length > 0 ? 'pb-24 lg:pb-8' : ''}`}>
        <Container className="min-w-0 space-y-6 sm:space-y-8">
          {items.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
              <div className="min-w-0">
              <ItemTable
                title="Shopping Cart"
                subtitle="View your shopping cart and proceed to checkout"
                items={items}
                selectedIds={new Set(items.filter((item) => item.selected).map((item) => item.id))}
                onSelect={selectItem}
                onQuantityChange={updateQuantity}
                onDelete={deleteItem}
                onSave={saveItem}
                clearLabel="Clear Cart"
                onClear={clearAll}
              />
              </div>

              <CartSummary
                itemCount={displayItemCount}
                subtotal={displaySubtotal}
                totals={orderTotals}
                total={orderTotal}
                isLoadingTotals={summaryQuery.isFetching && isAuthenticated}
                hasSelectedItems={selectedItems.length > 0}
                onOpenDelivery={() => setDeliveryOpen(true)}
                onProceedCheckout={handleProceedCheckout}
              />
            </div>
          )}

          {savedItems.length > 0 && (
            <ItemTable
              title="Saved Items"
              subtitle="Items you saved for later. Move them back to your cart when you're ready to buy."
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
          )}

          <ProductRail title="Best Deals From Seller" products={dealsProducts} onAddToCart={addToCart} />
          <ProductRail title="Products Related to this Item" products={relatedProducts} onAddToCart={addToCart} />
          <ProductRail title="See Other Amazing Products" products={amazingProducts} onAddToCart={addToCart} />
        </Container>
      </main>

      <MobileCheckoutBar
        itemCount={displayItemCount}
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
