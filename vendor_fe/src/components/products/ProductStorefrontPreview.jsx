import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Info,
  Layers3,
  Minus,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import notify from '../../lib/notify'
import { formatItemWeight, formatPackageDimensions, getProductConditionLabel, isReservedKeyDetailKey, mapDescriptiveImageUrls, mapKeyDetailsFromRecord, sortKeyDetailEntries } from '../../utils/productMetadata'

const cediFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatCedi(value) {
  return cediFormatter.format(Number(value) || 0)
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

function stripHtml(html) {
  return String(html ?? '').replace(/<[^>]*>/g, '').trim()
}

const FALLBACK_REVIEWS = [
  {
    id: 'preview-review-1',
    name: 'Isaac Morgan',
    rating: 5,
    date: 'Jan 09, 2026',
    text: 'This item is exactly as described. The finishing feels solid and delivery was quick.',
  },
  {
    id: 'preview-review-2',
    name: 'Akua Mensah',
    rating: 5,
    date: 'Jan 06, 2026',
    text: 'Good quality and comfortable to use every day. I would buy from this seller again.',
  },
  {
    id: 'preview-review-3',
    name: 'Isaac Morgan',
    rating: 4,
    date: 'Jan 04, 2026',
    text: 'Looks nice and fits well. Packaging was clean and the product arrived safely.',
  },
]

const FALLBACK_RATING_DISTRIBUTION = [
  { label: 'Small', value: 7 },
  { label: 'True to size', value: 88 },
  { label: 'Large', value: 4 },
]

// ─── Data shaping ───────────────────────────────────────────────────────────

function buildStorefrontPreview({ product, rawRecord, images, conditionLabel }) {
  const variants = Array.isArray(rawRecord?.variants) ? rawRecord.variants : []
  const sku = (product?.sku && product.sku !== '—') ? product.sku : (variants[0]?.sku || 'N/A')

  const galleryUrls = []
  const sortedImages = [...(images ?? [])].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
  )
  sortedImages.forEach((img) => { if (img?.image_url) galleryUrls.push(img.image_url) })
  variants.forEach((variant) => {
    (variant.images ?? []).forEach((img) => { if (img?.image_url) galleryUrls.push(img.image_url) })
  })
  const gallery = [...new Set(galleryUrls)]

  const colorImages = {}
  const colors = []
  const otherVariantGroups = {}

  variants.forEach((variant) => {
    const attrs = variant.attributes ?? {}
    const attrKeys = Object.keys(attrs)
    const colorKey = attrKeys.find((key) => key.toLowerCase() === 'color')
    const colorVal = colorKey ? attrs[colorKey] : (variant.color || variant.variant_name)

    if (colorVal) {
      if (!colors.includes(colorVal)) colors.push(colorVal)
      const varImage = variant.images?.[0]?.image_url || variant.image_url || variant.image
      if (varImage) colorImages[colorVal] = varImage
    }

    attrKeys.filter((key) => key.toLowerCase() !== 'color').forEach((key) => {
      if (!otherVariantGroups[key]) otherVariantGroups[key] = new Set()
      if (attrs[key]) otherVariantGroups[key].add(String(attrs[key]))
    })

    const size = variant.size || variant.attributes?.size
    if (size) {
      if (!otherVariantGroups.size) otherVariantGroups.size = new Set()
      otherVariantGroups.size.add(String(size))
    }
  })

  const extraVariantGroups = Object.entries(otherVariantGroups).map(([key, valueSet]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    values: [...valueSet],
  }))

  const sizes = extraVariantGroups[0]?.values ?? []
  const sizeGroupLabel = extraVariantGroups[0]?.label ?? 'Size'
  const compatibleModels = [...new Set(variants.map((variant) => variant.variant_name).filter(Boolean))]

  const keyDetails = {}
  mapKeyDetailsFromRecord(rawRecord).forEach((item) => {
    const key = item?.key?.trim()
    const value = String(item?.value ?? '').trim()
    if (key && value && !isReservedKeyDetailKey(key)) keyDetails[key] = value
  })

  const metadata = Array.isArray(rawRecord?.metadata) ? rawRecord.metadata : []
  const categoryName = product?.category && product.category !== '—' ? product.category : 'General'
  const conditionLabelFromMeta = getProductConditionLabel(
    metadata.find((item) => item?.key === 'condition')?.value,
  )

  keyDetails.Category = categoryName
  keyDetails['Model/SKU'] = sku
  if (product?.barcode) keyDetails.Barcode = product.barcode
  if (conditionLabelFromMeta) keyDetails.Condition = conditionLabelFromMeta
  if (product?.brand && product.brand !== '—') keyDetails.Brand = product.brand
  const packageDimensions = formatPackageDimensions(metadata)
  if (packageDimensions) keyDetails['Package Dimensions'] = packageDimensions
  keyDetails['Item Weight'] = formatItemWeight(metadata)

  const description = stripHtml(rawRecord?.description) || 'No description available for this product.'
  const stockCount = product?.stock ?? 0
  const barcode = product?.barcode || variants.find((variant) => variant?.barcode)?.barcode || null
  const tags = Array.isArray(rawRecord?.tags) ? rawRecord.tags : []
  const descriptiveImages = mapDescriptiveImageUrls(rawRecord?.descriptive_images)

  return {
    id: product?.id,
    slug: rawRecord?.slug || String(product?.id ?? ''),
    title: product?.name || 'Untitled product',
    storeName: rawRecord?.vendor?.store_name
      || rawRecord?.vendor?.business_name
      || rawRecord?.store?.name
      || 'Your Store',
    salesCount: 120,
    soldIndicator: '100+ bought in past month',
    inStock: stockCount > 0,
    stockCount,
    lowStockThreshold: product?.lowStockThreshold,
    barcode,
    tags,
    variants,
    gallery,
    colors,
    sizes,
    sizeGroupLabel,
    compatibleModels,
    extraVariantGroups,
    colorImages,
    keyDetails,
    description,
    descriptiveImages,
    details: {
      SKU: sku,
      Condition: conditionLabel || 'Not specified',
      Category: product?.category && product.category !== '—' ? product.category : 'General',
    },
    ratingDistribution: FALLBACK_RATING_DISTRIBUTION,
    rating: 4.5,
    reviewCount: 91,
    reviews: FALLBACK_REVIEWS,
    regularPrice: product?.regularPrice ?? 0,
    salePrice: product?.salePrice ?? product?.regularPrice ?? 0,
    hasDiscount: Boolean(product?.hasDiscount),
  }
}

// ─── Small shared bits ──────────────────────────────────────────────────────

function Stars({ rating, size = 'size-4' }) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, normalizedRating - index))
        const fillWidth = `${fill * 100}%`

        return (
          <span key={index} className={`relative inline-flex shrink-0 ${size}`}>
            <Star className="size-full" fill="#E2E8F0" strokeWidth={0} />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: fillWidth }}
              >
                <Star className="size-full" fill="#F59E0B" strokeWidth={0} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function PreviewGallery({ gallery, activeImage, setActiveImage, title }) {
  const currentImage = activeImage || gallery[0]

  if (!gallery.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-300 sm:aspect-[1.45]">
        <Package className="size-12" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="group bg-white">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden sm:aspect-[1.45]">
          <img
            src={currentImage}
            alt={title}
            className="size-full object-contain origin-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.03]"
          />
        </div>
      </div>
      {gallery.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`size-13 shrink-0 overflow-hidden border bg-white p-0.5 transition-colors sm:size-15 ${
                currentImage === image ? 'border-brand' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
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
                : 'border-slate-200 bg-white text-slate-500 hover:border-brand hover:text-brand'
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
        className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-brand">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex size-7 items-center justify-center rounded-full text-brand transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

// ─── Info panel (title, price, variants, CTAs) ─────────────────────────────

function InfoPanel({
  preview,
  activeVariant,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  selectedCompatibleModel,
  setSelectedCompatibleModel,
  displayPriceInfo,
}) {
  const [quantity, setQuantity] = useState(1)

  const variantStock = activeVariant?.quantity != null && activeVariant.quantity !== ''
    ? toNumber(activeVariant.quantity, 0)
    : null
  const stockCount = variantStock != null ? variantStock : preview.stockCount
  const lowStockThreshold = activeVariant?.low_stock_threshold != null
    ? toNumber(activeVariant.low_stock_threshold, preview.lowStockThreshold ?? 10)
    : (preview.lowStockThreshold ?? 10)
  const outOfStock = stockCount <= 0
  const colorValueSet = new Set((preview.colors ?? []).map((value) => String(value).toLowerCase()))
  const compatibleModelValues = preview.compatibleModels ?? []
  const sizeValues = preview.sizes ?? []
  const hasDuplicateCompatibleModels = compatibleModelValues.length > 0
    && colorValueSet.size > 0
    && compatibleModelValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const isColorVariantGroup = String(preview.sizeGroupLabel ?? '').toLowerCase().includes('color')
  const hasDuplicateSizeValues = sizeValues.length > 0
    && colorValueSet.size > 0
    && sizeValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const showCompatibleModels = compatibleModelValues.length > 0 && !hasDuplicateCompatibleModels
  const showSizeVariants = sizeValues.length > 0 && !isColorVariantGroup && !hasDuplicateSizeValues
  const isLowStock = !outOfStock && stockCount <= lowStockThreshold

  return (
    <aside className="min-w-0 bg-white p-3 sm:p-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="wrap-break-word text-lg font-bold leading-snug text-slate-950">{preview.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {preview.reviewCount > 0 ? (
            <>
              <span className="font-bold text-slate-950">{preview.rating.toFixed(1)}</span>
              <Stars rating={preview.rating} size="size-3" />
              <a href="#reviews" className="font-semibold text-blue-600 hover:underline">
                ({preview.reviewCount.toLocaleString()})
              </a>
            </>
          ) : (
            <span className="font-medium text-slate-500">No reviews yet</span>
          )}
          <span className="font-semibold text-slate-600">{preview.salesCount.toLocaleString()} sold</span>
        </div>
        <p className="mt-1 text-[0.6875rem] font-semibold text-slate-600">{preview.soldIndicator}</p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <span className="flex size-6 shrink-0 items-center justify-center rounded bg-brand-light">
              <ShoppingCart className="size-3.5 text-brand" strokeWidth={2} />
            </span>
            <span className="shrink-0 text-xs font-bold text-blue-600">Visit the {preview.storeName}</span>
            <span className="min-w-0 flex-1 truncate text-[0.625rem] font-semibold text-slate-500">
              110 Followers | 150k+ Followers | {preview.rating.toFixed(1)} ★
            </span>
          </div>
          <button
            type="button"
            disabled
            title="Preview only"
            className="shrink-0 cursor-not-allowed rounded-full border border-slate-300 px-4 py-1.5 text-[0.625rem] font-bold text-slate-400 sm:px-5"
          >
            Follow
          </button>
        </div>
      </div>

      <div className="space-y-2 py-3">
        {displayPriceInfo.compareAt != null && (
          <p className="w-fit rounded-sm bg-brand px-2 py-1 text-[0.625rem] font-bold text-white">
            Limited time deal
          </p>
        )}
        <div className="flex flex-wrap items-end gap-2">
          {displayPriceInfo.discountPercent != null && (
            <span className="text-xl font-bold text-brand">-{displayPriceInfo.discountPercent}%</span>
          )}
          <span className="text-2xl font-extrabold text-slate-950">{formatCedi(displayPriceInfo.price)}</span>
          {displayPriceInfo.compareAt != null && (
            <span className="pb-0.5 text-xs text-slate-400 line-through">{formatCedi(displayPriceInfo.compareAt)}</span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500">
          List Price:{' '}
          <span className={displayPriceInfo.compareAt != null ? 'line-through' : ''}>
            {displayPriceInfo.compareAt != null ? formatCedi(displayPriceInfo.compareAt) : formatCedi(displayPriceInfo.price)}
          </span>
        </p>
      </div>

      {preview.colors.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-950">Color: {selectedColor}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
            {preview.colors.map((color, index) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`border bg-white p-1 text-center transition-colors ${
                  selectedColor === color ? 'border-brand' : 'border-slate-200'
                }`}
              >
                <img
                  src={preview.colorImages?.[color] ?? (preview.gallery.length
                    ? preview.gallery[(index + 1) % preview.gallery.length]
                    : undefined)}
                  alt=""
                  className="aspect-square w-full bg-slate-100 object-cover"
                />
                <span className="mt-1 block text-[0.625rem] font-semibold text-slate-600">{color}</span>
              </button>
            ))}
          </div>
        </div>
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
          label={preview.sizeGroupLabel ?? 'Size'}
          values={sizeValues}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />
      )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-950">Quantity</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
          <p className="text-[0.625rem] leading-4">
            <span className={outOfStock ? 'font-bold text-red-600' : isLowStock ? 'font-bold text-brand' : 'font-bold text-emerald-600'}>
              {outOfStock ? 'Out of Stock' : isLowStock ? `Only ${stockCount} Items Left` : 'In Stock'}
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
          disabled
          title="Preview only — checkout is disabled here"
          className="cursor-not-allowed rounded-full bg-brand/50 px-6 py-3 text-xs font-bold text-white"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled
          title="Preview only — checkout is disabled here"
          className="cursor-not-allowed rounded-full border border-brand/30 px-6 py-3 text-xs font-bold text-brand/50"
        >
          Add to Cart
        </button>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] font-semibold text-slate-400">
        <Info className="size-3" />
        Preview only — purchase actions are disabled in this view.
      </p>

      <div className="mt-3 grid gap-1.5 text-[0.625rem] text-slate-500 min-[480px]:flex min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3">
        <span>Returns <b className="text-blue-600">30-day refund/replacement</b></span>
        <span>Payment <b className="text-blue-600">Secure transaction</b></span>
      </div>
    </aside>
  )
}

// ─── Key details / description / reviews blocks ────────────────────────────

function PreviewActionsMenu({
  productId,
  canActivate,
  canDeactivate,
  onActivate,
  onDeactivate,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const close = () => setOpen(false)

  const menuItemClass =
    'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'
  const dangerItemClass =
    'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        <MoreHorizontal className="size-3.5" />
        Actions
        <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <PortalMenu open={open} onClose={close} triggerRef={triggerRef} menuWidth={220}>
        <Link
          to={`/products/${productId}/edit?section=info`}
          role="menuitem"
          onClick={close}
          className={menuItemClass}
        >
          <Pencil className="size-4" />
          Edit product info
        </Link>
        <Link
          to={`/products/${productId}/edit?section=variations`}
          role="menuitem"
          onClick={close}
          className={menuItemClass}
        >
          <Layers3 className="size-4" />
          Manage variations
        </Link>
        {canActivate && (
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onActivate?.() }}
            className={menuItemClass}
          >
            <Power className="size-4 text-emerald-600" />
            Activate product
          </button>
        )}
        {canDeactivate && (
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onDeactivate?.() }}
            className={menuItemClass}
          >
            <PowerOff className="size-4 text-amber-600" />
            Deactivate product
          </button>
        )}
        <button
          type="button"
          role="menuitem"
          onClick={() => { close(); onDelete?.() }}
          className={dangerItemClass}
        >
          <Trash2 className="size-4" />
          Delete product
        </button>
      </PortalMenu>
    </>
  )
}

function KeyDetailsBlock({ tags, keyDetails, activeSku, activeBarcode, onShare }) {
  const detailsList = { ...keyDetails }
  if (activeSku) detailsList['Model/SKU'] = activeSku
  if (activeBarcode) detailsList.Barcode = activeBarcode

  const sortedEntries = sortKeyDetailEntries(Object.entries(detailsList))

  return (
    <section className="min-w-0 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-950">Key Details</h2>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-[0.6875rem] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Share2 className="size-3.5" strokeWidth={2.4} />
          Share
        </button>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.625rem] font-semibold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <dl className={`grid gap-1 text-[0.6875rem] leading-4 text-slate-700 ${tags.length > 0 ? 'mt-3' : 'mt-2'}`}>
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-1 sm:grid-cols-[11rem_1fr]">
            <dt className="font-bold">{key}:</dt>
            <dd className="wrap-break-word">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ReviewSummaryBlock({ rating, reviewCount, ratingDistribution, reviews }) {
  return (
    <section id="reviews" className="min-w-0 bg-white p-3 sm:p-4">
      <h2 className="text-base font-bold text-slate-950">Customer&apos;s Feedback</h2>
      <h3 className="mt-4 text-sm font-bold text-slate-950">Review this product</h3>
      <p className="mt-1 text-xs text-slate-600">Share your thoughts with other customers</p>
      <button
        type="button"
        disabled
        title="Preview only"
        className="mt-3 w-full cursor-not-allowed rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-400"
      >
        Write a customer review
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-extrabold text-slate-950">
          {reviewCount.toLocaleString()} reviews | {rating.toFixed(1)}
        </span>
        <Stars rating={rating} size="size-3" />
        <span className="rounded-sm bg-emerald-50 px-2 py-1 text-[0.5rem] font-bold text-emerald-700 sm:ml-auto">
          All ratings are by verified purchases
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {ratingDistribution.map((row) => (
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

      <div className="mt-4 space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="border-t border-slate-200 pt-3">
            <div className="flex items-start gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
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

      <div className="mt-5 text-center">
        <button
          type="button"
          disabled
          title="Preview only"
          className="cursor-not-allowed rounded-full border border-slate-300 px-6 py-2 text-xs font-semibold text-slate-400"
        >
          See All Reviews
        </button>
      </div>
    </section>
  )
}

function DescriptionBlock({ details, description, gallery, descriptiveImages = [] }) {
  const detailsList = { ...details }
  delete detailsList.SKU
  delete detailsList.sku
  delete detailsList.Sku
  const hasDescriptiveImages = descriptiveImages.length > 0
  const showGalleryFallback = !hasDescriptiveImages && gallery.length > 1

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
          <dd className="space-y-4 wrap-break-word text-slate-700">
            <p>{description}</p>
          </dd>
        </div>
      </div>

      {hasDescriptiveImages && (
        <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[12rem_1fr]">
          <h3 className="font-bold text-slate-950">Product Images</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {descriptiveImages.slice(0, 4).map((image, index) => (
              <img
                key={`${image}-descriptive-${index}`}
                src={image}
                alt={`Product detail ${index + 1}`}
                className="block h-auto w-full max-w-full rounded-sm bg-slate-100"
              />
            ))}
          </div>
        </div>
      )}

      {showGalleryFallback && (
        <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[12rem_1fr]">
          <h3 className="font-bold text-slate-950">Product Images</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {gallery.slice(1, 5).map((image, index) => (
              <img
                key={`${image}-description-${index}`}
                src={image}
                alt={`Product image ${index + 1}`}
                className="block h-auto w-full max-w-full rounded-sm bg-slate-100"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Skeleton rails (Other items from seller / Explore related) ───────────

function SkeletonCard() {
  return (
    <div className="min-w-0 animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-slate-200" />
      <div className="mt-1.5 h-2 w-4/5 rounded-full bg-slate-200" />
      <div className="mt-1 h-2 w-1/2 rounded-full bg-slate-200" />
    </div>
  )
}

function SkeletonRail({ title, visibleCount = 5, note }) {
  const desktopAutoCols = visibleCount === 3
    ? 'lg:auto-cols-[calc((100%-1.5rem)/3)]'
    : 'lg:auto-cols-[calc((100%-3rem)/5)]'
  const placeholderCount = visibleCount === 3 ? 6 : 10

  return (
    <section className="min-w-0 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <Sparkles className="size-3" />
          Live on storefront
        </span>
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-300"
        >
          <ChevronLeft className="size-4" />
        </span>
        <div
          className={`grid auto-cols-[7rem] grid-flow-col grid-rows-1 gap-2 overflow-x-hidden px-8 pb-1 min-[390px]:auto-cols-[7.5rem] sm:auto-cols-[9rem] sm:gap-3 ${desktopAutoCols}`}
        >
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-300"
        >
          <ChevronRight className="size-4" />
        </span>
      </div>
      {note && <p className="mt-3 text-xs text-slate-400">{note}</p>}
    </section>
  )
}

// ─── Main preview ───────────────────────────────────────────────────────────

export default function ProductStorefrontPreview({
  product,
  rawRecord,
  images,
  conditionLabel,
  actions,
}) {
  const preview = useMemo(
    () => buildStorefrontPreview({ product, rawRecord, images, conditionLabel }),
    [product, rawRecord, images, conditionLabel],
  )

  const [activeImage, setActiveImage] = useState(preview.gallery[0] ?? null)
  const [selectedColor, setSelectedColor] = useState(preview.colors[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(preview.sizes[0] ?? '')
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState(preview.compatibleModels[0] ?? '')

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)

    let matchingVariant = preview.variants.find((variant) => {
      const vColor = variant.attributes?.color || variant.color || variant.variant_name || ''
      const vSize = variant.attributes?.size || variant.size || ''
      const vModel = variant.variant_name || ''

      const matchColor = String(vColor).toLowerCase() === String(newColor).toLowerCase()
      const matchModel = !selectedCompatibleModel || String(vModel).toLowerCase() === String(selectedCompatibleModel).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      return matchColor && matchModel && matchSize
    })

    if (!matchingVariant) {
      matchingVariant = preview.variants.find((variant) => {
        const vColor = variant.attributes?.color || variant.color || variant.variant_name || ''
        return String(vColor).toLowerCase() === String(newColor).toLowerCase()
      })
    }

    if (matchingVariant) {
      if (matchingVariant.variant_name) setSelectedCompatibleModel(matchingVariant.variant_name)
      const vSize = matchingVariant.attributes?.size || matchingVariant.size
      if (vSize) setSelectedSize(vSize)
    }

    const varImage = preview.colorImages?.[newColor]
    if (varImage) setActiveImage(varImage)
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)

    let matchingVariant = preview.variants.find((variant) => {
      const vColor = variant.attributes?.color || variant.color || variant.variant_name || ''
      const vSize = variant.attributes?.size || variant.size || ''
      const vModel = variant.variant_name || ''

      const matchModel = String(vModel).toLowerCase() === String(newModel).toLowerCase()
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      return matchColor && matchModel && matchSize
    })

    if (!matchingVariant) {
      matchingVariant = preview.variants.find((variant) => String(variant.variant_name ?? '').toLowerCase() === String(newModel).toLowerCase())
    }

    if (matchingVariant) {
      const vColor = matchingVariant.attributes?.color || matchingVariant.color
      const vSize = matchingVariant.attributes?.size || matchingVariant.size
      if (vColor) {
        setSelectedColor(vColor)
        const varImage = preview.colorImages?.[vColor]
        if (varImage) setActiveImage(varImage)
      }
      if (vSize) setSelectedSize(vSize)
    }
  }

  const handleSizeSelect = (newSize) => {
    setSelectedSize(newSize)

    let matchingVariant = preview.variants.find((variant) => {
      const vColor = variant.attributes?.color || variant.color || variant.variant_name || ''
      const sizeKey = preview.sizeGroupLabel ? preview.sizeGroupLabel.toLowerCase().replace(/ /g, '_') : 'size'
      const vSize = variant.attributes?.[sizeKey] || variant.attributes?.size || variant.size || ''
      const vModel = variant.variant_name || ''

      const matchSize = String(vSize).toLowerCase() === String(newSize).toLowerCase()
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchModel = !selectedCompatibleModel || String(vModel).toLowerCase() === String(selectedCompatibleModel).toLowerCase()

      return matchColor && matchSize && matchModel
    })

    if (!matchingVariant) {
      const sizeKey = preview.sizeGroupLabel ? preview.sizeGroupLabel.toLowerCase().replace(/ /g, '_') : 'size'
      matchingVariant = preview.variants.find((variant) => {
        const vSize = variant.attributes?.[sizeKey] || variant.attributes?.size || variant.size || ''
        return String(vSize).toLowerCase() === String(newSize).toLowerCase()
      })
    }

    if (matchingVariant) {
      const vColor = matchingVariant.attributes?.color || matchingVariant.color
      const vModel = matchingVariant.variant_name
      if (vColor) {
        setSelectedColor(vColor)
        const varImage = preview.colorImages?.[vColor]
        if (varImage) setActiveImage(varImage)
      }
      if (vModel) setSelectedCompatibleModel(vModel)
    }
  }

  const activeVariant = useMemo(() => {
    if (!preview.variants.length) return null

    return preview.variants.find((variant) => {
      const vColor = variant.attributes?.color || variant.color || variant.variant_name || ''
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()

      const sizeKey = preview.sizeGroupLabel ? preview.sizeGroupLabel.toLowerCase().replace(/ /g, '_') : 'size'
      const vSize = variant.attributes?.[sizeKey] || variant.attributes?.size || variant.size || ''
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()

      const vModel = variant.variant_name || ''
      const matchModel = !selectedCompatibleModel || String(vModel).toLowerCase() === String(selectedCompatibleModel).toLowerCase()

      return matchColor && matchSize && matchModel
    }) ?? preview.variants[0]
  }, [preview, selectedColor, selectedSize, selectedCompatibleModel])

  const activeSku = useMemo(
    () => activeVariant?.sku || preview.keyDetails['Model/SKU'] || 'N/A',
    [activeVariant, preview],
  )

  const activeBarcode = useMemo(
    () => activeVariant?.barcode || preview.barcode || null,
    [activeVariant, preview],
  )

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

    const price = preview.hasDiscount ? preview.salePrice : preview.regularPrice
    const compareAt = preview.hasDiscount ? preview.regularPrice : null
    const discountPercent = preview.hasDiscount && preview.regularPrice > 0
      ? Math.round(((preview.regularPrice - preview.salePrice) / preview.regularPrice) * 100)
      : null

    return { price, compareAt, discountPercent }
  }, [preview, activeVariant])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify.success('Product link copied to clipboard!')
    } catch {
      notify.error('Could not copy link to clipboard')
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </span>
        <div className="flex flex-1 items-center gap-2 truncate rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
          <Globe className="size-3 shrink-0" />
          <span className="truncate">e-mall.com/product/{preview.slug}</span>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand ring-1 ring-brand/20 sm:inline-flex">
          <Eye className="size-3" />
          Customer view
        </span>
        {actions && (
          <PreviewActionsMenu
            productId={actions.productId}
            canActivate={actions.canActivate}
            canDeactivate={actions.canDeactivate}
            onActivate={actions.onActivate}
            onDeactivate={actions.onDeactivate}
            onDelete={actions.onDelete}
          />
        )}
      </div>

      <div className="bg-[#f2f2f2] p-2 sm:p-3">
        <div className="w-full space-y-3 sm:space-y-4">
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="contents lg:block lg:min-w-0 lg:space-y-4">
              <div className="order-1 min-w-0">
                <PreviewGallery
                  gallery={preview.gallery}
                  activeImage={activeImage}
                  setActiveImage={setActiveImage}
                  title={preview.title}
                />
              </div>
              <div className="order-3 min-w-0">
                <KeyDetailsBlock
                  tags={preview.tags}
                  keyDetails={preview.keyDetails}
                  activeSku={activeSku}
                  activeBarcode={activeBarcode}
                  onShare={handleShare}
                />
              </div>
              <div className="order-5 min-w-0 py-4 sm:py-5">
                <SkeletonRail
                  title="Other Items From Seller"
                  visibleCount={3}
                  note="Your other published products will appear here for shoppers."
                />
              </div>
            </div>
            <div className="contents lg:block lg:min-w-0 lg:space-y-4">
              <div className="order-2 min-w-0">
                <InfoPanel
                  preview={preview}
                  activeVariant={activeVariant}
                  selectedColor={selectedColor}
                  setSelectedColor={handleColorSelect}
                  selectedSize={selectedSize}
                  setSelectedSize={handleSizeSelect}
                  selectedCompatibleModel={selectedCompatibleModel}
                  setSelectedCompatibleModel={handleCompatibleModelSelect}
                  displayPriceInfo={displayPriceInfo}
                />
              </div>
              <div className="order-4 min-w-0">
                <ReviewSummaryBlock
                  rating={preview.rating}
                  reviewCount={preview.reviewCount}
                  ratingDistribution={preview.ratingDistribution}
                  reviews={preview.reviews}
                />
              </div>
            </div>
          </section>

          <DescriptionBlock
            details={preview.details}
            description={preview.description}
            gallery={preview.gallery}
            descriptiveImages={preview.descriptiveImages}
          />

          <SkeletonRail
            title="Explore Other Related Items"
            visibleCount={5}
            note="Related products from across the marketplace will show here for shoppers."
          />
        </div>
      </div>
    </div>
  )
}
