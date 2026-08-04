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

// Backend currently caps page size (~20); we still request a large page and fan out.
const BRANDS_DROPDOWN_PAGE_SIZE = 500

let approvedBrandsInflight = null

async function fetchApprovedBrandsPage(page) {
  const { data } = await apiClient.get(BRAND_ENDPOINTS.GET_APPROVED, {
    params: { page, per_page: BRANDS_DROPDOWN_PAGE_SIZE },
  })
  assertApiSuccess(data)
  return data
}

function dedupeBrands(brands) {
  const byId = new Map()
  for (const brand of brands) {
    if (!brand?.id) continue
    byId.set(String(brand.id), brand)
  }
  return [...byId.values()]
}

async function fetchApprovedBrandsOnce() {
  const firstResponse = await fetchApprovedBrandsPage(1)
  const firstPage = extractBrandRecords(firstResponse)
  const { lastPage } = getBrandPaginationMeta(firstResponse)

  if (lastPage <= 1) {
    return sortBrandsAlphabetically(dedupeBrands(firstPage))
  }

  const restResponses = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchApprovedBrandsPage(index + 2)),
  )
  const allBrands = [
    ...firstPage,
    ...restResponses.flatMap((response) => extractBrandRecords(response)),
  ]

  return sortBrandsAlphabetically(dedupeBrands(allBrands))
}

export async function getApprovedBrands() {
  if (!approvedBrandsInflight) {
    approvedBrandsInflight = fetchApprovedBrandsOnce().finally(() => {
      approvedBrandsInflight = null
    })
  }

  return approvedBrandsInflight
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
