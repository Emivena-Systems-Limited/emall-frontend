import { getSubcategoriesForParent } from './normalizeCategories'
import { getSubcategoryFallbacksForParent } from '../constants/categorySubcategoryFallbacks'
import { resolveSubcategoryImage } from './resolveCategoryImage'
import { getDepartmentAccent, resolveCategoryLayout, resolveGridColumns } from '../constants/categoryPageLayouts'

function resolveDepartmentChildren(parentSlug, categoryTree = []) {
  const apiChildren = getSubcategoriesForParent(categoryTree, parentSlug)
  if (apiChildren.length) return apiChildren

  return getSubcategoryFallbacksForParent(parentSlug)
}

export function buildSubcategoryDisplay(parentSlug, child) {
  const slug = child.slug ?? child.id

  return {
    id: child.id ?? slug,
    slug,
    label: child.name ?? child.label ?? slug.replace(/-/g, ' '),
    href: `/categories/${parentSlug}/${slug}`,
    image: resolveSubcategoryImage(child, parentSlug),
    productCount: child.productCount ?? 0,
  }
}

export function buildCategoryDepartment(parentCategory, categoryTree = [], index = 0) {
  if (!parentCategory?.slug) return null

  const children = resolveDepartmentChildren(parentCategory.slug, categoryTree)

  return {
    id: parentCategory.id ?? parentCategory.slug,
    parentSlug: parentCategory.slug,
    title: parentCategory.name ?? parentCategory.label ?? parentCategory.slug,
    viewAllHref: `/categories/${parentCategory.slug}`,
    layout: resolveCategoryLayout(parentCategory.slug, index),
    gridColumns: resolveGridColumns(parentCategory.slug),
    accent: getDepartmentAccent(index),
    subcategories: children.map((child) =>
      buildSubcategoryDisplay(parentCategory.slug, child),
    ),
  }
}

function getCategorySlug(category = {}) {
  return category.slug ?? category.parentSlug ?? ''
}

/** Keep Fashion immediately after Electronics; preserve API order for everything else. */
export function sortParentCategoriesForDisplay(categories = []) {
  const fashionIndex = categories.findIndex((category) => getCategorySlug(category) === 'fashion')
  const electronicsIndex = categories.findIndex((category) => getCategorySlug(category) === 'electronics')

  if (fashionIndex === -1 || electronicsIndex === -1 || fashionIndex === electronicsIndex + 1) {
    return categories
  }

  const fashion = categories[fashionIndex]
  const reordered = categories.filter((_, index) => index !== fashionIndex)
  const electronicsPos = reordered.findIndex((category) => getCategorySlug(category) === 'electronics')

  reordered.splice(electronicsPos + 1, 0, fashion)
  return reordered
}

export function buildAllCategoryDepartments(parentCategories = [], categoryTree = []) {
  return sortParentCategoriesForDisplay(parentCategories)
    .map((parent, index) => buildCategoryDepartment(parent, categoryTree, index))
    .filter(Boolean)
}

// Legacy helper kept for static fallbacks in promos / spotlights.
function findStaticMatch(staticSubcategories = [], slug, index) {
  if (!staticSubcategories.length) return null
  return staticSubcategories.find((item) => item.slug === slug)
    ?? staticSubcategories[index % staticSubcategories.length]
}

export function buildDepartmentSubcategories(department, categoryTree = []) {
  if (!department) return []

  const apiChildren = getSubcategoriesForParent(categoryTree, department.parentSlug)
  const source = apiChildren.length
    ? apiChildren
    : (department.subcategories?.length
      ? department.subcategories
      : getSubcategoryFallbacksForParent(department.parentSlug))

  return source.map((item, index) => {
    const slug = item.slug ?? item.id
    const staticMatch = findStaticMatch(department.subcategories, slug, index)

    return {
      id: item.id ?? slug,
      slug,
      label: item.name ?? item.label ?? staticMatch?.label ?? slug.replace(/-/g, ' '),
      href: `/categories/${department.parentSlug}/${slug}`,
      image: resolveSubcategoryImage(
        { ...item, image: item.image ?? staticMatch?.image },
        department.parentSlug,
      ),
      productCount: staticMatch?.productCount ?? item.productCount ?? 0,
    }
  })
}
