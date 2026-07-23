import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import ProductImageGallery from '../components/product/ProductImageGallery'
import ImageLightbox, { clampZoom, ZOOM_STEP } from '../components/shared/ImageLightbox'
import { getProductBySlug, getRelatedProducts } from '../constants/productDetails'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getProductById } from '../services/landingPageService'
import { formatProductListPrice, formatProductPriceParts } from '../utils/formatCurrency'
import { isProductActive, normalizeLandingProduct } from '../utils/normalizeLandingProducts'
import { notify } from '../lib/notify'
import { useCartActions } from '../hooks/useCartActions'
import { useOptionalMiniCart } from '../context/MiniCartContext'
import { selectCartItems } from '../store/slices/cartSlice'
import {
  formatProductCondition,
  sortKeyDetailEntries,
} from '../utils/keyDetailsOrder'
import { normalizeProductDescription } from '../utils/productDescriptionHtml'
import { mapKeyDetailsToObject } from '../utils/productKeyDetails'
import { calculateDisplayDiscountPercent } from '../utils/productPricing'
import {
  getVariantAttributeValue,
  getVariantCompatibleModels,
  resolveBrandName,
  resolveVariantAttributeFields,
  variantHasCompatibleModel,
} from '../utils/productVariantFields'

const SHOW_PRODUCT_VARIANTS = true

const STAR_FILL = '#F59E0B'
const STAR_EMPTY_FILL = '#E2E8F0'

const TRUST_INFO = {
  refund: {
    title: '30-day refund/replacement',
    description:
      'You can request a refund or replacement within 30 days of delivery if the item is damaged, defective, or not as described. Contact support with your order details to get started.',
  },
  secure: {
    title: 'Secure transaction',
    description:
      'Your payment is processed through encrypted, trusted payment partners. EZ-Stores does not store your full card or mobile money details on our servers.',
  },
}

function TrustInfoComment({ label, triggerText, infoKey, isOpen, onToggle, align = 'left' }) {
  const info = TRUST_INFO[infoKey]
  const bubbleId = `trust-info-${infoKey}`

  return (
    <div className="relative">
      <span className="text-[0.625rem] text-slate-500">
        {label}{' '}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bubbleId}
          className={`font-bold text-blue-600 underline-offset-2 ${
            isOpen ? 'underline' : 'hover:underline'
          }`}
        >
          {triggerText}
        </button>
      </span>

      {isOpen && (
        <div
          id={bubbleId}
          role="region"
          aria-label={info.title}
          className={`absolute top-full z-20 mt-2 w-[min(18rem,calc(100vw-2.5rem))] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div
            aria-hidden="true"
            className={`absolute -top-1.5 size-2.5 rotate-45 border border-slate-200 border-b-0 border-r-0 bg-white ${
              align === 'right' ? 'right-5' : 'left-5'
            }`}
          />
          <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            <p className="text-xs font-semibold leading-5 text-slate-900">{info.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{info.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Stars({ rating, size = 'size-4' }) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, normalizedRating - index))
        const fillWidth = `${fill * 100}%`

        return (
          <span key={index} className={`relative inline-flex shrink-0 ${size}`}>
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
  )
}

function formatStockAvailability(stockCount, lowStockThreshold = 10) {
  if (stockCount <= 0) {
    return {
      headline: 'Out of Stock',
      subtext: 'Currently unavailable',
      tone: 'out',
    }
  }

  if (stockCount <= lowStockThreshold) {
    return {
      headline: `Only ${stockCount} Items Left`,
      subtext: "Don't miss it",
      tone: 'low',
    }
  }

  let headline
  if (stockCount >= 1000) {
    headline = `${Math.floor(stockCount / 1000)}K+`
  } else if (stockCount >= 100) {
    headline = `${Math.floor(stockCount / 100) * 100}+`
  } else {
    headline = `${Math.floor(stockCount / 10) * 10}+`
  }

  return {
    headline,
    subtext: 'Available now',
    tone: 'in',
  }
}

function ProductGallery({ product, activeImage, setActiveImage }) {
  return (
    <ProductImageGallery
      images={product.gallery}
      title={product.title}
      activeImage={activeImage}
      onActiveImageChange={setActiveImage}
    />
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
    <div className="inline-flex h-12 min-w-36 items-center justify-between rounded-full bg-slate-50 px-2.5 sm:h-14 sm:min-w-40 sm:px-3">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40 sm:size-10"
      >
        <Minus className="size-5" />
      </button>
      <span className="min-w-10 text-center text-base font-bold text-auth-primary sm:min-w-12 sm:text-lg">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex size-9 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:size-10"
      >
        <Plus className="size-5" />
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

const SIDEBAR_REVIEW_LIMIT = 5

const fallbackReviewCards = [
  {
    id: 'review-1',
    name: 'Isaac Morgan',
    rating: 5,
    date: 'Feb 2024',
    text: 'This item is so durable, I love it.',
  },
  {
    id: 'review-2',
    name: 'Akua Mensah',
    rating: 5,
    date: 'Jan 28, 2026',
    text: 'Good quality and comfortable to use every day.',
  },
  {
    id: 'review-3',
    name: 'Kwame Asante',
    rating: 4,
    date: 'Jan 22, 2026',
    text: 'Looks nice and fits well. Packaging was clean.',
  },
  {
    id: 'review-4',
    name: 'Efua Boateng',
    rating: 5,
    date: 'Jan 15, 2026',
    text: 'Fast delivery and exactly as described. Very happy with this purchase.',
  },
  {
    id: 'review-5',
    name: 'Daniel Osei',
    rating: 4,
    date: 'Dec 2025',
    text: 'Solid quality for the price. Would recommend to anyone looking for value.',
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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [trustInfoOpen, setTrustInfoOpen] = useState(null)
  const trustInfoRef = useRef(null)
  const cartItems = useSelector(selectCartItems)
  const { addToCart } = useCartActions()
  const miniCart = useOptionalMiniCart()
  const stockAvailability = formatStockAvailability(
    activeVariant?.quantity != null
      ? toNumber(activeVariant.quantity, 0)
      : product.stockCount,
    product.lowStockThreshold ?? 10,
  )
  const outOfStock = activeVariant?.quantity != null
    ? toNumber(activeVariant.quantity, 0) <= 0
    : !product.inStock
  const colorValueSet = new Set((product.colors ?? []).map((value) => String(value).toLowerCase()))
  const compatibleModelValues = activeVariant
    ? getVariantCompatibleModels(activeVariant)
    : []
  const sizeValues = product.sizes ?? []
  const hasDuplicateCompatibleModels = compatibleModelValues.length > 0
    && colorValueSet.size > 0
    && compatibleModelValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const isColorVariantGroup = String(product.sizeGroupLabel ?? '').toLowerCase().includes('color')
  const hasDuplicateSizeValues = sizeValues.length > 0
    && colorValueSet.size > 0
    && sizeValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const showCompatibleModels = SHOW_PRODUCT_VARIANTS
    && compatibleModelValues.length > 0
    && !hasDuplicateCompatibleModels
  const showSizeVariants = SHOW_PRODUCT_VARIANTS
    && sizeValues.length > 0
    && !isColorVariantGroup
    && !hasDuplicateSizeValues

  useEffect(() => {
    if (!trustInfoOpen) return undefined

    const handlePointerDown = (event) => {
      if (!trustInfoRef.current?.contains(event.target)) {
        setTrustInfoOpen(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [trustInfoOpen])

  const toggleTrustInfo = (infoKey) => {
    setTrustInfoOpen((current) => (current === infoKey ? null : infoKey))
  }

  const currentPriceParts = formatProductPriceParts(displayPriceInfo.price)
  const hasSalePrice =
    displayPriceInfo.compareAt != null &&
    displayPriceInfo.discountPercent != null &&
    displayPriceInfo.discountPercent > 0 &&
    displayPriceInfo.compareAt > displayPriceInfo.price
  const listPriceValue = displayPriceInfo.compareAt ?? displayPriceInfo.price
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
      miniCart?.openMiniCart()
      return
    }

    if (isAddingToCart) return

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
    if (hasVariants && !activeVariant?.id) {
      notify.error('Please select a product option before adding to cart.')
      return
    }

    setIsAddingToCart(true)
    try {
      const item = await addToCart(
        {
          ...product,
          productId: product.backendId ?? product.id,
          product_id: product.backendId ?? product.id,
        },
        {
          silentSuccess: true,
          productId: product.backendId ?? product.id,
          syncable: Boolean(product.backendId ?? product.id),
          quantity,
          price: displayPriceInfo.price,
          compareAt: displayPriceInfo.compareAt,
          variantId: activeVariant?.id ?? null,
          product_variant_id: activeVariant?.id ?? null,
          sku: activeSku,
          variant: selectedColor || selectedCompatibleModel || selectedSize || product.variant,
          size: selectedSize || selectedCompatibleModel || activeSku,
          image: activeImage || product.colorImages?.[selectedColor] || product.gallery?.[0] || product.image,
          variantImage: activeImage || product.colorImages?.[selectedColor] || null,
          variantRecord: activeVariant ?? null,
        },
      )

      if (item) {
        miniCart?.openMiniCart()
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <aside className="min-w-0 bg-white p-3 sm:p-4">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="wrap-break-word text-lg font-bold capitalize leading-snug tracking-tight text-slate-950 sm:text-xl">
          {product.title}
        </h1>

        <p className="mt-2 text-xs font-semibold text-slate-500">
          {product.reviewCount > 0
            ? `${product.rating.toFixed(1)} (${product.reviewCount.toLocaleString()} reviews)`
            : 'No reviews yet'}{' '}
          {(product.salesCount ?? 0).toLocaleString()} sold
        </p>

        {product.soldIndicator && (
          <p className="mt-1 text-[0.6875rem] font-semibold text-slate-600">
            {product.soldIndicator}
          </p>
        )}

        <StoreInfo product={product} />
      </div>

      <div className="space-y-2 py-3">
        {hasSalePrice && (
          <p className="w-fit rounded-sm bg-auth-primary px-2 py-1 text-[0.625rem] font-bold leading-none text-white">
            Limited time deal
          </p>
        )}

        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          {hasSalePrice && (
            <span className="pb-0.5 text-xl font-bold leading-none text-auth-primary sm:text-2xl">
              -{displayPriceInfo.discountPercent}%
            </span>
          )}
          <div className="inline-flex items-start gap-0.5 leading-none">
            <span className="pt-1 text-sm font-normal text-slate-950">{currentPriceParts.currency}</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-[2.5rem]">
              {currentPriceParts.amount}
            </span>
          </div>
          {hasSalePrice && (
            <span className="pb-1 text-sm text-slate-400 line-through sm:text-base">
              {formatProductListPrice(listPriceValue)}
            </span>
          )}
        </div>

        {hasSalePrice && (
          <p className="text-xs font-medium text-slate-500">
            List Price:{' '}
            <span className="line-through">{formatProductListPrice(listPriceValue)}</span>
          </p>
        )}
      </div>

      {SHOW_PRODUCT_VARIANTS && (
        <ColorSwatches product={product} selected={selectedColor} onSelect={setSelectedColor} />
      )}
      
      {showCompatibleModels && (
        <VariantGroup
          label="Compatible Model"
          values={compatibleModelValues}
          selected={selectedCompatibleModel}
          onSelect={setSelectedCompatibleModel}
        />
      )}

      {showSizeVariants && (
        <VariantGroup
          label={product.sizeGroupLabel ?? 'Size'}
          values={sizeValues}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />
      )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-950">Quantity</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 sm:gap-5">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
          <p className="text-sm leading-5">
            <span
              className={
                stockAvailability.tone === 'out'
                  ? 'font-bold text-red-600'
                  : stockAvailability.tone === 'low'
                    ? 'font-bold text-auth-primary'
                    : 'font-bold text-emerald-600'
              }
            >
              {stockAvailability.headline}
            </span>
            <span className="block text-slate-500">{stockAvailability.subtext}</span>
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
          disabled={outOfStock || isAddingToCart}
          onClick={handleAddToCart}
          aria-busy={isAddingToCart}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-auth-primary px-6 py-3 text-xs font-bold text-auth-primary transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding...
            </>
          ) : (
            isInCart ? 'View Cart' : 'Add to Cart'
          )}
        </button>
      </div>

      <div
        ref={trustInfoRef}
        className="relative mt-3 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between min-[480px]:gap-6"
      >
        <TrustInfoComment
          label="Returns"
          triggerText="30-day refund/replacement"
          infoKey="refund"
          isOpen={trustInfoOpen === 'refund'}
          onToggle={() => toggleTrustInfo('refund')}
        />
        <TrustInfoComment
          label="Payment"
          triggerText="Secure transaction"
          infoKey="secure"
          isOpen={trustInfoOpen === 'secure'}
          onToggle={() => toggleTrustInfo('secure')}
          align="right"
        />
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

  const sortedEntries = sortKeyDetailEntries(Object.entries(detailsList))

  return (
    <section className="relative min-w-0 h-full bg-white p-4 sm:p-6">
      <button
        type="button"
        onClick={() => shareProduct(product)}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:right-4 sm:top-4"
      >
        <Share2 className="size-3.5" strokeWidth={2.2} />
        Share
      </button>
      <h2 className="pr-24 text-base font-bold text-slate-950">Key Details</h2>
      <dl className="mt-3 grid gap-2.5 text-sm leading-5 text-slate-700">
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-1 py-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3">
            <dt className="font-bold text-slate-900">{key}:</dt>
            <dd className="wrap-break-word">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const fallbackAboutItems = [
  'Thoughtfully designed with easy to use details throughout.',
  'Premium feel and practical protection for everyday use.',
  'Smooth finish with dependable grip for secure everyday handling.',
  'Shaped for comfortable handling with a clean, modern look.',
  'Available from EZ-Stores Marketplace with fast, reliable delivery.',
]

function AboutThisItem({ product }) {
  const items = product.about?.length ? product.about : fallbackAboutItems

  return (
    <section className="min-w-0 bg-white p-4 sm:p-6">
      <h2 className="text-base font-bold text-slate-950">About this item</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-5 text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="wrap-break-word">{item}</li>
        ))}
      </ul>
    </section>
  )
}

function ReviewSummary({ product, fillHeight = false }) {
  const visibleReviews = product.reviews.slice(0, SIDEBAR_REVIEW_LIMIT)

  return (
    <section
      id="reviews"
      className={`min-w-0 w-full bg-white p-3 sm:p-4 ${fillHeight ? 'flex min-h-[280px] flex-1 flex-col' : ''}`}
    >
      <div className="shrink-0">
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
      </div>

      <div className={`space-y-3 ${fillHeight ? 'mt-4 min-h-0 flex-1' : 'mt-4'}`}>
        {visibleReviews.map((review) => (
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
                <p className="mt-1 wrap-break-word text-[0.6875rem] leading-4 text-slate-700">{review.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={`text-center ${fillHeight ? 'mt-auto shrink-0 pt-4' : 'mt-5'}`}>
        <button type="button" className="rounded-full border border-slate-300 px-6 py-2 text-xs font-semibold text-slate-800">
          See All Reviews
        </button>
      </div>
    </section>
  )
}

function RailPriceDisplay({ price }) {
  const parts = formatProductPriceParts(price)
  const [whole, fraction] = parts.amount.includes('.')
    ? parts.amount.split('.')
    : [parts.amount, null]

  return (
    <span className="inline-flex items-baseline leading-none text-slate-950">
      <span className="mr-1 text-[0.625rem] font-normal">{parts.currency}</span>
      <span className="text-sm font-extrabold">{whole}</span>
      {fraction != null && (
        <span className="relative -top-0.5 text-[0.55rem] font-extrabold leading-none">.{fraction}</span>
      )}
    </span>
  )
}

function RailProductCard({ product }) {
  const fullStars = Math.floor(product.rating ?? 0)
  const productHref = product.href?.replace(/^\/products\//, '/')

  return (
    <article className="min-w-0 bg-white">
      <Link to={productHref} className="block">
        <span className="relative block aspect-square overflow-hidden bg-slate-50">
          <img src={product.image} alt={product.name} className="size-full object-contain p-1" loading="lazy" />
          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            {product.discountPercent != null && (
              <span className="rounded-sm bg-[#F5D020] px-1.5 py-0.5 text-[0.5rem] font-bold leading-none text-slate-900">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isHot && (
              <span className="rounded-sm bg-auth-primary px-1.5 py-0.5 text-[0.5rem] font-bold leading-none text-white">
                HOT
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Save ${product.name}`}
            onClick={(event) => event.preventDefault()}
            className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center"
          >
            <Heart className="size-3.5 text-white drop-shadow-sm" strokeWidth={2} />
          </button>
        </span>
        <span className="mt-1.5 block truncate text-xs font-bold text-slate-900">{product.name}</span>
      </Link>
      <RailPriceDisplay price={product.price} />
      <div className="mt-1 flex items-center justify-between gap-2">
        {product.reviewCount > 0 ? (
          <div className="flex min-w-0 items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className="size-2.5"
                fill={index < fullStars ? STAR_FILL : '#CBD5E1'}
                strokeWidth={0}
              />
            ))}
            <span className="ml-0.5 text-[0.5625rem] text-slate-500">({product.reviewCount})</span>
          </div>
        ) : (
          <span className="text-[0.5625rem] text-slate-400">No reviews</span>
        )}
        <Link
          to="/cart"
          aria-label={`Add ${product.name} to cart`}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition-colors hover:border-auth-primary hover:text-auth-primary"
        >
          <ShoppingCart className="size-3" strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  )
}

function useRailVisibleCount(maxVisible) {
  const computeCount = (max) => {
    if (typeof window === 'undefined') return Math.min(max, 2)
    if (window.matchMedia('(min-width: 1024px)').matches) return max
    if (window.matchMedia('(min-width: 640px)').matches) return Math.min(max, 3)
    return Math.min(max, 2)
  }

  const [visibleCount, setVisibleCount] = useState(() => computeCount(maxVisible))

  useEffect(() => {
    const update = () => setVisibleCount(computeCount(maxVisible))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [maxVisible])

  return visibleCount
}

function HorizontalProductRail({ title, products, visibleCount: maxVisible = 5 }) {
  const railRef = useRef(null)
  const visibleCount = useRailVisibleCount(maxVisible)
  const gapRem = 0.5
  const gapCount = Math.max(visibleCount - 1, 1)

  const scrollRail = (direction) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({
      left: direction * rail.clientWidth,
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
    <section className="min-w-0 overflow-hidden border-t border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="min-w-0 text-sm font-bold text-slate-950 sm:text-base">{title}</h2>
        <span className="shrink-0 text-[0.625rem] font-semibold text-slate-600 sm:text-xs">Page 1 Of 50</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-3">
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          aria-label={`Previous ${title}`}
          className="hidden size-8 shrink-0 items-center justify-center border border-slate-300 bg-white text-slate-700 transition-colors hover:border-slate-400 sm:flex sm:size-9"
        >
          <ChevronLeft className="size-4 sm:size-5" strokeWidth={2} />
        </button>
        <div
          ref={railRef}
          tabIndex={0}
          onKeyDown={handleRailKeyDown}
          aria-label={`${title} product carousel`}
          style={{ gridAutoColumns: `calc((100% - ${gapCount * gapRem}rem) / ${visibleCount})` }}
          className="grid min-w-0 flex-1 grid-flow-col grid-rows-1 gap-2 overflow-x-auto scroll-smooth overscroll-x-contain outline-none snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-auth-primary/40 sm:gap-2 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((item, index) => (
            <div
              key={item.id ?? item.backendId ?? item.slug ?? item.href ?? `${title}-${index}`}
              className="min-w-0 snap-start"
            >
              <RailProductCard product={item} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollRail(1)}
          aria-label={`Next ${title}`}
          className="hidden size-8 shrink-0 items-center justify-center border border-slate-300 bg-white text-slate-700 transition-colors hover:border-slate-400 sm:flex sm:size-9"
        >
          <ChevronRight className="size-4 sm:size-5" strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}

function isDescriptiveImageRecord(image) {
  if (!image || typeof image !== 'object') return false
  const type = String(image.image_type ?? image.type ?? '').trim().toLowerCase()
  return type === 'descriptive' || image.is_descriptive === true || image.is_descriptive === 1
}

function mapDescriptiveImageUrls(descriptiveImages) {
  if (!Array.isArray(descriptiveImages)) return []

  return descriptiveImages
    .map((image) => {
      if (typeof image === 'string') return image.trim()
      return String(image?.image_url ?? image?.url ?? image?.preview ?? '').trim()
    })
    .filter(Boolean)
}

function collectDescriptiveImageUrls(apiProduct) {
  const urls = new Set(mapDescriptiveImageUrls(apiProduct?.descriptive_images))

  if (Array.isArray(apiProduct?.images)) {
    apiProduct.images.forEach((image) => {
      if (!isDescriptiveImageRecord(image)) return
      const url = String(image?.image_url ?? image?.url ?? image?.preview ?? '').trim()
      if (url) urls.add(url)
    })
  }

  return [...urls]
}

const DESCRIPTIVE_GRID_SIZE = 4

function buildDescriptiveGridImages(product) {
  const descriptive = (product.descriptiveImages ?? []).filter(Boolean)
  const gallery = (product.gallery ?? []).filter(Boolean)
  const used = new Set(descriptive)
  const fillerPool = gallery.filter((url) => !used.has(url))

  const seed = String(product.slug ?? product.id ?? '')
  const shuffledFillers = [...fillerPool].sort((a, b) => {
    const score = (value) => {
      let hash = 0
      const key = `${seed}:${value}`
      for (let i = 0; i < key.length; i += 1) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0
      }
      return hash
    }
    return score(a) - score(b)
  })

  const combined = [...descriptive]
  shuffledFillers.forEach((url) => {
    if (combined.length < DESCRIPTIVE_GRID_SIZE) combined.push(url)
  })

  if (combined.length < DESCRIPTIVE_GRID_SIZE && gallery.length > 0) {
    let index = 0
    while (combined.length < DESCRIPTIVE_GRID_SIZE) {
      combined.push(gallery[index % gallery.length])
      index += 1
    }
  }

  return Array.from({ length: DESCRIPTIVE_GRID_SIZE }, (_, index) => combined[index] ?? null)
}

function DescriptiveImagePlaceholder() {
  return <ImageIcon className="size-7 text-slate-300 sm:size-8" strokeWidth={1.5} />
}

function DescriptiveImagesGrid({ product }) {
  const gridImages = buildDescriptiveGridImages(product)
  const hasDescriptive = (product.descriptiveImages ?? []).length > 0
  const viewableImages = useMemo(
    () => [...new Set(buildDescriptiveGridImages(product).filter(Boolean))],
    [product],
  )

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [zoom, setZoom] = useState(1)

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    setZoom(1)
  }, [])

  const goPrev = useCallback(() => {
    if (viewableImages.length <= 1) return
    setZoom(1)
    setLightboxIndex((index) => (
      index === null ? null : (index - 1 + viewableImages.length) % viewableImages.length
    ))
  }, [viewableImages.length])

  const goNext = useCallback(() => {
    if (viewableImages.length <= 1) return
    setZoom(1)
    setLightboxIndex((index) => (
      index === null ? null : (index + 1) % viewableImages.length
    ))
  }, [viewableImages.length])

  const openLightbox = (src) => {
    const index = viewableImages.indexOf(src)
    if (index < 0) return
    setZoom(1)
    setLightboxIndex(index)
  }

  useEffect(() => {
    if (lightboxIndex === null) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === '+' || event.key === '=') setZoom((value) => clampZoom(value + ZOOM_STEP))
      if (event.key === '-') setZoom((value) => clampZoom(value - ZOOM_STEP))
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

  const lightboxImage = lightboxIndex === null ? null : viewableImages[lightboxIndex]

  return (
    <>
      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[12rem_1fr]">
        <h3 className="font-bold text-slate-950">Product Images</h3>
        <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
          {gridImages.map((src, index) => (
            src
              ? (
                <button
                  key={index}
                  type="button"
                  onClick={() => openLightbox(src)}
                  aria-label={
                    hasDescriptive
                      ? `View product detail ${index + 1} full size`
                      : `View product image ${index + 1} full size`
                  }
                  className="group cursor-zoom-in overflow-hidden rounded-sm bg-slate-100 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40"
                >
                  <img
                    src={src}
                    alt=""
                    className="block h-auto w-full max-w-full transition-transform duration-200 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </button>
              )
              : (
                <div
                  key={index}
                  className="flex aspect-[970/600] w-full items-center justify-center rounded-sm bg-slate-100"
                >
                  <DescriptiveImagePlaceholder />
                </div>
              )
          ))}
        </div>
      </div>

      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          title={product.title ?? product.name ?? 'Product'}
          zoom={zoom}
          onZoomChange={setZoom}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          hasMultiple={viewableImages.length > 1}
        />
      )}
    </>
  )
}

function StoreInfo({ product }) {
  const ratingLabel = product.rating?.toFixed(1) ?? '4.5'

  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50">
          <ShoppingCart className="size-3.5 text-auth-primary" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Link
            to={product.vendorId ? `/stores/${product.vendorId}` : '/stores'}
            className="block truncate text-xs font-bold text-[#2E71A1] hover:underline sm:text-sm"
          >
            Visit the {product.storeName}
          </Link>
          <p className="mt-0.5 truncate text-[0.625rem] font-semibold text-slate-500 sm:text-xs">
            <span className="text-slate-700">110</span> Followers
            <span className="mx-1 text-slate-300" aria-hidden="true">|</span>
            <span className="text-slate-700">{ratingLabel}</span>
            <span className="text-slate-400" aria-hidden="true"> ★</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-[0.625rem] font-bold text-slate-950 transition-colors hover:border-auth-primary hover:text-auth-primary sm:px-5 sm:text-xs"
      >
        Follow
      </button>
    </div>
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
            <dd className="wrap-break-word text-slate-700">{value}</dd>
          </div>
        ))}
        <div className="grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="font-bold text-slate-950">Description</dt>
          <dd className="min-w-0 text-slate-700">
            {product.descriptionHtml ? (
              <div
                className="product-description text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="wrap-break-word text-sm leading-relaxed">{product.description}</p>
            )}
          </dd>
        </div>
      </div>

      <DescriptiveImagesGrid product={product} />
    </section>
  )
}

function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((m) => m && (m.key === key || m.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

function formatPackageDimensions(metadata) {
  const length = getMetadataValue(metadata, 'shipping_length')
  const width = getMetadataValue(metadata, 'shipping_width')
  const height = getMetadataValue(metadata, 'shipping_height')
  const dimensions = [length, width, height].filter(
    (value) => value !== undefined && value !== null && String(value).trim() !== '',
  )

  if (dimensions.length > 0) {
    return `${dimensions.join(' x ')} cm`
  }

  const packageDimensions = getMetadataValue(metadata, 'package_dimensions')
  if (packageDimensions && String(packageDimensions).trim()) {
    return String(packageDimensions).trim()
  }

  return null
}

function formatItemWeight(metadata, fallback = 'Lightweight everyday carry') {
  const weight = getMetadataValue(metadata, 'shipping_weight')
  if (weight !== undefined && weight !== null && String(weight).trim() !== '') {
    return `${String(weight).trim()} kg`
  }

  return fallback
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
  const variants = toArray(apiProduct.variants)
  const sku = getMetadataValue(metadata, 'sku') || apiProduct.sku || variants[0]?.sku || 'N/A'
  const variantStockTotal = variants.reduce((sum, variant) => sum + toNumber(variant?.quantity, 0), 0)
  const quantity = toNumber(getMetadataValue(metadata, 'quantity'), variantStockTotal || 10)
  const lowStockThreshold = toNumber(getMetadataValue(metadata, 'low_stock_threshold'), 10)
  const inStock = quantity > 0

  // Build gallery from product images only (variant images shown in swatches)
  const gallery = []
  if (Array.isArray(apiProduct.images)) {
    apiProduct.images.forEach((img) => {
      if (img?.image_url) gallery.push(img.image_url)
    })
  }
  if (gallery.length === 0) {
    gallery.push(core.image)
  }
  const uniqueGallery = [...new Set(gallery)]

  const colorImages = {}
  const colors = []
  const otherVariantGroups = {}

  variants.forEach((variant) => {
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
    const normalizedKey = String(attributeKey ?? '').trim().toLowerCase()
    const valueText = attributeValue != null && attributeValue !== '' ? String(attributeValue) : ''

    if (normalizedKey === 'color' && valueText) {
      if (!colors.includes(valueText)) colors.push(valueText)
      const varImage = variant.images?.[0]?.image_url || variant.image_url || variant.image
      if (varImage) colorImages[valueText] = varImage
      return
    }

    if (attributeKey && valueText) {
      const groupKey = String(attributeKey).trim()
      if (!otherVariantGroups[groupKey]) otherVariantGroups[groupKey] = new Set()
      otherVariantGroups[groupKey].add(valueText)
      return
    }

    const legacyColor = getVariantAttributeValue(variant, 'color')
    if (legacyColor) {
      if (!colors.includes(legacyColor)) colors.push(legacyColor)
      const varImage = variant.images?.[0]?.image_url || variant.image_url || variant.image
      if (varImage) colorImages[legacyColor] = varImage
    }

    const legacySize = getVariantAttributeValue(variant, 'size')
    if (legacySize) {
      if (!otherVariantGroups.size) otherVariantGroups.size = new Set()
      otherVariantGroups.size.add(legacySize)
    }
  })

  const extraVariantGroups = Object.entries(otherVariantGroups).map(([key, valSet]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    values: [...valSet],
  }))

  const uniqueColors = colors
  const uniqueSizes = extraVariantGroups[0]?.values ?? []
  const sizeGroupLabel = extraVariantGroups[0]?.label ?? 'Size'

  const compatibleModels = [
    ...new Set(variants.flatMap((variant) => getVariantCompatibleModels(variant))),
  ]

  const { descriptionHtml, description } = normalizeProductDescription(apiProduct.description)
  const reviews = normalizeProductReviews(apiProduct)
  const explicitReviewCount = apiProduct.reviews_count ?? apiProduct.review_count ?? apiProduct.total_reviews
  const reviewCount = explicitReviewCount !== undefined && explicitReviewCount !== null
    ? toNumber(explicitReviewCount, reviews.length)
    : core.reviewCount > 0
      ? core.reviewCount
      : 91
  const rating = toNumber(apiProduct.rating ?? apiProduct.average_rating ?? apiProduct.avg_rating ?? core.rating, 4.5)

  const categoryName = apiProduct.category?.category_name || 'General'
  const barcode = getMetadataValue(metadata, 'barcode') || apiProduct.barcode || variants.find((v) => v?.barcode)?.barcode
  const condition = formatProductCondition(apiProduct.condition ?? getMetadataValue(metadata, 'condition'))
  const brandName = resolveBrandName(apiProduct) || null
  const customKeyDetails = mapKeyDetailsToObject(apiProduct)
  const packageDimensions = formatPackageDimensions(metadata)
  const itemWeight = formatItemWeight(metadata, null)

  return {
    ...core,
    slug: apiProduct.slug,
    metadata,
    title: core.name,
    storeName: apiProduct.vendor?.store_name
      || apiProduct.vendor?.business_name
      || apiProduct.store?.name
      || 'EZ Stores',
    vendorId: apiProduct.vendor?.id ?? apiProduct.store?.id ?? null,
    salesCount: 120,
    soldIndicator: '1K+ bought in past month',
    inStock,
    stockCount: quantity,
    lowStockThreshold,
    variants,
    gallery: uniqueGallery,
    colors: uniqueColors,
    sizes: uniqueSizes,
    sizeGroupLabel,
    compatibleModels,
    extraVariantGroups,
    colorImages,
    about: fallbackAboutItems,
    keyDetails: {
      Category: categoryName,
      'Model/SKU': sku,
      ...(barcode ? { Barcode: String(barcode).trim() } : {}),
      ...(condition ? { Condition: condition } : {}),
      ...(brandName ? { Brand: brandName } : {}),
      ...(packageDimensions ? { 'Package Dimensions': packageDimensions } : {}),
      ...(itemWeight ? { 'Item Weight': itemWeight } : {}),
      ...customKeyDetails,
    },
    descriptiveImages: collectDescriptiveImageUrls(apiProduct),
    descriptionHtml,
    description,
    details: {
      SKU: sku,
      Condition: condition || 'Not specified',
      Category: categoryName,
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const landingProduct = useMemo(() => {
    if (!landingData) return null
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    for (const sec of sections) {
      const list = landingData[sec]
      if (Array.isArray(list)) {
        const found = list.find((p) => p && p.slug === slug && isProductActive(p))
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
    if (apiProduct && isProductActive(apiProduct)) {
      return normalizeApiProductDetails(apiProduct)
    }
    if (landingProduct) {
      return normalizeApiProductDetails(landingProduct)
    }
    return getProductBySlug(slug)
  }, [apiProduct, landingProduct, slug])

  return (
    <ProductDetailsView
      key={product.slug ?? slug}
      product={product}
      apiProduct={apiProduct}
      landingData={landingData}
    />
  )
}

function ProductDetailsView({ product, apiProduct, landingData }) {
  const [activeImage, setActiveImage] = useState(product.gallery?.[0] ?? null)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '')
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState(() => {
    const firstWithModels = product.variants?.find(
      (variant) => getVariantCompatibleModels(variant).length > 0,
    )
    return getVariantCompatibleModels(firstWithModels)[0] ?? product.compatibleModels?.[0] ?? ''
  })

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)

    let matchingVariant = product?.variants?.find((variant) => {
      const vColor = getVariantAttributeValue(variant, 'color') || variant.variant_name || ''
      const vSize = getVariantAttributeValue(variant, product.sizeGroupLabel ?? 'size')
      const matchColor = String(vColor).toLowerCase() === String(newColor).toLowerCase()
      const matchModel = !selectedCompatibleModel
        || variantHasCompatibleModel(variant, selectedCompatibleModel)
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      return matchColor && matchModel && matchSize
    })

    if (!matchingVariant) {
      matchingVariant = product?.variants?.find((variant) => {
        const vColor = getVariantAttributeValue(variant, 'color') || variant.variant_name || ''
        return String(vColor).toLowerCase() === String(newColor).toLowerCase()
      })
    }

    if (matchingVariant) {
      const models = getVariantCompatibleModels(matchingVariant)
      setSelectedCompatibleModel(models[0] ?? '')
      const vSize = getVariantAttributeValue(matchingVariant, product.sizeGroupLabel ?? 'size')
      if (vSize) setSelectedSize(vSize)
    }

    const varImage = product.colorImages?.[newColor]
    if (varImage) setActiveImage(varImage)
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)

    let matchingVariant = product?.variants?.find((variant) => {
      const vColor = getVariantAttributeValue(variant, 'color') || variant.variant_name || ''
      const vSize = getVariantAttributeValue(variant, product.sizeGroupLabel ?? 'size')
      const matchModel = variantHasCompatibleModel(variant, newModel)
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      return matchColor && matchModel && matchSize
    })

    if (!matchingVariant) {
      matchingVariant = product?.variants?.find((variant) => variantHasCompatibleModel(variant, newModel))
    }

    if (matchingVariant) {
      const vColor = getVariantAttributeValue(matchingVariant, 'color')
      const vSize = getVariantAttributeValue(matchingVariant, product.sizeGroupLabel ?? 'size')
      if (vColor) {
        setSelectedColor(vColor)
        const varImage = product.colorImages?.[vColor]
        if (varImage) setActiveImage(varImage)
      }
      if (vSize) setSelectedSize(vSize)
    }
  }

  const handleSizeSelect = (newSize) => {
    setSelectedSize(newSize)
    const sizeAttribute = product.sizeGroupLabel ?? 'size'

    let matchingVariant = product?.variants?.find((variant) => {
      const vColor = getVariantAttributeValue(variant, 'color') || variant.variant_name || ''
      const vSize = getVariantAttributeValue(variant, sizeAttribute)
      const matchSize = String(vSize).toLowerCase() === String(newSize).toLowerCase()
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchModel = !selectedCompatibleModel
        || variantHasCompatibleModel(variant, selectedCompatibleModel)

      return matchColor && matchSize && matchModel
    })

    if (!matchingVariant) {
      matchingVariant = product?.variants?.find((variant) => {
        const vSize = getVariantAttributeValue(variant, sizeAttribute)
        return String(vSize).toLowerCase() === String(newSize).toLowerCase()
      })
    }

    if (matchingVariant) {
      const vColor = getVariantAttributeValue(matchingVariant, 'color')
      const models = getVariantCompatibleModels(matchingVariant)
      if (vColor) {
        setSelectedColor(vColor)
        const varImage = product.colorImages?.[vColor]
        if (varImage) setActiveImage(varImage)
      }
      setSelectedCompatibleModel(models[0] ?? '')
    }
  }

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    const sizeAttribute = product.sizeGroupLabel ?? 'size'

    return product.variants.find((variant) => {
      const vColor = getVariantAttributeValue(variant, 'color') || variant.variant_name || ''
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()

      const vSize = getVariantAttributeValue(variant, sizeAttribute)
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      const matchModel = !selectedCompatibleModel
        || variantHasCompatibleModel(variant, selectedCompatibleModel)

      return matchColor && matchSize && matchModel
    }) ?? product.variants[0]
  }, [product, selectedColor, selectedSize, selectedCompatibleModel])

  const activeSku = useMemo(() => {
    return activeVariant?.sku || product?.sku || product?.keyDetails?.['Model/SKU'] || 'N/A'
  }, [activeVariant, product])

  const displayPriceInfo = useMemo(() => {
    if (activeVariant) {
      const variantListPrice = toNumber(activeVariant.regular_price ?? activeVariant.price)
      const variantSalePrice = toNumber(
        activeVariant.regular_discount_price ?? activeVariant.discount_price,
      )
      const hasVariantSale = variantSalePrice > 0 && variantListPrice > variantSalePrice
      const price = hasVariantSale ? variantSalePrice : variantListPrice
      const compareAt = hasVariantSale ? variantListPrice : null
      const discountPercent = hasVariantSale
        ? calculateDisplayDiscountPercent(variantListPrice, variantSalePrice)
        : null

      return { price, compareAt, discountPercent }
    }

    const price = product?.price ?? 0
    const compareAt = product?.compareAt ?? null
    const discountPercent = compareAt != null && compareAt > price && price > 0
      ? calculateDisplayDiscountPercent(compareAt, price)
      : product?.discountPercent ?? null

    return { price, compareAt, discountPercent }
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
          if (p && isProductActive(p) && !seenIds.has(p.id)) {
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

    const currentVendorId = apiProduct.vendor?.id ?? apiProduct.vendor_id
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
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] lg:items-stretch">
            <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
              <ProductGallery product={product} activeImage={activeImage} setActiveImage={setActiveImage} />
            </div>

            <div className="order-3 flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:h-full">
              <div className="min-w-0 lg:flex-1">
                <KeyDetails product={product} activeSku={activeSku} />
              </div>
              <div className="min-w-0">
                <AboutThisItem product={product} />
              </div>
              <div className="mt-auto min-w-0">
                <HorizontalProductRail title="Other Items From Seller" products={sellerProducts} visibleCount={3} />
              </div>
            </div>

            <div className="order-2 flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
              <ProductInfoPanel
                product={product}
                setActiveImage={setActiveImage}
                selectedColor={selectedColor}
                setSelectedColor={handleColorSelect}
                selectedSize={selectedSize}
                setSelectedSize={handleSizeSelect}
                selectedCompatibleModel={selectedCompatibleModel}
                setSelectedCompatibleModel={handleCompatibleModelSelect}
                activeImage={activeImage}
                activeVariant={activeVariant}
                activeSku={activeSku}
                displayPriceInfo={displayPriceInfo}
              />
              <div className="mt-auto min-w-0">
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
