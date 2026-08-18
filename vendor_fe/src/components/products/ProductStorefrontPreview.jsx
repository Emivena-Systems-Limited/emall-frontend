import { useEffect, useMemo, useRef, useState } from 'react'
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
  Star,
  Trash2,
} from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import notify from '../../lib/notify'
import { formatItemWeight, formatPackageDimensions, getMetadataValue, getProductConditionLabel, isReservedKeyDetailKey, mapDescriptiveImageUrls, mapKeyDetailsEntries, mapKeyDetailsFromRecord, sortKeyDetailEntries } from '../../utils/productMetadata'
import { normalizeProductDescription } from '../../utils/productDescriptionHtml'
import { calculateDisplayDiscountPercent } from '../../utils/productPricing'
import { readImageUrlDimensions } from '../../utils/productImageUtils'
import { DESCRIPTIVE_IMAGE_LANDSCAPE_RATIO_THRESHOLD, MAX_DESCRIPTIVE_IMAGE_COUNT } from '../../constants/products'
import {
  getVariantAttributeValue,
  getVariantCompatibleModels,
  resolveVariantAttributeFields,
  resolveVariantImageUrl,
} from '../../utils/productPayload'

const cediFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const KEY_DETAILS_EXPANDED_SECTION_ID = 'product-key-details-expanded'
const KEY_DETAILS_CUSTOM_VISIBLE_COUNT = 2
const KEY_DETAILS_CUSTOM_OVERFLOW_THRESHOLD = 3

function scrollToExpandedKeyDetails() {
  const target = document.getElementById(KEY_DETAILS_EXPANDED_SECTION_ID)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Standard fields (Category, SKU, Barcode, Condition, Brand, ...) always show in full.
 *  Custom backend key_details beyond the threshold get truncated with a link to the rest. */
function splitCustomKeyDetails(customEntries) {
  const entries = Array.isArray(customEntries) ? customEntries : []
  if (entries.length <= KEY_DETAILS_CUSTOM_OVERFLOW_THRESHOLD) {
    return { visible: entries, overflow: [] }
  }
  return {
    visible: entries.slice(0, KEY_DETAILS_CUSTOM_VISIBLE_COUNT),
    overflow: entries.slice(KEY_DETAILS_CUSTOM_VISIBLE_COUNT),
  }
}

function formatCedi(value) {
  return cediFormatter.format(Number(value) || 0)
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
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
  {
    id: 'preview-review-4',
    name: 'Kwame Asante',
    rating: 5,
    date: 'Jan 02, 2026',
    text: 'Solid build and great value for the price. Shipping was faster than I expected.',
  },
]

const FALLBACK_RATING_DISTRIBUTION = [
  { label: 'Small', value: 7 },
  { label: 'True to size', value: 88 },
  { label: 'Large', value: 4 },
]

// ─── Data shaping ───────────────────────────────────────────────────────────

function formatVariantGroupLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
}

function ensureVariantGroupStore(store, groupKey) {
  if (!store[groupKey]) {
    store[groupKey] = { values: new Set(), images: {} }
  }
  return store[groupKey]
}

function isSamePreviewOption(selected, value) {
  if (selected == null || value == null || selected === '' || value === '') return false
  return String(selected).trim().toLowerCase() === String(value).trim().toLowerCase()
}

function getPreviewColorValue(variant) {
  return getVariantAttributeValue(variant, 'color')
    || getVariantAttributeValue(variant, 'colour')
}

function getPreviewSizeValue(variant, preview) {
  return getVariantAttributeValue(variant, preview?.sizeGroupLabel ?? 'size')
}

function findPreviewPrimaryVariant(preview, { color = '', size = '' } = {}) {
  const variants = preview?.variants ?? []
  if (color) {
    const match = variants.find((variant) => isSamePreviewOption(getPreviewColorValue(variant), color))
    if (match) return match
  }
  if (size) {
    const match = variants.find((variant) => isSamePreviewOption(getPreviewSizeValue(variant, preview), size))
    if (match) return match
  }
  return variants[0] ?? null
}

function resolvePreviewVariantImage(preview, { color = '', size = '' } = {}) {
  const variant = findPreviewPrimaryVariant(preview, { color, size })
  if (color) {
    const mapped = preview.colorImages?.[color]
      ?? Object.entries(preview.colorImages ?? {}).find(
        ([key]) => isSamePreviewOption(key, color),
      )?.[1]
    if (mapped) return mapped
  }
  if (size) {
    const images = preview.extraVariantGroups?.[0]?.images ?? {}
    const mapped = images[size]
      ?? Object.entries(images).find(([key]) => isSamePreviewOption(key, size))?.[1]
    if (mapped) return mapped
  }
  return resolveVariantImageUrl(variant) || null
}

function resolveInitialPreviewSelections(preview) {
  const firstVariant = preview.variants[0] ?? null
  if (!firstVariant) {
    return {
      color: preview.colors[0] ?? '',
      size: '',
      compatibleModel: '',
    }
  }

  const rawColor = getPreviewColorValue(firstVariant)
  const rawSize = getPreviewSizeValue(firstVariant, preview)
  const color = rawColor || ''
  const size = color ? '' : (rawSize || '')
  const models = getVariantCompatibleModels(firstVariant)

  return {
    color,
    size,
    compatibleModel: models[0] ?? '',
  }
}

function buildStorefrontPreview({ product, rawRecord, images, conditionLabel }) {
  const variants = Array.isArray(rawRecord?.variants) ? rawRecord.variants : []
  const metadata = Array.isArray(rawRecord?.metadata) ? rawRecord.metadata : []
  const productSku = getMetadataValue(metadata, 'sku')
    || (product?.sku && product.sku !== '—' ? product.sku : '')
    || variants[0]?.sku
    || 'N/A'

  const galleryUrls = []
  const sortedImages = [...(images ?? [])].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
  )
  sortedImages.forEach((img) => { if (img?.image_url) galleryUrls.push(img.image_url) })

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
    if (legacyColor) {
      if (!colors.includes(legacyColor)) colors.push(legacyColor)
      if (varImage) colorImages[legacyColor] = varImage
    }

    const legacySize = getVariantAttributeValue(variant, 'size')
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
  const gallery = [...new Set(galleryUrls)]

  const extraVariantGroups = Object.entries(otherVariantGroups).map(([key, group]) => ({
    key,
    label: formatVariantGroupLabel(key),
    values: [...group.values],
    images: group.images,
  }))

  const sizes = extraVariantGroups[0]?.values ?? []
  const sizeGroupLabel = extraVariantGroups[0]?.label ?? 'Size'
  const compatibleModels = [
    ...new Set(variants.flatMap((variant) => getVariantCompatibleModels(variant))),
  ]

  const keyDetails = {}
  mapKeyDetailsFromRecord(rawRecord).forEach((item) => {
    const key = item?.key?.trim()
    const value = String(item?.value ?? '').trim()
    if (key && value && !isReservedKeyDetailKey(key)) keyDetails[key] = value
  })

  const categoryName = product?.category && product.category !== '—' ? product.category : 'General'
  const resolvedCondition = conditionLabel
    || getProductConditionLabel(rawRecord?.condition)
    || getProductConditionLabel(getMetadataValue(metadata, 'condition'))

  keyDetails.Category = categoryName
  keyDetails['Model/SKU'] = productSku
  const productBarcode = product?.barcode || getMetadataValue(metadata, 'barcode')
  if (productBarcode) keyDetails.Barcode = productBarcode
  if (resolvedCondition) keyDetails.Condition = resolvedCondition
  if (product?.brand && product.brand !== '—') keyDetails.Brand = product.brand
  const packageDimensions = formatPackageDimensions(metadata)
  if (packageDimensions) keyDetails['Package Dimensions'] = packageDimensions
  const itemWeight = formatItemWeight(metadata, null)
  if (itemWeight) keyDetails['Item Weight'] = itemWeight

  const { descriptionHtml, description } = normalizeProductDescription(rawRecord?.description)
  const stockCount = product?.stock ?? 0
  const barcode = productBarcode || variants.find((variant) => variant?.barcode)?.barcode || null
  const tags = Array.isArray(rawRecord?.tags) ? rawRecord.tags : []
  const descriptiveImages = mapDescriptiveImageUrls(rawRecord?.descriptive_images)
  const customKeyDetailEntries = mapKeyDetailsEntries(rawRecord)

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
    customKeyDetailEntries,
    description,
    descriptionHtml,
    descriptiveImages,
    details: {
      SKU: productSku,
      Condition: resolvedCondition || 'Not specified',
      Category: categoryName,
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
  const images = useMemo(() => {
    const next = (gallery ?? []).filter(Boolean)
    if (activeImage && !next.includes(activeImage)) {
      return [activeImage, ...next]
    }
    return next
  }, [gallery, activeImage])

  const currentImage = activeImage || images[0]

  if (!images.length) {
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
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => (
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
              selected === value ? 'border-brand' : 'border-slate-200'
            }`}
          >
            <img
              src={images[value] ?? fallbackGallery[(index + 1) % fallbackGallery.length]}
              alt=""
              className="aspect-square w-full bg-slate-100 object-cover"
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
  const lowStockThreshold = activeVariant?.minimum_threshold != null
    ? toNumber(activeVariant.minimum_threshold, preview.lowStockThreshold ?? 10)
    : activeVariant?.low_stock_threshold != null
      ? toNumber(activeVariant.low_stock_threshold, preview.lowStockThreshold ?? 10)
    : (preview.lowStockThreshold ?? 10)
  const outOfStock = stockCount <= 0
  const colorValueSet = new Set((preview.colors ?? []).map((value) => String(value).toLowerCase()))
  const compatibleModelValues = activeVariant
    ? getVariantCompatibleModels(activeVariant)
    : (preview.compatibleModels ?? [])
  const sizeValues = preview.sizes ?? []
  const primaryVariantGroup = preview.extraVariantGroups?.[0]
  const primaryVariantImages = primaryVariantGroup?.images ?? {}
  const hasPrimaryVariantImages = Object.keys(primaryVariantImages).length > 0
  const hasDuplicateCompatibleModels = compatibleModelValues.length > 0
    && colorValueSet.size > 0
    && compatibleModelValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const isColorVariantGroup = String(preview.sizeGroupLabel ?? '').toLowerCase().includes('color')
  const hasDuplicateSizeValues = sizeValues.length > 0
    && colorValueSet.size > 0
    && sizeValues.every((value) => colorValueSet.has(String(value).toLowerCase()))
  const showCompatibleModels = compatibleModelValues.length > 0 && !hasDuplicateCompatibleModels
  const showSizeVariants = sizeValues.length > 0 && !isColorVariantGroup && !hasDuplicateSizeValues
  const showVariantImagePicker = showSizeVariants && hasPrimaryVariantImages
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
          {displayPriceInfo.discountPercent != null && displayPriceInfo.discountPercent > 0 && (
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
        <>
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-950">
              Color{selectedColor ? `: ${selectedColor}` : ''}
            </p>
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
            label={preview.sizeGroupLabel ?? 'Option'}
            values={sizeValues}
            images={primaryVariantImages}
            selected={selectedSize}
            onSelect={setSelectedSize}
            fallbackGallery={preview.gallery}
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
            label={preview.sizeGroupLabel ?? 'Size'}
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

function KeyDetailsBlock({ tags, keyDetails, customKeyDetailEntries = [], activeSku, activeBarcode, onShare }) {
  const detailsList = { ...keyDetails }
  if (activeSku) detailsList['Model/SKU'] = activeSku
  if (activeBarcode) detailsList.Barcode = activeBarcode
  delete detailsList['Fulfillment']
  delete detailsList['fulfillment']
  delete detailsList['Status']
  delete detailsList['status']

  const { overflow: overflowCustomEntries } = splitCustomKeyDetails(customKeyDetailEntries)
  const overflowKeys = new Set(overflowCustomEntries.map(([key]) => key))
  const hasOverflow = overflowCustomEntries.length > 0

  const sortedEntries = sortKeyDetailEntries(Object.entries(detailsList))
    .filter(([key]) => !overflowKeys.has(key))

  return (
    <section className="relative min-w-0 h-full bg-white p-4 sm:p-6">
      <button
        type="button"
        onClick={onShare}
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:right-4 sm:top-4"
      >
        <Share2 className="size-3.5" strokeWidth={2.2} />
        Share
      </button>
      <h2 className="pr-24 text-base font-bold text-slate-950">Key Details</h2>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <dl className={`grid gap-2.5 text-sm leading-5 text-slate-700 ${tags.length > 0 ? 'mt-5' : 'mt-3'}`}>
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid min-w-0 gap-1 py-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3">
            <dt className="font-bold text-slate-900">{key}:</dt>
            <dd className="wrap-break-word">{value}</dd>
          </div>
        ))}
        {hasOverflow && (
          <div className="pt-1">
            <button
              type="button"
              onClick={scrollToExpandedKeyDetails}
              className="text-left text-sm font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
            >
              Click to see more details
            </button>
          </div>
        )}
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

function ExpandedKeyDetailsPanel({ entries }) {
  if (!entries?.length) return null

  return (
    <div
      id={KEY_DETAILS_EXPANDED_SECTION_ID}
      className="scroll-mt-24 grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]"
    >
      <dt className="shrink-0 font-bold whitespace-nowrap text-slate-950">Additional details</dt>
      <dd className="min-w-0 text-slate-700">
        <dl className="divide-y divide-slate-200">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex min-w-0 items-start gap-x-4 py-3 first:pt-0 last:pb-0"
            >
              <dt className="w-56 shrink-0 font-bold text-slate-950">{key}</dt>
              <dd className="min-w-0 flex-1 wrap-break-word">{value}</dd>
            </div>
          ))}
        </dl>
      </dd>
    </div>
  )
}

function DescriptionBlock({ details, description, descriptionHtml, descriptiveImages = [], customKeyDetailEntries = [] }) {
  const detailsList = { ...details }
  delete detailsList.SKU
  delete detailsList.sku
  delete detailsList.Sku

  const { overflow: overflowCustomEntries } = splitCustomKeyDetails(customKeyDetailEntries)
  const hasOverflow = overflowCustomEntries.length > 0
  const detailRows = Object.entries(detailsList)
  const hasCategoryRow = detailRows.some(([key]) => key === 'Category')
  const hasDescriptiveImages = descriptiveImages.length > 0
  const isLandscapeLayout = useDescriptiveImagesLandscapeLayout(descriptiveImages)

  return (
    <section className="min-w-0 bg-white p-3 sm:p-5">
      <h2 className="text-base font-bold text-slate-950">Product description</h2>
      <div className="mt-5 divide-y divide-slate-300 border-y border-slate-300">
        {detailRows.flatMap(([key, value]) => {
          const row = (
            <div key={key} className="grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
              <dt className="font-bold text-slate-950">{key}</dt>
              <dd className="wrap-break-word text-slate-700">{value}</dd>
            </div>
          )

          if (key === 'Category' && hasOverflow) {
            return [row, <ExpandedKeyDetailsPanel key="expanded-key-details" entries={overflowCustomEntries} />]
          }

          return [row]
        })}
        {hasOverflow && !hasCategoryRow && (
          <ExpandedKeyDetailsPanel entries={overflowCustomEntries} />
        )}
        <div className="grid min-w-0 gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="font-bold text-slate-950">Description</dt>
          <dd className="min-w-0 wrap-break-word text-slate-700">
            {descriptionHtml ? (
              <div
                className="product-description text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="leading-relaxed">{description}</p>
            )}
          </dd>
        </div>
      </div>

      {hasDescriptiveImages && (
        <div className="mt-6 w-full min-w-0">
          {isLandscapeLayout ? (
            <div className="flex w-full flex-col">
              {descriptiveImages.slice(0, MAX_DESCRIPTIVE_IMAGE_COUNT).map((image, index) => (
                <img
                  key={`${image}-descriptive-${index}`}
                  src={image}
                  alt={`Product detail ${index + 1}`}
                  className="block h-auto w-full max-w-full bg-slate-100"
                />
              ))}
            </div>
          ) : (
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
          )}
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
      <div className="mb-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
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
  const initialSelections = useMemo(() => resolveInitialPreviewSelections(preview), [preview])

  const [activeImage, setActiveImage] = useState(
    () => resolvePreviewVariantImage(preview, initialSelections) || preview.gallery[0] || null,
  )
  const [selectedColor, setSelectedColor] = useState(initialSelections.color)
  const [selectedSize, setSelectedSize] = useState(initialSelections.size)
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState(initialSelections.compatibleModel)

  const displayActiveImage = useMemo(() => {
    if (activeImage != null) return activeImage
    return resolvePreviewVariantImage(preview, {
      color: selectedColor,
      size: selectedSize,
    }) || preview.gallery[0] || null
  }, [activeImage, selectedColor, selectedSize, preview])

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)
    setSelectedSize('')

    const matchingVariant = findPreviewPrimaryVariant(preview, { color: newColor })
    const models = getVariantCompatibleModels(matchingVariant)
    setSelectedCompatibleModel(models[0] ?? '')

    const varImage = resolvePreviewVariantImage(preview, { color: newColor })
    if (varImage) setActiveImage(varImage)
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)
  }

  const handleSizeSelect = (newSize) => {
    setSelectedSize(newSize)
    setSelectedColor('')

    const matchingVariant = findPreviewPrimaryVariant(preview, { size: newSize })
    const models = getVariantCompatibleModels(matchingVariant)
    setSelectedCompatibleModel(models[0] ?? '')

    const variantImage = resolvePreviewVariantImage(preview, { size: newSize })
    if (variantImage) setActiveImage(variantImage)
  }

  const activeVariant = useMemo(
    () => findPreviewPrimaryVariant(preview, { color: selectedColor, size: selectedSize }),
    [preview, selectedColor, selectedSize],
  )

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

    const price = preview.hasDiscount ? preview.salePrice : preview.regularPrice
    const compareAt = preview.hasDiscount ? preview.regularPrice : null
    const discountPercent = preview.hasDiscount
      ? calculateDisplayDiscountPercent(preview.regularPrice, preview.salePrice)
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
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-stretch">
            <div className="contents lg:flex lg:min-h-full lg:flex-col lg:gap-4">
              <div className="order-1 min-w-0">
                <PreviewGallery
                  gallery={preview.gallery}
                  activeImage={displayActiveImage}
                  setActiveImage={setActiveImage}
                  title={preview.title}
                />
              </div>
              <div className="order-3 min-w-0 lg:flex-1">
                <KeyDetailsBlock
                  tags={preview.tags}
                  keyDetails={preview.keyDetails}
                  customKeyDetailEntries={preview.customKeyDetailEntries}
                  activeSku={activeSku}
                  activeBarcode={activeBarcode}
                  onShare={handleShare}
                />
              </div>
              <div className="order-5 min-w-0">
                <SkeletonRail
                  title="Other Items From Seller"
                  visibleCount={3}
                  note="Your other published products will appear here for shoppers."
                />
              </div>
            </div>
            <div className="contents lg:flex lg:min-h-full lg:flex-col lg:gap-4">
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
            descriptionHtml={preview.descriptionHtml}
            descriptiveImages={preview.descriptiveImages}
            customKeyDetailEntries={preview.customKeyDetailEntries}
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
