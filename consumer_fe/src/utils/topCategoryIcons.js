/**
 * Homepage Top Categories — backgroundless 3D icon assets keyed by API slug.
 * Used when the API does not provide a usable thumbnail URL.
 */
import artsCraftsSewing from '../assets/images/categories/top-icons/arts-crafts-sewing.png'
import babyMaternity from '../assets/images/categories/top-icons/baby-maternity.png'
import bagsLuggage from '../assets/images/categories/top-icons/bags-luggage.png'
import beautyHealth from '../assets/images/categories/top-icons/beauty-health.png'
import healthHousehold from '../assets/images/categories/top-icons/health-household.png'
import homeKitchen from '../assets/images/categories/top-icons/home-kitchen.png'
import jewelryAccessories from '../assets/images/categories/top-icons/jewelry-accessories.png'
import mobilePhonesAccessories from '../assets/images/categories/top-icons/mobile-phones-accessories.png'
import sportsOutdoors from '../assets/images/categories/top-icons/sports-outdoors.png'
import toysGames from '../assets/images/categories/top-icons/toys-games.png'

import appliances from '../assets/images/appliances.png'
import computing from '../assets/images/computing.png'
import electronics from '../assets/images/electronics.png'
import fashion from '../assets/images/fashion.png'
import homeOffice from '../assets/images/home_office.png'

const SLUG_ALIASES = {
  'beauty-personal-care': 'beauty-health',
  'baby-and-maternity': 'baby-maternity',
  'bags-and-luggage': 'bags-luggage',
  'phones-accessories': 'mobile-phones-accessories',
  'phones-tablets': 'mobile-phones-accessories',
  'phones-and-tablets': 'mobile-phones-accessories',
  'phone-tablets': 'mobile-phones-accessories',
  'mobile-phones': 'mobile-phones-accessories',
}

export const TOP_CATEGORY_ICONS = {
  'arts-crafts-sewing': artsCraftsSewing,
  'baby-maternity': babyMaternity,
  'bags-luggage': bagsLuggage,
  'beauty-health': beautyHealth,
  'health-household': healthHousehold,
  'home-kitchen': homeKitchen,
  'jewelry-accessories': jewelryAccessories,
  'mobile-phones-accessories': mobilePhonesAccessories,
  'sports-outdoors': sportsOutdoors,
  'toys-games': toysGames,
  appliances,
  computing,
  electronics,
  fashion,
  'home-office': homeOffice,
}

export function isUsableCategoryThumbnail(url) {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  return trimmed.length > 4 && /^https?:\/\//i.test(trimmed)
}

export function resolveTopCategorySlug(slug = '') {
  const normalized = String(slug).toLowerCase().trim()
  return SLUG_ALIASES[normalized] ?? normalized
}

export function getTopCategoryIcon(slug = '') {
  const resolved = resolveTopCategorySlug(slug)
  return TOP_CATEGORY_ICONS[resolved] ?? null
}

export const DEFAULT_TOP_CATEGORY_ICON = homeKitchen
