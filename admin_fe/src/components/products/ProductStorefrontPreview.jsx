import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  CheckCircle2,
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
  XCircle,
} from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import VariantOptionRow from './VariantOptionRow'
import notify from '../../lib/notify'
import { formatItemWeight, formatPackageDimensions, getMetadataValue, getProductConditionLabel, isReservedKeyDetailKey, mapDescriptiveImageUrls, mapKeyDetailsEntries, mapKeyDetailsFromRecord, sortKeyDetailEntries } from '../../utils/productMetadata'
import { normalizeProductDescription } from '../../utils/productDescriptionHtml'
import { calculateDisplayDiscountPercent } from '../../utils/productPricing'
import { resolveRecordCatalogPricing } from '../../utils/normalizeProducts'
import { readImageUrlDimensions } from '../../utils/productImageUtils'
import { DESCRIPTIVE_IMAGE_LANDSCAPE_RATIO_THRESHOLD, MAX_DESCRIPTIVE_IMAGE_COUNT } from '../../constants/products'
import { MAX_VARIANT_IMAGE_COUNT } from '../variants/variantConstants'
import {
  MAIN_PRODUCT_ATTRIBUTE_META_KEY,
  MAIN_PRODUCT_ATTRIBUTE_VALUE_META_KEY,
} from '../../utils/defaultProductVariation'
import {
  collectVariantImageUrls,
  getVariantAttributeValue,
  getVariantCompatibleModels,
  isSameVariantOption,
  resolveCanonicalVariantOption,
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
  { label: '5 stars', value: 75 },
  { label: '4 stars', value: 25 },
  { label: '3 stars', value: 0 },
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

function isColorAttribute(key = '', label = '') {
  return /color|colour/i.test(String(key)) || /color|colour/i.test(String(label))
}

function groupHasImageForValue(images = {}, value) {
  if (images[value]) return true
  return Object.entries(images).some(([key, url]) => (
    Boolean(url) && isSameVariantOption(key, value)
  ))
}

function resolveGroupPresentation(group) {
  if (isColorAttribute(group?.key, group?.label)) return 'images'

  const values = group?.values ?? []
  const images = group?.images ?? {}
  if (values.length === 0) return 'chips'

  const everyValueHasImage = values.every((value) => groupHasImageForValue(images, value))
  return everyValueHasImage ? 'images' : 'chips'
}

function getVariantOptionValue(variant, groupKey) {
  if (!variant || !groupKey) return ''

  const fromNamedField = getVariantAttributeValue(variant, groupKey)
  if (fromNamedField) return fromNamedField

  const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
  if (isSameVariantOption(attributeKey, groupKey)) {
    return String(attributeValue ?? '').trim()
  }

  return ''
}

function findMainProductVariant(preview) {
  const variants = preview?.variants ?? []
  if (preview?.mainAttribute && preview?.mainAttributeValue) {
    const match = variants.find((variant) => (
      isSameVariantOption(
        getVariantOptionValue(variant, preview.mainAttribute),
        preview.mainAttributeValue,
      )
    ))
    if (match) return match
  }
  return variants[0] ?? null
}

function findMatchingVariant(preview, { groupKey = '', value = '' } = {}) {
  const variants = preview?.variants ?? []
  if (groupKey && value) {
    const match = variants.find((variant) => (
      isSameVariantOption(getVariantOptionValue(variant, groupKey), value)
    ))
    if (match) return match
  }
  return findMainProductVariant(preview) ?? variants[0] ?? null
}

function isMainProductVariant(preview, variant) {
  if (!variant) return true
  const mainVariant = findMainProductVariant(preview)
  if (!mainVariant) return false
  if (mainVariant.id != null && variant.id != null) {
    return String(mainVariant.id) === String(variant.id)
  }
  const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
  return isSameVariantOption(attributeKey, preview.mainAttribute)
    && isSameVariantOption(String(attributeValue ?? ''), preview.mainAttributeValue)
}

function resolveGalleryImages(preview, variant) {
  const productGallery = (preview?.gallery ?? []).filter(Boolean)
  if (!variant || isMainProductVariant(preview, variant)) {
    return productGallery
  }

  const variantImages = collectVariantImageUrls(variant).slice(0, MAX_VARIANT_IMAGE_COUNT)
  if (variantImages.length > 0) return variantImages
  return productGallery
}

function resolveCompatibleModelOptions(preview, { groupKey = '', value = '' } = {}) {
  const variant = findMatchingVariant(preview, { groupKey, value })
  if (!variant) return []
  return getVariantCompatibleModels(variant)
}

function pickDefaultCompatibleModel(preview, options = []) {
  if (!options.length) return ''
  return resolveCanonicalVariantOption(options[0], preview.compatibleModels) || options[0]
}

/**
 * Attribute groups are independent SKUs, not a color × size matrix.
 * Default to the listing's main option; other groups stay unselected until chosen.
 */
function resolveInitialVariantSelections(preview) {
  const groups = preview.variantOptionGroups ?? []
  const mainVariant = findMainProductVariant(preview)

  if (!mainVariant) {
    const firstGroup = groups[0]
    return {
      groupKey: firstGroup?.key ?? '',
      value: firstGroup?.values?.[0] ?? '',
      compatibleModel: '',
    }
  }

  const { attributeKey, attributeValue } = resolveVariantAttributeFields(mainVariant)
  const group = groups.find((item) => isSameVariantOption(item.key, attributeKey))
    ?? groups.find((item) => getVariantOptionValue(mainVariant, item.key))
    ?? groups[0]
  const rawValue = String(attributeValue ?? '').trim()
    || (group ? getVariantOptionValue(mainVariant, group.key) : '')
    || preview.mainAttributeValue
    || ''
  const value = group
    ? (resolveCanonicalVariantOption(rawValue, group.values) || rawValue)
    : rawValue
  const variantModels = getVariantCompatibleModels(mainVariant)
  const compatibleModel = variantModels.length > 0
    ? (resolveCanonicalVariantOption(variantModels[0], preview.compatibleModels) || variantModels[0])
    : ''

  return {
    groupKey: group?.key ?? attributeKey ?? '',
    value,
    compatibleModel,
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

  const mainAttribute = String(getMetadataValue(metadata, MAIN_PRODUCT_ATTRIBUTE_META_KEY) ?? '').trim()
  const mainAttributeValue = String(getMetadataValue(metadata, MAIN_PRODUCT_ATTRIBUTE_VALUE_META_KEY) ?? '').trim()
  const variantGroups = {}
  const variantImageUrls = new Set()

  const resolveGroupStoreKey = (attributeKey) => {
    const normalized = String(attributeKey ?? '').trim()
    if (!normalized) return ''
    const existing = Object.keys(variantGroups).find(
      (key) => key.toLowerCase() === normalized.toLowerCase(),
    )
    return existing || normalized
  }

  const addVariantOption = (attributeKey, valueText, imageUrl) => {
    if (!attributeKey || !valueText) return
    const groupKey = resolveGroupStoreKey(attributeKey)
    const group = ensureVariantGroupStore(variantGroups, groupKey)
    group.values.add(valueText)
    if (imageUrl) group.images[valueText] = imageUrl
  }

  variants.forEach((variant) => {
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
    const valueText = attributeValue != null && attributeValue !== '' ? String(attributeValue) : ''
    const variantImages = collectVariantImageUrls(variant)
    variantImages.forEach((url) => variantImageUrls.add(url))
    const varImage = variantImages[0] || resolveVariantImageUrl(variant)

    if (attributeKey && valueText) {
      addVariantOption(attributeKey, valueText, varImage)
      return
    }

    const legacyColor = getVariantAttributeValue(variant, 'color')
    if (legacyColor) {
      addVariantOption('Color', legacyColor, varImage)
    }

    const legacySize = getVariantAttributeValue(variant, 'size')
    if (legacySize) {
      addVariantOption('Size', legacySize, varImage)
    }
  })

  // Product gallery stays product photos. Extra-variant shots only appear after that option is selected.
  let gallery = [...new Set(galleryUrls)].filter((url) => !variantImageUrls.has(url))
  if (gallery.length === 0 && (product?.image || galleryUrls[0])) {
    gallery = [product?.image || galleryUrls[0]].filter(Boolean)
  }

  let variantOptionGroups = Object.entries(variantGroups).map(([key, group]) => ({
    key,
    label: formatVariantGroupLabel(key),
    values: [...group.values],
    images: group.images,
  }))

  if (mainAttribute) {
    variantOptionGroups = [
      ...variantOptionGroups.filter((group) => isSameVariantOption(group.key, mainAttribute)),
      ...variantOptionGroups.filter((group) => !isSameVariantOption(group.key, mainAttribute)),
    ]
  }

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
    compatibleModels,
    variantOptionGroups,
    mainAttribute,
    mainAttributeValue,
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
    savingsAmount: Number(product?.savingsAmount ?? 0),
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
  const images = useMemo(
    () => (gallery ?? []).filter(Boolean),
    [gallery],
  )

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
              <img src={image} alt="" className="size-full object-contain" />
            </button>
          ))}
        </div>
      )}
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
  selectedGroupKey,
  selectedValue,
  onSelectOption,
  selectedCompatibleModel,
  setSelectedCompatibleModel,
  compatibleModelOptions = [],
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
  const variantOptionGroups = preview.variantOptionGroups ?? []
  const compatibleModelValues = compatibleModelOptions.length
    ? compatibleModelOptions
    : (activeVariant ? getVariantCompatibleModels(activeVariant) : (preview.compatibleModels ?? []))
  const selectedGroupValues = new Set(
    (variantOptionGroups.find((group) => isSameVariantOption(group.key, selectedGroupKey))?.values ?? [])
      .map((value) => String(value).toLowerCase()),
  )
  const hasDuplicateCompatibleModels = compatibleModelValues.length > 0
    && selectedGroupValues.size > 0
    && compatibleModelValues.every((value) => selectedGroupValues.has(String(value).toLowerCase()))
  const showCompatibleModels = compatibleModelValues.length > 0 && !hasDuplicateCompatibleModels
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

      {variantOptionGroups.map((group) => (
        <VariantOptionRow
          key={group.key}
          label={group.label}
          values={group.values}
          images={group.images}
          selected={isSameVariantOption(selectedGroupKey, group.key) ? selectedValue : ''}
          onSelect={(value) => onSelectOption(group.key, value)}
          presentation={resolveGroupPresentation(group)}
        />
      ))}
      {showCompatibleModels && selectedValue ? (
        <VariantOptionRow
          label="Compatible Model"
          values={compatibleModelValues}
          selected={selectedCompatibleModel}
          onSelect={setSelectedCompatibleModel}
          presentation="chips"
        />
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
  canApprove,
  canReject,
  onActivate,
  onDeactivate,
  onApprove,
  onReject,
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
        {canApprove && (
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onApprove?.() }}
            className={menuItemClass}
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            Approve listing
          </button>
        )}
        {canReject && (
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onReject?.() }}
            className={menuItemClass}
          >
            <XCircle className="size-4 text-slate-500" />
            Reject listing
          </button>
        )}
        {canActivate && (
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onActivate?.() }}
            className={menuItemClass}
          >
            <Power className="size-4 text-emerald-600" />
            Show on storefront
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
            Hide from shoppers
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
          <div key={row.label} className="grid grid-cols-[3.75rem_1fr_2.25rem] items-center gap-3 text-[0.625rem] text-slate-600">
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
  const initialSelections = useMemo(() => resolveInitialVariantSelections(preview), [preview])
  const initialVariant = useMemo(
    () => findMatchingVariant(preview, initialSelections),
    [preview, initialSelections],
  )

  const [activeImage, setActiveImage] = useState(
    () => resolveGalleryImages(preview, initialVariant)[0] ?? null,
  )
  const [selectedGroupKey, setSelectedGroupKey] = useState(initialSelections.groupKey)
  const [selectedValue, setSelectedValue] = useState(initialSelections.value)
  const [selectedCompatibleModel, setSelectedCompatibleModel] = useState(initialSelections.compatibleModel)

  const compatibleModelOptions = useMemo(
    () => resolveCompatibleModelOptions(preview, {
      groupKey: selectedGroupKey,
      value: selectedValue,
    }),
    [preview, selectedGroupKey, selectedValue],
  )

  const effectiveCompatibleModel = useMemo(() => {
    if (!compatibleModelOptions.length) return ''
    if (
      selectedCompatibleModel
      && compatibleModelOptions.some((model) => isSameVariantOption(model, selectedCompatibleModel))
    ) {
      return selectedCompatibleModel
    }
    return pickDefaultCompatibleModel(preview, compatibleModelOptions)
  }, [compatibleModelOptions, selectedCompatibleModel, preview])

  const activeVariant = useMemo(
    () => findMatchingVariant(preview, { groupKey: selectedGroupKey, value: selectedValue }),
    [preview, selectedGroupKey, selectedValue],
  )

  const galleryImages = useMemo(
    () => resolveGalleryImages(preview, activeVariant),
    [preview, activeVariant],
  )
  const gallerySignature = galleryImages.join('|')

  useEffect(() => {
    const nextGallery = gallerySignature ? gallerySignature.split('|') : []
    setActiveImage((current) => {
      if (current && nextGallery.includes(current)) return current
      return nextGallery[0] ?? null
    })
  }, [gallerySignature])

  const displayActiveImage = useMemo(() => {
    if (activeImage && galleryImages.includes(activeImage)) return activeImage
    return galleryImages[0] ?? null
  }, [activeImage, galleryImages])

  const handleOptionSelect = (groupKey, value) => {
    setSelectedGroupKey(groupKey)
    setSelectedValue(value)

    const matchingVariant = findMatchingVariant(preview, { groupKey, value })
    const availableModels = getVariantCompatibleModels(matchingVariant)
    setSelectedCompatibleModel(pickDefaultCompatibleModel(preview, availableModels))
  }

  const handleCompatibleModelSelect = (newModel) => {
    setSelectedCompatibleModel(newModel)
  }

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
      const pricing = resolveRecordCatalogPricing(activeVariant, {
        paidPrice: preview.salePrice,
        listPrice: preview.regularPrice,
        salePrice: preview.salePrice,
        discount: preview.savingsAmount,
        savingsAmount: preview.savingsAmount,
      })
      const hasVariantSale = pricing.discountAmount > 0 && pricing.salePrice < pricing.listPrice
      const price = hasVariantSale ? pricing.salePrice : pricing.listPrice
      const compareAt = hasVariantSale ? pricing.listPrice : null
      const discountPercent = hasVariantSale
        ? calculateDisplayDiscountPercent(pricing.listPrice, pricing.salePrice)
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
            canApprove={actions.canApprove}
            canReject={actions.canReject}
            onActivate={actions.onActivate}
            onDeactivate={actions.onDeactivate}
            onApprove={actions.onApprove}
            onReject={actions.onReject}
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
                  gallery={galleryImages}
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
                  selectedGroupKey={selectedGroupKey}
                  selectedValue={selectedValue}
                  onSelectOption={handleOptionSelect}
                  selectedCompatibleModel={effectiveCompatibleModel}
                  setSelectedCompatibleModel={handleCompatibleModelSelect}
                  compatibleModelOptions={compatibleModelOptions}
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
