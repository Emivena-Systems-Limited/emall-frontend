import { buildCategoryListingHref } from './listingFilterParams'
import { resolveParentCategoryImage, resolveSubcategoryImage } from './resolveCategoryImage'

function toSearchText(...values) {
  return values
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
}

export function buildCategoriesPageSearchIndex(parentCategories = []) {
  const entries = []

  for (const parent of parentCategories) {
    if (!parent?.slug) continue

    const title = parent.name ?? parent.label ?? parent.slug
    entries.push({
      id: `department-${parent.slug}`,
      type: 'department',
      slug: parent.slug,
      title,
      href: buildCategoryListingHref(parent.slug),
      image: resolveParentCategoryImage(parent),
      searchText: toSearchText(title, parent.slug),
    })

    for (const child of parent.children ?? []) {
      if (!child?.slug || child.isActive === false) continue

      const label = child.name ?? child.label ?? child.slug
      entries.push({
        id: `subcategory-${parent.slug}-${child.slug}`,
        type: 'subcategory',
        slug: child.slug,
        parentSlug: parent.slug,
        parentTitle: title,
        title: label,
        href: buildCategoryListingHref(parent.slug, child.slug),
        image: resolveSubcategoryImage(child, parent.slug),
        searchText: toSearchText(label, child.slug, title, parent.slug),
      })
    }
  }

  return entries
}

export function filterCategoriesPageSearch(index = [], query = '', limit = 12) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  const scored = []

  for (const entry of index) {
    const title = entry.title.toLowerCase()
    let score = -1
    if (title === needle) score = 0
    else if (title.startsWith(needle)) score = 1
    else if (entry.searchText.includes(needle)) score = 2
    if (score < 0) continue

    const typeRank = entry.type === 'department' ? 0 : 1
    scored.push({ entry, score, typeRank })
  }

  scored.sort((left, right) => (
    left.score - right.score
    || left.typeRank - right.typeRank
    || left.entry.title.localeCompare(right.entry.title)
  ))

  return scored.slice(0, limit).map((item) => item.entry)
}

export function scrollToCategoryDepartment(slug) {
  if (!slug) return false

  const section = document.getElementById(`department-${slug}`)
  if (!section) return false

  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}
