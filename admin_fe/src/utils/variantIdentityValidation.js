import { VARIANT_OPTIONAL_EMPTY_VALUE } from '../components/variants/variantFormUtils'

function normalizeBarcode(value) {
  const barcode = String(value ?? '').trim()
  if (!barcode || barcode === VARIANT_OPTIONAL_EMPTY_VALUE) return null
  return barcode
}

/** Barcodes already used on other products/variants in the vendor catalogue. */
export function collectKnownBarcodes(
  products = [],
  { excludeProductId = null, excludeVariantId = null } = {},
) {
  const barcodes = new Map()

  for (const product of products) {
    if (!product?.id) continue

    const isExcludedProduct = excludeProductId && String(product.id) === String(excludeProductId)

    if (!isExcludedProduct) {
      const productBarcode = normalizeBarcode(product.barcode)
      if (productBarcode) {
        barcodes.set(productBarcode, {
          productId: product.id,
          productName: product.name ?? 'another product',
          source: 'product',
        })
      }
    }

    for (const variant of product.variants ?? []) {
      if (excludeVariantId && String(variant.id) === String(excludeVariantId)) continue

      const variantBarcode = normalizeBarcode(variant.barcode)
      if (!variantBarcode) continue

      barcodes.set(variantBarcode, {
        productId: product.id,
        productName: product.name ?? 'another product',
        source: 'variant',
      })
    }
  }

  return barcodes
}

/**
 * Detect variation barcodes that would fail backend unique validation.
 * Returns Formik-compatible dotted field paths (e.g. variations.0.values.0.barcode).
 */
export function findDuplicateVariationBarcodes({
  productBarcode,
  variations = [],
  knownBarcodes = new Map(),
} = {}) {
  const errors = []
  const seenInPayload = new Set()
  const normalizedProductBarcode = normalizeBarcode(productBarcode)

  variations.forEach((group, groupIndex) => {
    ;(group?.values ?? []).forEach((variantValue, valueIndex) => {
      const barcode = normalizeBarcode(variantValue?.barcode)
      if (!barcode) return

      const field = `variations.${groupIndex}.values.${valueIndex}.barcode`

      if (normalizedProductBarcode && barcode === normalizedProductBarcode) {
        errors.push({
          field,
          message: 'This barcode is already set on the product. Leave the variant barcode empty or use a different code.',
        })
        return
      }

      if (seenInPayload.has(barcode)) {
        errors.push({
          field,
          message: 'This barcode is already used on another variation in this product.',
        })
        return
      }

      seenInPayload.add(barcode)

      const existing = knownBarcodes.get(barcode)
      if (existing) {
        errors.push({
          field,
          message: `Barcode "${barcode}" is already used on "${existing.productName}".`,
        })
      }
    })
  })

  return errors
}

export function mapFieldErrorsToFormikErrors(fieldErrors = {}) {
  return Object.entries(fieldErrors).reduce((acc, [field, message]) => {
    if (!field || !message) return acc

    const parts = field.split('.')
    let cursor = acc

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const nextKey = /^\d+$/.test(part) ? Number(part) : part

      if (isLast) {
        cursor[nextKey] = message
        return
      }

      if (cursor[nextKey] == null) {
        cursor[nextKey] = /^\d+$/.test(parts[index + 1]) ? [] : {}
      }

      cursor = cursor[nextKey]
    })

    return acc
  }, {})
}

export function findDuplicateProductBarcode({
  productBarcode,
  knownBarcodes = new Map(),
  excludeProductId = null,
} = {}) {
  const barcode = normalizeBarcode(productBarcode)
  if (!barcode) return null

  const existing = knownBarcodes.get(barcode)
  if (!existing) return null
  if (excludeProductId && String(existing.productId) === String(excludeProductId)) return null

  return `Barcode "${barcode}" is already used on "${existing.productName}".`
}

export function assertVariationBarcodesAvailable({
  productBarcode,
  variations = [],
  knownBarcodes = new Map(),
  excludeProductId = null,
} = {}) {
  const productBarcodeError = findDuplicateProductBarcode({
    productBarcode,
    knownBarcodes,
    excludeProductId,
  })
  if (productBarcodeError) {
    const error = new Error(productBarcodeError)
    error.fieldErrors = { barcode: productBarcodeError }
    throw error
  }

  const variationErrors = findDuplicateVariationBarcodes({
    productBarcode,
    variations,
    knownBarcodes,
  })

  if (variationErrors.length === 0) return

  const error = new Error(variationErrors[0].message)
  error.fieldErrors = variationErrors.reduce((acc, entry) => {
    acc[entry.field] = entry.message
    return acc
  }, {})
  throw error
}
