import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import ProductImageGallery from '../components/product/ProductImageGallery'
import AddedToCartFlyout from '../components/product/AddedToCartFlyout'
import KeyDetailsModal from '../components/product/KeyDetailsModal'
import ProductDetailsSkeleton from '../components/product/ProductDetailsSkeleton'
import ProductReviewsModal from '../components/product/ProductReviewsModal'
import ImageLightbox from '../components/shared/ImageLightbox'
import { getProductBySlug, getRelatedProducts } from '../constants/productDetails'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getProductById } from '../services/landingPageService'
import { getProductReviews } from '../services/reviewService'
import { formatProductListPrice, formatProductPriceParts } from '../utils/formatCurrency'
import { isProductActive, normalizeLandingProduct } from '../utils/normalizeLandingProducts'
import { notify } from '../lib/notify'
import { addToWishlist, getUserWishlist, removeFromWishlist } from '../services/wishlistService'
import { useCartActions } from '../hooks/useCartActions'
import { useOptionalMiniCart } from '../context/MiniCartContext'
import { buildCartItem, isProductInCart, selectCartItems } from '../store/slices/cartSlice'
import { saveBuyNowItem } from '../utils/buyNowItem'
import {
  formatProductCondition,
  sortKeyDetailEntries,
} from '../utils/keyDetailsOrder'
import { normalizeProductDescription } from '../utils/productDescriptionHtml'
import { mapKeyDetailsEntries, mapKeyDetailsToObject } from '../utils/productKeyDetails'
import { calculateDisplayDiscountPercent } from '../utils/productPricing'
import { resolveProductDisplayPrices } from '../utils/extractProductVariantFacets'
import {
  getVariantAttributeValue,
  getVariantCompatibleModels,
  isSameVariantOption,
  resolveBrandName,
  resolveCanonicalVariantOption,
  resolveVariantAttributeFields,
  resolveVariantImageUrl,
} from '../utils/productVariantFields'

const SHOW_PRODUCT_VARIANTS = true
const KEY_DETAILS_VISIBLE_COUNT = 5
const DESCRIPTION_LONG_TEXT_THRESHOLD = 480
const DESCRIPTION_LONG_HTML_THRESHOLD = 700
const MAX_GALLERY_IMAGES = 10

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

function ProductGallery({ product, activeImage, setActiveImage, onShare, onWishlist, isWishlisted }) {
  const images = useMemo(() => {
    const gallery = (product.gallery ?? []).filter(Boolean)
    if (activeImage && !gallery.includes(activeImage)) {
      return [activeImage, ...gallery]
    }
    return gallery
  }, [product.gallery, activeImage])

  return (
    <ProductImageGallery
      images={images}
      title={product.title}
      activeImage={activeImage}
      onActiveImageChange={setActiveImage}
      onShare={onShare}
      onWishlist={onWishlist}
      isWishlisted={isWishlisted}
    />
  )
}

function ColorSwatches({ product, selected, onSelect }) {
  if (!product.colors.length) return null

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-slate-950">
        Color{selected ? `: ${selected}` : ''}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
        {product.colors.map((color, index) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`border bg-white p-1 text-center transition-colors ${
              isSameVariantOption(selected, color) ? 'border-auth-primary ring-1 ring-auth-primary' : 'border-slate-200'
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
              isSameVariantOption(selected, value)
                ? 'border-auth-primary bg-red-50 text-auth-primary ring-1 ring-auth-primary'
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

function VariantImageGroup({ label, values, images = {}, selected, onSelect, fallbackGallery = [] }) {
  if (!values.length) return null

  return (
    <div className="pt-3">
      <p className="text-xs font-semibold text-slate-950">
        {label}{selected ? `: ${selected}` : ''}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
        {values.map((value, index) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`border bg-white p-1 text-center transition-colors ${
              isSameVariantOption(selected, value)
                ? 'border-auth-primary ring-1 ring-auth-primary'
                : 'border-slate-200'
            }`}
          >
            <img
              src={images[value] ?? fallbackGallery[(index + 1) % fallbackGallery.length]}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <span className="mt-1 block text-[0.625rem] font-semibold text-slate-600">{value}</span>
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

const fallbackRatingDistribution = [
  { label: 'Small', value: 7 },
  { label: 'True to size', value: 88 },
  { label: 'Large', value: 4 },
]

function ProductInfoPanel({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  selectedCompatibleModel,
  setSelectedCompatibleModel,
  compatibleModelOptions = [],
  activeImage,
  activeVariant,
  activeSku,
  displayPriceInfo
}) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCartOpen, setAddedToCartOpen] = useState(false)
  const [addedToCartSnapshot, setAddedToCartSnapshot] = useState(null)
  const [trustInfoOpen, setTrustInfoOpen] = useState(null)
  const trustInfoRef = useRef(null)
  const navigate = useNavigate()
  const cartItems = useSelector(selectCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const { addToCart } = useCartActions()
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
  const compatibleModelValues = compatibleModelOptions
  const sizeValues = product.sizes ?? []
  const hasDuplicateCompatibleModels = compatibleModelValues.length > 0
    && colorValueSet.size > 0
    && compatibleModelValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const isColorVariantGroup = /color|colour/i.test(String(product.sizeGroupLabel ?? ''))
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
  const primaryVariantGroup = product.extraVariantGroups?.[0]
  const primaryVariantImages = primaryVariantGroup?.images ?? {}
  const hasPrimaryVariantImages = Object.keys(primaryVariantImages).length > 0
  const showVariantImagePicker = showSizeVariants && hasPrimaryVariantImages

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
  const isInCart = isProductInCart(cartItems, product, {
    productId: product.backendId ?? product.id,
    variantId: activeVariant?.id ?? null,
  })

  const hasSelectableVariants = Array.isArray(product.variants) && product.variants.length > 0

  const buildCartArgs = () => ({
    product: {
      ...product,
      productId: product.backendId ?? product.id,
      product_id: product.backendId ?? product.id,
    },
    options: {
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
      image: activeImage
        || product.colorImages?.[selectedColor]
        || resolveVariantGroupImage(product, selectedSize)
        || product.gallery?.[0]
        || product.image,
      variantImage: activeImage
        || product.colorImages?.[selectedColor]
        || resolveVariantGroupImage(product, selectedSize)
        || null,
      variantRecord: activeVariant ?? null,
    },
  })

  const handleAddToCart = async () => {
    if (isInCart) return

    if (isAddingToCart) return

    if (hasSelectableVariants && !activeVariant?.id) {
      notify.error('Please select a product option before adding to cart.')
      return
    }

    setIsAddingToCart(true)
    try {
      const { product: cartProduct, options: cartOptions } = buildCartArgs()
      const item = await addToCart(cartProduct, {
        ...cartOptions,
        silentSuccess: true,
      })

      if (item) {
        setAddedToCartSnapshot({
          image: cartOptions.image || product.image,
          quantity: cartOptions.quantity ?? quantity,
          variantLabel: cartOptions.variant || cartOptions.size || activeSku || '',
        })
        setAddedToCartOpen(true)
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (hasSelectableVariants && !activeVariant?.id) {
      notify.error('Please select a product option before continuing.')
      return
    }

    // Buy Now skips the cart entirely — the item is held client-side and
    // handed straight to the (single-item) checkout flow once the shopper is
    // authenticated, rather than going through addToCart/the cart API.
    const { product: cartProduct, options: cartOptions } = buildCartArgs()
    const buyNowItem = buildCartItem(cartProduct, cartOptions)
    saveBuyNowItem(buyNowItem)

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout/buy-now' } })
      return
    }

    navigate('/checkout/buy-now')
  }

  return (
    <aside className="min-w-0 bg-white p-3 sm:p-4">
      <AddedToCartFlyout
        open={addedToCartOpen}
        product={product}
        image={addedToCartSnapshot?.image}
        quantity={addedToCartSnapshot?.quantity ?? quantity}
        variantLabel={addedToCartSnapshot?.variantLabel}
        onClose={() => setAddedToCartOpen(false)}
        onViewCart={() => {
          setAddedToCartOpen(false)
          navigate('/cart')
        }}
      />
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
        <>
          <ColorSwatches product={product} selected={selectedColor} onSelect={setSelectedColor} />
          {showCompatibleModels && selectedColor ? (
            <VariantGroup
              label="Compatible Model"
              values={compatibleModelValues}
              selected={selectedCompatibleModel}
              onSelect={setSelectedCompatibleModel}
            />
          ) : null}
        </>
      )}

      {showVariantImagePicker ? (
        <>
          <VariantImageGroup
            label={product.sizeGroupLabel ?? 'Option'}
            values={sizeValues}
            images={primaryVariantImages}
            selected={selectedSize}
            onSelect={setSelectedSize}
            fallbackGallery={product.gallery}
          />
          {showCompatibleModels && selectedSize ? (
            <VariantGroup
              label="Compatible Model"
              values={compatibleModelValues}
              selected={selectedCompatibleModel}
              onSelect={setSelectedCompatibleModel}
            />
          ) : null}
        </>
      ) : showSizeVariants ? (
        <>
          <VariantGroup
            label={product.sizeGroupLabel ?? 'Size'}
            values={sizeValues}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
          {showCompatibleModels && selectedSize ? (
            <VariantGroup
              label="Compatible Model"
              values={compatibleModelValues}
              selected={selectedCompatibleModel}
              onSelect={setSelectedCompatibleModel}
            />
          ) : null}
        </>
      ) : null}

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
          onClick={handleBuyNow}
          className="rounded-full bg-[#FFA41C] px-6 py-3 text-xs font-bold text-slate-900 transition-colors hover:bg-[#F0950C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock || isAddingToCart || isInCart}
          onClick={handleAddToCart}
          aria-busy={isAddingToCart}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f5d020] bg-[#f5d020] px-6 py-3 text-xs font-bold text-slate-900 transition-colors hover:bg-[#e6c01d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding...
            </>
          ) : (
            isInCart ? 'Already in cart' : 'Add to Cart'
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
  const [modalOpen, setModalOpen] = useState(false)
  const detailsList = { ...product.keyDetails }
  if (activeSku) {
    detailsList['Model/SKU'] = activeSku
  }
  delete detailsList['Fulfillment']
  delete detailsList['fulfillment']
  delete detailsList['Status']
  delete detailsList['status']

  const customEntries = Array.isArray(product.customKeyDetailEntries) ? product.customKeyDetailEntries : []
  const sortedStandardEntries = sortKeyDetailEntries(Object.entries(detailsList))
  const allEntries = [...sortedStandardEntries, ...customEntries]
  const visibleEntries = allEntries.slice(0, KEY_DETAILS_VISIBLE_COUNT)
  const hasMore = allEntries.length > KEY_DETAILS_VISIBLE_COUNT

  return (
    <>
      <section className="relative min-w-0 bg-white p-4 sm:p-6">
        <h2 className="text-base font-bold text-slate-950">Key Details</h2>
        <dl className="mt-3 space-y-2.5 text-sm leading-5 text-slate-700">
          {visibleEntries.map(([key, value]) => (
            <div key={key} className="grid min-w-0 grid-cols-[minmax(0,7.5rem)_1fr] items-start gap-x-3 gap-y-0">
              <dt className="font-bold text-slate-900">{key}:</dt>
              <dd className="wrap-break-word">{value}</dd>
            </div>
          ))}
        </dl>
        {hasMore && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 text-left text-sm font-semibold text-auth-primary underline-offset-2 transition-colors hover:text-auth-primary-hover hover:underline"
          >
            See all details
          </button>
        )}
      </section>

      <KeyDetailsModal
        open={modalOpen}
        entries={allEntries}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}

function ReviewsEmptyState({ productName, onWriteReview, fillHeight }) {
  const prompts = [
    { label: 'Quality', hint: 'Feel, finish, and how it lasts' },
    { label: 'Delivery', hint: 'Speed, packing, and condition' },
    { label: 'Value', hint: 'Whether it earned the price' },
  ]

  return (
    <div
      className={`relative mt-4 flex flex-col overflow-hidden rounded-xl ${
        fillHeight ? 'min-h-0 flex-1' : 'min-h-80'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-50 via-white to-slate-50" />
      <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-amber-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-red-50 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 top-10 h-px bg-linear-to-r from-transparent via-amber-200/80 to-transparent" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 text-center sm:px-5">
        <span className="inline-flex items-stretch overflow-hidden border border-slate-300 text-[0.625rem] leading-none">
          <span className="bg-slate-950 px-2 py-1.5 font-bold tabular-nums text-white">0</span>
          <span className="bg-white px-2 py-1.5 font-semibold text-slate-600">reviews so far</span>
        </span>

        <p className="mt-4 text-5xl font-black tracking-tight text-slate-200 sm:text-6xl">0.0</p>
        <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Awaiting its first rating
        </p>

        <div className="mt-4 flex items-center justify-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className="size-7 drop-shadow-sm sm:size-8"
              fill={STAR_EMPTY_FILL}
              strokeWidth={0}
            />
          ))}
        </div>

        <h3 className="mt-4 text-sm font-extrabold tracking-tight text-slate-950">
          Be the first voice on this product
        </h3>
        {productName ? (
          <p className="mt-1 line-clamp-2 max-w-[17rem] text-xs font-semibold text-slate-500">
            {productName}
          </p>
        ) : null}
        <p className="mt-2 max-w-[19rem] text-[0.6875rem] leading-5 text-slate-500">
          Shoppers are waiting to hear how it holds up in real life. A clear explanation goes a long way.
        </p>

        <button
          type="button"
          onClick={onWriteReview}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-auth-primary px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_20px_-12px_rgba(199,59,45,0.7)] transition hover:bg-auth-primary-hover"
        >
          Write the first review
        </button>

        <div className="mt-5 grid w-full max-w-sm grid-cols-3 gap-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.label}
              className="rounded-lg border border-slate-200/80 bg-white/90 px-2 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
            >
              <p className="text-[0.625rem] font-bold text-slate-800">{prompt.label}</p>
              <p className="mt-1 text-[0.5rem] leading-3.5 text-slate-500">{prompt.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-auto space-y-2 px-4 pb-4" aria-hidden="true">
        {[0.5, 0.28, 0.12].map((opacity, index) => (
          <div
            key={index}
            className="flex gap-2.5 rounded-lg border border-slate-100 bg-white/90 px-3 py-2.5"
            style={{ opacity }}
          >
            <span className="size-7 shrink-0 rounded-full bg-linear-to-br from-slate-200 to-slate-100" />
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-20 rounded-full bg-slate-200" />
                <span className="h-1.5 w-10 rounded-full bg-slate-100" />
              </div>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, star) => (
                  <Star key={star} className="size-2.5" fill={STAR_EMPTY_FILL} strokeWidth={0} />
                ))}
              </span>
              <span className="block h-1.5 w-full rounded-full bg-slate-100" />
              <span className="block h-1.5 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewSummary({ product, fillHeight = false }) {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const reviews = product.reviews ?? []
  const visibleReviews = reviews.slice(0, 3)
  const hasReviews = product.reviewCount > 0 || reviews.length > 0

  const handleWriteReview = () => {
    const destination = '/account/reviews/new'
    if (isAuthenticated) {
      navigate(destination)
      return
    }
    navigate('/login', { state: { from: destination } })
  }

  return (
    <section
      id="reviews"
      className={`min-w-0 w-full bg-white p-3 sm:p-4 ${fillHeight ? 'flex min-h-70 flex-1 flex-col' : ''}`}
    >
      <div className="shrink-0" data-review-header>
        <h2 className="text-base font-bold text-slate-950">Customer&apos;s Feedback</h2>
        {hasReviews ? (
          <>
            <h3 className="mt-4 text-sm font-bold text-slate-950">Review this product</h3>
            <p className="mt-1 text-xs text-slate-600">Share your thoughts with other customers</p>
            <button
              className="mt-3 w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-auth-primary hover:bg-red-50 hover:text-auth-primary"
              type="button"
              onClick={handleWriteReview}
            >
              Write a customer review
            </button>

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

            <div className="mt-5 flex flex-wrap gap-2">
              {['Nice', 'Perfect Fitting', 'Comfy'].map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[0.625rem] font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {hasReviews ? (
        <>
          <div
            data-review-list
            className={`space-y-3 ${fillHeight ? 'mt-4 min-h-0 flex-1' : 'mt-4'}`}
          >
            {visibleReviews.map((review) => (
              <article key={review.id} data-review-card className="border-t border-slate-200 pt-3">
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

          {reviews.length > 3 && (
            <div
              data-review-footer
              className={`text-center ${fillHeight ? 'mt-auto shrink-0 pt-4' : 'mt-5'}`}
            >
              <button
                type="button"
                onClick={() => setShowAllReviews(true)}
                className="rounded-full border border-slate-300 px-6 py-2 text-xs font-semibold text-slate-800 transition hover:border-auth-primary hover:bg-red-50 hover:text-auth-primary"
              >
                See All Reviews
              </button>
            </div>
          )}
        </>
      ) : (
        <ReviewsEmptyState
          productName={product.title ?? product.name}
          onWriteReview={handleWriteReview}
          fillHeight={fillHeight}
        />
      )}

      <ProductReviewsModal
        open={showAllReviews}
        productName={product.title ?? product.name}
        reviews={reviews}
        averageRating={product.rating}
        onClose={() => setShowAllReviews(false)}
      />
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
  const cartItems = useSelector(selectCartItems)
  const { addToCart } = useCartActions()
  const miniCart = useOptionalMiniCart()
  const [isAdding, setIsAdding] = useState(false)
  const productId = product.backendId ?? product.id
  const isInCart = isProductInCart(cartItems, product, { productId, variantId: null })

  const handleRailAddToCart = async () => {
    if (isAdding || isInCart) return

    setIsAdding(true)
    try {
      const item = await addToCart(product, {
        productId,
        syncable: Boolean(productId),
        quantity: 1,
        silentSuccess: true,
      })
      if (item) miniCart?.openMiniCart()
    } finally {
      setIsAdding(false)
    }
  }

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
        <span className="group/rail-cart relative flex shrink-0">
          <button
            type="button"
            onClick={handleRailAddToCart}
            disabled={isAdding || isInCart}
            aria-busy={isAdding}
            aria-label={isInCart ? `${product.name} is already in cart` : `Add ${product.name} to cart`}
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed ${
              isInCart
                ? 'border-slate-200 bg-slate-100 text-slate-400'
                : 'border-slate-300 text-slate-500 hover:border-auth-primary hover:text-auth-primary'
            }`}
          >
            {isAdding
              ? <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              : <ShoppingCart className="size-3" strokeWidth={1.8} />}
          </button>
          {isInCart && (
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-[calc(100%+0.4rem)] right-0 z-30 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[0.625rem] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover/rail-cart:opacity-100 group-focus-within/rail-cart:opacity-100"
            >
              Already in cart
            </span>
          )}
        </span>
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
const MAX_DESCRIPTIVE_LANDSCAPE_IMAGE_COUNT = 3
/** Ratio (width ÷ height) at or above which a descriptive image is treated as a wide
 *  landscape banner (one per row) instead of the legacy 2-per-row grid tile. */
const DESCRIPTIVE_IMAGE_LANDSCAPE_RATIO_THRESHOLD = 2

function readImageUrlDimensions(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Missing image URL'))
      return
    }

    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Could not read image dimensions'))
    image.src = url
  })
}

/**
 * Backend has no flag for "wide banner" vs legacy "square tile" descriptive images, so we
 * measure each image's rendered aspect ratio client-side. A set only switches to the new
 * one-per-row banner layout once every image in it is confirmed landscape — this keeps older
 * products (uploaded before the wide-banner format existed) safely on the legacy 2×2 grid.
 */
function useDescriptiveImagesLandscapeLayout(imageUrls) {
  const [isLandscapeLayout, setIsLandscapeLayout] = useState(false)

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLandscapeLayout(false)
      return undefined
    }

    let cancelled = false

    Promise.all(imageUrls.map((url) => readImageUrlDimensions(url).catch(() => null)))
      .then((results) => {
        if (cancelled) return
        const allLandscape = results.every((result) => (
          result?.width > 0
          && result?.height > 0
          && result.width / result.height >= DESCRIPTIVE_IMAGE_LANDSCAPE_RATIO_THRESHOLD
        ))
        setIsLandscapeLayout(allLandscape)
      })

    return () => {
      cancelled = true
    }
  }, [imageUrls])

  return isLandscapeLayout
}

function DescriptiveImagesGrid({ product }) {
  const descriptiveImages = useMemo(
    () => (product.descriptiveImages ?? []).filter(Boolean),
    [product],
  )
  const hasDescriptive = descriptiveImages.length > 0
  const isLandscapeLayout = useDescriptiveImagesLandscapeLayout(descriptiveImages)
  const viewableImages = useMemo(() => [...new Set(descriptiveImages)], [descriptiveImages])

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [zoom, setZoom] = useState(1)

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    setZoom(1)
  }, [setLightboxIndex, setZoom])

  const goPrev = useCallback(() => {
    if (viewableImages.length <= 1) return
    setZoom(1)
    setLightboxIndex((index) => (
      index === null ? null : (index - 1 + viewableImages.length) % viewableImages.length
    ))
  }, [viewableImages.length, setLightboxIndex, setZoom])

  const goNext = useCallback(() => {
    if (viewableImages.length <= 1) return
    setZoom(1)
    setLightboxIndex((index) => (
      index === null ? null : (index + 1) % viewableImages.length
    ))
  }, [viewableImages.length, setLightboxIndex, setZoom])

  const openLightbox = (src) => {
    const index = viewableImages.indexOf(src)
    if (index < 0) return
    setZoom(1)
    setLightboxIndex(index)
  }

  // Descriptive images are optional — render nothing rather than padding with product/gallery images.
  if (!hasDescriptive) return null

  const lightboxImage = lightboxIndex === null ? null : viewableImages[lightboxIndex]
  const visibleImages = isLandscapeLayout
    ? descriptiveImages.slice(0, MAX_DESCRIPTIVE_LANDSCAPE_IMAGE_COUNT)
    : descriptiveImages.slice(0, DESCRIPTIVE_GRID_SIZE)

  return (
    <>
      <div className="mt-6 w-full min-w-0">
        <div
          className={
            isLandscapeLayout
              ? 'flex w-full flex-col'
              : 'grid w-full grid-cols-2 gap-2 sm:gap-3'
          }
        >
          {visibleImages.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => openLightbox(src)}
              aria-label={`View product detail ${index + 1} full size`}
              className={
                isLandscapeLayout
                  ? 'group cursor-zoom-in overflow-hidden bg-slate-100 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40'
                  : 'group cursor-zoom-in overflow-hidden rounded-sm bg-slate-100 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40'
              }
            >
              <img
                src={src}
                alt=""
                className="block h-auto w-full max-w-full transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </button>
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
          currentIndex={lightboxIndex ?? 0}
          imageCount={viewableImages.length}
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const detailsList = { ...product.details }
  delete detailsList['SKU']
  delete detailsList['sku']
  delete detailsList['Sku']

  const detailRows = Object.entries(detailsList)

  const hasHtmlDescription = Boolean(product.descriptionHtml)
  const descriptionLength = hasHtmlDescription
    ? String(product.descriptionHtml).length
    : String(product.description ?? '').length
  const isLongDescription = hasHtmlDescription
    ? descriptionLength > DESCRIPTION_LONG_HTML_THRESHOLD
    : descriptionLength > DESCRIPTION_LONG_TEXT_THRESHOLD

  return (
    <section className="min-w-0 bg-white p-3 sm:p-5">
      <h2 className="text-base font-bold text-slate-950">Product description</h2>
      <div className="mt-5 divide-y divide-slate-300 border-y border-slate-300">
        {detailRows.map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-1.5 py-4 text-sm">
            <dt className="font-bold text-slate-950">{key}</dt>
            <dd className="wrap-break-word text-slate-700">{value}</dd>
          </div>
        ))}
        <div className="grid min-w-0 gap-1.5 py-4 text-sm">
          <dt className="font-bold text-slate-950">Description</dt>
          <dd className="relative min-w-0 text-slate-700">
            {hasHtmlDescription ? (
              <div
                className={`product-description text-sm leading-relaxed text-slate-700 ${
                  !descriptionExpanded && isLongDescription ? 'max-h-56 overflow-hidden' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p
                className={`wrap-break-word text-sm leading-relaxed ${
                  !descriptionExpanded && isLongDescription ? 'line-clamp-6' : ''
                }`}
              >
                {product.description}
              </p>
            )}

            {!descriptionExpanded && isLongDescription && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-8 h-16 bg-linear-to-t from-white to-transparent"
              />
            )}

            {isLongDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((current) => !current)}
                className="relative z-10 mt-3 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline"
              >
                {descriptionExpanded ? 'Show less' : 'Read more'}
              </button>
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
    name: review.user?.name
      || [review.user?.first_name, review.user?.last_name].filter(Boolean).join(' ')
      || review.user_name
      || review.customer_name
      || review.name
      || 'Customer',
    rating: toNumber(review.rating ?? review.stars, 5),
    date: formatReviewDate(review.created_at, review.date),
    title: review.title ?? review.heading ?? '',
    text: review.comment ?? review.review ?? review.message ?? review.text ?? 'Good quality product.',
    images: toArray(review.media ?? review.review_media ?? review.attachments ?? review.images)
      .map((media) => media?.url ?? media?.image_url ?? media?.file_url ?? media?.path)
      .filter(Boolean),
  }))

  return reviews
}

function formatReviewDate(dateValue, fallback = 'Recent') {
  if (!dateValue) return fallback
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date)
}

function formatVariantGroupLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
}

function ensureVariantGroupStore(store, groupKey) {
  if (!store[groupKey]) {
    store[groupKey] = { values: new Set(), images: {} }
  }
  return store[groupKey]
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

  // Build gallery from non-descriptive product images only (up to 10).
  const galleryUrls = []
  if (Array.isArray(apiProduct.images)) {
    apiProduct.images.forEach((img) => {
      if (isDescriptiveImageRecord(img)) return
      const url = String(img?.image_url ?? img?.url ?? img?.preview ?? '').trim()
      if (url) galleryUrls.push(url)
    })
  }
  if (galleryUrls.length === 0) {
    galleryUrls.push(core.image)
  }

  const colorImages = {}
  const colors = []
  const otherVariantGroups = {}

  variants.forEach((variant) => {
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
    const normalizedKey = String(attributeKey ?? '').trim().toLowerCase()
    const valueText = attributeValue != null && attributeValue !== '' ? String(attributeValue) : ''
    const varImage = resolveVariantImageUrl(variant)

    if ((normalizedKey === 'color' || normalizedKey === 'colour') && valueText) {
      if (!colors.includes(valueText)) colors.push(valueText)
      if (varImage) colorImages[valueText] = varImage
      return
    }

    if (attributeKey && valueText) {
      const groupKey = String(attributeKey).trim()
      const group = ensureVariantGroupStore(otherVariantGroups, groupKey)
      group.values.add(valueText)
      if (varImage) group.images[valueText] = varImage
      return
    }

    const legacyColor = getVariantAttributeValue(variant, 'color')
      || (variant?.color ? String(variant.color).trim() : '')
    if (legacyColor) {
      if (!colors.includes(legacyColor)) colors.push(legacyColor)
      if (varImage) colorImages[legacyColor] = varImage
    }

    const legacySize = getVariantAttributeValue(variant, 'size')
      || (variant?.size ? String(variant.size).trim() : '')
    if (legacySize) {
      const group = ensureVariantGroupStore(otherVariantGroups, 'size')
      group.values.add(legacySize)
      if (varImage) group.images[legacySize] = varImage
    }
  })

  variants.forEach((variant) => {
    const url = resolveVariantImageUrl(variant)
    if (url) galleryUrls.push(url)
  })
  const uniqueGallery = [...new Set(galleryUrls)].slice(0, MAX_GALLERY_IMAGES)

  const extraVariantGroups = Object.entries(otherVariantGroups).map(([key, group]) => ({
    key,
    label: formatVariantGroupLabel(key),
    values: [...group.values],
    images: group.images,
  }))

  const uniqueColors = colors
  const uniqueSizes = extraVariantGroups[0]?.values ?? []
  const sizeGroupKey = extraVariantGroups[0]?.key ?? 'size'
  const sizeGroupLabel = extraVariantGroups[0]?.label ?? 'Size'

  const compatibleModels = [
    ...new Set(variants.flatMap((variant) => getVariantCompatibleModels(variant))),
  ]

  const { descriptionHtml, description } = normalizeProductDescription(apiProduct.description)
  const reviews = normalizeProductReviews(apiProduct)
  const explicitReviewCount = apiProduct.reviews_count ?? apiProduct.review_count ?? apiProduct.total_reviews
  const reviewCount = explicitReviewCount !== undefined && explicitReviewCount !== null
    ? toNumber(explicitReviewCount, reviews.length)
    : reviews.length
  const calculatedRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0
  const rating = toNumber(
    apiProduct.rating ?? apiProduct.average_rating ?? apiProduct.avg_rating,
    calculatedRating,
  )

  const categoryName = apiProduct.category?.category_name || 'General'
  const barcode = getMetadataValue(metadata, 'barcode') || apiProduct.barcode || variants.find((v) => v?.barcode)?.barcode
  const condition = formatProductCondition(apiProduct.condition ?? getMetadataValue(metadata, 'condition'))
  const brandName = resolveBrandName(apiProduct) || null
  const customKeyDetails = mapKeyDetailsToObject(apiProduct)
  const customKeyDetailEntries = mapKeyDetailsEntries(apiProduct)
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
    sizeGroupKey,
    sizeGroupLabel,
    compatibleModels,
    extraVariantGroups,
    colorImages,
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
    customKeyDetailEntries,
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
  const {
    data: landingData,
    isPending: isLandingPending,
    isFetching: isLandingFetching,
  } = useLandingPageData()

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

  const {
    data: apiProduct,
    isPending: isProductPending,
    isFetching: isProductFetching,
    isError: isProductError,
  } = useQuery({
    queryKey: ['product-details', apiProductId],
    queryFn: () => getProductById(apiProductId),
    enabled: Boolean(apiProductId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: productReviewData } = useQuery({
    queryKey: ['product-reviews', apiProductId],
    queryFn: () => getProductReviews(apiProductId),
    enabled: Boolean(apiProductId),
    staleTime: 60 * 1000,
  })

  const isWaitingForLanding = !landingData && (isLandingPending || isLandingFetching)
  const isWaitingForProductDetails = Boolean(apiProductId)
    && !apiProduct
    && !isProductError
    && (isProductPending || isProductFetching)

  const showSkeleton = isWaitingForLanding || isWaitingForProductDetails

  const product = useMemo(() => {
    if (apiProduct && isProductActive(apiProduct)) {
      return normalizeApiProductDetails({
        ...apiProduct,
        ...(productReviewData ? {
          reviews: productReviewData.reviews,
          reviews_count: productReviewData.reviewCount,
          average_rating: productReviewData.averageRating,
          rating_distribution: productReviewData.ratingDistribution,
        } : {}),
      })
    }
    if (showSkeleton) {
      return null
    }
    if (landingProduct) {
      return normalizeApiProductDetails(landingProduct)
    }
    return getProductBySlug(slug)
  }, [apiProduct, landingProduct, productReviewData, showSkeleton, slug])

  const productViewKey = useMemo(() => {
    if (!product) return `loading::${slug}`
    return [
      product.slug ?? slug,
      product.backendId ?? product.id ?? 'local',
      product.variants?.length ?? 0,
      product.colors?.length ?? 0,
      product.sizes?.length ?? 0,
      product.compatibleModels?.length ?? 0,
    ].join('::')
  }, [product, slug])

  if (showSkeleton || !product) {
    return (
      <SiteLayout>
        <main className="bg-[#f2f2f2] py-3 sm:py-4">
          <Container>
            <ProductDetailsSkeleton />
          </Container>
        </main>
      </SiteLayout>
    )
  }

  return (
    <ProductDetailsView
      key={productViewKey}
      product={product}
      apiProduct={apiProduct}
      landingData={landingData}
    />
  )
}

function resolveColorImage(product, color) {
  if (!color) return null
  if (product.colorImages?.[color]) return product.colorImages[color]

  const match = Object.entries(product.colorImages ?? {}).find(
    ([key]) => isSameVariantOption(key, color),
  )
  return match?.[1] ?? null
}

function resolveVariantGroupImage(product, value, groupIndex = 0) {
  if (!value) return null

  const images = product.extraVariantGroups?.[groupIndex]?.images ?? {}
  if (images[value]) return images[value]

  const match = Object.entries(images).find(
    ([key]) => isSameVariantOption(key, value),
  )
  return match?.[1] ?? null
}

function resolveProductSizeAttribute(product) {
  return product.sizeGroupKey ?? product.sizeGroupLabel ?? 'size'
}

function getVariantColorValue(variant) {
  return getVariantAttributeValue(variant, 'color')
    || getVariantAttributeValue(variant, 'colour')
    || (variant?.color ? String(variant.color).trim() : '')
}

function getVariantSizeValue(variant, product) {
  const sizeAttribute = resolveProductSizeAttribute(product)
  return getVariantAttributeValue(variant, sizeAttribute)
    || (variant?.size ? String(variant.size).trim() : '')
}

function findPrimaryVariant(product, { color = '', size = '' } = {}) {
  const variants = product?.variants ?? []
  if (color) {
    const match = variants.find((variant) => isSameVariantOption(getVariantColorValue(variant), color))
    if (match) return match
  }
  if (size) {
    const match = variants.find((variant) => isSameVariantOption(getVariantSizeValue(variant, product), size))
    if (match) return match
  }
  return variants[0] ?? null
}

function resolveSelectedVariantImage(product, { color = '', size = '' } = {}) {
  const variant = findPrimaryVariant(product, { color, size })
  return resolveColorImage(product, color)
    || resolveVariantGroupImage(product, size)
    || resolveVariantImageUrl(variant)
    || null
}

function resolveCompatibleModelOptions(product, { color = '', size = '' } = {}) {
  const variant = findPrimaryVariant(product, { color, size })
  if (!variant) return []
  return getVariantCompatibleModels(variant)
}

function pickDefaultCompatibleModel(product, options = []) {
  if (!options.length) return ''
  return resolveCanonicalVariantOption(options[0], product.compatibleModels) || options[0]
}

/**
 * Color and Size are independent variant types (separate SKUs), not a matrix.
 * Default to the first variant only; if it has compatible models, pick the first.
 * Other groups stay unselected until the shopper chooses one.
 */
function resolveInitialVariantSelections(product) {
  const firstVariant = product.variants?.[0] ?? null

  if (!firstVariant) {
    return {
      color: product.colors?.[0] ?? '',
      size: '',
      compatibleModel: '',
    }
  }

  const rawColor = getVariantColorValue(firstVariant)
  const rawSize = getVariantSizeValue(firstVariant, product)
  const color = rawColor
    ? (resolveCanonicalVariantOption(rawColor, product.colors) || rawColor)
    : ''
  const size = color
    ? ''
    : rawSize
      ? (resolveCanonicalVariantOption(rawSize, product.sizes) || rawSize)
      : ''

  const variantModels = getVariantCompatibleModels(firstVariant)
  const compatibleModel = variantModels.length > 0
    ? (resolveCanonicalVariantOption(variantModels[0], product.compatibleModels) || variantModels[0])
    : ''

  return { color, size, compatibleModel }
}

function ProductDetailsView({ product, apiProduct, landingData }) {
  const queryClient = useQueryClient()
  const initialSelections = useMemo(() => resolveInitialVariantSelections(product), [product])
  const [activeImage, setActiveImage] = useState(
    () => resolveSelectedVariantImage(product, initialSelections) || product.gallery?.[0] || null,
  )
  const [selectedColor, setSelectedColor] = useState(initialSelections.color)
  const [selectedSize, setSelectedSize] = useState(initialSelections.size)
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState(initialSelections.compatibleModel)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [localWishlisted, setLocalWishlisted] = useState(false)

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: getUserWishlist,
    enabled: Boolean(isAuthenticated),
    staleTime: 30000,
  })

  const currentWishlistItem = useMemo(() => {
    if (!wishlistItems || !Array.isArray(wishlistItems)) return null
    const targetProductId = String(apiProduct?.id ?? product.backendId ?? product.id ?? '').trim()
    const targetSlug = String(product?.slug ?? '').trim()
    return wishlistItems.find((item) => {
      const itemId = String(item.product?.id ?? item.product_id ?? item.productId ?? '').trim()
      const itemSlug = String(item.product?.slug ?? '').trim()
      if (targetProductId && itemId && targetProductId === itemId) return true
      if (targetSlug && itemSlug && targetSlug === itemSlug) return true
      return false
    }) ?? null
  }, [wishlistItems, apiProduct, product])

  const isWishlisted = Boolean(currentWishlistItem || localWishlisted)

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      notify.info('Item already in wishlist')
      return
    }

    if (!isAuthenticated) {
      notify.error('Please sign in to add items to your wishlist')
      return
    }

    const productId = String(apiProduct?.id ?? product.backendId ?? product.id ?? '').trim()
    const payload = {
      product_id: productId,
      product_variant_id: activeVariant?.id ? String(activeVariant.id).trim() : null,
    }

    try {
      await addToWishlist(payload)
      setLocalWishlisted(true)
      await queryClient.invalidateQueries({ queryKey: ['user-wishlist'] })
      notify.success('Added to wishlist')
    } catch (err) {
      notify.fromError(err, 'Failed to add item to wishlist')
      if (import.meta.env.DEV) {
        console.warn(
          '[wishlist] API call failed:',
          err?.response?.data ? JSON.stringify(err.response.data) : err?.message || err,
        )
      }
    }
  }

  const compatibleModelOptions = useMemo(
    () => resolveCompatibleModelOptions(product, {
      color: selectedColor,
      size: selectedSize,
    }),
    [product, selectedColor, selectedSize],
  )

  const effectiveCompatibleModel = useMemo(() => {
    if (!compatibleModelOptions.length) return ''
    if (
      selectedCompatibleModel
      && compatibleModelOptions.some((model) => isSameVariantOption(model, selectedCompatibleModel))
    ) {
      return selectedCompatibleModel
    }
    return pickDefaultCompatibleModel(product, compatibleModelOptions)
  }, [compatibleModelOptions, selectedCompatibleModel, product])

  const displayActiveImage = useMemo(() => {
    if (activeImage != null) return activeImage
    return resolveSelectedVariantImage(product, {
      color: selectedColor,
      size: selectedSize,
    }) || product.gallery?.[0] || null
  }, [activeImage, selectedColor, selectedSize, product])

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)
    setSelectedSize('')

    const matchingVariant = findPrimaryVariant(product, { color: newColor })
    const availableModels = getVariantCompatibleModels(matchingVariant)
    setSelectedCompatibleModel(pickDefaultCompatibleModel(product, availableModels))

    const varImage = resolveSelectedVariantImage(product, { color: newColor })
    if (varImage) setActiveImage(varImage)
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)
  }

  const handleSizeSelect = (newSize) => {
    setSelectedSize(newSize)
    setSelectedColor('')

    const matchingVariant = findPrimaryVariant(product, { size: newSize })
    const availableModels = getVariantCompatibleModels(matchingVariant)
    setSelectedCompatibleModel(pickDefaultCompatibleModel(product, availableModels))

    const variantImage = resolveSelectedVariantImage(product, { size: newSize })
    if (variantImage) setActiveImage(variantImage)
  }

  const activeVariant = useMemo(
    () => findPrimaryVariant(product, { color: selectedColor, size: selectedSize }),
    [product, selectedColor, selectedSize],
  )

  const activeSku = useMemo(() => {
    return activeVariant?.sku || product?.sku || product?.keyDetails?.['Model/SKU'] || 'N/A'
  }, [activeVariant, product])

  const displayPriceInfo = useMemo(() => {
    const pricing = resolveProductDisplayPrices(product, activeVariant)
    const price = pricing.price ?? 0
    const compareAt = pricing.compareAt ?? null
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
          <section className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] lg:items-start">
            <div className="contents lg:sticky lg:top-14 lg:z-10 lg:flex lg:flex-col lg:gap-4 lg:self-start">
              <div className="order-1 min-w-0">
                <ProductGallery
                  product={product}
                  activeImage={displayActiveImage}
                  setActiveImage={setActiveImage}
                  onShare={() => shareProduct(product)}
                  onWishlist={handleWishlistToggle}
                  isWishlisted={isWishlisted}
                />
              </div>

              <div className="order-3 flex min-w-0 flex-col gap-4">
                <KeyDetails product={product} activeSku={activeSku} />
                <HorizontalProductRail title="Other Items From Seller" products={sellerProducts} visibleCount={3} />
              </div>
            </div>

            <div className="order-2 flex min-w-0 flex-col gap-3" data-product-sidebar>
              <ProductInfoPanel
                product={product}
                selectedColor={selectedColor}
                setSelectedColor={handleColorSelect}
                selectedSize={selectedSize}
                setSelectedSize={handleSizeSelect}
                selectedCompatibleModel={effectiveCompatibleModel}
                setSelectedCompatibleModel={handleCompatibleModelSelect}
                compatibleModelOptions={compatibleModelOptions}
                activeImage={displayActiveImage}
                activeVariant={activeVariant}
                activeSku={activeSku}
                displayPriceInfo={displayPriceInfo}
              />
              <ReviewSummary product={product} />
            </div>
          </section>

          <ProductDescription product={product} />
          <HorizontalProductRail title="Explore Other Related Items" products={exploreRelatedProducts} visibleCount={5} />
        </Container>
      </main>
    </SiteLayout>
  )
}
