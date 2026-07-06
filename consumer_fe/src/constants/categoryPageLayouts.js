export const CATEGORY_LAYOUT_TYPES = {
  GRID: 'grid',
  CAROUSEL: 'carousel',
  BENTO: 'bento',
  PHONES_TABLETS: 'phones-tablets',
  MOSAIC: 'mosaic',
  STACKED: 'stacked',
  COMPACT: 'compact',
}

const SLUG_LAYOUT_MAP = {
  electronics: CATEGORY_LAYOUT_TYPES.GRID,
  fashion: CATEGORY_LAYOUT_TYPES.BENTO,
  'home-kitchen': CATEGORY_LAYOUT_TYPES.CAROUSEL,
  home: CATEGORY_LAYOUT_TYPES.CAROUSEL,
  'sports-outdoors': CATEGORY_LAYOUT_TYPES.CAROUSEL,
  'phones-accessories': CATEGORY_LAYOUT_TYPES.PHONES_TABLETS,
  agriculture: CATEGORY_LAYOUT_TYPES.MOSAIC,
  'phones-tablets': CATEGORY_LAYOUT_TYPES.PHONES_TABLETS,
  phones: CATEGORY_LAYOUT_TYPES.PHONES_TABLETS,
  smartphone: CATEGORY_LAYOUT_TYPES.PHONES_TABLETS,
  computing: CATEGORY_LAYOUT_TYPES.MOSAIC,
  appliances: CATEGORY_LAYOUT_TYPES.GRID,
  automotive: CATEGORY_LAYOUT_TYPES.MOSAIC,
  services: CATEGORY_LAYOUT_TYPES.COMPACT,
  'industrial-commercial-equipment': CATEGORY_LAYOUT_TYPES.STACKED,
  'industrial-commercial': CATEGORY_LAYOUT_TYPES.STACKED,
  'construction-tools': CATEGORY_LAYOUT_TYPES.MOSAIC,
  construction: CATEGORY_LAYOUT_TYPES.MOSAIC,
  groceries: CATEGORY_LAYOUT_TYPES.COMPACT,
  'beauty-personal-care': CATEGORY_LAYOUT_TYPES.CAROUSEL,
  'toys-games': CATEGORY_LAYOUT_TYPES.MOSAIC,
  'home-office': CATEGORY_LAYOUT_TYPES.GRID,
  'books-stationery': CATEGORY_LAYOUT_TYPES.GRID,
  'books-and-stationery': CATEGORY_LAYOUT_TYPES.GRID,
}

const SLUG_GRID_COLUMNS = {
  'books-stationery': 3,
  'books-and-stationery': 3,
  books: 3,
  stationery: 3,
}

const LAYOUT_ROTATION = [
  CATEGORY_LAYOUT_TYPES.CAROUSEL,
  CATEGORY_LAYOUT_TYPES.MOSAIC,
  CATEGORY_LAYOUT_TYPES.STACKED,
  CATEGORY_LAYOUT_TYPES.COMPACT,
  CATEGORY_LAYOUT_TYPES.GRID,
]

const SLUG_ALIASES = {
  'health-fitness': 'sports-outdoors',
  'health-and-fitness': 'sports-outdoors',
  'phone-tablet': 'phones-tablets',
  'phones-and-tablets': 'phones-tablets',
}

export function normalizeCategorySlug(slug = '') {
  return slug.toLowerCase().trim()
}

export function resolveCategoryLayout(slug, index = 0) {
  const normalized = normalizeCategorySlug(slug)
  const aliased = SLUG_ALIASES[normalized] ?? normalized

  const direct = SLUG_LAYOUT_MAP[aliased] ?? SLUG_LAYOUT_MAP[normalized]
  if (direct) return direct

  if (/phone|tablet|mobile/.test(normalized)) return CATEGORY_LAYOUT_TYPES.PHONES_TABLETS
  if (/sport|fitness|outdoor|athletic/.test(normalized)) return CATEGORY_LAYOUT_TYPES.CAROUSEL
  if (/automotive|vehicle|motor/.test(normalized)) return CATEGORY_LAYOUT_TYPES.MOSAIC
  if (/grocer|food|beverage/.test(normalized)) return CATEGORY_LAYOUT_TYPES.COMPACT
  if (/service/.test(normalized)) return CATEGORY_LAYOUT_TYPES.COMPACT
  if (/industrial|commercial|equipment/.test(normalized)) return CATEGORY_LAYOUT_TYPES.STACKED
  if (/construct|tool|hardware/.test(normalized)) return CATEGORY_LAYOUT_TYPES.MOSAIC
  if (/fashion|apparel|cloth/.test(normalized)) return CATEGORY_LAYOUT_TYPES.BENTO
  if (/book|stationery/.test(normalized)) return CATEGORY_LAYOUT_TYPES.GRID
  if (/electronic|comput/.test(normalized)) return CATEGORY_LAYOUT_TYPES.GRID
  if (/home|kitchen|furniture/.test(normalized)) return CATEGORY_LAYOUT_TYPES.CAROUSEL

  return LAYOUT_ROTATION[index % LAYOUT_ROTATION.length]
}

export function resolveGridColumns(slug = '') {
  const normalized = normalizeCategorySlug(slug)

  if (SLUG_GRID_COLUMNS[normalized]) return SLUG_GRID_COLUMNS[normalized]
  if (/books?.*stationery|stationery.*books?/.test(normalized)) return 3

  return 4
}

export function getDepartmentAccent(index = 0) {
  const accents = [
    { gradient: 'from-auth-primary/8 to-transparent', ring: 'ring-auth-primary/15', badge: 'bg-auth-primary/10 text-auth-primary' },
    { gradient: 'from-slate-200/80 to-transparent', ring: 'ring-slate-200', badge: 'bg-slate-100 text-slate-700' },
    { gradient: 'from-amber-100/60 to-transparent', ring: 'ring-amber-200/80', badge: 'bg-amber-50 text-amber-800' },
    { gradient: 'from-sky-100/60 to-transparent', ring: 'ring-sky-200/80', badge: 'bg-sky-50 text-sky-800' },
    { gradient: 'from-emerald-100/50 to-transparent', ring: 'ring-emerald-200/70', badge: 'bg-emerald-50 text-emerald-800' },
  ]

  return accents[index % accents.length]
}
