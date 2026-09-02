import {
  buildDefaultVariantSkuSuffix,
  resolveDefaultVariantSku,
} from './defaultProductVariation'
import {
  isPresentVariantField,
  VARIANT_OPTIONAL_EMPTY_VALUE,
} from '../components/variants/variantFormUtils'
import { productQueryKeys } from '../hooks/useProducts'

const ENTROPY_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTUVWXYZ'
const MAX_SUFFIX_ATTEMPTS = 99
const MAX_ENTROPY_ATTEMPTS = 32

function normalizeSku(value) {
  const sku = String(value ?? '').trim().toUpperCase()
  if (!sku || sku === VARIANT_OPTIONAL_EMPTY_VALUE) return null
  return sku
}

function slugifySkuBase(value, maxLength = 24) {
  const slug = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

  if (!slug) return ''
  return slug.length <= maxLength ? slug : slug.slice(0, maxLength).replace(/-[^-]*$/, '')
}

function generateEntropySegment(length = 6) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(bytes, (byte) => ENTROPY_ALPHABET[byte % ENTROPY_ALPHABET.length]).join('')
  }

  return Array.from({ length }, () => (
    ENTROPY_ALPHABET[Math.floor(Math.random() * ENTROPY_ALPHABET.length)]
  )).join('')
}

function generateEntropySku(preferredBase = 'VAR') {
  const base = slugifySkuBase(preferredBase, 20) || 'VAR'
  return `${base}-V${generateEntropySegment()}`
}

function toInitialSkuList(initialSkus) {
  if (!initialSkus) return []
  if (Array.isArray(initialSkus)) return initialSkus
  if (initialSkus instanceof Set) return [...initialSkus]
  if (typeof initialSkus[Symbol.iterator] === 'function') return [...initialSkus]
  return []
}

/** Tracks SKUs already present in the catalogue and ones allocated in this submit batch. */
export class SkuRegistry {
  constructor(initialSkus = []) {
    this.reserved = new Set(
      toInitialSkuList(initialSkus).map(normalizeSku).filter(Boolean),
    )
  }

  isTaken(sku) {
    const normalized = normalizeSku(sku)
    return Boolean(normalized && this.reserved.has(normalized))
  }

  reserve(sku) {
    const normalized = normalizeSku(sku)
    if (!normalized) return null
    this.reserved.add(normalized)
    return normalized
  }

  release(sku) {
    const normalized = normalizeSku(sku)
    if (normalized) this.reserved.delete(normalized)
  }
}

/** Every product + variant SKU currently in the vendor catalogue. */
export function collectKnownSkus(
  products = [],
  { excludeProductId = null, excludeVariantId = null } = {},
) {
  const skus = new Set()

  for (const product of products) {
    if (!product?.id) continue

    const isExcludedProduct = excludeProductId && String(product.id) === String(excludeProductId)

    if (!isExcludedProduct) {
      const productSku = normalizeSku(product.sku)
      if (productSku) skus.add(productSku)
    }

    for (const variant of product.variants ?? []) {
      if (excludeVariantId && String(variant.id) === String(excludeVariantId)) continue

      const variantSku = normalizeSku(variant.sku)
      if (variantSku) skus.add(variantSku)
    }
  }

  return skus
}

/** Collect SKUs already in the product cache. Do not crawl catalogue pages. */
export async function fetchKnownSkusForSubmit(queryClient, options = {}) {
  const products = []
  const queries = queryClient?.getQueriesData?.({ queryKey: productQueryKeys.all }) ?? []

  for (const [, data] of queries) {
    if (Array.isArray(data)) products.push(...data)
    else if (Array.isArray(data?.products)) products.push(...data.products)
  }

  return collectKnownSkus(products, options)
}

export function buildVariantSkuCandidates({
  productSku = '',
  attribute = '',
  value = '',
} = {}) {
  const base = String(productSku ?? '').trim().toUpperCase()
  const suffix = buildDefaultVariantSkuSuffix(attribute, value)
  const readable = resolveDefaultVariantSku(productSku, attribute, value)

  return [
    readable,
    base && suffix ? `${base}-${suffix}` : null,
    base ? `${base}-VAR` : null,
    suffix ? `V-${suffix}` : null,
    base ? `${base}-V1` : null,
  ]
    .map(normalizeSku)
    .filter(Boolean)
    .filter((candidate, index, list) => list.indexOf(candidate) === index)
}

/**
 * Pick the first available SKU from readable candidates, then suffixes, then entropy.
 * Always reserves the returned SKU in the registry.
 */
export function allocateUniqueVariantSku(registry, candidates = [], { entropyBase = 'VAR' } = {}) {
  const preferred = candidates.map(normalizeSku).filter(Boolean)

  for (const candidate of preferred) {
    if (!registry.isTaken(candidate)) {
      registry.reserve(candidate)
      return candidate
    }

    for (let suffix = 2; suffix <= MAX_SUFFIX_ATTEMPTS; suffix += 1) {
      const suffixed = `${candidate}-${suffix}`
      if (!registry.isTaken(suffixed)) {
        registry.reserve(suffixed)
        return suffixed
      }
    }
  }

  for (let attempt = 0; attempt < MAX_ENTROPY_ATTEMPTS; attempt += 1) {
    const entropySku = generateEntropySku(preferred[0] || entropyBase)
    if (!registry.isTaken(entropySku)) {
      registry.reserve(entropySku)
      return entropySku
    }
  }

  throw new Error('Could not generate a unique variant SKU. Please try again.')
}

/**
 * System-assigned SKUs always carry an entropy segment so they stay unique even when
 * the local catalogue cache is incomplete or stale.
 */
export function allocateSystemVariantSku(registry, {
  productSku = '',
  attribute = '',
  value = '',
  entropyBase = 'VAR',
} = {}) {
  const readableBase =
    buildVariantSkuCandidates({ productSku, attribute, value })[0]
    || slugifySkuBase(productSku)
    || slugifySkuBase(entropyBase)
    || 'VAR'

  for (let attempt = 0; attempt < MAX_ENTROPY_ATTEMPTS; attempt += 1) {
    const sku = attempt === 0
      ? `${readableBase}-V${generateEntropySegment()}`
      : generateEntropySku(readableBase)

    if (!registry.isTaken(sku)) {
      registry.reserve(sku)
      return sku
    }
  }

  throw new Error('Could not generate a unique variant SKU. Please try again.')
}

/** Resolve any preferred SKU to one that is free in the registry. */
export function allocateUniqueCatalogSku(registry, preferredSku, { entropyBase = 'VAR' } = {}) {
  const preferred = normalizeSku(preferredSku)
  if (!preferred) {
    throw new Error('A SKU is required.')
  }

  if (!registry.isTaken(preferred)) {
    registry.reserve(preferred)
    return preferred
  }

  for (let suffix = 2; suffix <= MAX_SUFFIX_ATTEMPTS; suffix += 1) {
    const candidate = `${preferred}-${suffix}`
    if (!registry.isTaken(candidate)) {
      registry.reserve(candidate)
      return candidate
    }
  }

  return allocateSystemVariantSku(registry, {
    productSku: preferred,
    entropyBase: entropyBase || preferred,
  })
}

export function isVendorProvidedVariantSku(value) {
  return isPresentVariantField(value)
}

function throwSkuFieldErrors(fieldErrors, fallbackMessage) {
  const error = new Error(Object.values(fieldErrors)[0] || fallbackMessage)
  error.fieldErrors = fieldErrors
  throw error
}

export function assertProductSkuAvailable(productSku, knownSkus = []) {
  const normalized = normalizeSku(productSku)
  if (!normalized) {
    throwSkuFieldErrors({ sku: 'Product SKU is required.' }, 'Product SKU is required.')
  }

  const registry = new SkuRegistry(knownSkus)
  if (registry.isTaken(normalized)) {
    throwSkuFieldErrors(
      { sku: `SKU "${normalized}" is already used in your catalogue. Choose a different product SKU.` },
      `SKU "${normalized}" is already used in your catalogue.`,
    )
  }
}

/**
 * Resolve the product SKU for create/edit submit.
 * On create, duplicates are auto-adjusted (e.g. AUD-WEP-001 → AUD-WEP-001-2).
 */
export function resolveProductSkuForSubmit(productSku, knownSkus = [], { autoResolve = false } = {}) {
  const normalized = normalizeSku(productSku)
  if (!normalized) {
    throwSkuFieldErrors({ sku: 'Product SKU is required.' }, 'Product SKU is required.')
  }

  const registry = new SkuRegistry(knownSkus)

  if (!registry.isTaken(normalized)) {
    registry.reserve(normalized)
    return {
      sku: normalized,
      wasAdjusted: false,
      knownSkus: registry.reserved,
    }
  }

  if (!autoResolve) {
    throwSkuFieldErrors(
      { sku: `SKU "${normalized}" is already used in your catalogue. Choose a different product SKU.` },
      `SKU "${normalized}" is already used in your catalogue.`,
    )
  }

  const resolved = allocateUniqueCatalogSku(registry, normalized, { entropyBase: normalized })

  return {
    sku: resolved,
    wasAdjusted: true,
    originalSku: normalized,
    knownSkus: registry.reserved,
  }
}

export function assertPayloadSkuUniqueness(productSku, variations = []) {
  const fieldErrors = {}
  const seen = new Map()

  const registerSku = (sku, field) => {
    const normalized = normalizeSku(sku)
    if (!normalized) return

    if (seen.has(normalized)) {
      fieldErrors[field] = `SKU "${normalized}" is already used in this listing.`
      return
    }

    seen.set(normalized, field)
  }

  registerSku(productSku, 'sku')

  variations.forEach((group, groupIndex) => {
    ;(group?.values ?? []).forEach((variantValue, valueIndex) => {
      registerSku(
        variantValue?.sku,
        `variations.${groupIndex}.values.${valueIndex}.sku`,
      )
    })
  })

  if (Object.keys(fieldErrors).length > 0) {
    throwSkuFieldErrors(fieldErrors, 'Each SKU in this listing must be unique.')
  }
}

/**
 * Assign guaranteed-unique SKUs and clear optional barcodes before API submit.
 * Vendor-entered SKUs are validated; system fills any blank variant SKU.
 */
export function prepareVariationsForSubmit({
  variations = [],
  productValues = {},
  knownSkus = [],
  reserveProductSku = true,
  autoResolveVendorSkus = false,
} = {}) {
  const registry = new SkuRegistry(knownSkus)
  const fieldErrors = {}

  if (reserveProductSku) {
    const productSku = normalizeSku(productValues?.sku)
    if (productSku) registry.reserve(productSku)
  }

  const nextVariations = variations.map((group, groupIndex) => ({
    ...group,
    values: (group?.values ?? []).map((variantValue, valueIndex) => {
      const field = `variations.${groupIndex}.values.${valueIndex}.sku`
      const nextValue = {
        ...variantValue,
        barcode: '',
      }

      if (isVendorProvidedVariantSku(variantValue?.sku)) {
        const vendorSku = normalizeSku(variantValue.sku)
        if (registry.isTaken(vendorSku)) {
          if (autoResolveVendorSkus) {
            try {
              nextValue.sku = allocateUniqueCatalogSku(registry, vendorSku, {
                entropyBase: productValues?.sku || vendorSku,
              })
            } catch (error) {
              fieldErrors[field] = error.message || 'Could not generate a unique variant SKU.'
            }
            return nextValue
          }

          fieldErrors[field] = `SKU "${vendorSku}" is already used in your catalogue. Choose a different code.`
          return nextValue
        }
        registry.reserve(vendorSku)
        nextValue.sku = vendorSku
        return nextValue
      }

      try {
        nextValue.sku = allocateSystemVariantSku(registry, {
          productSku: productValues?.sku,
          attribute: group?.attribute,
          value: variantValue?.value,
          entropyBase: productValues?.sku || group?.attribute || 'VAR',
        })
      } catch (error) {
        fieldErrors[field] = error.message || 'Could not generate a unique variant SKU.'
      }

      return nextValue
    }),
  }))

  if (Object.keys(fieldErrors).length > 0) {
    const error = new Error(Object.values(fieldErrors)[0])
    error.fieldErrors = fieldErrors
    throw error
  }

  return nextVariations
}
