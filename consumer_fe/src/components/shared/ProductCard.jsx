import { useState } from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { STAR_EMPTY_FILL, STAR_FILL } from '../../constants/landingLayout'
import { formatCedi } from '../../utils/formatCurrency'
import { isProductInCart, selectCartItems } from '../../store/slices/cartSlice'
import PortaledHoverTooltip from './PortaledHoverTooltip'
import QuickAddToCartModal from '../product/QuickAddToCartModal'
import AddedToCartFlyout from '../product/AddedToCartFlyout'
import { LOCK_PURCHASE_ACTIONS, STORE_DELIVERY_ELIGIBILITY_ENABLED } from '../../config/featureFlags'
import { resolveAuthUserCity, resolveLocalDeliveryEligibility } from '../../utils/storefront'
import { addToWishlist } from '../../services/wishlistService'
import { notify } from '../../lib/notify'

function resolveDiscountPercent(price, compareAt, discountPercent) {
  const given = Number(discountPercent)
  if (Number.isFinite(given) && given > 0) return Math.round(given)

  const current = Number(price)
  const regular = Number(compareAt)
  if (!Number.isFinite(current) || !Number.isFinite(regular) || regular <= current || current <= 0) {
    return null
  }

  return Math.round(((regular - current) / regular) * 100)
}

function resolveInStock(product) {
  if (product?.inStock === false || product?.in_stock === false) return false
  if (product?.inStock === true || product?.in_stock === true) return true

  const qty = Number(
    product?.quantity
      ?? product?.stockCount
      ?? product?.available_quantity
      ?? product?.availableQuantity,
  )
  if (Number.isFinite(qty)) return qty > 0

  return true
}

function resolveMetaLabel(product) {
  const brand = String(product?.brand || product?.storeName || '').trim()
  const category = String(product?.subcategory || product?.category || '').trim()
  if (brand && category) return `${brand} - ${category}`
  return brand || category || ''
}

function StarRating({ rating, count, size = 'sm' }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0))
  const reviews = Number(count) || 0
  const starClass = size === 'md' ? 'size-4' : 'size-3.5'
  const countClass = size === 'md' ? 'text-xs' : 'text-[11px]'

  return (
    <div className={`flex items-center gap-1.5 ${size === 'md' ? 'h-5' : 'h-4'}`}>
      <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, value - index))

          return (
            <span key={index} className={`relative ${starClass}`} aria-hidden>
              <Star className={starClass} fill={STAR_EMPTY_FILL} strokeWidth={0} />
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={starClass} fill={STAR_FILL} strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </span>
      <span className={`leading-none text-slate-400 ${countClass}`}>({reviews})</span>
    </div>
  )
}

function PriceDisplay({ price, compareAt, discountPercent }) {
  const percent = resolveDiscountPercent(price, compareAt, discountPercent)

  return (
    <div className="flex h-5 min-w-0 items-baseline gap-1.5 overflow-hidden whitespace-nowrap">
      <span className="shrink-0 text-[13px] font-bold leading-none text-slate-950 tabular-nums">
        {formatCedi(price)}
      </span>
      {compareAt ? (
        <span className="min-w-0 truncate text-[11px] leading-none text-slate-400 line-through tabular-nums">
          {formatCedi(compareAt)}
        </span>
      ) : null}
      {percent ? (
        <span className="shrink-0 text-[11px] font-semibold leading-none text-nav-red">
          -{percent}%
        </span>
      ) : null}
    </div>
  )
}

const revealActionClass =
  'max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100'

export default function ProductCard({
  product,
  hrefOverride,
  onAddToCart,
  disabledReason = '',
  layout = 'grid',
}) {
  const cartItems = useSelector(selectCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.auth.user)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddMounted, setQuickAddMounted] = useState(false)
  const [addedSnapshot, setAddedSnapshot] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState(false)
  const productHref = hrefOverride ?? product.href?.replace(/^\/products\//, '/')
  const productId = product.backendId ?? product.id
  const userCity = resolveAuthUserCity(user)
  const deliveryEligible = !STORE_DELIVERY_ELIGIBILITY_ENABLED
    ? true
    : resolveLocalDeliveryEligibility(product.deliverySource ?? product, user)
  const locationBlocksPurchase = Boolean(
    isAuthenticated && STORE_DELIVERY_ELIGIBILITY_ENABLED && !deliveryEligible,
  )
  const effectiveDisabledReason = disabledReason
    || (locationBlocksPurchase
      ? `Not available in ${userCity || 'your location'}`
      : '')
  const cartLocked = Boolean(effectiveDisabledReason)
    || (LOCK_PURCHASE_ACTIONS && !isAuthenticated)
  const isInCart = isProductInCart(cartItems, product, { productId, variantId: null })
  const tooltipContent = cartLocked
    ? (effectiveDisabledReason || (isInCart ? 'Already in cart — add another option' : ''))
    : (isInCart ? 'Already in cart — add another option' : '')
  const metaLabel = resolveMetaLabel(product)
  const inStock = resolveInStock(product)

  const handleWishlist = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      notify.error('Please sign in to save items to your wishlist')
      return
    }

    const id = String(productId ?? '').trim()
    if (!id || savingWishlist) return

    setSavingWishlist(true)
    try {
      await addToWishlist({ product_id: id, product_variant_id: null })
      setWishlisted(true)
      notify.success(`${product.name} saved to wishlist`)
    } catch (error) {
      notify.fromError(error, 'Could not save item to your wishlist')
    } finally {
      setSavingWishlist(false)
    }
  }

  const handleAddToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (cartLocked) return

    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    setQuickAddMounted(true)
    setQuickAddOpen(true)
  }

  const modals = (
    <>
      {quickAddMounted ? (
        <QuickAddToCartModal
          open={quickAddOpen}
          product={product}
          onClose={() => setQuickAddOpen(false)}
          onAdded={(snapshot) => {
            setQuickAddOpen(false)
            setAddedSnapshot(snapshot ?? { name: product.name, image: product.image, price: product.price })
          }}
        />
      ) : null}
      <AddedToCartFlyout
        open={Boolean(addedSnapshot)}
        product={{ ...product, name: addedSnapshot?.name ?? product.name }}
        image={addedSnapshot?.image}
        brand={addedSnapshot?.brand}
        price={addedSnapshot?.price ?? product.price}
        variantLabel={addedSnapshot?.variantLabel}
        onClose={() => setAddedSnapshot(null)}
      />
    </>
  )

  if (layout === 'list') {
    return (
      <article className="group relative flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.22)] sm:gap-4 sm:p-4">
        <Link
          to={productHref}
          className="relative block size-[6.5rem] shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:size-36"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={product.image}
            alt=""
            className="size-full object-contain object-center p-2"
            loading="lazy"
          />
          {product.isHot ? (
            <span className="pointer-events-none absolute top-1.5 left-1.5 rounded bg-nav-red px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
              HOT
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          {metaLabel ? (
            <p className="truncate text-[11px] leading-none text-slate-400 sm:text-xs">
              {metaLabel}
            </p>
          ) : null}

          <Link to={productHref} className="mt-1.5 block min-w-0 sm:mt-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 sm:text-[0.9375rem] sm:leading-6">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1.5 sm:mt-2">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 sm:mt-2.5">
            <span className="text-base font-bold leading-none text-slate-950 tabular-nums sm:text-lg">
              {formatCedi(product.price)}
            </span>
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span className="size-1.5 rounded-full bg-slate-300" aria-hidden />
                Out of Stock
              </span>
            )}
          </div>

          <div className="mt-auto w-full pt-3 [&>span]:flex [&>span]:w-full">
            <PortaledHoverTooltip content={tooltipContent}>
              <button
                type="button"
                aria-label={
                  cartLocked && effectiveDisabledReason
                    ? effectiveDisabledReason
                    : `Choose options and add ${product.name} to cart`
                }
                disabled={cartLocked}
                onClick={handleAddToCart}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-nav-red px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-nav-red-deep disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <ShoppingCart className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                Add to Cart
              </button>
            </PortaledHoverTooltip>
          </div>
        </div>

        {modals}
      </article>
    )
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.28)]">
      <div className="relative overflow-clip">
        <Link
          to={productHref}
          className="relative block aspect-square w-full bg-white"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={product.image}
            alt=""
            className="size-full object-contain object-center p-3"
            loading="lazy"
          />
        </Link>

        {product.isHot ? (
          <span className="pointer-events-none absolute top-2 left-2 rounded bg-nav-red px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            HOT
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wishlisted ? `${product.name} is saved to your wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          disabled={savingWishlist}
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.16)] transition-all duration-200 hover:text-nav-red ${revealActionClass}`}
        >
          <Heart
            className={`size-4 ${wishlisted ? 'fill-nav-red text-nav-red' : ''}`}
            strokeWidth={2}
          />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-y-[calc(100%+2px)] md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-has-[:focus-visible]:pointer-events-auto md:group-has-[:focus-visible]:translate-y-0 max-md:pointer-events-auto [&>span]:flex [&>span]:w-full">
          <PortaledHoverTooltip content={tooltipContent}>
            <button
              type="button"
              aria-label={
                cartLocked && effectiveDisabledReason
                  ? effectiveDisabledReason
                  : `Choose options and add ${product.name} to cart`
              }
              disabled={cartLocked}
              onClick={handleAddToCart}
              className="flex h-7 w-full cursor-pointer items-center justify-center bg-nav-red text-xs font-semibold text-white transition-colors duration-200 hover:bg-nav-red-deep disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              + Add to Cart
            </button>
          </PortaledHoverTooltip>
        </div>
      </div>

      <div className="mt-auto flex min-w-0 flex-col gap-1.5 px-3 pt-3 pb-3.5">
        <Link to={productHref} className="block min-w-0">
          <h3 className="line-clamp-2 h-10 text-sm leading-5 font-medium text-slate-900">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <PriceDisplay
          price={product.price}
          compareAt={product.compareAt}
          discountPercent={product.discountPercent}
        />
      </div>

      {modals}
    </article>
  )
}
