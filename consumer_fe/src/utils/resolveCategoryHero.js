import heroPrimaryFallback from '../assets/images/categories/hero/category-hero-primary.png'
import heroAccentFallback from '../assets/images/categories/hero/category-hero-accent.png'
import { CATEGORY_BANNER_ASSETS } from './categoryLocalAssets'
import { normalizeCategorySlug } from './normalizeCategories'
import { resolveParentCategoryImage, resolveSubcategoryImage } from './resolveCategoryImage'

const HERO_TAGLINES = {
  'mobile-phones-accessories': 'Feel Connected,\nFeel the Beat',
  'home-kitchen': 'Warm Spaces,\nBetter Living',
  'beauty-health': 'Look Great,\nFeel Confident',
  'sports-outdoors': 'Move More,\nLive Active',
  fashion: 'Dress Bold,\nOwn Your Style',
  computing: 'Work Smart,\nPlay Harder',
  electronics: 'Power Up,\nStay Ahead',
  'baby-maternity': 'Little Moments,\nBig Love',
  'bags-luggage': 'Pack Light,\nTravel Right',
  'toys-games': 'Play More,\nSmile Often',
  'jewelry-accessories': 'Shine Bright,\nStand Out',
  'arts-crafts-sewing': 'Create More,\nMake It Yours',
  'health-household': 'Clean Home,\nHealthy Life',
  groceries: 'Fresh Picks,\nDaily Essentials',
  automotive: 'Drive Better,\nGo Further',
  'construction-tools': 'Built Tough,\nDone Right',
}

const HERO_BACKGROUNDS = {
  'mobile-phones-accessories': 'bg-[#fdf2f0]',
  'home-kitchen': 'bg-[#f3faf6]',
  'beauty-health': 'bg-[#fdf2f8]',
  'sports-outdoors': 'bg-[#f0f7ff]',
  fashion: 'bg-[#faf5ff]',
  computing: 'bg-[#f4f7fc]',
  default: 'bg-[#fdf2f0]',
}

function pickProductImage(lifestyleImage, subcategory, parentSlug, subcategories) {
  const candidates = [
    subcategory,
    ...subcategories.filter((item) => item.slug !== subcategory?.slug),
  ].filter(Boolean)

  for (const item of candidates) {
    const image = resolveSubcategoryImage(item, parentSlug)
    if (image && image !== lifestyleImage) return image
  }

  return heroAccentFallback
}

export function resolveCategoryHeroContent({
  category,
  subcategory,
  subcategories = [],
  categoryLabel = 'This category',
}) {
  const slug = category?.slug ?? ''
  const canonicalSlug = normalizeCategorySlug(slug)
  const displayLabel = subcategory?.name ?? category?.name ?? categoryLabel
  const bannerAsset = CATEGORY_BANNER_ASSETS[`${canonicalSlug}-banner`]
  const lifestyleImage = bannerAsset
    ?? resolveParentCategoryImage(category ?? { slug, name: displayLabel })
    ?? heroPrimaryFallback
  const productImage = pickProductImage(lifestyleImage, subcategory, slug, subcategories)

  const ctaHref = subcategory?.slug
    ? `/categories/${slug}/${subcategory.slug}`
    : slug
      ? `/categories/${slug}`
      : '/categories'

  const rawTitle = HERO_TAGLINES[canonicalSlug] ?? `Discover More,\nShop ${displayLabel}`

  return {
    eyebrow: subcategory?.name ?? category?.name ?? categoryLabel,
    title: rawTitle,
    ctaLabel: 'Explore Collection',
    ctaHref,
    lifestyleImage,
    productImage: productImage || heroAccentFallback,
    backgroundClass: HERO_BACKGROUNDS[canonicalSlug] ?? HERO_BACKGROUNDS.default,
  }
}
