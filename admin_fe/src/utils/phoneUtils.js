import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

export const DEFAULT_PHONE_COUNTRY = 'GH'

export function toPhoneInputValue(stored, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const raw = String(stored ?? '').trim()
  if (!raw) return ''

  if (raw.startsWith('+')) {
    return parsePhoneNumberFromString(raw)?.number ?? raw
  }

  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  const fromCountryCode = parsePhoneNumberFromString(`+${digits}`)
  if (fromCountryCode?.isValid()) return fromCountryCode.number

  const fromLocal = parsePhoneNumberFromString(digits, defaultCountry)
    ?? parsePhoneNumberFromString(raw, defaultCountry)
  return fromLocal?.number ?? ''
}

export function toBackendPhoneNumber(value, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const e164 = toPhoneInputValue(value, defaultCountry)
  if (!e164) return ''
  return e164.replace(/^\+/, '')
}

export function isValidAdminPhone(value, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const e164 = toPhoneInputValue(value, defaultCountry)
  return Boolean(e164) && isValidPhoneNumber(e164)
}

export function formatPhoneDisplay(value, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const e164 = toPhoneInputValue(value, defaultCountry)
  if (!e164) return '—'
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164
}
