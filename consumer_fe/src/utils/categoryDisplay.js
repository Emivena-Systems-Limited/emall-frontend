import { topCategories } from '../constants/topCategories'
import { categoryMenuItems } from '../constants/categoriesMenu'
import { resolveParentCategoryImage, resolveSubcategoryImage } from './resolveCategoryImage'

export function getCategoryImage(category, index = 0) {
  if (category?.image) return category.image

  const localMatch = topCategories.find(
    (item) => item.href === `/categories/${category.slug}`,
  )
  if (localMatch?.image) return localMatch.image

  return resolveParentCategoryImage(category)
    ?? topCategories[index % topCategories.length]?.image
    ?? null
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
