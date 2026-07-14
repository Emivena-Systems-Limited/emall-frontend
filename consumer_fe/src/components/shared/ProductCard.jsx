import { useState } from 'react'
import { Loader2, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { formatCedi } from '../../utils/formatCurrency'
import { useCartActions } from '../../hooks/useCartActions'
import { useOptionalMiniCart } from '../../context/MiniCartContext'

function PriceDisplay({ price, compareAt }) {
  const [integer, decimal] = formatCedi(price).split('.')

  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-base font-bold leading-tight text-slate-900 tabular-nums">
        {integer}
        {decimal && (
          <sup className="text-[0.6rem] font-bold">.{decimal}</sup>
        )}
      </p>
      {compareAt && (
        <p className="mt-0.5 truncate text-sm leading-tight text-slate-400 line-through tabular-nums">
          {formatCedi(compareAt)}
        </p>
      )}
    </div>
  )
}

function StarRating({ rating, count }) {
  if (!count || count <= 0) return null

  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-[1px]">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < full
          const half = !filled && i === full && hasHalf
          return (
            <span key={i} className="relative inline-flex size-3.5 sm:size-[0.9375rem]">
              <Star
                className="size-full text-slate-200"
                fill="currentColor"
                strokeWidth={0}
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                >
                  <Star
                    className="size-full text-[#f59e0b]"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span className="text-xs font-medium text-slate-500 sm:text-sm">
        ({count})
      </span>
    </div>
  )
}

export default function ProductCard({ product, hrefOverride, onAddToCart }) {
  const { addToCart } = useCartActions()
  const miniCart = useOptionalMiniCart()
  const [isAdding, setIsAdding] = useState(false)
  const productHref = hrefOverride ?? product.href?.replace(/^\/products\//, '/')

  const handleAddToCart = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    if (isAdding) return

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
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.15)]">
      <Link
        to={productHref}
        className="relative block aspect-square w-full overflow-hidden bg-white"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt=""
          className="size-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.discountPercent != null && (
            <span className="rounded px-2 py-0.5 text-xs font-bold tracking-wide text-slate-900 bg-[#f5d020]">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isHot && (
            <span className="rounded px-2 py-0.5 text-xs font-bold tracking-wide text-white bg-auth-primary">
              HOT
            </span>
          )}
          {product.compareAt && product.discountPercent == null && !product.isHot && (
            <span className="rounded-full bg-auth-primary px-2 py-0.5 text-xs font-bold tracking-wide text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <Link to={productHref} className="block min-w-0">
          <h3 className="truncate text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-auth-primary sm:text-base">
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
            {product.variant}
          </p>
        </Link>

        <StarRating rating={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex min-w-0 items-end justify-between gap-2 pt-1">
          <PriceDisplay price={product.price} compareAt={product.compareAt} />

          <button
            type="button"
            aria-busy={isAdding}
            aria-label={
              isAdding
                ? `Adding ${product.name} to cart`
                : `Add ${product.name} to cart`
            }
            disabled={isAdding}
            onClick={handleAddToCart}
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed sm:size-9 ${
              isAdding
                ? 'border-auth-primary bg-auth-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-auth-primary hover:bg-auth-primary hover:text-white'
            }`}
          >
            {isAdding ? (
              <Loader2 className="size-3.5 animate-spin sm:size-4" aria-hidden="true" />
            ) : (
              <ShoppingCart className="size-3.5 sm:size-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
