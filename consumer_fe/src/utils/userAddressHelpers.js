import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityLabel,
  getCityOptionsByRegion,
  getDistrictsByRegion,
} from '../constants/ghanaLocations'

export const emptyAddressForm = {
  type: 'shipping',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  region: '',
  city_or_town: '',
  town_custom: '',
  district: '',
  address_line_1: '',
  landmark: '',
  digital_address: '',
  delivery_note: '',
  country: 'Ghana',
  is_default: false,
}

export function resolveDistrictId(regionId, value) {
  const raw = String(value ?? '').trim()
  if (!raw || !regionId) return ''
  return (
    getDistrictsByRegion(regionId).find(
      (district) => district.id === raw || district.name.toLowerCase() === raw.toLowerCase(),
    )?.id ?? ''
  )
}

export function addressId(address) {
  return address?.id ?? address?.address_id ?? null
}

export function resolveRegionId(value) {
  const raw = String(value ?? '').trim()
  return GHANA_LOCATIONS.find(
    (region) => region.id === raw || region.name.toLowerCase() === raw.toLowerCase(),
  )?.id ?? ''
}

export function resolveTown(regionId, value) {
  const raw = String(value ?? '').trim()
  const match = getCityOptionsByRegion(regionId).find(
    (option) => option.value === raw || option.label.toLowerCase() === raw.toLowerCase(),
  )
  return match
    ? { city_or_town: match.value, town_custom: '' }
    : { city_or_town: raw ? LOCATION_OTHER_VALUE : '', town_custom: raw }
}

/** Same address extraction logic used on CheckoutPage. */
export function getAddressList(response, type = 'shipping') {
  const candidates = [response, response?.data, response?.result, response?.payload]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (Array.isArray(candidate?.[type])) return candidate[type]
    if (Array.isArray(candidate?.addresses)) return candidate.addresses
    if (Array.isArray(candidate?.data)) return candidate.data
    if (Array.isArray(candidate?.data?.[type])) return candidate.data[type]
    if (Array.isArray(candidate?.data?.addresses)) return candidate.data.addresses
  }

  return []
}

export function getShippingAddresses(response) {
  return getAddressList(response, 'shipping')
}

export function getBillingAddresses(response) {
  return getAddressList(response, 'billing')
}

export function getDefaultShippingAddress(response) {
  const shippingAddresses = getShippingAddresses(response)
  return shippingAddresses.find((item) => item?.is_default || item?.isDefault) ?? shippingAddresses[0] ?? null
}

export function getDefaultBillingAddress(response) {
  const billingAddresses = getBillingAddresses(response)
  return billingAddresses.find((item) => item?.is_default || item?.isDefault) ?? billingAddresses[0] ?? null
}

export function addressGroups(response) {
  return {
    shipping: getAddressList(response, 'shipping'),
    billing: getAddressList(response, 'billing'),
  }
}

export function toAddressForm(address, type = 'shipping') {
  const region = resolveRegionId(address?.region)
  const town = resolveTown(region, address?.city_or_town ?? address?.city ?? address?.town)
  const district = resolveDistrictId(region, address?.district ?? address?.district_id)
  const landmark = typeof address?.landmark === 'string' ? address.landmark : ''
  const digitalAddress = String(
    address?.digital_address ?? address?.digitalAddress ?? address?.ghana_post_address ?? '',
  ).trim()

  return {
    ...emptyAddressForm,
    type,
    first_name: address?.first_name ?? address?.firstName ?? '',
    last_name: address?.last_name ?? address?.lastName ?? '',
    email: address?.email ?? '',
    phone_number: address?.phone_number ?? address?.phone ?? '',
    region,
    ...town,
    district,
    address_line_1: address?.address_line_1 ?? address?.address ?? '',
    landmark,
    digital_address: digitalAddress,
    delivery_note: typeof address?.delivery_note === 'string' ? address.delivery_note : '',
    country: typeof address?.country === 'string' ? address.country : 'Ghana',
    is_default: Boolean(address?.is_default ?? address?.isDefault),
  }
}

export function buildAddressPayload(form) {
  const region = GHANA_LOCATIONS.find((item) => item.id === form.region)?.name ?? form.region
  const city = form.city_or_town === LOCATION_OTHER_VALUE
    ? form.town_custom
    : getCityLabel(form.region, form.city_or_town)
  const districtName = getDistrictsByRegion(form.region).find((item) => item.id === form.district)?.name
    ?? String(form.district ?? '').trim()
  const landmark = String(form.landmark ?? '').trim()
  const digitalAddress = String(form.digital_address ?? '').trim()
  const addressLine2 = [landmark, digitalAddress].filter(Boolean).join(' · ')

  const payload = {
    type: form.type,
    first_name: form.first_name,
    last_name: form.last_name,
    phone_number: form.phone_number,
    region,
    city_or_town: city,
    address_line_1: form.address_line_1,
    country: form.country || 'Ghana',
    is_default: Boolean(form.is_default),
  }

  if (form.email?.trim()) payload.email = form.email.trim()
  if (districtName) payload.district = districtName
  if (landmark) payload.landmark = landmark
  if (digitalAddress) payload.digital_address = digitalAddress
  if (addressLine2) payload.address_line_2 = addressLine2
  if (form.delivery_note?.trim()) payload.delivery_note = form.delivery_note.trim()

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )
}

export function buildAddressPrefill(user, { type = 'shipping', isDefault = true } = {}) {
  const region = resolveRegionId(user?.region)
  const town = resolveTown(
    region,
    user?.city_or_town ?? user?.city ?? user?.town,
  )
  const district = resolveDistrictId(region, user?.district ?? user?.district_id)

  return {
    ...emptyAddressForm,
    type,
    first_name: user?.first_name ?? user?.firstName ?? '',
    last_name: user?.last_name ?? user?.lastName ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? user?.phone ?? '',
    region,
    ...town,
    district,
    address_line_1: user?.address_line_1 ?? user?.address ?? user?.street_address ?? '',
    is_default: isDefault,
  }
}
