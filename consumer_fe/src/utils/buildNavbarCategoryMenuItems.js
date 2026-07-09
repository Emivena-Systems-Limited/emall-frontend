import { getSubcategoryFallbacksForParent } from '../constants/categorySubcategoryFallbacks'
import { sortParentCategoriesForDisplay } from './buildCategoryDepartments'
import { getSubcategoriesForParent } from './normalizeCategories'

function buildSubcategoryLinks(parentSlug, children = []) {
  const subcategories = [
    { id: 'all', label: 'All', href: `/categories/${parentSlug}` },
    ...children.map((child) => {
      const slug = child.slug ?? child.id
      return {
        id: slug,
        label: child.name ?? child.label ?? slug.replace(/-/g, ' '),
        href: `/categories/${parentSlug}/${slug}`,
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
      href: `/categories/${slug}`,
      subcategories: buildSubcategoryLinks(slug, children),
      featuredTitle: `FEATURED ${(parent.name ?? slug).toUpperCase()}`,
      featured: [],
      promo: null,
    }
  })
}
