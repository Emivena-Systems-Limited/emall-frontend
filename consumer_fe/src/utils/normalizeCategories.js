function unwrapApiEnvelope(body) {
  if (!body || typeof body !== 'object') return body

  if ('in_error' in body || 'status_code' in body || 'errors' in body) return body

  if (body.data && typeof body.data === 'object') {
    const inner = body.data
    if ('in_error' in inner || 'status_code' in inner || 'errors' in inner) return inner
  }

  return body
}

export const CATEGORY_SLUG_ALIASES = {
  'phones-and-accessories': 'mobile-phones-accessories',
  phones_and_accessories: 'mobile-phones-accessories',
  'phones-accessories': 'mobile-phones-accessories',
  'mobile-phones': 'mobile-phones-accessories',
  smartphones: 'mobile-phones-accessories',
  'phones-and-tablets': 'phones-tablets',
  'phone-tablets': 'phones-tablets',
  'phone-tablet': 'phones-tablets',
  'home-and-kitchen': 'home-kitchen',
  home_and_kitchen: 'home-kitchen',
  home_kitchen: 'home-kitchen',
  'construction-and-tools': 'construction-tools',
  'construction-and-tools-equipment': 'construction-tools',
  'computer-laptop': 'computing',
  computers: 'computing',
  'baby-and-maternity': 'baby-and-maternity',
  baby_maternity: 'baby-and-maternity',
  'bags-and-luggage': 'bags-and-luggage',
  bags_luggage: 'bags-and-luggage',
}

export function normalizeCategorySlug(slug = '') {
  const normalized = String(slug).toLowerCase().trim().replace(/_/g, '-')
  return CATEGORY_SLUG_ALIASES[normalized] ?? normalized
}

function slugsMatch(categorySlug, searchSlug) {
  return normalizeCategorySlug(categorySlug) === normalizeCategorySlug(searchSlug)
}

export function formatCategorySlugLabel(slug = '') {
  const label = normalizeCategorySlug(slug).replace(/-/g, ' ')
  return label ? label.replace(/\b\w/g, (char) => char.toUpperCase()) : ''
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
    if (slugsMatch(category.slug, slug)) return category

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
