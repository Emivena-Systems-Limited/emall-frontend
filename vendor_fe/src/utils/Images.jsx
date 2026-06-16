/**
 * Central image registry for vendor_fe.
 *
 * public/*              → path strings (served as-is)
 * src/assets/images/*   → import for Vite bundling + cache busting
 */

import signupHero from '../assets/images/auth_img.jpg'

const brand = {
  favicon: '/favicon.svg',
  iconsSprite: '/icons.svg',
}

const auth = {
  signupHero,
}

const shop = {}

const common = {}

export const Images = {
  brand,
  auth,
  shop,
  common,
}

export default Images
