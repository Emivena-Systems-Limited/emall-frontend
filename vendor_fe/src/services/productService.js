import apiClient from '../lib/apiClient'
import { PRODUCT_ENDPOINTS } from '../constants/products'
import {
  extractProductList,
  extractProductRecord,
  getProductPaginationMeta,
  toCatalogProduct,
} from '../utils/normalizeProducts'
import { assertApiSuccess } from './authService'

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

export async function replicateProduct(productId) {
  const { data } = await apiClient.post(PRODUCT_ENDPOINTS.replicateById(productId))
  assertApiSuccess(data)

  const record = extractProductRecord(data)
  if (!record?.id) {
    throw new Error('Product was duplicated but no product id was returned.')
  }

  return record
}

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
