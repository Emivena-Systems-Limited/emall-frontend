import apiClient from '../lib/apiClient'
import { PRODUCT_ENDPOINTS } from '../constants/products'
import {
  extractProductList,
  extractProductRecord,
  getProductPaginationMeta,
  toCatalogProduct,
} from '../utils/normalizeProducts'
import { assertApiSuccess } from './authService'

const COPY_NAME_PATTERN = /\(copy\)|\bcopy\b|\bduplicate\b/i

function pickDuplicatedCatalogProduct(candidates, allProducts, sourceProductId) {
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const source = allProducts.find((product) => product.id === sourceProductId)
  const sourceName = source?.name?.trim().toLowerCase() ?? ''

  const nameMatches = candidates.filter((product) => {
    const name = product.name?.trim().toLowerCase() ?? ''
    if (!name) return false
    if (COPY_NAME_PATTERN.test(product.name ?? '')) return true
    if (!sourceName) return false
    return name.includes(sourceName) || sourceName.includes(name)
  })

  const pool = nameMatches.length > 0 ? nameMatches : candidates

  return pool
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })[0]
}

async function fetchProductsPage(page) {
  const { data } = await apiClient.get(PRODUCT_ENDPOINTS.LIST, { params: { page } })
  assertApiSuccess(data)
  return data
}

export async function getAllProducts() {
  const firstResponse = await fetchProductsPage(1)
  const products = extractProductList(firstResponse)
    .map((record) => toCatalogProduct(record))
    .filter(Boolean)
  const { lastPage } = getProductPaginationMeta(firstResponse)

  if (lastPage <= 1) {
    return products
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchProductsPage(index + 2)),
  )

  remainingResponses.forEach((response) => {
    extractProductList(response)
      .map((record) => toCatalogProduct(record))
      .filter(Boolean)
      .forEach((product) => products.push(product))
  })

  return products
}

export const getVendorProducts = getAllProducts

export async function createProduct(formData) {
  const { data } = await apiClient.post(PRODUCT_ENDPOINTS.CREATE, formData)
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product was created but no product id was returned.')
  }

  return record
}

export async function getProductById(productId) {
  const { data } = await apiClient.get(PRODUCT_ENDPOINTS.byId(productId))
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product not found.')
  }

  return record
}

export async function updateProduct(productId, formData) {
  const { data } = await apiClient.put(PRODUCT_ENDPOINTS.byId(productId), formData)
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product was updated but no product id was returned.')
  }

  return record
}

export async function updateProductInfo(productId, formData) {
  const { data } = await apiClient.post(PRODUCT_ENDPOINTS.updateInfoById(productId), formData)
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product info was updated but no product id was returned.')
  }

  return record
}

export async function updateProductVariant(productVariantId, formData) {
  if (!formData.get('_method')) {
    formData.append('_method', 'PUT')
  }

  formData.delete('product_id')

  const endpoint = PRODUCT_ENDPOINTS.updateVariantById(productVariantId)

  if (import.meta.env.DEV) {
    console.log('[update variant] POST', endpoint)
  }

  const { data } = await apiClient.post(endpoint, formData)
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product variant was updated but no product id was returned.')
  }

  return record
}

export async function createProductVariant(productId, formData) {
  formData.set('product_id', String(productId))

  const { data } = await apiClient.post(PRODUCT_ENDPOINTS.createVariantStore, formData)
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Variant was created but no product id was returned.')
  }

  return record
}

export async function deleteProductVariant(productVariantId) {
  const { data } = await apiClient.delete(
    PRODUCT_ENDPOINTS.deleteVariantById(productVariantId),
  )
  assertApiSuccess(data)
  return productVariantId
}

export async function duplicateProduct(sourceProductId, knownProductIds = []) {
  const { data } = await apiClient.get(PRODUCT_ENDPOINTS.duplicateById(sourceProductId))
  assertApiSuccess(data)

  const inlineRecord = extractProductRecord(data)
  if (inlineRecord?.id) {
    return {
      record: inlineRecord,
      catalogProducts: null,
    }
  }

  const catalogProducts = await getAllProducts()
  const beforeIds = new Set(knownProductIds)
  const candidates = catalogProducts.filter(
    (product) => !beforeIds.has(product.id) && product.id !== sourceProductId,
  )

  const match = pickDuplicatedCatalogProduct(candidates, catalogProducts, sourceProductId)
  if (!match?.id) {
    throw new Error(
      'Product was duplicated successfully but could not be found in your catalogue. Refresh the page and try again.',
    )
  }

  const record = await getProductById(match.id)
  return {
    record,
    catalogProducts,
  }
}

/** @deprecated Use duplicateProduct */
export const replicateProduct = duplicateProduct

export async function toggleProductActive(productId) {
  const { data } = await apiClient.put(PRODUCT_ENDPOINTS.toggleActiveById(productId))
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    return getProductById(productId)
  }

  return record
}

export async function deleteProduct(productId) {
  const { data } = await apiClient.delete(PRODUCT_ENDPOINTS.deleteById(productId))
  assertApiSuccess(data)
  return productId
}

export async function deleteProducts(productIds = []) {
  const ids = [...new Set(productIds.filter(Boolean))]
  await Promise.all(ids.map((productId) => deleteProduct(productId)))
  return ids
}

export { toCatalogProduct }
