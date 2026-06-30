import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { getProductBySlug, getRelatedProducts } from '../constants/productDetails'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getProductById } from '../services/landingPageService'
import { formatCedi } from '../utils/formatCurrency'
import { normalizeLandingProduct } from '../utils/normalizeLandingProducts'
import { notify } from '../lib/notify'
import { useCartActions } from '../hooks/useCartActions'
import { selectCartItems } from '../store/slices/cartSlice'

function Stars({ rating, size = 'size-4' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < full
        const halfFilled = !filled && index === full && half
        return (
          <span key={index} className={`relative inline-flex ${size}`}>
            <Star className="size-full text-slate-200" fill="currentColor" strokeWidth={0} />
            {(filled || halfFilled) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: halfFilled ? '50%' : '100%' }}>
                <Star className="size-full text-auth-primary" fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function ProductGallery({ product, activeImage, setActiveImage }) {
  const currentImage = activeImage || product.gallery[0]

  return (
    <div className="space-y-3">
      <div className="group overflow-hidden bg-white">
        <img
          src={currentImage}
          alt={product.title}
          className="aspect-square w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:aspect-[1.45] sm:object-cover motion-safe:group-hover:scale-110"
        />
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {product.gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`size-13 shrink-0 overflow-hidden border bg-white p-0.5 transition-colors sm:size-15 ${
              currentImage === image ? 'border-auth-primary' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src={image} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorSwatches({ product, selected, onSelect }) {
  if (!product.colors.length) return null

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-slate-950">Color: {selected}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
        {product.colors.map((color, index) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`border bg-white p-1 text-center transition-colors ${
              selected === color ? 'border-auth-primary' : 'border-slate-200'
            }`}
          >
            <img
              src={product.colorImages?.[color] ?? product.gallery[(index + 1) % product.gallery.length]}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <span className="mt-1 block text-[0.625rem] font-semibold text-slate-600">{color}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantGroup({ label, values, selected, onSelect }) {
  if (!values.length) return null

  return (
    <div className="pt-3">
      <p className="text-xs font-semibold text-slate-950">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`rounded-full border px-3 py-1.5 text-[0.625rem] font-semibold transition-colors ${
              selected === value
                ? 'border-slate-950 bg-white text-slate-950'
                : 'border-slate-200 bg-white text-slate-500 hover:border-auth-primary hover:text-auth-primary'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuantitySelector({ value, onChange, disabled }) {
  return (
    <div className="inline-flex h-10 min-w-30 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-auth-primary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex size-7 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

async function shareProduct(product) {
  const shareData = {
    title: product.title,
    text: `Check out ${product.title} on EZ-Stores!`,
    url: window.location.href,
  }

  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      notify.success('Product link copied to clipboard!')
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(window.location.href)
        notify.success('Product link copied to clipboard!')
      } catch (clipErr) {
        notify.error('Could not copy link to clipboard')
        console.error(clipErr)
      }
    }
  }
}

const fallbackReviewCards = [
  {
    id: 'review-1',
    name: 'Isaac Morgan',
    rating: 5,
    date: 'Jan 09, 2026',
    text: 'This item is exactly as described. The finishing feels solid and delivery was quick.',
  },
  {
    id: 'review-2',
    name: 'Akua Mensah',
    rating: 5,
    date: 'Jan 06, 2026',
    text: 'Good quality and comfortable to use every day. I would buy from this seller again.',
  },
  {
    id: 'review-3',
    name: 'Isaac Morgan',
    rating: 4,
    date: 'Jan 04, 2026',
    text: 'Looks nice and fits well. Packaging was clean and the product arrived safely.',
  },
  {
    id: 'review-4',
    name: 'Ama Boatemaa',
    rating: 5,
    date: 'Dec 29, 2025',
    text: 'The color and texture matched the photos. Great value for the price.',
  },
]

const fallbackRatingDistribution = [
  { label: 'Small', value: 7 },
  { label: 'True to size', value: 88 },
  { label: 'Large', value: 4 },
]

function ProductInfoPanel({
  product,
  setActiveImage,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  selectedCompatibleModel,
  setSelectedCompatibleModel,
  activeImage,
  activeVariant,
  activeSku,
  displayPriceInfo
}) {
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()
  const cartItems = useSelector(selectCartItems)
  const { addToCart } = useCartActions()
  const outOfStock = !product.inStock

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)
    const varImage = product.colorImages?.[newColor]
    if (varImage && setActiveImage) {
      setActiveImage(varImage)
    }
  }

  const isLowStock = !outOfStock && product.stockCount <= (product.lowStockThreshold ?? 10)
  const activeCartKey = [
    product.id,
    activeVariant?.id,
    activeSku,
  ].filter(Boolean).join(':')
  const isInCart = cartItems.some((item) => item.key === activeCartKey || (
    String(item.productId) === String(product.id) &&
    String(item.variantId ?? '') === String(activeVariant?.id ?? '') &&
    String(item.sku ?? '') === String(activeSku ?? '')
  ))

  const handleAddToCart = async () => {
    if (isInCart) {
      navigate('/cart')
      return
    }

    await addToCart(product, {
      quantity,
      price: displayPriceInfo.price,
      compareAt: displayPriceInfo.compareAt,
      variantId: activeVariant?.id,
      sku: activeSku,
      variant: selectedColor || selectedCompatibleModel || selectedSize || product.variant,
      size: selectedSize || selectedCompatibleModel || activeSku,
      image: activeImage || product.gallery?.[0] || product.image,
    })
  }

  return (
    <aside className="min-w-0 bg-white p-3 sm:p-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="break-words text-lg font-bold leading-snug text-slate-950">{product.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {product.reviewCount > 0 ? (
            <>
              <span className="font-bold text-slate-950">{product.rating.toFixed(1)}</span>
              <Stars rating={product.rating} size="size-3" />
              <Link to="#reviews" className="font-semibold text-blue-600 hover:underline">
                ({product.reviewCount.toLocaleString()})
              </Link>
            </>
          ) : (
            <span className="font-medium text-slate-500">No reviews yet</span>
          )}
          <span className="font-semibold text-slate-600">{product.salesCount.toLocaleString()} sold</span>
        </div>
        <p className="mt-1 text-[0.6875rem] font-semibold text-slate-600">{product.soldIndicator}</p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-slate-100 pt-3">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <span className="flex size-6 shrink-0 items-center justify-center rounded bg-red-50">
              <ShoppingCart className="size-3.5 text-auth-primary" strokeWidth={2} />
            </span>
            <Link to="/stores" className="shrink-0 text-xs font-bold text-blue-600 hover:underline">
              Visit the {product.storeName}
            </Link>
            <span className="min-w-0 flex-1 truncate text-[0.625rem] font-semibold text-slate-500">
              110 Followers | 150k+ Followers | {product.rating.toFixed(1)} ★
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-slate-300 px-4 py-1.5 text-[0.625rem] font-bold text-slate-800 transition-colors hover:bg-slate-50 sm:px-5"
          >
            Follow
          </button>
        </div>
      </div>

      <div className="space-y-2 py-3">
        <p className="w-fit rounded-sm bg-auth-primary px-2 py-1 text-[0.625rem] font-bold text-white">
          Limited time deal
        </p>
        <div className="flex flex-wrap items-end gap-2">
          {displayPriceInfo.discountPercent && (
            <span className="text-xl font-bold text-auth-primary">-{displayPriceInfo.discountPercent}%</span>
          )}
          <span className="text-2xl font-extrabold text-slate-950">{formatCedi(displayPriceInfo.price)}</span>
          {displayPriceInfo.compareAt && (
            <span className="pb-0.5 text-xs text-slate-400 line-through">{formatCedi(displayPriceInfo.compareAt)}</span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500">
          List Price:{' '}
          <span className={displayPriceInfo.compareAt ? 'line-through' : ''}>
            {displayPriceInfo.compareAt ? formatCedi(displayPriceInfo.compareAt) : formatCedi(displayPriceInfo.price)}
          </span>
        </p>
      </div>

      <ColorSwatches product={product} selected={selectedColor} onSelect={handleColorSelect} />
      
      {product.compatibleModels && product.compatibleModels.length > 0 && (
        <VariantGroup
          label="Compatible Model"
          values={product.compatibleModels}
          selected={selectedCompatibleModel}
          onSelect={setSelectedCompatibleModel}
        />
      )}

      {product.sizes.length > 0 && (
        <VariantGroup
          label={product.sizeGroupLabel ?? 'Size'}
          values={product.sizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />
      )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-950">Quantity</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
          <p className="text-[0.625rem] leading-4">
            <span className={outOfStock ? 'font-bold text-red-600' : isLowStock ? 'font-bold text-auth-primary' : 'font-bold text-emerald-600'}>
              {outOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stockCount} Items Left` : 'In Stock'}
            </span>
            <span className="block text-slate-500">
              {outOfStock ? 'Currently unavailable' : isLowStock ? "Don't miss it" : 'Available now'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2 sm:gap-3">
        <button
          type="button"
          disabled={outOfStock}
          className="rounded-full bg-auth-primary px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="rounded-full border border-auth-primary px-6 py-3 text-xs font-bold text-auth-primary transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isInCart ? 'View Cart' : 'Add to Cart'}
        </button>
      </div>

      <div className="mt-3 grid gap-1.5 text-[0.625rem] text-slate-500 min-[480px]:flex min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3">
        <span>Returns <b className="text-blue-600">30-day refund/replacement</b></span>
        <span>Payment <b className="text-blue-600">Secure transaction</b></span>
      </div>
    </aside>
  )
}

function KeyDetails({ product, activeSku }) {
  const detailsList = { ...product.keyDetails }
  if (activeSku) {
    detailsList['Model/SKU'] = activeSku
  }
  delete detailsList['Fulfillment']
  delete detailsList['fulfillment']
  delete detailsList['Status']
  delete detailsList['status']

  return (
    <section className="min-w-0 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-950">Key Details</h2>
        <button
          type="button"
          onClick={() => shareProduct(product)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-[0.6875rem] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Share2 className="size-3.5" strokeWidth={2.4} />
          Share
        </button>
      </div>
      <dl className="mt-2 grid gap-1 text-[0.6875rem] leading-4 text-slate-700">
        {Object.entries(detailsList).map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-1 sm:grid-cols-[11rem_1fr]">
            <dt className="font-bold">{key}:</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-4 text-sm font-bold text-slate-950">About this item</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-700">
        {product.about.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function ReviewSummary({ product }) {
  return (
    <section id="reviews" className="min-w-0 bg-white p-3 sm:p-4">
      <h2 className="text-base font-bold text-slate-950">Customer&apos;s Feedback</h2>
      <h3 className="mt-4 text-sm font-bold text-slate-950">Review this product</h3>
      <p className="mt-1 text-xs text-slate-600">Share your thoughts with other customers</p>
      <button className="mt-3 w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800" type="button">
        Write a customer review
      </button>

      {product.reviewCount > 0 ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-950">{product.reviewCount.toLocaleString()} reviews | {product.rating.toFixed(1)}</span>
            <Stars rating={product.rating} size="size-3" />
            <span className="rounded-sm bg-emerald-50 px-2 py-1 text-[0.5rem] font-bold text-emerald-700 sm:ml-auto">
              All ratings are by verified purchases
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {product.ratingDistribution.map((row) => (
              <div key={row.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-[0.625rem] text-slate-600">
                <span className="truncate">{row.label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full rounded-full bg-slate-950" style={{ width: `${row.value}%` }} />
                </span>
                <span className="text-right">{row.value}%</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-xs text-slate-500">No ratings yet for this product.</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {['Nice', 'Perfect Fitting', 'Comfy'].map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[0.625rem] font-semibold text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {product.reviews.map((review) => (
          <article key={review.id} className="border-t border-slate-200 pt-3">
            <div className="flex items-start gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                {review.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-950">{review.name}</h3>
                  <span className="text-[0.5625rem] text-slate-500">on {review.date}</span>
                </div>
                <Stars rating={review.rating} size="size-3" />
                <p className="mt-1 break-words text-[0.6875rem] leading-4 text-slate-700">{review.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-6 py-2 text-xs font-semibold text-slate-800">
          See All Reviews
        </button>
      </div>
    </section>
  )
}

function SellerShowcase({ product }) {
  return (
    <section className="bg-white p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-13 items-center justify-center rounded-full bg-red-50">
            <ShoppingCart className="size-6 text-auth-primary" />
          </span>
          <div>
            <h2 className="text-base font-bold text-blue-600">Visit the {product.storeName}</h2>
            <p className="text-xs text-slate-500">110 Followers | 150k+ Followers | {product.rating.toFixed(1)} ★</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Follow</button>
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Shop all items</button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        {product.gallery.slice(1, 5).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-square w-full bg-slate-100 object-cover" />
        ))}
      </div>
      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-7 py-2 text-xs font-semibold text-slate-800 sm:px-8 sm:py-2.5 sm:text-sm">See All</button>
      </div>
    </section>
  )
}

function RailProductCard({ product }) {
  const fullStars = Math.floor(product.rating)

  const productHref = product.href?.replace(/^\/products\//, '/')

  return (
    <article className="min-w-0">
      <Link to={productHref} className="block">
        <span className="relative block aspect-square overflow-hidden bg-slate-100">
          <img src={product.image} alt={product.name} className="size-full object-cover" loading="lazy" />
          {product.discountPercent != null && (
            <span className="absolute left-1 top-1 bg-yellow-300 px-1.5 py-0.5 text-[0.5rem] font-bold text-slate-900">
              {product.discountPercent}% OFF
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-[0.6875rem] font-bold text-slate-900">{product.name}</span>
        <span className="block text-[0.6875rem] font-extrabold text-slate-950">{formatCedi(product.price)}</span>
      </Link>
      <div className="mt-1 flex items-center justify-between gap-2">
        {product.reviewCount > 0 ? (
          <div className="flex min-w-0 items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-2.5 ${index < fullStars ? 'text-auth-primary' : 'text-slate-300'}`}
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
            <span className="ml-1 text-[0.5625rem] text-slate-500">({product.reviewCount})</span>
          </div>
        ) : (
          <span className="text-[0.5625rem] text-slate-400">No reviews</span>
        )}
        <Link
          to="/cart"
          aria-label={`Add ${product.name} to cart`}
          className="flex size-6 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        >
          <ShoppingCart className="size-3" strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  )
}

function HorizontalProductRail({ title, products, visibleCount }) {
  const railRef = useRef(null)
  const desktopAutoCols = visibleCount === 3
    ? 'lg:auto-cols-[calc((100%-1.5rem)/3)]'
    : 'lg:auto-cols-[calc((100%-3rem)/5)]'

  const scrollRail = (direction) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.85, 240),
      behavior: 'smooth',
    })
  }

  const handleRailKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollRail(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollRail(1)
    }
  }

  return (
    <section className="min-w-0 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <span className="text-xs font-semibold text-slate-600">Page 1 Of 50</span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          aria-label={`Previous ${title}`}
          className="absolute left-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-300 bg-white"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div
          ref={railRef}
          tabIndex={0}
          onKeyDown={handleRailKeyDown}
          aria-label={`${title} product carousel`}
          className={`grid auto-cols-[7rem] grid-flow-col grid-rows-1 gap-2 overflow-x-auto scroll-smooth px-8 pb-1 outline-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-auth-primary/40 min-[390px]:auto-cols-[7.5rem] sm:auto-cols-[9rem] sm:gap-3 ${desktopAutoCols} [&::-webkit-scrollbar]:hidden`}
        >
          {products.map((item) => (
            <div key={`${item.slug}-${title}`} className="min-w-0">
              <RailProductCard product={item} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollRail(1)}
          aria-label={`Next ${title}`}
          className="absolute right-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-300 bg-white"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

function ProductDescription({ product }) {
  const detailsList = { ...product.details }
  delete detailsList['SKU']
  delete detailsList['sku']
  delete detailsList['Sku']

  return (
    <section className="min-w-0 bg-white p-3 sm:p-5">
      <h2 className="text-base font-bold text-slate-950">Product description</h2>
      <div className="mt-5 divide-y divide-slate-300 border-y border-slate-300">
        {Object.entries(detailsList).map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="font-bold text-slate-950">{key}</dt>
            <dd className="break-words text-slate-700">{value}</dd>
          </div>
        ))}
        <div className="grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="font-bold text-slate-950">Description</dt>
          <dd className="space-y-4 break-words text-slate-700">
            <p>{product.description}</p>
            <div>
              <h3 className="font-bold text-slate-950">Key Features:</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Stylish design with a bold finish</li>
                <li>Durable construction for everyday protection</li>
                <li>Smooth feel and reliable grip</li>
                <li>Precise openings and comfortable handling</li>
              </ul>
            </div>
          </dd>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[12rem_1fr]">
        <h3 className="font-bold text-slate-950">Product Images</h3>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {product.gallery.slice(1).concat(product.gallery.slice(1, 3)).slice(0, 6).map((image, index) => (
            <img key={`${image}-description-${index}`} src={image} alt="" className="aspect-square w-full bg-slate-100 object-cover" />
          ))}
        </div>
      </div>
    </section>
  )
}

function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((m) => m && (m.key === key || m.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.products)) return value.products
  return []
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

function normalizeProductReviews(apiProduct) {
  const reviews = toArray(apiProduct.reviews).map((review, index) => ({
    id: review.id ?? `review-${index + 1}`,
    name: review.user?.name ?? review.customer_name ?? review.name ?? 'Customer',
    rating: toNumber(review.rating ?? review.stars, 5),
    date: formatReviewDate(review.created_at, review.date),
    text: review.comment ?? review.review ?? review.message ?? review.text ?? 'Good quality product.',
  }))

  return reviews.length ? reviews : fallbackReviewCards
}

function formatReviewDate(dateValue, fallback = 'Recent') {
  if (!dateValue) return fallback
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date)
}

function normalizeApiProductDetails(apiProduct) {
  const core = normalizeLandingProduct(apiProduct)
  if (!core) return null

  const metadata = toArray(apiProduct.metadata)
  const sku = apiProduct.sku || apiProduct.variants?.[0]?.sku || getMetadataValue(metadata, 'sku') || 'N/A'
  const quantity = toNumber(getMetadataValue(metadata, 'quantity'), 10)
  const lowStockThreshold = toNumber(getMetadataValue(metadata, 'low_stock_threshold'), 10)
  const inStock = quantity > 0

  // Build gallery
  const gallery = []
  if (Array.isArray(apiProduct.images)) {
    apiProduct.images.forEach(img => {
      if (img?.image_url) gallery.push(img.image_url)
    })
  }
  if (Array.isArray(apiProduct.variants)) {
    apiProduct.variants.forEach(v => {
      if (Array.isArray(v.images)) {
        v.images.forEach(img => {
          if (img?.image_url) gallery.push(img.image_url)
        })
      }
    })
  }
  if (gallery.length === 0) {
    gallery.push(core.image)
  }
  const uniqueGallery = [...new Set(gallery)]

  // Build colors and other variant groups from API variants
  const colorImages = {}
  const colors = []
  const otherVariantGroups = {}

  if (Array.isArray(apiProduct.variants)) {
    apiProduct.variants.forEach(v => {
      const attrs = v.attributes ?? {}
      const attrKeys = Object.keys(attrs)
      
      // Use the color attribute; fall back to top-level color or variant_name
      const colorKey = attrKeys.find(k => k.toLowerCase() === 'color')
      const colorVal = colorKey ? attrs[colorKey] : (v.color || v.variant_name)
      
      if (colorVal) {
        if (!colors.includes(colorVal)) {
          colors.push(colorVal)
        }
        const varImage = v.images?.[0]?.image_url || v.image_url || v.image
        if (varImage) {
          colorImages[colorVal] = varImage
        }
      }

      // Collect all non-color attributes as separate variant groups
      attrKeys.filter(k => k.toLowerCase() !== 'color').forEach(k => {
        if (!otherVariantGroups[k]) otherVariantGroups[k] = new Set()
        if (attrs[k]) otherVariantGroups[k].add(String(attrs[k]))
      })

      // Also check for a top-level size field
      const size = v.size || v.attributes?.size
      if (size) {
        if (!otherVariantGroups['size']) otherVariantGroups['size'] = new Set()
        otherVariantGroups['size'].add(String(size))
      }
    })
  }

  // Convert other variant groups to arrays with human-readable labels
  const extraVariantGroups = Object.entries(otherVariantGroups).map(([key, valSet]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    values: [...valSet],
  }))

  const uniqueColors = colors
  const uniqueSizes = extraVariantGroups[0]?.values ?? []
  const sizeGroupLabel = extraVariantGroups[0]?.label ?? 'Size'

  const compatibleModels = Array.isArray(apiProduct.variants)
    ? [...new Set(apiProduct.variants.map(v => v.variant_name).filter(Boolean))]
    : []

  // Strip HTML tags from description
  const rawDescription = apiProduct.description || ''
  const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim()
  const reviews = normalizeProductReviews(apiProduct)
  const explicitReviewCount = apiProduct.reviews_count ?? apiProduct.review_count ?? apiProduct.total_reviews
  const reviewCount = explicitReviewCount !== undefined && explicitReviewCount !== null
    ? toNumber(explicitReviewCount, reviews.length)
    : core.reviewCount > 0
      ? core.reviewCount
      : 91
  const rating = toNumber(apiProduct.rating ?? apiProduct.average_rating ?? apiProduct.avg_rating ?? core.rating, 4.5)

  return {
    ...core,
    slug: apiProduct.slug,
    title: core.name,
    storeName: 'EZ Stores',
    salesCount: 120,
    soldIndicator: '100+ bought in past month',
    inStock,
    stockCount: quantity,
    lowStockThreshold,
    variants: apiProduct.variants || [],
    gallery: uniqueGallery,
    colors: uniqueColors,
    sizes: uniqueSizes,
    sizeGroupLabel,
    compatibleModels,
    extraVariantGroups,
    colorImages,
    about: [
      'High-quality design and build for premium daily use.',
      'Features reliable and durable construction.',
      'Designed for optimal comfort and perfect handling.',
      'Matches the official specifications and quality standards.',
    ],
    keyDetails: {
      'Model/SKU': sku,
      'Category': apiProduct.category?.category_name || 'General',
    },
    description: cleanDescription || 'No description available for this product.',
    details: {
      SKU: sku,
      Condition: 'Brand New',
      Category: apiProduct.category?.category_name || 'General',
    },
    ratingDistribution: [
      { label: 'Small', value: toNumber(apiProduct.rating_small, fallbackRatingDistribution[0].value) },
      { label: 'True to size', value: toNumber(apiProduct.rating_true_to_size, fallbackRatingDistribution[1].value) },
      { label: 'Large', value: toNumber(apiProduct.rating_large, fallbackRatingDistribution[2].value) },
    ],
    rating,
    reviewCount,
    reviews,
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { data: landingData } = useLandingPageData()

  const landingProduct = useMemo(() => {
    if (!landingData) return null
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    for (const sec of sections) {
      const list = landingData[sec]
      if (Array.isArray(list)) {
        const found = list.find((p) => p && p.slug === slug)
        if (found) return found
      }
    }
    return null
  }, [landingData, slug])

  const apiProductId = landingProduct?.id ?? null

  const { data: apiProduct } = useQuery({
    queryKey: ['product-details', apiProductId],
    queryFn: () => getProductById(apiProductId),
    enabled: Boolean(apiProductId),
    staleTime: 5 * 60 * 1000,
  })

  const product = useMemo(() => {
    if (apiProduct) {
      return normalizeApiProductDetails(apiProduct)
    }
    if (landingProduct) {
      return normalizeApiProductDetails(landingProduct)
    }
    return getProductBySlug(slug)
  }, [apiProduct, landingProduct, slug])

  const [activeImage, setActiveImage] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState('')

  // Sync selectedColor, selectedSize, and activeImage when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] ?? '')
      setSelectedSize(product.sizes?.[0] ?? '')
      setSelectedCompatibleModel(product.compatibleModels?.[0] ?? '')
      if (product.gallery && product.gallery[0]) {
        setActiveImage(product.gallery[0])
      } else {
        setActiveImage(null)
      }
    } else {
      setSelectedColor('')
      setSelectedSize('')
      setSelectedCompatibleModel('')
      setActiveImage(null)
    }
  }, [product])

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)
    
    // Find if there is a variant that matches the new color and the current compatible model and size
    let matchingVariant = product?.variants?.find((v) => {
      const vColor = v.attributes?.color || v.color || v.variant_name || ''
      const vSize = v.attributes?.size || v.size || ''
      const vModel = v.variant_name || ''
      
      const matchColor = String(vColor).toLowerCase() === String(newColor).toLowerCase()
      const matchModel = !selectedCompatibleModel || String(vModel).toLowerCase() === String(selectedCompatibleModel).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()
      
      return matchColor && matchModel && matchSize
    })
    
    // If no exact match, find any variant that has this color
    if (!matchingVariant) {
      matchingVariant = product?.variants?.find((v) => {
        const vColor = v.attributes?.color || v.color || v.variant_name || ''
        return String(vColor).toLowerCase() === String(newColor).toLowerCase()
      })
    }
    
    // If we found a matching variant, sync the other attributes!
    if (matchingVariant) {
      const vModel = matchingVariant.variant_name
      const vSize = matchingVariant.attributes?.size || matchingVariant.size
      if (vModel) setSelectedCompatibleModel(vModel)
      if (vSize) setSelectedSize(vSize)
    }

    // Update the image
    const varImage = product.colorImages?.[newColor]
    if (varImage && setActiveImage) {
      setActiveImage(varImage)
    }
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)
    
    // Find if there is a variant that matches the new compatible model and the current color and size
    let matchingVariant = product?.variants?.find((v) => {
      const vColor = v.attributes?.color || v.color || v.variant_name || ''
      const vSize = v.attributes?.size || v.size || ''
      const vModel = v.variant_name || ''
      
      const matchModel = String(vModel).toLowerCase() === String(newModel).toLowerCase()
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()
      
      return matchColor && matchModel && matchSize
    })
    
    // If no exact match, find any variant that has this compatible model
    if (!matchingVariant) {
      matchingVariant = product?.variants?.find((v) => {
        const vModel = v.variant_name || ''
        return String(vModel).toLowerCase() === String(newModel).toLowerCase()
      })
    }
    
    // If we found a matching variant, sync the other attributes!
    if (matchingVariant) {
      const vColor = matchingVariant.attributes?.color || matchingVariant.color
      const vSize = matchingVariant.attributes?.size || matchingVariant.size
      if (vColor) {
        setSelectedColor(vColor)
        const varImage = product.colorImages?.[vColor]
        if (varImage && setActiveImage) {
          setActiveImage(varImage)
        }
      }
      if (vSize) setSelectedSize(vSize)
    }
  }

  const activeVariant = useMemo(() => {
    if (!product || !product.variants || !product.variants.length) return null

    // Match variant by all three selected attributes (color, size, and compatible model)
    return product.variants.find((v) => {
      const vColor = v.attributes?.color || v.color || v.variant_name || ''
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()

      const sizeKey = product.sizeGroupLabel ? product.sizeGroupLabel.toLowerCase().replace(/ /g, '_') : 'size'
      const vSize = v.attributes?.[sizeKey] || v.attributes?.size || v.size || ''
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      const vModel = v.variant_name || ''
      const matchModel = !selectedCompatibleModel || String(vModel).toLowerCase() === String(selectedCompatibleModel).toLowerCase()

      return matchColor && matchSize && matchModel
    }) ?? product.variants[0]
  }, [product, selectedColor, selectedSize, selectedCompatibleModel])

  const activeSku = useMemo(() => {
    return activeVariant?.sku || product?.sku || product?.keyDetails?.['Model/SKU'] || 'N/A'
  }, [activeVariant, product])

  const displayPriceInfo = useMemo(() => {
    if (activeVariant) {
      const variantPrice = toNumber(activeVariant.price)
      const variantDiscountPrice = toNumber(activeVariant.discount_price)
      
      const price = variantDiscountPrice > 0 ? variantDiscountPrice : variantPrice
      const compareAt = variantDiscountPrice > 0 ? variantPrice : null
      
      const discountPercent = compareAt > price && price > 0
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : null
      
      return { price, compareAt, discountPercent }
    }
    
    return {
      price: product?.price ?? 0,
      compareAt: product?.compareAt ?? null,
      discountPercent: product?.discountPercent ?? null
    }
  }, [product, activeVariant])

  const allApiProducts = useMemo(() => {
    if (!landingData) return []
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    const products = []
    const seenIds = new Set()
    for (const sec of sections) {
      const list = landingData[sec]
      if (Array.isArray(list)) {
        list.forEach((p) => {
          if (p && !seenIds.has(p.id)) {
            seenIds.add(p.id)
            const normalized = normalizeLandingProduct(p)
            if (normalized) {
              products.push({
                ...normalized,
                vendor_id: p.vendor_id || p.vendor?.id || p.store?.vendor_id || p.store?.id || ''
              })
            }
          }
        })
      }
    }
    return products
  }, [landingData])

  const sellerProducts = useMemo(() => {
    if (!apiProduct) {
      return getRelatedProducts(product.slug, 8)
    }

    const currentVendorId = apiProduct.vendor_id
    let matching = allApiProducts.filter(
      (p) => p.id !== product.id && p.vendor_id === currentVendorId
    )

    if (matching.length < 5) {
      const otherReal = allApiProducts.filter(
        (p) => p.id !== product.id && p.vendor_id !== currentVendorId
      )
      matching = [...matching, ...otherReal].slice(0, 8)
    }

    if (matching.length === 0) {
      return getRelatedProducts(product.slug, 8)
    }

    return matching
  }, [apiProduct, product.id, product.slug, allApiProducts])

  const exploreRelatedProducts = useMemo(() => {
    if (!apiProduct) {
      return getRelatedProducts(product.slug, 8)
    }

    const otherReal = allApiProducts.filter((p) => p.id !== product.id)
    
    if (otherReal.length === 0) {
      return getRelatedProducts(product.slug, 8)
    }

    return otherReal.slice(0, 8)
  }, [apiProduct, product.id, product.slug, allApiProducts])

  return (
    <SiteLayout>
      <main className="bg-[#f2f2f2] py-3 sm:py-4">
        <Container className="space-y-3 sm:space-y-4">
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="contents lg:block lg:min-w-0 lg:space-y-4">
              <div className="order-1 min-w-0">
                <ProductGallery product={product} activeImage={activeImage} setActiveImage={setActiveImage} />
              </div>
              <div className="order-3 min-w-0">
                <KeyDetails product={product} activeSku={activeSku} />
              </div>
              <div className="order-5 min-w-0">
                <HorizontalProductRail title="Other Items From Seller" products={sellerProducts} visibleCount={3} />
              </div>
            </div>
            <div className="contents lg:block lg:min-w-0 lg:space-y-4">
              <div className="order-2 min-w-0">
                <ProductInfoPanel
                  product={product}
                  setActiveImage={setActiveImage}
                  selectedColor={selectedColor}
                  setSelectedColor={handleColorSelect}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  selectedCompatibleModel={selectedCompatibleModel}
                  setSelectedCompatibleModel={handleCompatibleModelSelect}
                  activeImage={activeImage}
                  activeVariant={activeVariant}
                  activeSku={activeSku}
                  displayPriceInfo={displayPriceInfo}
                />
              </div>
              <div className="order-4 min-w-0">
                <ReviewSummary product={product} />
              </div>
            </div>
          </section>

          <ProductDescription product={product} />
          <HorizontalProductRail title="Explore Other Related Items" products={exploreRelatedProducts} visibleCount={5} />
        </Container>
      </main>
    </SiteLayout>
  )
}
