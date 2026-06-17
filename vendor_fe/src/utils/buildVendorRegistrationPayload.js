import { GHANA_COUNTRY } from '../constants/ghanaRegions'

function normalizeGhanaPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`
  if (digits.startsWith('233')) return digits
  return digits
}

export function buildVendorRegistrationPayload(values) {
  return {
    business_name: values.business_name.trim(),
    trading_name: values.trading_name.trim(),
    store_name: values.trading_name.trim(),
    admin_full_name: values.admin_full_name.trim(),
    email: values.email.trim(),
    password: values.password,
    password_confirmation: values.password_confirmation,
    phone_number: normalizeGhanaPhone(values.phone_number),
    country: values.country,
    region: values.region,
    district: values.district.trim(),
    city_or_town: values.city_or_town.trim(),
    gps_address: values.gps_address.trim(),
    address: values.address.trim(),
    street_name: values.street_name.trim(),
    landmark: values.landmark?.trim() || null,
    business_registration_number: values.business_registration_number?.trim() || null,
    tin_number: values.tin_number?.trim() || null,
    // registration_certificate: values.registration_certificate?.data ?? null, // Hidden until backend file storage is ready
    confirm_accurate: values.confirm_accurate,
    agree_terms: values.agree_terms,
  }
}
