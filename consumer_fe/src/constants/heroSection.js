import Images from '../utils/Images'

export const heroBanners = [
  {
    id: 'hero-banner-one',
    href: '/categories/fashion',
    image: Images.sample_hero_banners.hero_banner_one,
  },
  {
    id: 'hero-banner-two',
    href: '/categories/tv-appliances',
    image: Images.sample_hero_banners.hero_banner_two,
  },
  {
    id: 'hero-banner-three',
    href: '/categories/beauty',
    image: Images.sample_hero_banners.hero_banner_three,
  },
  {
    id: 'hero-banner-four',
    href: '/categories/skincare',
    image: Images.sample_hero_banners.hero_banner_four,
  },
]

export const authenticatedQuickActions = [
  { id: 'stores', label: 'All Stores', href: '/stores', icon: 'store' },
  { id: 'deals', label: 'Todays Deals', href: '/deals', icon: 'deals' },
  { id: 'clearance', label: 'Clearance', href: '/clearance', icon: 'clearance' },
  { id: 'wishlist', label: 'Wishlist', href: '/wishlist', icon: 'wishlist' },
  { id: 'orders', label: 'My Orders', href: '/orders', icon: 'orders' },
]

export const guestQuickActions = [
  { id: 'stores', label: 'All Stores', href: '/stores', icon: 'store' },
  { id: 'deals', label: 'Todays Deals', href: '/deals', icon: 'deals' },
  { id: 'clearance', label: 'Clearance', href: '/clearance', icon: 'clearance' },
  { id: 'sign-in', label: 'Sign In', href: '/login', icon: 'sign-in' },
  { id: 'register', label: 'Register', href: '/register', icon: 'register' },
]
