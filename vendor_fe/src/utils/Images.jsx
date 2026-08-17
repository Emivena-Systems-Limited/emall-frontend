/**
 * Central image registry for vendor_fe.
 *
 * public/*              → path strings (served as-is)
 * src/assets/images/*   → import for Vite bundling + cache busting
 */

import signupHero from '../assets/images/auth_img.jpg'
import ghana_map from '../assets/images/ghana_map.png'
import hero_image from '../assets/images/hero_image.jpg'
import hero_img from '../assets/images/hero_img_alt.png'
import hero_img_one from '../assets/images/hero_img_one.png'
import hero_img_two from '../assets/images/hero_img_two.png'
import grow_your_business from '../assets/images/grow_your_business.png'
import increase_sales from '../assets/images/increase_sales.png'
import reach_more_customers from '../assets/images/reach_more_customers.png'
import secure_platform from '../assets/images/secure_platform.png'
import ghana_grid_map from '../assets/images/ghana_grid_map.png'
import ghana_map_grid from '../assets/images/ghana_mapping.png'
import step_one from '../assets/images/step_one.png'
import step_two from '../assets/images/step_two.png'
import step_three from '../assets/images/step_three.png'
import step_four from '../assets/images/step_four.png'
import logo from '../assets/images/logo.png'
import logoWhite from '../assets/images/logo_white.png'

const brand = {
  favicon: '/favicon.svg',
  iconsSprite: '/icons.svg',
  logo,
  logoWhite,
}

const auth = {
  signupHero,
}

const shop = {}

const common = {
  ghana_map,
  hero_image,
  hero_img,
  hero_img_one,
  hero_img_two,
  grow_your_business,
  increase_sales,
  reach_more_customers,
  secure_platform,
  ghana_grid_map,
  ghana_map_grid,
  step_one,
  step_two,
  step_three,
  step_four,
}

export const Images = {
  brand,
  auth,
  shop,
  common,
}

export default Images
