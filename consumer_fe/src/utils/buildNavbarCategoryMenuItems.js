import { getSubcategoryFallbacksForParent } from '../constants/categorySubcategoryFallbacks'
import { sortParentCategoriesForDisplay } from './buildCategoryDepartments'
import { getCategoryImage } from './categoryDisplay'
import { buildCategoryListingHref } from './listingFilterParams'
import { getSubcategoriesForParent } from './normalizeCategories'

function buildSubcategoryLinks(parentSlug, children = []) {
  const subcategories = [
    { id: 'all', label: 'All', href: buildCategoryListingHref(parentSlug) },
    ...children.map((child) => {
      const slug = child.slug ?? child.id
      return {
        id: slug,
        label: child.name ?? child.label ?? slug.replace(/-/g, ' '),
        href: buildCategoryListingHref(parentSlug, slug),
      }
    }),
  ]

  return subcategories
}

export function buildNavbarCategoryMenuItems(parentCategories = []) {
  if (!parentCategories.length) return []

  return sortParentCategoriesForDisplay(parentCategories).map((parent) => {
    const slug = parent.slug
    let children = getSubcategoriesForParent(parentCategories, slug)

    if (!children.length) {
      children = getSubcategoryFallbacksForParent(slug).map((item) => ({
        slug: item.slug,
        name: item.name,
      }))
    }

    return {
      id: slug,
      label: parent.name,
      href: buildCategoryListingHref(slug),
      image: getCategoryImage(parent),
      subcategories: buildSubcategoryLinks(slug, children),
      featuredTitle: `FEATURED ${(parent.name ?? slug).toUpperCase()}`,
      featured: [],
      promo: null,
    }
  })
}
