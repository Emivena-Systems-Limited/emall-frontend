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
  'baby-and-maternity': 'baby-maternity',
  baby_maternity: 'baby-maternity',
  'bags-and-luggage': 'bags-luggage',
  bags_luggage: 'bags-luggage',
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

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function toBoolean(value, fallback = false) {
  if (value == null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const text = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'active'].includes(text)) return true
  if (['0', 'false', 'no', 'inactive'].includes(text)) return false
  return fallback
}

export function extractCategoryImages(record) {
  const images = record?.images
  let imageUrl = ''
  let thumbnailUrl = ''

  if (Array.isArray(images)) {
    for (const item of images) {
      if (typeof item === 'string') {
        imageUrl = imageUrl || firstText(item)
        continue
      }
      if (!item || typeof item !== 'object') continue
      imageUrl = imageUrl || firstText(item.image_url, item.imageUrl, item.url)
      thumbnailUrl = thumbnailUrl || firstText(
        item.thumbnail_image_url,
        item.thumbnailImageUrl,
        item.thumbnail,
      )
    }
  } else if (images && typeof images === 'object') {
    imageUrl = firstText(images.image_url, images.imageUrl)
    thumbnailUrl = firstText(images.thumbnail_image_url, images.thumbnailImageUrl)
  }

  imageUrl = imageUrl || firstText(record?.image_url, record?.imageUrl, record?.image, record?.icon)
  thumbnailUrl = thumbnailUrl || firstText(
    record?.thumbnail_image_url,
    record?.thumbnailImageUrl,
    record?.thumbnail,
  )

  return {
    image: imageUrl || null,
    thumbnail: thumbnailUrl || null,
  }
}

export function normalizeCategoryRecord(record) {
  if (!record || typeof record !== 'object') return null

  const { image, thumbnail } = extractCategoryImages(record)

  return {
    id: record.id,
    slug: record.slug,
    name: record.category_name ?? record.name ?? '',
    parentId: record.parent_id ?? null,
    nestedLevel: record.nested_level ?? 0,
    isActive: record.is_active ?? true,
    isFeatured: toBoolean(record.is_featured, false),
    image,
    thumbnail,
    children: (record.children ?? [])
      .map(normalizeCategoryRecord)
      .filter((child) => child && child.isActive),
  }
}

export function mergeParentsWithTree(parents = [], tree = []) {
  if (!parents.length) return tree

  const byId = new Map()
  const bySlug = new Map()

  for (const node of tree) {
    if (node?.id) byId.set(node.id, node)
    if (node?.slug) bySlug.set(normalizeCategorySlug(node.slug), node)
  }

  const seen = new Set()
  const merged = parents.map((parent) => {
    const match = (parent.id && byId.get(parent.id))
      || bySlug.get(normalizeCategorySlug(parent.slug))

    if (!match) return parent

    seen.add(match.id)

    return {
      ...parent,
      name: match.name || parent.name,
      image: match.image || parent.image,
      thumbnail: match.thumbnail || parent.thumbnail,
      isFeatured: match.isFeatured ?? parent.isFeatured,
      children: match.children?.length ? match.children : (parent.children ?? []),
    }
  })

  for (const node of tree) {
    if (node?.id && !seen.has(node.id)) merged.push(node)
  }

  return merged
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
