import { getProductConditionLabel } from './productMetadata'
import { findCategoryById, getSubcategoriesForParentId } from './normalizeCategories'
import { isUsableProductImage } from './productImageUtils'

const VARIANT_DESCRIPTION_MAX_LENGTH = 300

/** Maps category/tag signals to the option type shoppers expect for single-SKU listings. */
const CATEGORY_ATTRIBUTE_RULES = [
  { pattern: /phone|mobile|tablet|laptop|computer|electronic|accessories|gadget|audio|earbud|headphone|speaker|tv|camera|smart/i, attribute: 'Model' },
  { pattern: /cloth|fashion|apparel|wear|shoe|footwear|dress|shirt|men|women|kid|textile|fabric/i, attribute: 'Size' },
  { pattern: /food|grocery|beverage|drink|snack|gourmet|nutrition|supplement|vitamin|pharmacy|health/i, attribute: 'Pack Size' },
  { pattern: /beauty|cosmetic|skin|hair|fragrance|perfume|makeup|care/i, attribute: 'Style' },
  { pattern: /home|furniture|kitchen|decor|appliance|bedding|lighting/i, attribute: 'Style' },
  { pattern: /book|media|stationery|office/i, attribute: 'Format' },
  { pattern: /sport|fitness|outdoor|gym|athletic/i, attribute: 'Style' },
  { pattern: /auto|vehicle|motor|car|tyre|tire|part/i, attribute: 'Model' },
  { pattern: /jewel|watch|accessory|bag|wallet/i, attribute: 'Style' },
]

const VARIANT_LIKE_KEY_DETAIL_KEYS = [
  'color', 'colour', 'size', 'material', 'weight', 'style', 'capacity',
  'flavor', 'flavour', 'model', 'storage', 'memory', 'ram', 'volume', 'length',
]

const MAX_VARIANT_SKU_SUFFIX_LENGTH = 16
const DEFAULT_VARIANT_SKU_SUFFIX = 'VAR'

function slugifySkuPart(text, maxLength = MAX_VARIANT_SKU_SUFFIX_LENGTH) {
  const slug = String(text ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

  if (!slug) return ''
  if (slug.length <= maxLength) return slug

  const truncated = slug.slice(0, maxLength).replace(/-[^-]*$/, '')
  return truncated || slug.slice(0, maxLength)
}

function acronymFromWords(text, maxLength = 8) {
  const acronym = String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  if (!acronym) return ''
  return acronym.slice(0, maxLength)
}

/**
 * Build a short, readable suffix so variant SKU ≠ parent product SKU.
 * Mirrors manual patterns like AUD-WEP-001-BLK — base SKU + hyphen + value code.
 */
export function buildDefaultVariantSkuSuffix(attribute, value) {
  const normalizedValue = String(value ?? '').trim()
  const valueSlug = slugifySkuPart(normalizedValue)

  if (/^one size$|^free size$|^standard$/i.test(normalizedValue)) return 'OS'
  if (valueSlug && valueSlug.length <= 8) return valueSlug

  const acronym = acronymFromWords(normalizedValue)
  if (acronym.length >= 2) return acronym

  if (valueSlug) return valueSlug.slice(0, MAX_VARIANT_SKU_SUFFIX_LENGTH)

  const attributeSlug = slugifySkuPart(attribute, 6)
  return attributeSlug || DEFAULT_VARIANT_SKU_SUFFIX
}

export function resolveDefaultVariantSku(productSku, attribute, value) {
  const base = String(productSku ?? '').trim()
  const suffix = buildDefaultVariantSkuSuffix(attribute, value)

  if (base) {
    const candidate = `${base}-${suffix}`
    if (candidate.toUpperCase() !== base.toUpperCase()) return candidate
    return `${base}-${DEFAULT_VARIANT_SKU_SUFFIX}`
  }

  return suffix || DEFAULT_VARIANT_SKU_SUFFIX
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function truncateDescription(description) {
  const text = String(description ?? '').trim()
  if (!text) return ''
  if (text.length <= VARIANT_DESCRIPTION_MAX_LENGTH) return text
  return `${text.slice(0, VARIANT_DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
}

function titleCaseWords(text) {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function normalizeKeyDetailEntry(item) {
  const key = String(item?.key ?? item?.property ?? '').trim()
  const value = String(item?.value ?? '').trim()
  return { key, value }
}

function isVariantLikeKeyDetailKey(key) {
  const normalized = String(key ?? '').trim().toLowerCase()
  if (!normalized) return false
  return VARIANT_LIKE_KEY_DETAIL_KEYS.some(
    (candidate) => normalized === candidate || normalized.includes(candidate),
  )
}

function buildCatalogHaystack({ category, subcategory, tags = [] }) {
  return [
    category?.slug,
    category?.name,
    subcategory?.slug,
    subcategory?.name,
    ...(Array.isArray(tags) ? tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function inferAttributeFromCatalog(haystack) {
  const text = String(haystack ?? '').trim().toLowerCase()
  if (!text) return 'Style'

  for (const rule of CATEGORY_ATTRIBUTE_RULES) {
    if (rule.pattern.test(text)) return rule.attribute
  }

  return 'Style'
}

function extractPackSize(text) {
  const match = String(text ?? '').match(/\b(\d+\s*(?:ml|l|g|kg|oz|lb|pack|pcs|pieces|count|tablets?|capsules?|sachets?))\b/i)
  return match ? titleCaseWords(match[1]) : ''
}

function extractCapacity(text) {
  const match = String(text ?? '').match(/\b(\d+\s*(?:gb|tb|mb|mah|w|kw|hp|inch|in|cm|mm|litre?s?|l))\b/i)
  return match ? match[1].toUpperCase() : ''
}

function inferFlavor(text) {
  const flavors = [
    'vanilla', 'chocolate', 'strawberry', 'mint', 'original', 'classic',
    'lemon', 'mango', 'berry', 'caramel', 'honey', 'spicy', 'plain',
  ]
  const normalized = String(text ?? '').toLowerCase()
  const hit = flavors.find((flavor) => normalized.includes(flavor))
  return hit ? titleCaseWords(hit) : ''
}

function resolveFromKeyDetails(keyDetails = []) {
  const variantLike = (keyDetails ?? [])
    .map(normalizeKeyDetailEntry)
    .filter(({ key, value }) => key && value && isVariantLikeKeyDetailKey(key))

  if (variantLike.length !== 1) return null

  const { key, value } = variantLike[0]
  return {
    attribute: titleCaseWords(key),
    value,
    source: 'key_detail',
  }
}

function inferValueForAttribute({ attribute, name, sku, condition, tags = [] }) {
  const conditionLabel = getProductConditionLabel(condition)
  const isNonNew = condition && String(condition).trim().toLowerCase() !== 'new'
  const tagText = (Array.isArray(tags) ? tags : []).join(' ')
  const combined = `${name} ${tagText}`

  if (attribute === 'Size') {
    if (/one size|free size|osfa|standard size/i.test(combined)) return 'One Size'
    return 'One Size'
  }

  if (attribute === 'Pack Size') {
    return extractPackSize(name)
      || extractPackSize(tagText)
      || name
      || sku
      || 'Standard Pack'
  }

  if (attribute === 'Flavor') {
    return inferFlavor(combined) || name || sku || 'Original'
  }

  if (attribute === 'Capacity') {
    return extractCapacity(combined) || name || sku || 'Standard'
  }

  if (attribute === 'Format') {
    if (/hardcover/i.test(combined)) return 'Hardcover'
    if (/paperback/i.test(combined)) return 'Paperback'
    if (/digital|ebook|kindle/i.test(combined)) return 'Digital'
  }

  let value = name || sku || conditionLabel || 'Standard'

  if (isNonNew && conditionLabel && name) {
    value = `${conditionLabel} · ${name}`
  }

  return value
}

/**
 * Resolve category + subcategory for variation inference from wizard catalog state.
 */
export function buildVariationCatalogContext({
  parentCategories = [],
  categoryTree = [],
  formValues = {},
} = {}) {
  const category =
    findCategoryById(categoryTree, formValues.category_id)
    ?? parentCategories.find((item) => String(item.id) === String(formValues.category_id))
  const subcategories = getSubcategoriesForParentId(categoryTree, formValues.category_id)
  const subcategory = findCategoryById(subcategories, formValues.subcategory_id)

  return { category, subcategory }
}

/**
 * Infer attribute, value, display name, and SKU for the auto-created variation.
 * Uses key details when unambiguous, otherwise category context + listing fields.
 */
export function resolveDefaultVariationIdentity(values = {}, catalogContext = {}) {
  const name = String(values.name ?? '').trim()
  const sku = String(values.sku ?? '').trim()
  const condition = values.condition
  const tags = Array.isArray(values.tags) ? values.tags : []
  const keyDetails = Array.isArray(values.key_details) ? values.key_details : []

  const fromKeyDetail = resolveFromKeyDetails(keyDetails)
  const haystack = buildCatalogHaystack({
    category: catalogContext.category,
    subcategory: catalogContext.subcategory,
    tags,
  })
  const attribute = inferAttributeFromCatalog(haystack)

  // Key details only drive identity when the listing has no product name yet.
  if (!name && fromKeyDetail) {
    return {
      attribute: fromKeyDetail.attribute,
      value: fromKeyDetail.value,
      variant_name: fromKeyDetail.value,
      sku: resolveDefaultVariantSku(sku, fromKeyDetail.attribute, fromKeyDetail.value),
      source: fromKeyDetail.source,
    }
  }

  const value = inferValueForAttribute({ attribute, name, sku, condition, tags })

  return {
    attribute,
    value,
    variant_name: name || value || sku || 'Standard',
    sku: resolveDefaultVariantSku(sku, attribute, value),
    source: haystack ? 'catalog' : 'product',
  }
}

export function formatDefaultVariationLabel(identity) {
  if (!identity) return 'Style · Standard'
  return `${identity.attribute} · ${identity.value}`
}

/** @deprecated Use formatDefaultVariationLabel(resolveDefaultVariationIdentity(...)) */
export function formatGenericVariationLabel(values = {}, catalogContext = {}) {
  return formatDefaultVariationLabel(resolveDefaultVariationIdentity(values, catalogContext))
}

/**
 * Whether the vendor explicitly added at least one variation value.
 */
export function hasAnyProductVariationValues(variations = []) {
  return (variations ?? []).some((group) => (group?.values ?? []).length > 0)
}

/**
 * Clone the main product photo for a default variation.
 * Keeps the same File for a separate presign + S3 upload (unique upload_id).
 */
export function cloneMainImageForDefaultVariation(mainImage) {
  if (!mainImage || typeof mainImage !== 'object') return null

  const id = createLocalId('img-var-default')

  return {
    id,
    content_id: id,
    file: mainImage.file ?? null,
    preview: mainImage.preview ?? mainImage.image_url ?? '',
    width: mainImage.width ?? null,
    height: mainImage.height ?? null,
    isRemote: false,
    remoteId: null,
    upload_id: null,
    image_url: null,
    s3Path: null,
    storagePath: null,
    uploadStatus: 'idle',
    uploadError: null,
  }
}

/**
 * Build one inferred variation from listing details (pricing, stock, photo, etc.).
 */
export function buildDefaultProductVariationGroup(
  values = {},
  mainImage = null,
  catalogContext = {},
) {
  const image = cloneMainImageForDefaultVariation(mainImage)

  if (!image || !isUsableProductImage(image)) {
    throw new Error(
      'A main product photo is required to publish without custom variations.',
    )
  }

  const identity = resolveDefaultVariationIdentity(values, catalogContext)

  return {
    id: createLocalId('var-default'),
    attribute: identity.attribute,
    values: [
      {
        id: createLocalId('val-default'),
        value: identity.value,
        variant_name: identity.variant_name,
        sku: '',
        price: '',
        discount_price: '',
        quantity: values.quantity === '' || values.quantity == null
          ? ''
          : values.quantity,
        reserved_quantity: '',
        minimum_threshold: values.low_stock_threshold === '' || values.low_stock_threshold == null
          ? ''
          : values.low_stock_threshold,
        barcode: '',
        barcode_type: 'UPC',
        weight: values.shipping_weight ?? '',
        length: values.shipping_length ?? '',
        width: values.shipping_width ?? '',
        height: values.shipping_height ?? '',
        description: truncateDescription(values.description),
        has_compatible_models: false,
        compatible_models: [],
        images: [image],
      },
    ],
  }
}

/**
 * If the vendor skipped variations, inject one inferred option from listing details.
 * Call before presigned media upload so the variant image gets its own upload_id.
 */
export function ensureDefaultProductVariations({
  variations = [],
  values = {},
  mainImage = null,
  catalogContext = {},
} = {}) {
  if (hasAnyProductVariationValues(variations)) {
    return variations
  }

  return [buildDefaultProductVariationGroup(values, mainImage, catalogContext)]
}
