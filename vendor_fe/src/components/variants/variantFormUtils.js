import { DEFAULT_VARIANT_MINIMUM_THRESHOLD } from './variantConstants'

export const VARIANT_OPTIONAL_EMPTY_VALUE = 'N/A'

export function isBlankVariantField(value) {
  if (value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

export function isPresentVariantField(value) {
  if (isBlankVariantField(value)) return false
  return String(value).trim() !== VARIANT_OPTIONAL_EMPTY_VALUE
}

/** Maps stored N/A (or blank) back to empty string for form inputs. */
export function fromVariantOptionalField(value) {
  if (isBlankVariantField(value)) return ''
  const str = String(value).trim()
  return str === VARIANT_OPTIONAL_EMPTY_VALUE ? '' : value
}

function optionalFieldOrNa(value) {
  if (isBlankVariantField(value)) return VARIANT_OPTIONAL_EMPTY_VALUE
  const str = String(value).trim()
  return str === VARIANT_OPTIONAL_EMPTY_VALUE ? VARIANT_OPTIONAL_EMPTY_VALUE : str
}

function optionalNumberFieldOrNa(value) {
  if (isBlankVariantField(value)) return VARIANT_OPTIONAL_EMPTY_VALUE
  const str = String(value).trim()
  return str === VARIANT_OPTIONAL_EMPTY_VALUE ? VARIANT_OPTIONAL_EMPTY_VALUE : str
}

/** Normalizes empty optional drawer fields to N/A before persisting variant details. */
export function normalizeVariantOptionalFields(values, { isCustomPrice = false } = {}) {
  const next = { ...values }

  next.variant_name = optionalFieldOrNa(values.variant_name)
  next.sku = optionalFieldOrNa(values.sku)
  next.barcode = optionalFieldOrNa(values.barcode)
  // Keep the form select on a valid enum value; omit barcode_type from API when barcode is blank.
  next.barcode_type = isBlankVariantField(values.barcode)
    ? 'UPC'
    : (values.barcode_type || 'UPC')
  next.weight = optionalNumberFieldOrNa(values.weight)
  next.length = optionalNumberFieldOrNa(values.length)
  next.width = optionalNumberFieldOrNa(values.width)
  next.height = optionalNumberFieldOrNa(values.height)
  next.description = optionalFieldOrNa(values.description)
  next.reserved_quantity = isBlankVariantField(values.reserved_quantity)
    ? ''
    : optionalNumberFieldOrNa(values.reserved_quantity)
  next.minimum_threshold = optionalNumberFieldOrNa(values.minimum_threshold)

  if (isCustomPrice) {
    next.discount_price = optionalNumberFieldOrNa(values.discount_price)
  }

  next.compatible_models = (values.compatible_models ?? [])
    .map((model) => String(model ?? '').trim())
    .filter(Boolean)
  next.has_compatible_models = next.compatible_models.length > 0

  return next
}

/** Normalize compatible models for API payloads — driven by the models list, not the toggle alone. */
export function resolveVariantCompatibleModelsForPayload(variantValue = {}) {
  const compatible_models = (variantValue.compatible_models ?? [])
    .map((model) => String(model ?? '').trim())
    .filter(Boolean)

  return {
    has_compatible_models: compatible_models.length > 0,
    compatible_models,
  }
}

export function optionalVariantFieldForPayload(value) {
  if (isBlankVariantField(value)) return VARIANT_OPTIONAL_EMPTY_VALUE
  const str = String(value).trim()
  return str === VARIANT_OPTIONAL_EMPTY_VALUE ? VARIANT_OPTIONAL_EMPTY_VALUE : str
}

export function optionalVariantNumberForPayload(value, fallback = 0) {
  if (isBlankVariantField(value) || String(value).trim() === VARIANT_OPTIONAL_EMPTY_VALUE) {
    return fallback
  }
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export function optionalVariantStringForJsonPayload(value) {
  if (!isPresentVariantField(value)) return null
  return String(value).trim()
}

/** Backend requires variant_name — default to the option value, then SKU, then product SKU. */
export function resolveVariantDisplayName(variantValue, variation, productValues = {}) {
  const customName = optionalVariantStringForJsonPayload(variantValue.variant_name)
  if (customName) return customName

  const attributeValue = variantValue.value?.trim()
  if (attributeValue) return attributeValue

  const sku = optionalVariantStringForJsonPayload(variantValue.sku)
    ?? optionalVariantStringForJsonPayload(productValues.sku)
  if (sku) return sku

  const attribute = variation?.attribute?.trim()
  return attribute ? `${attribute} variant` : 'Variant'
}

export function resolveVariantBarcodePayloadFields(variantValue) {
  const barcode = optionalVariantStringForJsonPayload(variantValue.barcode)

  if (!barcode) {
    return {
      barcode: null,
      barcode_type: null,
    }
  }

  const barcodeType = isPresentVariantField(variantValue.barcode_type)
    ? String(variantValue.barcode_type).trim()
    : 'UPC'

  return {
    barcode,
    barcode_type: barcodeType,
  }
}

export function optionalVariantNumberOrNullForJsonPayload(value) {
  if (!isPresentVariantField(value)) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export function resolveVariantMinimumThreshold(
  value,
  fallback = DEFAULT_VARIANT_MINIMUM_THRESHOLD,
) {
  if (isBlankVariantField(value) || String(value).trim() === VARIANT_OPTIONAL_EMPTY_VALUE) {
    return fallback
  }

  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export function variantMinimumThresholdForPayload(value) {
  return resolveVariantMinimumThreshold(value)
}

export const EMPTY_VARIANT_VALUES = {
  attribute: '',
  value: '',
  variant_name: '',
  sku: '',
  price: '',
  discount_price: '',
  quantity: '',
  reserved_quantity: '',
  // Left blank in the form — defaulted to DEFAULT_VARIANT_MINIMUM_THRESHOLD only when
  // building the submit payload (variantMinimumThresholdForPayload), so it never conflicts
  // with a low quantity value while the vendor is still filling in the form.
  minimum_threshold: '',
  barcode: '',
  barcode_type: 'UPC',
  weight: '',
  length: '',
  width: '',
  height: '',
  description: '',
  has_compatible_models: false,
  compatible_models: [],
  images: [],
}

export function toVariantFormValues(variantValue, attributeType) {
  const barcode = fromVariantOptionalField(variantValue.barcode)
  const barcodeType = fromVariantOptionalField(variantValue.barcode_type)

  return {
    attribute: attributeType ?? '',
    value: variantValue.value ?? '',
    variant_name: fromVariantOptionalField(variantValue.variant_name),
    sku: fromVariantOptionalField(variantValue.sku),
    price: fromVariantOptionalField(variantValue.price),
    discount_price: fromVariantOptionalField(variantValue.discount_price),
    quantity: variantValue.quantity ?? '',
    reserved_quantity: fromVariantOptionalField(variantValue.reserved_quantity),
    minimum_threshold: fromVariantOptionalField(
      variantValue.minimum_threshold ?? variantValue.low_stock_threshold,
    ),
    barcode,
    barcode_type: barcode && barcodeType ? barcodeType : 'UPC',
    weight: fromVariantOptionalField(variantValue.weight),
    length: fromVariantOptionalField(variantValue.length),
    width: fromVariantOptionalField(variantValue.width),
    height: fromVariantOptionalField(variantValue.height),
    description: fromVariantOptionalField(variantValue.description),
    has_compatible_models: Boolean(variantValue.compatible_models?.length),
    compatible_models: variantValue.compatible_models ?? [],
    images: variantValue.images ?? [],
  }
}

export function resolveStockStatus(quantity, threshold) {
  const qty = parseInt(quantity, 10)
  const thresh = parseInt(threshold, 10)
  if (!Number.isFinite(qty) || qty === 0) {
    return { label: 'Out of stock', dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 ring-red-100' }
  }
  if (Number.isFinite(thresh) && thresh > 0 && qty <= thresh) {
    return { label: `Low: ${qty}`, dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100' }
  }
  return { label: `${qty} in stock`, dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100' }
}

export function svFieldError(formik, name) {
  const touched = formik.touched[name] || formik.submitCount > 0
  return touched && formik.errors[name] ? formik.errors[name] : ''
}

export function getVariantValuePlaceholder(attribute = '') {
  switch (attribute) {
    case 'Color':
      return 'e.g. Red, Blue, Green'
    case 'Size':
      return 'e.g. S, M, L, XL'
    case 'Weight':
      return 'e.g. 250g, 500g, 1kg'
    case 'Material':
      return 'e.g. Cotton, Leather, Nylon'
    case 'Style':
      return 'e.g. Classic, Slim, Relaxed'
    case 'Capacity':
      return 'e.g. 64GB, 128GB, 256GB'
    case 'Flavor':
      return 'e.g. Vanilla, Chocolate, Strawberry'
    default:
      return attribute ? `e.g. Option 1, Option 2, Option 3` : 'e.g. Black, Large, Cotton'
  }
}

export function getVariantValuesHint(attribute = '') {
  const example = getVariantValuePlaceholder(attribute).replace(/^e\.g\.\s*/, '')
  return `Press Enter or comma after each value. Paste several at once, e.g. ${example}`
}

/** Placeholder example shown in the multi-value input field. */
export function getVariantValuesInputPlaceholder(attribute = '') {
  return getVariantValuePlaceholder(attribute).replace(/^e\.g\.\s*/, '')
}

/** Splits comma-separated input (e.g. "Red, Blue, Green") into trimmed, de-duplicated values. */
export function parseMultiValues(raw) {
  const seenLower = new Set()
  const values = []

  String(raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const key = entry.toLowerCase()
      if (seenLower.has(key)) return
      seenLower.add(key)
      values.push(entry)
    })

  return values
}

/** @deprecated Use parseMultiValues — kept for any legacy references. */
export function parsePipeValues(raw) {
  return parseMultiValues(raw)
}
