/**
 * Local category image registry — real photo assets keyed by API slug.
 * Photos live in src/assets/images/categories/catalog/ as .jpg or .png
 * Regenerate stock product photos: npm run generate:category-assets
 */
import homeKitchenBanner from '../assets/images/categories/home_and_kitchen.png'
import phonesAccessoriesBanner from '../assets/images/categories/phones_and_accesories.png'
import mensSportsShoesLegacy from '../assets/images/categories/men_sports_outdoor_shoes.jpg'
import homeDecor from '../assets/images/categories/home_decor.jpg'
import kitchenUtensils from '../assets/images/categories/kitchen_utensils.jpg'
import bedding from '../assets/images/categories/bedding.jpg'
import kitchenStorage from '../assets/images/categories/kitchen_storage.jpg'

const catalogJpgs = import.meta.glob('../assets/images/categories/catalog/*.jpg', {
  eager: true,
  import: 'default',
})

const catalogPngs = import.meta.glob('../assets/images/categories/catalog/*.png', {
  eager: true,
  import: 'default',
})

/** High-quality legacy photos — take priority over catalog downloads */
const CATEGORY_PHOTO_OVERRIDES = {
  'home-kitchen-home-decor': homeDecor,
  'home-kitchen-kitchen-utensils': kitchenUtensils,
  'home-kitchen-bedding': bedding,
  'home-kitchen-kitchen-storage-organization': kitchenStorage,
  'kitchen-utensils': kitchenUtensils,
  'home-decor': homeDecor,
  bedding,
  'kitchen-storage': kitchenStorage,
}

/** Spotlight / legacy banner photos (not in catalog folder) */
export const CATEGORY_BANNER_ASSETS = {
  'home-kitchen-banner': homeKitchenBanner,
  'mobile-phones-accessories-banner': phonesAccessoriesBanner,
  'sports-outdoors-mens-sports-outdoor-shoes-legacy': mensSportsShoesLegacy,
}

/** Legacy slug aliases → canonical API slug for asset lookup */
const SLUG_ALIASES = {
  'beauty-personal-care': 'beauty-health',
  'baby-and-maternity': 'baby-maternity',
  'bags-and-luggage': 'bags-luggage',
  'phones-accessories': 'mobile-phones-accessories',
  'phones-tablets': 'mobile-phones-accessories',
  'phones-and-tablets': 'mobile-phones-accessories',
}

function normalizeSlug(slug = '') {
  return String(slug).toLowerCase().trim()
}

function resolveCanonicalSlug(slug) {
  const normalized = normalizeSlug(slug)
  return SLUG_ALIASES[normalized] ?? normalized
}

function buildSlugCandidates(slug, parentSlug = '') {
  const canonical = resolveCanonicalSlug(slug)
  if (!canonical) return []

  const candidates = new Set([canonical])
  const parent = parentSlug ? resolveCanonicalSlug(parentSlug) : ''

  if (parent) {
    if (!canonical.startsWith(`${parent}-`)) {
      candidates.add(`${parent}-${canonical}`)
    }

    const withoutParent = canonical.startsWith(`${parent}-`)
      ? canonical.slice(parent.length + 1)
      : canonical
    candidates.add(`${parent}-${withoutParent}`)
  }

  return [...candidates]
}

function assetFromGlob(slug) {
  const jpgPath = `../assets/images/categories/catalog/${slug}.jpg`
  const pngPath = `../assets/images/categories/catalog/${slug}.png`
  // Prefer PNG (curated people/lifestyle shots) over stock JPG product photos
  return catalogPngs[pngPath] ?? catalogJpgs[jpgPath] ?? null
}

export function getLocalCategoryImage(slug, parentSlug = '') {
  for (const candidate of buildSlugCandidates(slug, parentSlug)) {
    if (CATEGORY_PHOTO_OVERRIDES[candidate]) {
      return CATEGORY_PHOTO_OVERRIDES[candidate]
    }

    const asset = assetFromGlob(candidate)
    if (asset) return asset
  }

  return null
}

/** Full slug → asset map for Images.jsx catalog export */
export const categoryCatalogBySlug = {
  ...CATEGORY_PHOTO_OVERRIDES,
}

for (const jpgPath of Object.keys(catalogJpgs)) {
  const slug = jpgPath.split('/').pop()?.replace('.jpg', '')
  if (slug && !categoryCatalogBySlug[slug]) {
    categoryCatalogBySlug[slug] = catalogJpgs[jpgPath]
  }
}

for (const pngPath of Object.keys(catalogPngs)) {
  const slug = pngPath.split('/').pop()?.replace('.png', '')
  if (slug) categoryCatalogBySlug[slug] = catalogPngs[pngPath]
}

export const categoryCatalogSlugs = Object.keys(categoryCatalogBySlug).sort()
