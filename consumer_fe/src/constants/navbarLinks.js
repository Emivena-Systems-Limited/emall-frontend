const POPULAR_CATEGORY_LIMIT = 7
const EXCLUDED_CATEGORY_SLUGS = new Set(['underwear-sleepwear'])
const CATEGORY_SLUG_REPLACEMENTS = {
  'bags-luggage': 'computer-office',
}

export const navbarPinnedLinks = [
  {
    id: 'deals',
    label: 'Deals',
    href: '/promotions?filter=todays-deals',
    tone: 'deals',
  },
  {
    id: 'promotions',
    label: 'Promotions',
    href: '/promotions',
    tone: 'promotions',
  },
  {
    id: 'vendors',
    label: 'Vendors',
    href: '/stores',
  },
]

export function buildNavbarCategoryLinks(menuItems = []) {
  const categories = menuItems.filter((item) => item?.href && item?.label)
  const popular = categories.filter((item) => item.isFeatured)
  const source = popular.length ? popular : categories
  const bySlug = new Map(categories.map((item) => [item.id, item]))
  const selected = []
  const used = new Set()

  for (const item of source.slice(0, POPULAR_CATEGORY_LIMIT)) {
    if (EXCLUDED_CATEGORY_SLUGS.has(item.id)) continue

    const replacementSlug = CATEGORY_SLUG_REPLACEMENTS[item.id]
    const next = replacementSlug ? bySlug.get(replacementSlug) : item
    if (!next || used.has(next.id)) continue

    used.add(next.id)
    selected.push({
      id: next.id,
      label: next.label,
      href: next.href,
    })
  }

  return selected
}
