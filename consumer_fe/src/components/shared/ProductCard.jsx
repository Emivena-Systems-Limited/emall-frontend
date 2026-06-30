import { ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { formatCedi } from '../../utils/formatCurrency'
import { useCartActions } from '../../hooks/useCartActions'

function PriceDisplay({ price, compareAt }) {
  const [integer, decimal] = formatCedi(price).split('.')

  return (
    <div className="flex items-start gap-2">
      <span className="text-base font-bold leading-tight text-slate-900">
        {integer}
        {decimal && (
          <sup className="text-[0.6rem] font-bold">.{decimal}</sup>
        )}
      </span>
      {compareAt && (
        <span className="mt-0.5 text-[0.6875rem] text-slate-400 line-through">
          {formatCedi(compareAt)}
        </span>
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
      <span className="text-[0.625rem] font-medium text-slate-500 sm:text-[0.6875rem]">
        ({count})
      </span>
    </div>
  )
}

export default function ProductCard({ product, hrefOverride, onAddToCart }) {
  const { addToCart } = useCartActions()
  const productHref = hrefOverride ?? product.href?.replace(/^\/products\//, '/')

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.15)]">
      <Link
        to={productHref}
        className="relative block aspect-square w-full overflow-hidden bg-slate-50"
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
            <span className="rounded px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-slate-900 bg-[#f5d020]">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isHot && (
            <span className="rounded px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-white bg-auth-primary">
              HOT
            </span>
          )}
          {product.compareAt && product.discountPercent == null && !product.isHot && (
            <span className="rounded-full bg-auth-primary px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <Link to={productHref} className="block min-w-0">
          <h3 className="truncate text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-auth-primary sm:text-[0.9375rem]">
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-[0.6875rem] text-slate-500 sm:text-xs">
            {product.variant}
          </p>
        </Link>

        <StarRating rating={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <PriceDisplay price={product.price} compareAt={product.compareAt} />

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(e) => {
              e.preventDefault()
              if (onAddToCart) {
                onAddToCart(product)
                return
              }

              addToCart(product)
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-auth-primary hover:bg-auth-primary hover:text-white sm:size-9"
          >
            <ShoppingCart className="size-3.5 sm:size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  )
}
