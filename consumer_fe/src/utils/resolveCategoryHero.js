import heroLifestyle from '../assets/images/hero-banners/category-lifestyle.png'
import heroProduct from '../assets/images/hero-banners/category-product.png'
import { normalizeCategorySlug } from './normalizeCategories'

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
  'mobile-phones-accessories': 'bg-[#F8D5D0]',
  'home-kitchen': 'bg-[#D8EEDF]',
  'beauty-health': 'bg-[#F5D5E3]',
  'sports-outdoors': 'bg-[#D4E6FA]',
  fashion: 'bg-[#E8DDF5]',
  computing: 'bg-[#DDE5F0]',
  default: 'bg-[#F8D5D0]',
}

export function resolveCategoryHeroContent({
  category,
  subcategory,
  categoryLabel = 'This category',
}) {
  const slug = category?.slug ?? ''
  const canonicalSlug = normalizeCategorySlug(slug)
  const displayLabel = subcategory?.name ?? category?.name ?? categoryLabel

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
    lifestyleImage: heroLifestyle,
    productImage: heroProduct,
    backgroundClass: HERO_BACKGROUNDS[canonicalSlug] ?? HERO_BACKGROUNDS.default,
  }
}
