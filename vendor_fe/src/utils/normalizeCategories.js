import { unwrapApiEnvelope } from './parseApiError'

export function normalizeCategoryRecord(record) {
  if (!record || typeof record !== 'object') return null

  return {
    id: record.id,
    slug: record.slug,
    name: record.category_name ?? record.name ?? '',
    parentId: record.parent_id ?? null,
    nestedLevel: record.nested_level ?? 0,
    isActive: record.is_active ?? true,
    isFeatured: record.is_featured ?? false,
    children: (record.children ?? [])
      .map(normalizeCategoryRecord)
      .filter(Boolean),
  }
}

export function extractCategoryList(body) {
  const envelope = unwrapApiEnvelope(body)
  const list = Array.isArray(envelope?.data) ? envelope.data : []

  return list
    .map(normalizeCategoryRecord)
    .filter((category) => category && category.isActive && category.slug && category.name)
}

export function toSelectOptions(categories) {
  return categories.map((category) => ({
    value: category.slug,
    label: category.name,
  }))
}

export function findCategoryBySlug(categories, slug) {
  if (!slug) return null
  return categories.find((category) => category.slug === slug) ?? null
}

export function getSubcategoriesForParent(categories, parentSlug) {
  const parent = findCategoryBySlug(categories, parentSlug)
  return (parent?.children ?? []).filter((child) => child.isActive)
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
