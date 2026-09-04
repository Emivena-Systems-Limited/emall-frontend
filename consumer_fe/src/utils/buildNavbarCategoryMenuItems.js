import { getCategoryImage } from './categoryDisplay'
import { sortParentCategoriesForDisplay } from './buildCategoryDepartments'
import { buildCategoryListingHref } from './listingFilterParams'
import { getSubcategoriesForParent } from './normalizeCategories'

function buildSubcategoryLinks(parentSlug, children = []) {
  return [
    { id: 'all', label: 'All', href: buildCategoryListingHref(parentSlug) },
    ...children.map((child) => {
      const slug = child.slug ?? child.id
      return {
        id: slug,
        label: child.name ?? child.label ?? slug.replace(/-/g, ' '),
        href: buildCategoryListingHref(parentSlug, slug),
        image: child.thumbnail || child.image || null,
      }
    }),
  ]
}

function resolveMenuChildren(parent, catalog) {
  if (parent.children?.length) {
    return parent.children.filter((child) => child.isActive !== false)
  }

  return getSubcategoriesForParent(catalog, parent.slug)
}

export function buildNavbarCategoryMenuItems(parentCategories = []) {
  if (!parentCategories.length) return []

  return sortParentCategoriesForDisplay(parentCategories).map((parent, index) => {
    const slug = parent.slug
    const children = resolveMenuChildren(parent, parentCategories)

    return {
      id: slug,
      label: parent.name,
      href: buildCategoryListingHref(slug),
      image: getCategoryImage(parent, index),
      subcategories: buildSubcategoryLinks(slug, children),
      featuredTitle: `FEATURED ${(parent.name ?? slug).toUpperCase()}`,
      featured: [],
      promo: null,
    }
  })
}
