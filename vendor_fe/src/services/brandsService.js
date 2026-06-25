import apiClient from '../lib/apiClient'
import { BRAND_ENDPOINTS } from '../constants/brands'
import {
  capitalizeBrandName,
  extractBrandRecords,
  extractCreatedBrand,
  sortBrandsAlphabetically,
} from '../utils/normalizeBrands'
import { assertApiSuccess } from './authService'

// One request for the brand dropdown — no client-side pagination fan-out.
const BRANDS_DROPDOWN_PAGE_SIZE = 500

let approvedBrandsInflight = null

async function fetchApprovedBrandsOnce() {
  const { data } = await apiClient.get(BRAND_ENDPOINTS.GET_APPROVED, {
    params: { page: 1, per_page: BRANDS_DROPDOWN_PAGE_SIZE },
  })
  assertApiSuccess(data)

  return sortBrandsAlphabetically(extractBrandRecords(data))
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
