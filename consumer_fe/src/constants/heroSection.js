import Images from '../utils/Images'

/** Native hero banner artwork size — keeps containers aligned with source assets. */
export const HERO_BANNER_WIDTH = 1286
export const HERO_BANNER_HEIGHT = 1223
export const HERO_BANNER_ASPECT_RATIO = `${HERO_BANNER_WIDTH} / ${HERO_BANNER_HEIGHT}`

export const heroBanners = [
  {
    id: 'hero-banner-one',
    href: '/promotions',
    image: Images.sample_hero_banners.hero_banner_one,
  },
  {
    id: 'hero-banner-two',
    href: '/promotions',
    image: Images.sample_hero_banners.hero_banner_two,
  },
  {
    id: 'hero-banner-three',
    href: '/promotions',
    image: Images.sample_hero_banners.hero_banner_three,
  },
  {
    id: 'hero-banner-four',
    href: '/promotions',
    image: Images.sample_hero_banners.hero_banner_four,
  },
]

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
