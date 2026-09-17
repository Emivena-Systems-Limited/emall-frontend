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
const titleCase = (value) => String(value ?? '').toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
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

function isPlainRecord(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

/** API may return lists as { "0": {...}, "1": {...} } instead of arrays. */
function listFromNumericObject(value) {
  if (!isPlainRecord(value)) return []
  const keys = Object.keys(value)
  if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) return []
  return keys
    .sort((left, right) => Number(left) - Number(right))
    .map((key) => value[key])
    .filter(isPlainRecord)
}

function asArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const fromNumeric = listFromNumericObject(value)
  if (fromNumeric.length) return fromNumeric

  for (const candidate of [value?.stores, value?.data, value?.items, value?.products]) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && candidate !== value && typeof candidate === 'object') {
      const nested = asArray(candidate)
      if (nested.length) return nested
    }
  }
  return []
}

function asAddressRecord(value) {
  if (Array.isArray(value)) return value.find(isPlainRecord) ?? null
  return isPlainRecord(value) ? value : null
}

function normalizeCityKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^.+::/, '')
}

function displayCity(value) {
  const raw = firstValue(value)
  if (!raw) return ''
  return titleCase(String(raw).replace(/^.+::/, ''))
}

export function resolveVendorAddress(source) {
  const vendor = source?.vendor ?? source?.store ?? source
  return asAddressRecord(vendor?.addresses)
    ?? asAddressRecord(vendor?.address)
    ?? asAddressRecord(source?.addresses)
    ?? asAddressRecord(source?.address)
}

export function resolveVendorCity(source) {
  const vendor = source?.vendor ?? source?.store ?? source
  const address = resolveVendorAddress(source)
  return displayCity(firstValue(
    vendor?.city,
    vendor?.city_or_town,
    address?.city,
    address?.city_or_town,
    vendor?.location?.city,
    vendor?.location?.city_or_town,
    source?.storeCity,
    source?.city,
    source?.city_or_town,
  ))
}

export function resolveAuthUserCity(user) {
  return displayCity(firstValue(
    user?.city_or_town,
    user?.city,
    user?.town,
    user?.default_address?.city_or_town,
    user?.default_address?.city,
  ))
}

export function isSameCity(left, right) {
  const first = normalizeCityKey(left)
  const second = normalizeCityKey(right)
  return Boolean(first && second && first === second)
}

export function resolveLocalDeliveryEligibility(productOrApiProduct, user) {
  const vendorCity = resolveVendorCity(productOrApiProduct)
  const userCity = resolveAuthUserCity(user)
  if (!vendorCity || !userCity) return true
  return isSameCity(vendorCity, userCity)
}

export function normalizeStoreRecord(record, index = 0) {
  if (!record || typeof record !== 'object') return null
  const source = record.store && typeof record.store === 'object' ? record.store : record
  const storeId = firstValue(source.id, source.store_id, source.uuid)
  if (!storeId) return null
  const serviceAreas = getServiceAreas(source)
  const productSource = firstValue(
    source.products_at_random,
    source.productsAtRandom,
    source.featured_products,
    source.products,
  )
  const products = asArray(productSource)
    .slice(0, 5)
    .map((product, productIndex) => normalizeLandingProduct(product, productIndex, { prefix: `store-${index}` }))
    .filter(Boolean)
  const logo = firstValue(
    source.store_logo,
    source.logo,
    source.image,
    source.avatar,
    source.profile_image,
  )
  const vendorAddress = resolveVendorAddress(source)
  return {
    ...source,
    id: String(storeId),
    name: firstValue(source.store_name, source.business_name, source.name, source.title, 'Marketplace store'),
    tradingName: firstValue(source.trading_name, source.tradingName, ''),
    city: resolveVendorCity(source) || titleCase(firstValue(
      source.store_location,
      source.location_name,
      typeof source.location === 'string' ? source.location : undefined,
      source.region,
      vendorAddress?.region,
      serviceAreas[0],
      'Location unavailable',
    )),
    region: firstValue(
      source.region,
      source.location?.region,
      vendorAddress?.region,
      source.address?.region,
      '',
    ),
    logo,
    image: firstValue(source.cover_image, source.cover_photo, source.banner, source.banner_image, source.store_image, logo, products[0]?.image, null),
    bannerImage: firstValue(source.banner_image, source.cover_image, source.cover_photo, source.banner, null),
    rating: Number(firstValue(source.average_rating, source.rating, 0)) || 0,
    ratingCount: Number(firstValue(source.reviews_count, source.review_count, source.rating_count, 0)) || 0,
    salesCount: Number(firstValue(source.sales_count, source.salesCount, 0)) || 0,
    followersCount: Number(firstValue(source.followers_count, source.followersCount, 0)) || 0,
    productsCount: Number(firstValue(source.products_count, source.productsCount, products.length, 0)) || 0,
    serviceAreas,
    explicitEligibility: firstValue(source.delivery_eligible, source.delivers_to_user_location, source.is_delivery_eligible),
    deliveryMessage: firstValue(source.delivery_message, source.eligibility_message, ''),
    products,
  }
}

export function extractStoreDirectoryPagination(payload) {
  const meta = payload?.pagination ?? payload?.meta ?? {}
  const total = Number(firstValue(meta.total, meta.total_count, 0)) || 0
  const lastPage = Number(firstValue(meta.last_page, meta.lastPage, 0)) || 1
  const currentPage = Number(firstValue(meta.current_page, meta.currentPage, 1)) || 1
  const perPage = Number(firstValue(meta.per_page, meta.perPage, 50)) || 50

  return { currentPage, lastPage, perPage, total }
}

export function normalizeStoreDirectory(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeStoreRecord).filter(Boolean)
  }
  return asArray(payload?.stores ?? payload).map(normalizeStoreRecord).filter(Boolean)
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
      city: firstValue(resolveVendorCity(vendor), vendor?.city, vendor?.city_or_town, vendor?.location?.city, 'Ghana'),
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
  const vendorCity = resolveVendorCity(apiProduct)
  const areas = getServiceAreas(store)
  const serviceAreas = areas.length > 0 ? areas : (vendorCity ? [vendorCity] : [])
  return resolveStoreEligibility({
    ...store,
    explicitEligibility: firstValue(
      apiProduct?.delivers_to_user_location,
      apiProduct?.delivery_eligible,
      apiProduct?.serves_location,
      store?.delivers_to_user_location,
      store?.delivery_eligible,
    ),
    serviceAreas,
  }, location)
}
