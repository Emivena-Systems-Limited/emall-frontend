import apiClient from '../lib/apiClient'
import { CATEGORY_ENDPOINTS } from '../constants/categories'
import { extractCategoryList } from '../utils/normalizeCategories'
import { assertApiSuccess } from './authService'

export async function getParentCategories() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_PARENTS)
  assertApiSuccess(data)

  return extractCategoryList(data).map(({ id, slug, name }) => ({
    id,
    slug,
    name,
  }))
}

export async function getCategoriesWithChildren() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_WITH_CHILDREN)
  assertApiSuccess(data)

  return extractCategoryList(data)
}
