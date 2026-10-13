import Images from '../utils/Images'
import { buildCategoryListingHref } from '../utils/listingFilterParams'

/** Native hero artwork is 2172×724. */
export const HERO_BANNER_WIDTH = 2172
export const HERO_BANNER_HEIGHT = 724
export const HERO_BANNER_ASPECT_RATIO = `${HERO_BANNER_WIDTH} / ${HERO_BANNER_HEIGHT}`

const SMALL_WORDS = new Set(['and', 'or', 'of'])
const MAX_SHOP_LABEL_LENGTH = 20

function shopButtonLabel(name, { singleLine, shopLabel }) {
  if (shopLabel) return shopLabel
  if (singleLine) return 'Shop EZMall'
  const label = `Shop ${name}`
  return label.length > MAX_SHOP_LABEL_LENGTH ? 'Shop Now' : label
}

function heroNameFromFile(fileName) {
  return fileName
    .replace(/_hero$/, '')
    .split('_')
    .map((word, index) => {
      if (index > 0 && SMALL_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const heroSlides = [
  { file: 'app_main_hero', slug: null, copySide: 'right', title: 'What EZMall Offers', singleLine: true },
  { file: 'electronics_hero', slug: 'electronics', copySide: 'left' },
  { file: 'cell_phone_and_accessories', slug: 'cell-phones-accessories', copySide: 'right' },
  { file: 'computing_and_office_hero', slug: 'computer-office', copySide: 'right' },
  {
    file: 'appliances_one_hero',
    slug: 'appliances',
    copySide: 'right',
    title: 'Your Home Needs an Upgrade',
    shopLabel: 'Shop Appliances',
    subtitle: 'Discover home upgrades — curated just for you.',
  },
  {
    file: 'appliances_two_hero',
    slug: 'appliances',
    copySide: 'right',
    title: 'Explore Office and Home Appliances',
    shopLabel: 'Shop Appliances',
    subtitle: 'Discover office and home appliances — curated just for you.',
  },
  { file: 'furniture_hero', slug: 'furniture', copySide: 'right' },
]

export const heroBanners = heroSlides.map(({ file, slug, copySide, title, singleLine = false, shopLabel, subtitle }) => {
  const name = title ?? heroNameFromFile(file)
  const words = name.split(' ')
  const href = slug ? buildCategoryListingHref(slug) : '/categories'

  return {
    id: file,
    name,
    singleLine,
    lead: words.length > 1 ? words.slice(0, -1).join(' ') : '',
    accent: words.at(-1),
    subtitle: subtitle ?? `Discover ${name} — curated just for you.`,
    shopLabel: shopButtonLabel(name, { singleLine, shopLabel }),
    arrivalsLabel: 'View New Arrivals',
    href,
    arrivalsHref: '/promotions',
    image: Images.hero[file],
    copySide,
  }
})

export const authenticatedQuickActions = [
  { id: 'stores', label: 'All Stores', href: '/stores', icon: 'store' },
  { id: 'deals', label: 'Todays Deals', href: '/promotions?filter=todays-deals', icon: 'deals' },
  { id: 'clearance', label: 'Clearance', href: '/promotions?filter=clearance', icon: 'clearance' },
  { id: 'wishlist', label: 'Wishlist', href: '/account/wishlist', icon: 'wishlist' },
  { id: 'orders', label: 'My Orders', href: '/account/orders', icon: 'orders' },
]

export const guestQuickActions = [
  { id: 'stores', label: 'All Stores', href: '/stores', icon: 'store' },
  { id: 'deals', label: 'Todays Deals', href: '/promotions?filter=todays-deals', icon: 'deals' },
  { id: 'clearance', label: 'Clearance', href: '/promotions?filter=clearance', icon: 'clearance' },
  { id: 'sign-in', label: 'Sign In', href: '/login', icon: 'sign-in' },
  { id: 'register', label: 'Register', href: '/register', icon: 'register' },
]
