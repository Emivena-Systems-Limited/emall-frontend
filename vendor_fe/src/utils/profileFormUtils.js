import { GHANA_COUNTRY, GHANA_REGIONS } from '../constants/ghanaRegions'
import {
  OVERALL_VERIFICATION_STATUS,
  VENDOR_ROLE_DESCRIPTIONS,
  VENDOR_ROLE_LABELS,
  VERIFICATION_ITEM_STATUS,
} from '../constants/profile'
import { unwrapApiEnvelope } from './parseApiError'
import { VENDOR_ADDRESS_MAX_LENGTH } from './validationSchemas'

export function getProfileDisplayName(profile) {
  return profile?.name?.trim() || profile?.admin_full_name?.trim() || 'Vendor'
}

export function getProfileInitials(profile) {
  const name = getProfileDisplayName(profile)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
  }
  return (name[0] ?? profile?.email?.[0] ?? 'V').toUpperCase()
}

export function getProfileRoleLabel(profile) {
  const raw = profile?.role ?? profile?.vendor_role ?? ''
  const key = String(raw).toLowerCase()
  return VENDOR_ROLE_LABELS[key] ?? raw ?? 'Store Owner'
}

export function getProfileRoleDescription(profile) {
  const raw = profile?.role ?? profile?.vendor_role ?? ''
  const key = String(raw).toLowerCase()
  return VENDOR_ROLE_DESCRIPTIONS[key] ?? ''
}

export function getOverallVerificationMeta(status) {
  return OVERALL_VERIFICATION_STATUS[status] ?? OVERALL_VERIFICATION_STATUS.not_verified
}

export function getVerificationItemMeta(status) {
  return VERIFICATION_ITEM_STATUS[status] ?? VERIFICATION_ITEM_STATUS.not_verified
}

export function formatProfileDate(value, { monthYear = false } = {}) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', monthYear
      ? { month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' },
    ).format(new Date(value))
  } catch {
    return '—'
  }
}

export function formatProfileDateShort(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

export function parsePhoneNumber(phone = '', fallbackCountryCode = '+233') {
  const normalized = String(phone).trim()
  if (!normalized) {
    return { countryCode: fallbackCountryCode, local: '' }
  }

  const matchedCode = ['+233', '+234', '+254', '+27', '+1', '+44']
    .sort((a, b) => b.length - a.length)
    .find((code) => normalized.startsWith(code))

  if (matchedCode) {
    return {
      countryCode: matchedCode,
      local: normalized.slice(matchedCode.length).replace(/\D/g, ''),
    }
  }

  const digits = normalized.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return { countryCode: fallbackCountryCode, local: digits.slice(1) }
  }

  return { countryCode: fallbackCountryCode, local: digits }
}

export function composePhoneNumber(countryCode, local) {
  const digits = String(local ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return `${countryCode}${digits}`
}

export function formatPhoneDisplay(phone) {
  const { countryCode, local } = parsePhoneNumber(phone)
  if (!local) return '—'

  const grouped = local.replace(/(\d{2,3})(?=\d)/g, '$1 ').trim()
  return `${countryCode} ${grouped}`
}

function firstNonEmpty(...values) {
  return values.find((value) => {
    if (value === undefined || value === null || typeof value === 'object') return false
    return String(value).trim() !== ''
  }) ?? ''
}

function normalizeStoredPhone(phone) {
  const raw = String(phone ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('+')) return raw

  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('233')) return `+${digits}`
  if (digits.startsWith('0')) return `+233${digits.slice(1)}`
  return digits ? `+233${digits}` : ''
}

function isAddressRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Boolean(
    firstNonEmpty(
      value.id,
      value.address_id,
      value.addressId,
      value.vendor_address_id,
      value.country,
      value.region,
      value.city_or_town,
      value.gps_address,
      value.street_name,
      value.landmark,
      typeof value.address === 'string' ? value.address : '',
    ),
  )
}

function unwrapAddressRecord(value) {
  if (!value) return null
  if (Array.isArray(value)) return unwrapAddressRecord(value[0])
  if (typeof value !== 'object') return null

  if (value.data && typeof value.data === 'object') {
    const inner = unwrapAddressRecord(value.data)
    if (inner) {
      return firstNonEmpty(inner.id, inner.address_id) ? inner : { ...inner, id: value.id ?? inner.id }
    }
  }

  if (value.attributes && typeof value.attributes === 'object') {
    return { id: value.id, ...value.attributes }
  }

  return isAddressRecord(value) ? value : null
}

function getVendorAddressRecord(user) {
  if (!user || typeof user !== 'object') return null

  // Login returns a single address object on `addresses` (not an array).
  const candidates = [
    user.addresses,
    user.address,
    user.vendor_address,
    user.vendorAddress,
    user.business_address,
    user.store_address,
  ]

  for (const candidate of candidates) {
    const record = unwrapAddressRecord(candidate)
    if (record) return record
  }

  return null
}

export function getVendorAddressId(user) {
  if (!user || typeof user !== 'object') return ''

  const record = getVendorAddressRecord(user)
  const nestedId = firstNonEmpty(record?.id, record?.address_id, record?.addressId, record?.uuid)
  if (nestedId) return nestedId

  const storedId = firstNonEmpty(
    user.address_id,
    user.addressId,
    user.vendor_address_id,
    user.vendorAddressId,
  )
  const vendorId = firstNonEmpty(user.vendor_id, user.id)

  // Never send the vendor id as the address id when a dedicated address exists.
  if (storedId && storedId !== vendorId) return storedId
  return ''
}

/** Copies `addresses` from an auth payload onto the stored vendor user. */
export function mergeAuthUserAddress(user, ...sources) {
  if (!user || typeof user !== 'object') return user

  let record = getVendorAddressRecord(user)
  if (!record) {
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue
      record = unwrapAddressRecord(source.addresses)
        || unwrapAddressRecord(source.address)
        || unwrapAddressRecord(source.vendor_address)
        || getVendorAddressRecord(source)
      if (record) break
    }
  }

  const addressId = firstNonEmpty(record?.id, record?.address_id, user.address_id)

  if (!record && !addressId) return user

  return {
    ...user,
    ...(record ? { addresses: record } : {}),
    ...(addressId ? { address_id: addressId } : {}),
  }
}

function getAddressField(user, ...keys) {
  const record = getVendorAddressRecord(user)
  const sources = [record, user]
  for (const source of sources) {
    if (!source) continue
    const value = firstNonEmpty(...keys.map((key) => source[key]))
    if (value) return value
  }
  return ''
}

function normalizeRegionValue(region) {
  const raw = String(region ?? '').trim()
  if (!raw) return ''
  const match = GHANA_REGIONS.find((option) => (
    option.value === raw.toLowerCase() || option.label.toLowerCase() === raw.toLowerCase()
  ))
  return match?.value ?? raw
}

function composeLocation(user) {
  const city = getAddressField(user, 'city_or_town', 'city')
  const region = getAddressField(user, 'region')
  const country = getAddressField(user, 'country') || GHANA_COUNTRY
  const explicit = getAddressField(user, 'location', 'address')

  if (city || region) {
    return [city, region, country].filter(Boolean).join(', ')
  }

  return explicit
}

function mapVerificationStatus(user) {
  const status = String(user?.status ?? '').toLowerCase()
  if (status === 'active' || user?.email_verified_at || user?.phone_verified_at) {
    if (status === 'pending_approval') return 'pending'
    if (status === 'suspended') return 'not_verified'
    return 'verified'
  }
  if (status === 'pending_approval' || status === 'pending') return 'pending'
  return 'not_verified'
}

/** Maps the authenticated vendor in Redux onto the personal-information profile shape. */
export function mapAuthUserToProfile(user) {
  if (!user || typeof user !== 'object') return null

  const name = firstNonEmpty(user.admin_full_name, user.name, user.full_name)
  const phone = normalizeStoredPhone(firstNonEmpty(user.phone_number, user.phone))

  const addressId = getVendorAddressId(user)

  return {
    id: firstNonEmpty(user.id, user.vendor_id),
    name,
    admin_full_name: name,
    email: firstNonEmpty(user.email),
    phone,
    location: composeLocation(user),
    profilePicture: firstNonEmpty(
      user.profile_picture,
      user.profilePicture,
      user.avatar,
      user.logo_url,
    ) || null,
    role: firstNonEmpty(user.vendor_role, user.role, 'store_owner'),
    vendor_role: user.vendor_role,
    verificationStatus: mapVerificationStatus(user),
    dateJoined: firstNonEmpty(user.created_at, user.date_joined, user.dateJoined),
    storeName: firstNonEmpty(user.store_name, user.business_name, user.trading_name),
    business_name: firstNonEmpty(user.business_name),
    store_name: firstNonEmpty(user.store_name),
    trading_name: firstNonEmpty(user.trading_name),
    address_id: addressId,
    country: getAddressField(user, 'country') || GHANA_COUNTRY,
    region: normalizeRegionValue(getAddressField(user, 'region')),
    city_or_town: getAddressField(user, 'city_or_town', 'city'),
    address: getAddressField(user, 'address'),
    gps_address: getAddressField(user, 'gps_address', 'gps'),
    street_name: getAddressField(user, 'street_name', 'street'),
    landmark: getAddressField(user, 'landmark'),
  }
}

export function mergeProfileWithAuthUser(profile, user) {
  const fromAuth = mapAuthUserToProfile(user)
  if (!fromAuth && !profile) return null
  if (!fromAuth) return profile
  if (!profile) return fromAuth

  return {
    ...profile,
    ...fromAuth,
    profilePicture: fromAuth.profilePicture ?? profile.profilePicture ?? null,
    verification: profile.verification,
  }
}

export function mapProfileToPersonalForm(profile) {
  const phone = parsePhoneNumber(profile?.phone ?? profile?.phone_number)
  return {
    name: firstNonEmpty(profile?.name, profile?.admin_full_name),
    email: firstNonEmpty(profile?.email),
    phoneCountryCode: phone.countryCode,
    phoneLocal: phone.local,
  }
}

export function mapProfileToAddressForm(profile) {
  return {
    country: firstNonEmpty(profile?.country) || GHANA_COUNTRY,
    region: normalizeRegionValue(profile?.region),
    city_or_town: firstNonEmpty(profile?.city_or_town, profile?.city),
    address: firstNonEmpty(profile?.address),
    gps_address: firstNonEmpty(profile?.gps_address, profile?.gps),
    street_name: firstNonEmpty(profile?.street_name, profile?.street),
    landmark: firstNonEmpty(profile?.landmark),
  }
}

/** API phone format: country code + local digits, no plus (e.g. 23350085941). */
export function toNationalPhoneDigits(local) {
  const digits = String(local ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('0') ? digits.slice(1) : digits
}

export function toVendorApiPhoneNumber(countryCode, local) {
  const national = toNationalPhoneDigits(local)
  const codeDigits = String(countryCode ?? '').replace(/\D/g, '') || '233'
  if (!national) return ''
  return `${codeDigits}${national}`
}

export function buildVendorInformationUpdatePayload(form = {}, user = {}) {
  return {
    business_name: String(form.business_name ?? form.businessName ?? user.business_name ?? '').trim(),
    admin_full_name: String(form.name ?? form.admin_full_name ?? user.admin_full_name ?? '').trim(),
    store_name: String(form.store_name ?? form.storeName ?? user.store_name ?? '').trim(),
    trading_name: String(form.trading_name ?? form.tradingName ?? user.trading_name ?? '').trim(),
    phone_number: toVendorApiPhoneNumber(form.phoneCountryCode, form.phoneLocal)
      || String(user.phone_number ?? '').replace(/\D/g, ''),
  }
}

export function extractVendorInformationPayload(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  if (!payload || typeof payload !== 'object') return null
  if (payload.vendor && typeof payload.vendor === 'object') return payload.vendor
  if (payload.user && typeof payload.user === 'object') return payload.user
  return payload
}

export function extractVendorAddressPayload(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  if (!payload || typeof payload !== 'object') return null
  if (payload.address && typeof payload.address === 'object' && !Array.isArray(payload.address)) {
    return payload.address
  }
  if (payload.vendor_address && typeof payload.vendor_address === 'object') {
    return payload.vendor_address
  }
  return payload
}

export function buildVendorAddressUpdatePayload(form, user = {}) {
  return {
    country: String(form?.country ?? getAddressField(user, 'country') ?? GHANA_COUNTRY).trim() || GHANA_COUNTRY,
    region: String(form?.region ?? '').trim(),
    city_or_town: String(form?.city_or_town ?? '').trim(),
    address: String(form?.address ?? '').trim(),
    gps_address: String(form?.gps_address ?? '').trim(),
    street_name: String(form?.street_name ?? '').trim(),
    landmark: String(form?.landmark ?? '').trim(),
  }
}

export function mapBusinessToForm(profile) {
  const phone = parsePhoneNumber(profile?.phone ?? profile?.phone_number)
  return {
    businessName: firstNonEmpty(profile?.business_name, profile?.businessName),
    storeName: firstNonEmpty(profile?.store_name, profile?.storeName),
    tradingName: firstNonEmpty(profile?.trading_name, profile?.tradingName),
    businessEmail: firstNonEmpty(profile?.email),
    phoneCountryCode: phone.countryCode,
    phoneLocal: phone.local,
  }
}

export function isPlainObjectEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function validatePersonalForm(form) {
  const errors = {}
  const name = form.name.trim()

  if (name.length < 3) {
    errors.name = 'Enter your full name (at least 3 characters).'
  }

  const localDigits = String(form.phoneLocal ?? '').replace(/\D/g, '')
  if (!localDigits) {
    errors.phoneLocal = 'Phone number is required.'
  } else if (form.phoneCountryCode === '+233') {
    const national = toNationalPhoneDigits(localDigits)
    if (national.length < 8 || national.length > 9) {
      errors.phoneLocal = 'Enter a valid Ghana mobile number, with or without the leading 0.'
    }
  }

  return errors
}

export function validateAddressForm(form) {
  const errors = {}

  if (!String(form.region ?? '').trim()) errors.region = 'Region is required.'
  if (!String(form.city_or_town ?? '').trim()) errors.city_or_town = 'Town or city is required.'
  if (!String(form.gps_address ?? '').trim()) {
    errors.gps_address = 'GPS address is required.'
  } else if (String(form.gps_address).trim().length < 3) {
    errors.gps_address = 'Enter a valid GPS address.'
  }

  const physicalAddress = String(form.address ?? '').trim()
  if (!physicalAddress) {
    errors.address = 'Address is required.'
  } else if (physicalAddress.length < 5) {
    errors.address = 'Address must be at least 5 characters.'
  } else if (physicalAddress.length > VENDOR_ADDRESS_MAX_LENGTH) {
    errors.address = `Address must not exceed ${VENDOR_ADDRESS_MAX_LENGTH} characters.`
  }

  if (!String(form.street_name ?? '').trim() || String(form.street_name).trim().length < 2) {
    errors.street_name = 'Street name is required.'
  }

  return errors
}

export function validateBusinessForm(form) {
  const errors = {}

  if (!String(form.businessName ?? '').trim()) errors.businessName = 'Business name is required.'
  if (!String(form.storeName ?? '').trim()) errors.storeName = 'Store name is required.'
  if (!String(form.tradingName ?? '').trim()) errors.tradingName = 'Trading name is required.'

  const localDigits = String(form.phoneLocal ?? '').replace(/\D/g, '')
  if (!localDigits) {
    errors.phoneLocal = 'Phone number is required.'
  } else if (form.phoneCountryCode === '+233') {
    const national = toNationalPhoneDigits(localDigits)
    if (national.length < 8 || national.length > 9) {
      errors.phoneLocal = 'Enter a valid Ghana mobile number, with or without the leading 0.'
    }
  }

  return errors
}

export function mapPasswordChangeFieldErrors(fieldErrors = {}) {
  const errors = {}
  const currentPassword = fieldErrors.current_password || fieldErrors.currentPassword
  const password = fieldErrors.password
  const passwordConfirmation = fieldErrors.password_confirmation || fieldErrors.passwordConfirmation

  if (currentPassword) errors.currentPassword = currentPassword
  if (password) errors.password = password
  if (passwordConfirmation) errors.passwordConfirmation = passwordConfirmation

  return errors
}

export function validateChangePasswordForm(form) {
  const errors = {}

  if (!form.currentPassword) errors.currentPassword = 'Current password is required.'
  if (!form.password) {
    errors.password = 'New password is required.'
  } else {
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
    else if (!/[a-z]/.test(form.password)) errors.password = 'Password must include a lowercase letter.'
    else if (!/[A-Z]/.test(form.password)) errors.password = 'Password must include an uppercase letter.'
    else if (!/[0-9]/.test(form.password)) errors.password = 'Password must include a number.'
  }

  if (!form.passwordConfirmation) {
    errors.passwordConfirmation = 'Please confirm your new password.'
  } else if (form.passwordConfirmation !== form.password) {
    errors.passwordConfirmation = 'Passwords must match.'
  }

  return errors
}
