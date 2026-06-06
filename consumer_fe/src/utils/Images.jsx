/**
 * Central image registry for consumer_fe.
 *
 * public/*              → path strings (served as-is)
 * src/assets/images/*   → import for Vite bundling + cache busting
 *
 * Add bundled images:
 *   import logo from '../assets/images/logo.png'
 *   then register under the matching group below
 */

// import logo from '../assets/images/logo.png'
// import heroBanner from '../assets/images/hero-banner.webp'

const brand = {
  favicon: '/favicon.svg',
  iconsSprite: '/icons.svg',
  // logo,
}

const auth = {
  // loginIllustration,
  // registerIllustration,
}

const shop = {
  // emptyCart,
  // emptyWishlist,
}

const common = {
  // placeholder: '/images/placeholder.png',
}

export const Images = {
  brand,
  auth,
  shop,
  common,
}

export default Images
