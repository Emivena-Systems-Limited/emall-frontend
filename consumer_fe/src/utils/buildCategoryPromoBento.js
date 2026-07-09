import { sortParentCategoriesForDisplay } from './buildCategoryDepartments'
import { resolveParentCategoryImage } from './resolveCategoryImage'

function orderCategoriesForPage(parentCategories = [], deprioritizeSlugs = []) {
  const sorted = sortParentCategoriesForDisplay(parentCategories)
  const deprioritizeSet = new Set(deprioritizeSlugs)
  const prioritized = sorted.filter((category) => !deprioritizeSet.has(category.slug))
  const deprioritized = sorted.filter((category) => deprioritizeSet.has(category.slug))

  return [...prioritized, ...deprioritized]
}

function toFeaturedPromo(category) {
  return {
    id: category.slug,
    title: category.name,
    description: `Explore ${category.name} and discover products curated for your lifestyle.`,
    href: `/categories/${category.slug}`,
    cta: 'Shop Now',
    image: resolveParentCategoryImage(category),
  }
}

function toTilePromo(category) {
  return {
    id: category.slug,
    title: category.name,
    href: `/categories/${category.slug}`,
    image: resolveParentCategoryImage(category),
  }
}

export function buildCategoryPromoBento(
  parentCategories = [],
  { skip = 2, count = 5, deprioritizeSlugs = ['fashion'] } = {},
) {
  const ordered = orderCategoriesForPage(parentCategories, deprioritizeSlugs)
  const selected = ordered.slice(skip, skip + count)

  if (!selected.length) return null

  const [featuredCategory, ...tileCategories] = selected

  return {
    featured: toFeaturedPromo(featuredCategory),
    tiles: tileCategories.map(toTilePromo),
  }
}
