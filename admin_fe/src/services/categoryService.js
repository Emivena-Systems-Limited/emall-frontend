import apiClient from '../lib/apiClient'
import {
  CATEGORY_ENDPOINTS,
  CATEGORY_IMAGE_TYPE_REGULAR,
  CATEGORY_IMAGE_TYPE_THUMBNAIL,
  CATEGORY_WRITE_ENABLED,
  normalizeCategoryImageType,
} from '../constants/categories'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { extractCategoryList, normalizeCategoryRecord } from '../utils/normalizeAdminCategories'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function writePendingError() {
  const error = new Error('This category cannot be saved yet.')
  error.code = 'CATEGORY_WRITE_PENDING'
  return error
}

function toParentIdValue(parentId) {
  const value = String(parentId ?? '').trim()
  return value || null
}

function buildCategoryWriteFields(fields) {
  return {
    category_name: String(fields.name ?? '').trim(),
    slug: String(fields.slug ?? '').trim(),
    parent_id: toParentIdValue(fields.parentId),
    is_active: fields.isActive ? '1' : '0',
    is_featured: fields.isFeatured ? '1' : '0',
  }
}

function isUploadedFile(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function existingCategoryImages(fields) {
  if (Array.isArray(fields.images) && fields.images.length > 0) return fields.images
  if (!Array.isArray(fields.keepImageIds)) return []
  return fields.keepImageIds.map((id) => ({
    id,
    type: CATEGORY_IMAGE_TYPE_REGULAR,
  }))
}

function collectKeepImageIds(fields) {
  const replacingRegular = isUploadedFile(fields.imageFile)
  const replacingThumbnail = isUploadedFile(fields.thumbnailFile)

  return existingCategoryImages(fields)
    .filter((image) => {
      const id = String(image?.id ?? image ?? '').trim()
      if (!id) return false
      const type = normalizeCategoryImageType(image?.type)
      if (type === CATEGORY_IMAGE_TYPE_THUMBNAIL) return !replacingThumbnail
      return !replacingRegular
    })
    .map((image) => String(image?.id ?? image).trim())
    .filter(Boolean)
}

function appendKeepImageIds(form, ids) {
  ids.forEach((id, index) => {
    form.append(`keep_image_ids[${index}]`, id)
  })
}

function collectCategoryImageEntries(fields) {
  const entries = []

  if (isUploadedFile(fields.imageFile)) {
    entries.push({
      image_url: fields.imageFile,
      type: CATEGORY_IMAGE_TYPE_REGULAR,
    })
  }

  if (isUploadedFile(fields.thumbnailFile)) {
    entries.push({
      image_url: fields.thumbnailFile,
      type: CATEGORY_IMAGE_TYPE_THUMBNAIL,
    })
  }

  return entries
}

function appendCategoryImages(form, entries) {
  entries.forEach((entry, index) => {
    form.append(`images[${index}][image_url]`, entry.image_url)
    form.append(`images[${index}][type]`, entry.type)
  })
}

export function buildCategoryFormData(fields, { isUpdate = false } = {}) {
  const form = new FormData()
  const payload = buildCategoryWriteFields(fields)
  const imageEntries = collectCategoryImageEntries(fields)

  Object.entries(payload).forEach(([key, value]) => {
    form.append(key, value == null ? '' : value)
  })

  if (isUpdate) appendKeepImageIds(form, collectKeepImageIds(fields))
  appendCategoryImages(form, imageEntries)
  return form
}

export async function fetchParentCategories() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_PARENTS, {
    params: { ...LATEST_FIRST_QUERY },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load parent categories.')
  return extractCategoryList(envelope)
}

export async function fetchCategoriesWithChildren() {
  const { data } = await apiClient.get(CATEGORY_ENDPOINTS.GET_WITH_CHILDREN, {
    params: { ...LATEST_FIRST_QUERY },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load categories.')
  return extractCategoryList(envelope)
}

function extractSavedCategory(envelope) {
  const payload = envelope?.data ?? envelope

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const normalized = normalizeCategoryRecord(payload)
    if (normalized) return normalized
  }

  return extractCategoryList(envelope)[0]
    ?? extractCategoryList({ data: payload })[0]
    ?? null
}

export async function createAdminCategory(fields) {
  if (!CATEGORY_WRITE_ENABLED) throw writePendingError()

  const { data } = await apiClient.post(CATEGORY_ENDPOINTS.CREATE, buildCategoryFormData(fields))
  const envelope = assertAuthEnvelope(data, 'Could not create category.')

  return {
    category: extractSavedCategory(envelope),
    message: envelope?.reason || envelope?.message || 'Category created.',
  }
}

async function sendCategoryUpdate(categoryId, fields) {
  const endpoint = CATEGORY_ENDPOINTS.update(categoryId)
  const form = buildCategoryFormData(fields, { isUpdate: true })
  const parentId = toParentIdValue(fields.parentId)
  form.set('parent_id', parentId == null ? '' : parentId)
  if (!form.get('_method')) form.append('_method', 'PUT')
  return apiClient.post(endpoint, form)
}

export async function updateAdminCategory({ id, ...fields }) {
  const categoryId = String(id ?? '').trim()
  if (!categoryId) throw new Error('Category id is required.')
  if (!CATEGORY_WRITE_ENABLED) throw writePendingError()

  const { data } = await sendCategoryUpdate(categoryId, fields)
  const envelope = assertAuthEnvelope(data, 'Could not update category.')

  return {
    category: extractSavedCategory(envelope),
    message: envelope?.reason || envelope?.message || 'Category updated.',
  }
}

function readFeaturedFlag(source, fallback) {
  if (typeof source === 'boolean') return source
  if (!source || typeof source !== 'object') return fallback

  const raw = source.is_featured ?? source.isFeatured ?? source.featured
  if (raw == null) return fallback
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'number') return raw !== 0

  const text = String(raw).trim().toLowerCase()
  if (['1', 'true', 'yes'].includes(text)) return true
  if (['0', 'false', 'no'].includes(text)) return false
  return fallback
}

export async function toggleAdminCategoryFeatured({ id, currentlyFeatured = false }) {
  const categoryId = String(id ?? '').trim()
  if (!categoryId) throw new Error('Category id is required.')
  if (!CATEGORY_WRITE_ENABLED) throw writePendingError()

  const { data } = await apiClient.patch(CATEGORY_ENDPOINTS.toggleFeatured(categoryId))
  const envelope = assertAuthEnvelope(data, 'Could not update featured category.')
  const category = extractSavedCategory(envelope)
  const payload = envelope?.data ?? envelope
  const isFeatured = category?.isFeatured ?? readFeaturedFlag(payload, !currentlyFeatured)

  return {
    category: category ? { ...category, isFeatured } : { id: categoryId, isFeatured },
    isFeatured,
    message: envelope?.message || envelope?.reason || (
      isFeatured ? 'Category is now featured.' : 'Category is no longer featured.'
    ),
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
