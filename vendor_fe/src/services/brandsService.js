import apiClient from '../lib/apiClient'
import { BRAND_ENDPOINTS } from '../constants/brands'
import {
  capitalizeBrandName,
  extractBrandRecords,
  extractCreatedBrand,
  getBrandPaginationMeta,
  sortBrandsAlphabetically,
} from '../utils/normalizeBrands'
import { assertApiSuccess } from './authService'

async function fetchApprovedBrandsPage(page) {
  const { data } = await apiClient.get(BRAND_ENDPOINTS.GET_APPROVED, { params: { page } })
  assertApiSuccess(data)
  return data
}

export async function getApprovedBrands() {
  const firstResponse = await fetchApprovedBrandsPage(1)
  const brands = extractBrandRecords(firstResponse)
  const { lastPage } = getBrandPaginationMeta(firstResponse)

  if (lastPage <= 1) {
    return sortBrandsAlphabetically(brands)
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchApprovedBrandsPage(index + 2)),
  )

  remainingResponses.forEach((response) => {
    brands.push(...extractBrandRecords(response))
  })

  return sortBrandsAlphabetically(brands)
}

export async function createBrand({ brand_name }) {
  const { data } = await apiClient.post(BRAND_ENDPOINTS.CREATE, {
    brand_name: capitalizeBrandName(brand_name),
  })
  assertApiSuccess(data)

  const brand = extractCreatedBrand(data)
  if (!brand?.id) {
    throw new Error('Brand was created but no brand id was returned.')
  }

  return brand
}
