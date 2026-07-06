function unwrapApiEnvelope(body) {
  if (!body || typeof body !== 'object') return body

  if ('in_error' in body || 'status_code' in body || 'errors' in body) return body

  if (body.data && typeof body.data === 'object') {
    const inner = body.data
    if ('in_error' in inner || 'status_code' in inner || 'errors' in inner) return inner
  }

  return body
}

export function normalizeCategoryRecord(record) {
  if (!record || typeof record !== 'object') return null

  return {
    id: record.id,
    slug: record.slug,
    name: record.category_name ?? record.name ?? '',
    parentId: record.parent_id ?? null,
    nestedLevel: record.nested_level ?? 0,
    isActive: record.is_active ?? true,
    image: record.image ?? record.image_url ?? record.icon ?? record.thumbnail ?? null,
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

export function findCategoryBySlug(categories, slug) {
  if (!slug) return null

  for (const category of categories) {
    if (category.slug === slug) return category

    const nestedMatch = findCategoryBySlug(category.children ?? [], slug)
    if (nestedMatch) return nestedMatch
  }

  return null
}

export function findCategoryById(categories, id) {
  if (!id) return null

  for (const category of categories) {
    if (category.id === id) return category

    const nestedMatch = findCategoryById(category.children ?? [], id)
    if (nestedMatch) return nestedMatch
  }

  return null
}

export function getSubcategoriesForParent(categories, parentSlug) {
  const parent = findCategoryBySlug(categories, parentSlug)
  return (parent?.children ?? []).filter((child) => child.isActive)
}
