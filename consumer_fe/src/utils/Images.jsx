import applePay from '../assets/images/apple-pay.png'
import googlePay from '../assets/images/google-pay.png'
import visa from '../assets/images/visa.png'
import mastercard from '../assets/images/mastercard.png'
import paypal from '../assets/images/paypal.png'
import playstore from '../assets/images/playstore.png'
import appstore from '../assets/images/apple_store.svg'
import heroBannerOne from '../assets/images/hero_sample_one.png'
import heroBannerTwo from '../assets/images/hero_sample_two.png'
import heroBannerThree from '../assets/images/hero_sample_three.png'
import heroBannerFour from '../assets/images/hero_sample_four.png'
import fashion from '../assets/images/fashion.png'
import electronics from '../assets/images/electronics.png'
import home_kitchen from '../assets/images/home_kitchen.png'
import beauty_personal_care from '../assets/images/beauty_personal_care.png'
import sports_outdoors from '../assets/images/sports_outdoors.png'
import toys_games from '../assets/images/toys_games.png'
import computing from '../assets/images/computing.png'
import appliances from '../assets/images/appliances.png'
import home_office from '../assets/images/home_office.png'
import phones_accessories from '../assets/images/phones_accessories.png'

// Category spotlight banners
import electronicsImage from '../assets/images/categories/electronics.jpg'
import phones_and_accessoriesImage from '../assets/images/categories/phones_and_accesories.png'
import home_and_kitchenImage from '../assets/images/categories/home_and_kitchen.png'

import {
  CATEGORY_BANNER_ASSETS,
  categoryCatalogBySlug,
  categoryCatalogSlugs,
  getLocalCategoryImage,
} from './categoryLocalAssets'

const brand = {
  favicon: '/favicon.svg',
  iconsSprite: '/icons.svg',
}

const auth = {}

const shop = {}

const sample_hero_banners = {
  hero_banner_one: heroBannerOne,
  hero_banner_two: heroBannerTwo,
  hero_banner_three: heroBannerThree,
  hero_banner_four: heroBannerFour,
}

const top_categories = {
  fashion,
  electronics,
  home_kitchen,
  beauty_personal_care,
  sports_outdoors,
  toys_games,
  computing,
  appliances,
  home_office,
  phones_accessories,
}

const common = {
  apple_pay: applePay,
  google_pay: googlePay,
  visa,
  mastercard,
  paypal,
  playstore,
  appstore,
}

/** Spotlight banners used on Categories page header */
const categories = {
  electronicsImage,
  phones_and_accessoriesImage,
  home_and_kitchenImage,
}

/** Full category catalog — real JPG photos keyed by API slug */
const catalog = {
  banners: CATEGORY_BANNER_ASSETS,
  bySlug: categoryCatalogBySlug,
  slugs: categoryCatalogSlugs,
  get: getLocalCategoryImage,
}

export const Images = {
  brand,
  auth,
  shop,
  common,
  sample_hero_banners,
  top_categories,
  categories,
  catalog,
}

export default Images
