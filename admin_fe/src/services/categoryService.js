import apiClient from '../lib/apiClient'
import { CATEGORY_ENDPOINTS, CATEGORY_WRITE_ENABLED } from '../constants/categories'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { extractCategoryList } from '../utils/normalizeAdminCategories'

function writePendingError() {
  const error = new Error('This category cannot be saved yet.')
  error.code = 'CATEGORY_WRITE_PENDING'
  return error
}

export function buildCategoryFormData({
  name,
  slug,
  parentId,
  isActive,
  isFeatured,
  imageFile,
  thumbnailFile,
}) {
  const form = new FormData()
  form.append('category_name', String(name ?? '').trim())
  form.append('slug', String(slug ?? '').trim())
  form.append('parent_id', parentId ? String(parentId) : '')
  form.append('is_active', isActive ? '1' : '0')
  form.append('is_featured', isFeatured ? '1' : '0')

  if (imageFile instanceof File) {
    form.append('images[image_url]', imageFile)
  }

  if (thumbnailFile instanceof File) {
    form.append('images[thumbnail_image_url]', thumbnailFile)
  }

  return form
}

export async function fetchParentCategories() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_PARENTS)
  const envelope = assertAuthEnvelope(data, 'Could not load parent categories.')
  return extractCategoryList(envelope)
}

export async function fetchCategoriesWithChildren() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_WITH_CHILDREN)
  const envelope = assertAuthEnvelope(data, 'Could not load categories.')
  return extractCategoryList(envelope)
}

export async function createAdminCategory(fields) {
  if (!CATEGORY_WRITE_ENABLED) throw writePendingError()

  const { data } = await apiClient.post(CATEGORY_ENDPOINTS.CREATE, buildCategoryFormData(fields))
  const envelope = assertAuthEnvelope(data, 'Could not create category.')
  const record = extractCategoryList(envelope)[0]
    ?? extractCategoryList({ data: envelope?.data })[0]

  return {
    category: record,
    message: envelope?.reason || envelope?.message || 'Category created.',
  }
}

export async function updateAdminCategory({ id, ...fields }) {
  if (!CATEGORY_WRITE_ENABLED) throw writePendingError()

  const { data } = await apiClient.post(CATEGORY_ENDPOINTS.update(id), buildCategoryFormData(fields))
  const envelope = assertAuthEnvelope(data, 'Could not update category.')
  const record = extractCategoryList(envelope)[0]
    ?? extractCategoryList({ data: envelope?.data })[0]

  return {
    category: record,
    message: envelope?.reason || envelope?.message || 'Category updated.',
  }
}

export async function deleteAdminCategory(id) {
  const { data } = await apiClient.post(CATEGORY_ENDPOINTS.remove(id))
  const envelope = assertAuthEnvelope(data, 'Could not remove category.')
  return {
    id: String(id),
    message: envelope?.reason || envelope?.message || 'Category removed.',
  }
}
