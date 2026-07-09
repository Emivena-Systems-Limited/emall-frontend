import { topCategories } from '../constants/topCategories'
import { categoryMenuItems } from '../constants/categoriesMenu'
import {
  DEFAULT_TOP_CATEGORY_ICON,
  getTopCategoryIcon,
  isUsableCategoryThumbnail,
} from './topCategoryIcons'
import { resolveSubcategoryImage } from './resolveCategoryImage'

export function formatProductCount(count) {
  if (!count || count <= 0) return null

  if (count >= 1000) {
    const thousands = count / 1000
    const formatted = Number.isInteger(thousands)
      ? String(thousands)
      : thousands.toFixed(1).replace(/\.0$/, '')
    return `${formatted}k`
  }

  return count.toLocaleString('en-US')
}

/**
 * Resolve the circular thumbnail for homepage Top Categories.
 * API thumbnails take precedence; otherwise use backgroundless category icons.
 */
export function getCategoryImage(category, index = 0) {
  const apiThumbnail =
    category?.image ?? category?.image_url ?? category?.icon ?? category?.thumbnail

  if (isUsableCategoryThumbnail(apiThumbnail)) {
    return apiThumbnail.trim()
  }

  const topIcon = getTopCategoryIcon(category?.slug)
  if (topIcon) return topIcon

  const localMatch = topCategories.find(
    (item) => item.href === `/categories/${category.slug}`,
  )
  if (localMatch?.image) return localMatch.image

  return topCategories[index % topCategories.length]?.image ?? DEFAULT_TOP_CATEGORY_ICON
}

export function mapApiCategory(category, index) {
  return {
    id: category.id ?? category.slug,
    slug: category.slug,
    label: category.name,
    href: `/categories/${category.slug}`,
    image: getCategoryImage(category, index),
  }
}

export function mapSubcategoryForDisplay(subcategory, parentSlug) {
  return {
    id: subcategory.id ?? subcategory.slug,
    slug: subcategory.slug,
    label: subcategory.name,
    href: `/categories/${parentSlug}/${subcategory.slug}`,
    image: resolveSubcategoryImage(subcategory, parentSlug),
  }
}

export function getStaticSubcategoriesForSlug(slug) {
  const menuCategory = categoryMenuItems.find((item) => item.href === `/categories/${slug}`)
  if (!menuCategory) return []

  return menuCategory.subcategories
    .filter((sub) => sub.id !== 'all')
    .map((sub) => ({
      id: sub.id,
      slug: sub.href.split('/').pop(),
      name: sub.label,
    }))
}

export function resolveCategoryBySlug(categories, slug) {
  if (!slug || !categories.length) return null
  return categories.find((category) => category.slug === slug) ?? null
}
