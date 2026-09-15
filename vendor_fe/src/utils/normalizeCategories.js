import { unwrapApiEnvelope } from './parseApiError'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function toBoolean(value, fallback = true) {
  if (value == null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const text = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'active'].includes(text)) return true
  if (['0', 'false', 'no', 'inactive'].includes(text)) return false
  return fallback
}

function slugifyCategoryName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function childList(record) {
  if (Array.isArray(record?.children)) return record.children
  if (Array.isArray(record?.subcategories)) return record.subcategories
  if (Array.isArray(record?.sub_categories)) return record.sub_categories
  if (Array.isArray(record?.child_categories)) return record.child_categories
  return []
}

function extractRawCategoryList(body) {
  if (Array.isArray(body)) return body

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.categories)) return payload.categories
  if (Array.isArray(payload?.parents)) return payload.parents
  return []
}

export function normalizeCategoryRecord(record) {
  if (!isRecord(record)) return null

  const id = firstText(record.id, record.category_id)
  const name = firstText(record.category_name, record.name, record.title, record.label)
  const slug = firstText(record.slug, record.category_slug) || slugifyCategoryName(name)

  if (!id || (!name && !slug)) return null

  return {
    id,
    slug,
    name: name || slug,
    parentId: record.parent_id == null || record.parent_id === ''
      ? null
      : String(record.parent_id),
    nestedLevel: record.nested_level ?? record.level ?? 0,
    isActive: toBoolean(record.is_active ?? record.active, true),
    isFeatured: toBoolean(record.is_featured ?? record.featured, false),
    children: sortCategoriesAlphabetically(
      childList(record)
        .map(normalizeCategoryRecord)
        .filter(Boolean),
    ),
  }
}

export function sortCategoriesAlphabetically(categories = []) {
  return [...categories].sort((left, right) =>
    String(left.name ?? left.label ?? '').localeCompare(
      String(right.name ?? right.label ?? ''),
      undefined,
      { sensitivity: 'base' },
    ),
  )
}

export function extractCategoryList(body) {
  return sortCategoriesAlphabetically(
    extractRawCategoryList(body)
      .map(normalizeCategoryRecord)
      .filter((category) => category && category.isActive && category.name),
  )
}

export function toSelectOptions(categories) {
  return sortCategoriesAlphabetically(
    (categories ?? [])
      .filter((category) => category?.id != null && category.id !== '' && category.name)
      .map((category) => ({
        value: String(category.id),
        label: String(category.name),
      })),
  )
}

export function findCategoryBySlug(categories, slug) {
  if (!slug) return null
  return (categories ?? []).find((category) => category.slug === slug) ?? null
}

export function findCategoryById(categories, id) {
  if (id == null || id === '') return null
  const target = String(id)

  for (const category of categories ?? []) {
    if (String(category.id) === target) return category

    const nestedMatch = findCategoryById(category.children ?? [], id)
    if (nestedMatch) return nestedMatch
  }

  return null
}

/** Root → leaf path for a category id in the nested tree. */
export function findCategoryPath(categories, id, path = []) {
  if (id == null || id === '') return null
  const target = String(id)

  for (const category of categories ?? []) {
    const nextPath = [...path, category]
    if (String(category.id) === target) return nextPath

    const nested = findCategoryPath(category.children ?? [], id, nextPath)
    if (nested) return nested
  }

  return null
}

export function getSubcategoriesForParent(categories, parentSlug) {
  const parent = findCategoryBySlug(categories, parentSlug)
  return sortCategoriesAlphabetically(
    (parent?.children ?? []).filter((child) => child.isActive),
  )
}

export function getSubcategoriesForParentId(categories, parentId) {
  const parent = findCategoryById(categories, parentId)
  return sortCategoriesAlphabetically(
    (parent?.children ?? []).filter((child) => child.isActive),
  )
}

export function inferMetadataTemplateType(parentSlug) {
  if (!parentSlug) return 'default'

  if (parentSlug.includes('electronic') || parentSlug.includes('phone') || parentSlug.includes('computer')) {
    return 'electronics'
  }

  if (parentSlug.includes('fashion') || parentSlug.includes('cloth') || parentSlug.includes('wear')) {
    return 'fashion'
  }

  if (
    parentSlug.includes('home')
    || parentSlug.includes('furniture')
    || parentSlug.includes('kitchen')
    || parentSlug.includes('living')
  ) {
    return 'home'
  }

  return 'default'
}
