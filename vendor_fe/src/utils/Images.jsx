/**
 * Central image registry for vendor_fe.
 *
 * public/*              → path strings (served as-is)
 * src/assets/images/*   → import for Vite bundling + cache busting
 */

import signupHero from '../assets/images/auth_img.jpg'
import ghana_map from '../assets/images/ghana_map.png'

const brand = {
  favicon: '/favicon.svg',
  iconsSprite: '/icons.svg',
}

const auth = {
  signupHero,
}

const shop = {}

const common = {
  ghana_map,
}

export const Images = {
  brand,
  auth,
  shop,
  common,
}

export default Images
