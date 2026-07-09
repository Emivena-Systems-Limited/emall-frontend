import {
  CATEGORY_IMAGES,
  CATEGORY_IMAGE_KEYWORD_RULES,
  PARENT_DEFAULT_IMAGES,
  SLUG_IMAGE_MAP,
} from '../constants/categoryImageLibrary'
import { getLocalCategoryImage } from './categoryLocalAssets'

const PARENT_SLUG_ALIASES = {
  'construction-and-tools': 'construction-tools',
  'construction-and-tools-equipment': 'construction-tools',
  'phones-and-tablets': 'phones-tablets',
  'phone-tablets': 'phones-tablets',
  'phone-tablet': 'phones-tablets',
  'computer-laptop': 'computing',
  computers: 'computing',
  'baby-and-maternity': 'baby-maternity',
  baby_maternity: 'baby-maternity',
  'baby-maternity': 'baby-maternity',
  'bags-and-luggage': 'bags-luggage',
  bags_luggage: 'bags-luggage',
  'bags-luggage': 'bags-luggage',
  'beauty-personal-care': 'beauty-health',
  'beauty-health': 'beauty-health',
  'mobile-phones-accessories': 'mobile-phones-accessories',
  'phones-accessories': 'mobile-phones-accessories',
}

function resolveParentSlug(parentSlug = '') {
  const normalized = normalizeSlug(parentSlug)
  return PARENT_SLUG_ALIASES[normalized] ?? normalized
}

function isUsableImageUrl(url) {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  return trimmed.length > 4 && /^https?:\/\//i.test(trimmed)
}

function normalizeToken(value = '') {
  return String(value).toLowerCase().trim().replace(/&/g, 'and')
}

function normalizeSlug(slug = '') {
  return normalizeToken(slug).replace(/\s+/g, '-')
}

function buildSearchText(slug = '', label = '') {
  const normalizedSlug = normalizeSlug(slug).replace(/-/g, ' ')
  return `${normalizedSlug} ${normalizeToken(label)}`.trim()
}

function matchKeywordRules(searchText) {
  for (const rule of CATEGORY_IMAGE_KEYWORD_RULES) {
    if (rule.pattern.test(searchText)) return rule.image
  }
  return null
}

/**
 * Resolve a thematic placeholder image for a category or subcategory.
 * API-provided images always take precedence when passed in by callers.
 */
export function resolveCategoryImage({
  slug = '',
  label = '',
  parentSlug = '',
} = {}) {
  const normalizedSlug = normalizeSlug(slug)
  const normalizedParent = resolveParentSlug(parentSlug)
  const searchText = buildSearchText(normalizedSlug, label)

  const localAsset = getLocalCategoryImage(normalizedSlug, normalizedParent)
  if (localAsset) return localAsset

  if (normalizedSlug && SLUG_IMAGE_MAP[normalizedSlug]) {
    return SLUG_IMAGE_MAP[normalizedSlug]
  }

  const compositeKey = normalizedParent && normalizedSlug
    ? `${normalizedParent}/${normalizedSlug}`
    : ''
  if (compositeKey && SLUG_IMAGE_MAP[compositeKey]) {
    return SLUG_IMAGE_MAP[compositeKey]
  }

  const keywordMatch = matchKeywordRules(searchText)
  if (keywordMatch) return keywordMatch

  if (normalizedParent && PARENT_DEFAULT_IMAGES[normalizedParent]) {
    return PARENT_DEFAULT_IMAGES[normalizedParent]
  }

  return CATEGORY_IMAGES.generic
}

export function resolveParentCategoryImage(category = {}) {
  const local = getLocalCategoryImage(category.slug)
  if (local) return local

  if (isUsableImageUrl(category?.image)) return category.image.trim()

  return resolveCategoryImage({
    slug: category.slug,
    label: category.name ?? category.label,
  })
}

export function resolveSubcategoryImage(subcategory = {}, parentSlug = '') {
  const slug = subcategory.slug ?? subcategory.id
  const local = getLocalCategoryImage(slug, parentSlug)
  if (local) return local

  if (isUsableImageUrl(subcategory?.image)) return subcategory.image.trim()

  return resolveCategoryImage({
    slug,
    label: subcategory.name ?? subcategory.label,
    parentSlug,
  })
}

// Backward-compatible export for any legacy index-based callers.
export function getSubcategoryPlaceholderImage(_index = 0, context = {}) {
  return resolveCategoryImage(context)
}
