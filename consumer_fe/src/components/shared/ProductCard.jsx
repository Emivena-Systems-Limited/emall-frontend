import { useState } from 'react'
import { Loader2, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { formatCedi } from '../../utils/formatCurrency'
import { useCartActions } from '../../hooks/useCartActions'
import { useOptionalMiniCart } from '../../context/MiniCartContext'
import { STAR_EMPTY_FILL, STAR_FILL } from '../../constants/landingLayout'
import { isProductInCart, selectCartItems } from '../../store/slices/cartSlice'

function PriceDisplay({ price, compareAt }) {
  const [integer, decimal] = formatCedi(price).split('.')

  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-[1.125em] font-bold leading-tight text-slate-900 tabular-nums">
        {integer}
        {decimal && (
          <sup className="text-[0.65em] font-bold">.{decimal}</sup>
        )}
      </p>
      {compareAt && (
        <p className="mt-0.5 truncate text-[0.9375em] leading-tight text-slate-400 line-through tabular-nums">
          {formatCedi(compareAt)}
        </p>
      )}
    </div>
  )
}

function StarRating({ rating, count }) {
  if (!count || count <= 0) return null

  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <div className="flex items-center gap-[0.25em]">
      <span className="inline-flex items-center gap-px" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, normalizedRating - index))
          const fillWidth = `${fill * 100}%`

          return (
            <span key={index} className="relative inline-flex size-[0.875em]">
              <Star className="size-full" fill={STAR_EMPTY_FILL} strokeWidth={0} />
              {fill > 0 && (
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: fillWidth }}
                >
                  <Star className="size-full" fill={STAR_FILL} strokeWidth={0} />
                </span>
              )}
            </span>
          )
        })}
      </span>
      <span className="text-[0.875em] font-medium text-slate-500">
        ({count})
      </span>
    </div>
  )
}

export default function ProductCard({ product, hrefOverride, onAddToCart, disabledReason = '' }) {
  const { addToCart } = useCartActions()
  const miniCart = useOptionalMiniCart()
  const cartItems = useSelector(selectCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [isAdding, setIsAdding] = useState(false)
  const productHref = hrefOverride ?? product.href?.replace(/^\/products\//, '/')
  const productId = product.backendId ?? product.id
  const isInCart = isProductInCart(cartItems, product, { productId, variantId: null })

  const handleAddToCart = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated || isAdding || isInCart || disabledReason) return

    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    setIsAdding(true)
    try {
      const item = await addToCart(product, {
        productId: product.backendId ?? product.id,
        syncable: Boolean(product.backendId ?? product.id),
        quantity: 1,
        silentSuccess: true,
      })

      if (item) {
        miniCart?.openMiniCart()
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="@container group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-[clamp(0.6875rem,2.75cqi,1rem)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.15)]">
      <Link
        to={productHref}
        className="relative block aspect-square w-full min-w-0 overflow-hidden bg-white"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt=""
          className="size-full min-h-0 min-w-0 max-h-full max-w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-[0.5em] top-[0.5em] flex flex-col gap-[0.25em]">
          {product.discountPercent != null && (
            <span className="rounded px-[0.5em] py-[0.125em] text-[0.75em] font-bold tracking-wide text-slate-900 bg-[#f5d020]">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isHot && (
            <span className="rounded px-[0.5em] py-[0.125em] text-[0.75em] font-bold tracking-wide text-white bg-auth-primary">
              HOT
            </span>
          )}
          {product.compareAt && product.discountPercent == null && !product.isHot && (
            <span className="rounded-full bg-auth-primary px-[0.5em] py-[0.125em] text-[0.75em] font-bold tracking-wide text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-[0.375em] p-[0.75em]">
        <Link to={productHref} className="block min-w-0">
          <h3 className="truncate text-[1.05em] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-auth-primary">
            {product.name}
          </h3>
          <p className="mt-[0.125em] truncate text-[0.875em] text-slate-500">
            {product.variant}
          </p>
        </Link>

        <StarRating rating={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex min-w-0 items-end justify-between gap-[0.5em] pt-[0.25em]">
          <PriceDisplay price={product.price} compareAt={product.compareAt} />

          <span className="group/cart relative flex shrink-0">
            <button
              type="button"
              aria-busy={isAdding}
              aria-label={
                disabledReason
                  ? disabledReason
                  : isInCart
                  ? `${product.name} is already in cart`
                  : isAdding
                    ? `Adding ${product.name} to cart`
                    : `Add ${product.name} to cart`
              }
              disabled={!isAuthenticated || isAdding || isInCart || Boolean(disabledReason)}
              onClick={handleAddToCart}
              className={`flex size-[2.25em] shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed ${
                isAdding
                  ? 'border-auth-primary bg-auth-primary text-white'
                  : !isAuthenticated || isInCart || disabledReason
                    ? 'border-slate-200 bg-slate-100 text-slate-400 shadow-none'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-auth-primary hover:bg-auth-primary hover:text-white'
              }`}
            >
              {isAdding ? (
                <Loader2 className="size-[1em] animate-spin" aria-hidden="true" />
              ) : (
                <ShoppingCart className="size-[1em]" strokeWidth={2} />
              )}
            </button>
            {(isInCart || disabledReason) && (
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-30 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[0.6875rem] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover/cart:opacity-100 group-focus-within/cart:opacity-100"
              >
                {disabledReason || 'Already in cart'}
              </span>
            )}
          </span>
        </div>
      </div>
    </article>
  )
}
