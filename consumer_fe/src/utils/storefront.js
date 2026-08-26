import electronicsImage from '../assets/images/categories/electronics.jpg'
import kitchenImage from '../assets/images/categories/home_and_kitchen.png'
import fashionImage from '../assets/images/fashion.png'
import beautyImage from '../assets/images/beauty_personal_care.png'
import computingImage from '../assets/images/computing.png'
import sportsImage from '../assets/images/sports_outdoors.png'
import { normalizeLandingProduct } from './normalizeLandingProducts'

export const SHOPPING_LOCATION_KEY = 'emall:shopping-location'
export const GHANA_SHOPPING_LOCATIONS = ['Accra', 'Tema', 'Ashaiman', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tamale', 'Koforidua', 'Ho', 'Sunyani']

const fallbackStores = [
  { id: 'spintex-digital', name: 'Spintex Digital', city: 'Accra', image: electronicsImage, serviceAreas: ['Accra', 'Tema', 'Ashaiman'] },
  { id: 'home-and-more', name: 'Home & More', city: 'Tema', image: kitchenImage, serviceAreas: ['Tema', 'Accra', 'Ashaiman'] },
  { id: 'the-style-room', name: 'The Style Room', city: 'Accra', image: fashionImage, serviceAreas: ['Accra', 'Tema'] },
  { id: 'glow-market', name: 'Glow Market', city: 'Kumasi', image: beautyImage, serviceAreas: ['Kumasi'] },
  { id: 'byte-hub', name: 'Byte Hub Ghana', city: 'Takoradi', image: computingImage, serviceAreas: ['Takoradi', 'Cape Coast'] },
  { id: 'active-world', name: 'Active World', city: 'Tamale', image: sportsImage, serviceAreas: ['Tamale'] },
]

const sectionKeys = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '')
const normalizeArea = (value) => typeof value === 'string' ? value.trim() : String(firstValue(value?.city, value?.name, value?.city_or_town, value?.region) ?? '').trim()
const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'eligible', 'available'].includes(normalized)) return true
  if (['false', '0', 'no', 'ineligible', 'unavailable'].includes(normalized)) return false
  return null
}

function getServiceAreas(record) {
  const source = firstValue(record?.service_areas, record?.delivery_areas, record?.supported_locations, record?.cities)
  return Array.isArray(source) ? source.map(normalizeArea).filter(Boolean) : []
}

function extractRawProducts(landingData) {
  const seen = new Set()
  return sectionKeys.flatMap((key) => Array.isArray(landingData?.[key]) ? landingData[key] : []).filter((product) => {
    const id = firstValue(product?.id, product?.product_id, product?.slug)
    if (!id || seen.has(String(id))) return false
    seen.add(String(id)); return true
  })
}

function asArray(value) {
  if (Array.isArray(value)) return value
  for (const candidate of [value?.data, value?.stores, value?.items, value?.products]) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && candidate !== value && typeof candidate === 'object') {
      const nested = asArray(candidate)
      if (nested.length) return nested
    }
  }
  return []
}

export function normalizeStoreRecord(record, index = 0) {
  if (!record || typeof record !== 'object') return null
  const source = record.store && typeof record.store === 'object' ? record.store : record
  const products = asArray(source.products)
    .map((product, productIndex) => normalizeLandingProduct(product, productIndex, { prefix: `store-${index}` }))
    .filter(Boolean)
  return {
    ...source,
    id: String(firstValue(source.id, source.store_id, source.uuid, `store-${index}`)),
    name: firstValue(source.store_name, source.business_name, source.name, source.title, 'Marketplace store'),
    city: firstValue(source.city, source.city_or_town, source.location?.city, source.address?.city, source.address?.city_or_town, 'Ghana'),
    region: firstValue(source.region, source.location?.region, source.address?.region, ''),
    image: firstValue(source.cover_image, source.cover_photo, source.banner, source.banner_image, source.store_image, source.store_logo, source.logo, source.image, source.avatar, source.profile_image, products[0]?.image, null),
    serviceAreas: getServiceAreas(source),
    explicitEligibility: firstValue(source.delivery_eligible, source.delivers_to_user_location, source.is_delivery_eligible),
    deliveryMessage: firstValue(source.delivery_message, source.eligibility_message, ''),
    products,
  }
}

export function normalizeStoreDirectory(payload) {
  return asArray(payload).map(normalizeStoreRecord).filter(Boolean)
}

export function normalizeStoreProducts(payload) {
  return asArray(payload)
    .map((product, index) => normalizeLandingProduct(product, index, { prefix: 'store-product' }))
    .filter(Boolean)
}

export function buildStoreDirectory(landingData) {
  const rawProducts = extractRawProducts(landingData)
  const stores = new Map()
  rawProducts.forEach((rawProduct, index) => {
    const vendor = rawProduct.vendor ?? rawProduct.store
    const id = firstValue(vendor?.id, rawProduct.vendor_id, rawProduct.store_id)
    if (!id) return
    const product = normalizeLandingProduct(rawProduct, index, { prefix: 'store-product' })
    if (!product) return
    const current = stores.get(String(id)) ?? {
      id: String(id), name: firstValue(vendor?.store_name, vendor?.business_name, vendor?.name, 'Marketplace store'),
      city: firstValue(vendor?.city, vendor?.city_or_town, vendor?.location?.city, 'Ghana'),
      image: firstValue(vendor?.logo, vendor?.image, vendor?.avatar, product.image), serviceAreas: getServiceAreas(vendor),
      explicitEligibility: firstValue(vendor?.delivers_to_user_location, vendor?.delivery_eligible), products: [],
    }
    current.products.push(product); stores.set(String(id), current)
  })
  if (stores.size) return [...stores.values()]
  const products = rawProducts.map((product, index) => normalizeLandingProduct(product, index, { prefix: 'store-product' })).filter(Boolean)
  return fallbackStores.map((store, index) => ({ ...store, products: products.filter((_, productIndex) => productIndex % fallbackStores.length === index) }))
}

export function resolveShoppingLocation(user) {
  return resolveShoppingLocationDetails(user).city
}

export function resolveShoppingLocationDetails(user) {
  if (typeof window !== 'undefined') {
    const selectedLocation = window.localStorage.getItem(SHOPPING_LOCATION_KEY)
    if (selectedLocation) {
      try {
        const parsed = JSON.parse(selectedLocation)
        if (parsed?.city) return { region: parsed.region || 'Greater Accra', city: parsed.city }
      } catch {
        return { region: 'Greater Accra', city: selectedLocation }
      }
    }
  }
  const city = firstValue(user?.city_or_town, user?.city, user?.town, user?.default_address?.city_or_town, user?.default_address?.city)
  const region = firstValue(user?.region, user?.default_address?.region, 'Greater Accra')
  return { region: String(region), city: city ? String(city) : 'Accra' }
}

export function saveShoppingLocation(location) {
  if (typeof window === 'undefined') return
  const normalized = typeof location === 'string'
    ? { region: 'Greater Accra', city: location }
    : { region: location?.region || 'Greater Accra', city: location?.city || 'Accra' }
  window.localStorage.setItem(SHOPPING_LOCATION_KEY, JSON.stringify(normalized))
}

export function resolveStoreEligibility(store, location) {
  const explicit = store?.explicitEligibility ?? store?.delivers_to_user_location ?? store?.delivery_eligible
  const normalizedEligibility = normalizeBoolean(explicit)
  if (normalizedEligibility !== null) return normalizedEligibility
  const areas = store?.serviceAreas ?? getServiceAreas(store)
  if (!areas.length || !location) return true
  return areas.some((area) => String(area).trim().toLowerCase() === String(location).trim().toLowerCase())
}

export function resolveProductStoreEligibility(apiProduct, location) {
  const store = apiProduct?.vendor ?? apiProduct?.store ?? {}
  return resolveStoreEligibility({ ...store, explicitEligibility: firstValue(apiProduct?.delivers_to_user_location, apiProduct?.delivery_eligible, apiProduct?.serves_location, store?.delivers_to_user_location, store?.delivery_eligible), serviceAreas: getServiceAreas(store) }, location)
}
