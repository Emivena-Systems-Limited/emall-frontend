import { CATEGORY_ENDPOINTS } from '../constants/categories'
import apiClient from '../lib/apiClient'
import { extractCategoryList } from '../utils/normalizeCategories'

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Unable to fetch categories')
  error.response = { data }
  throw error
}

export async function getParentCategories() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_PARENTS, { skipAuthLogout: true })
  assertApiSuccess(data)

  return extractCategoryList(data)
}

export async function getCategoriesWithChildren() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_WITH_CHILDREN, { skipAuthLogout: true })
  assertApiSuccess(data)

  return extractCategoryList(data)
}
