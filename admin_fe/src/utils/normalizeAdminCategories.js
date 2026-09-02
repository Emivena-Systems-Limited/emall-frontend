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

function cleanCategoryName(raw) {
  const text = String(raw ?? '').trim().replace(/\s+/g, ' ')
  if (!text) return ''
  if (text !== text.toLowerCase()) return text
  return text.replace(/\b([a-z])/g, (match) => match.toUpperCase())
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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

function childList(record) {
  if (Array.isArray(record?.children)) return record.children
  if (Array.isArray(record?.subcategories)) return record.subcategories
  if (Array.isArray(record?.sub_categories)) return record.sub_categories
  return []
}

function pickImageUrl(source) {
  if (!isRecord(source)) return ''
  return firstText(
    source.image_url,
    source.imageUrl,
    source.cover,
    source.url,
    source.path,
  )
}

function pickThumbnailUrl(source) {
  if (!isRecord(source)) return ''
  return firstText(
    source.thumbnail_image_url,
    source.thumbnailImageUrl,
    source.thumbnail_url,
    source.thumbnail,
    source.thumb,
  )
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
      if (!isRecord(item)) continue
      const key = firstText(item.key, item.type, item.kind, item.name).toLowerCase()
      const url = firstText(item.image_url, item.thumbnail_image_url, item.url, item.path)
      if (key.includes('thumb')) thumbnailUrl = thumbnailUrl || url
      else if (key.includes('image') || key.includes('cover')) imageUrl = imageUrl || url
      else {
        imageUrl = imageUrl || pickImageUrl(item)
        thumbnailUrl = thumbnailUrl || pickThumbnailUrl(item)
      }
    }
  } else if (isRecord(images)) {
    imageUrl = pickImageUrl(images)
    thumbnailUrl = pickThumbnailUrl(images)
  }

  imageUrl = imageUrl || firstText(record?.image_url, record?.imageUrl, record?.image, record?.icon)
  thumbnailUrl = thumbnailUrl || firstText(record?.thumbnail_image_url, record?.thumbnailImageUrl, record?.thumbnail)

  return {
    imageUrl: imageUrl || null,
    thumbnailUrl: thumbnailUrl || null,
  }
}

export function getCategoryDisplayImage(category, nested = false) {
  if (nested) return category?.thumbnailUrl || category?.imageUrl || null
  return category?.imageUrl || category?.thumbnailUrl || null
}

export function normalizeCategoryRecord(record, parentId = null, nestedLevel = 0) {
  if (!isRecord(record)) return null

  const id = firstText(record.id, record.category_id, record.uuid)
  const name = cleanCategoryName(firstText(record.category_name, record.name, record.title, record.label))
  const slug = firstText(record.slug, record.category_slug)

  if (!id || (!name && !slug)) return null

  const inferredParentId = record.parent_id == null || record.parent_id === ''
    ? parentId
    : String(record.parent_id)
  const inferredLevel = record.nested_level != null || record.level != null
    ? toNumber(record.nested_level ?? record.level, nestedLevel)
    : nestedLevel
  const { imageUrl, thumbnailUrl } = extractCategoryImages(record)

  return {
    id,
    slug,
    name: name || slug,
    parentId: inferredParentId,
    nestedLevel: inferredLevel,
    isActive: toBoolean(record.is_active ?? record.active, true),
    isFeatured: toBoolean(record.is_featured ?? record.featured, false),
    imageUrl,
    thumbnailUrl,
    image: thumbnailUrl || imageUrl,
    productCount: record.products_count == null && record.product_count == null
      ? null
      : toNumber(record.products_count ?? record.product_count),
    children: childList(record)
      .map((child) => normalizeCategoryRecord(child, id, inferredLevel + 1))
      .filter(Boolean),
  }
}

export function extractCategoryList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  let list = []
  if (Array.isArray(payload)) list = payload
  else if (Array.isArray(payload?.data)) list = payload.data
  else if (Array.isArray(payload?.categories)) list = payload.categories
  else if (Array.isArray(payload?.parents)) list = payload.parents
  else if (isRecord(payload)) {
    const values = Object.values(payload)
    if (values.length > 0 && values.every((item) => isRecord(item) && (item.id || item.category_name || item.name))) {
      list = values
    }
  }

  return list.map((item) => normalizeCategoryRecord(item)).filter(Boolean)
}

export function flattenCategories(categories, depth = 0, parent = null) {
  const rows = []

  for (const category of categories ?? []) {
    rows.push({
      ...category,
      depth,
      parentId: category.parentId ?? parent?.id ?? null,
      parentName: parent?.name ?? '',
    })
    if (category.children?.length) {
      rows.push(...flattenCategories(category.children, depth + 1, category))
    }
  }

  return rows
}

export function countCategoryTree(categories) {
  const rows = flattenCategories(categories)
  const parents = rows.filter((item) => item.depth === 0).length
  const children = rows.length - parents

  return {
    total: rows.length,
    parents,
    children,
    active: rows.filter((item) => item.isActive).length,
    inactive: rows.filter((item) => !item.isActive).length,
  }
}

export function categoryMatchesQuery(category, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true

  return [category.name, category.parentName]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export function filterCategoryTree(categories, query) {
  const needle = String(query ?? '').trim()
  if (!needle) return categories ?? []

  return (categories ?? []).reduce((acc, category) => {
    const children = filterCategoryTree(category.children, needle)
    if (categoryMatchesQuery(category, needle) || children.length > 0) {
      acc.push({ ...category, children })
    }
    return acc
  }, [])
}

export function findCategoryById(categories, id) {
  if (id == null || id === '') return null
  const target = String(id)

  for (const category of categories ?? []) {
    if (String(category.id) === target) return category
    const nested = findCategoryById(category.children, id)
    if (nested) return nested
  }

  return null
}

export function countNestedCategories(category) {
  return flattenCategories(category?.children ?? []).length
}

export function getCategoryParentOptions(tree, categoryId) {
  const blocked = new Set()
  const current = findCategoryById(tree, categoryId)

  const block = (node) => {
    if (!node) return
    blocked.add(String(node.id))
    node.children?.forEach(block)
  }
  block(current)

  const options = [{ value: '', label: 'None · top-level department' }]

  const add = (nodes, depth) => {
    for (const category of nodes ?? []) {
      if (!blocked.has(String(category.id))) {
        options.push({
          value: String(category.id),
          label: `${depth ? `${'— '.repeat(depth)}` : ''}${category.name}`,
        })
      }
      add(category.children, depth + 1)
    }
  }

  add(tree, 0)
  return options
}

export function slugifyCategoryName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function collectExpandableIds(categories) {
  const ids = []

  for (const category of categories ?? []) {
    if (category.children?.length) {
      ids.push(category.id)
      ids.push(...collectExpandableIds(category.children))
    }
  }

  return ids
}
