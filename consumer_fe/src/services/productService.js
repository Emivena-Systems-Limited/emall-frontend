import { PRODUCT_CATALOG_ENDPOINT } from '../constants/productCatalog'
import apiClient from '../lib/apiClient'
import { serializeCatalogParams } from '../utils/catalogQueryParams'
import { normalizeProductCatalog } from '../utils/normalizeProductCatalog'

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || data.reason || 'Unable to fetch products')
  error.response = { data }
  throw error
}

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value == null || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  )
}

export async function getProductCatalog(params = {}) {
  const requestParams = compactParams(params)
  const { data } = await apiClient.get(PRODUCT_CATALOG_ENDPOINT, {
    params: requestParams,
    paramsSerializer: { serialize: serializeCatalogParams },
    skipAuthLogout: true,
  })
  assertApiSuccess(data)

  return normalizeProductCatalog(data, requestParams)
}
