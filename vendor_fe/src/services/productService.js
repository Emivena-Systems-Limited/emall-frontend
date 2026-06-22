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

export { toCatalogProduct }
