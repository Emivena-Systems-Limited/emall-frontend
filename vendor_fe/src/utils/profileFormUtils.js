import {
  OVERALL_VERIFICATION_STATUS,
  VENDOR_ROLE_DESCRIPTIONS,
  VENDOR_ROLE_LABELS,
  VERIFICATION_ITEM_STATUS,
} from '../constants/profile'
import { maskAccountNumber } from './financeUtils'

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

export function maskBankAccountNumber(accountNumber) {
  return maskAccountNumber(accountNumber)
}

export function mapProfileToPersonalForm(profile) {
  const phone = parsePhoneNumber(profile?.phone)
  return {
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phoneCountryCode: phone.countryCode,
    phoneLocal: phone.local,
    dateOfBirth: profile?.dateOfBirth ?? '',
    location: profile?.location ?? '',
  }
}

export function mapBusinessToForm(business) {
  const phone = parsePhoneNumber(business?.businessPhone)
  return {
    businessName: business?.businessName ?? '',
    registrationNumber: business?.registrationNumber ?? '',
    businessType: business?.businessType ?? '',
    businessEmail: business?.businessEmail ?? '',
    businessPhoneCountryCode: phone.countryCode,
    businessPhoneLocal: phone.local,
    address: business?.address ?? '',
    city: business?.city ?? '',
    region: business?.region ?? '',
    country: business?.country ?? 'Ghana',
  }
}

export function mapBankToForm(bank) {
  return {
    bankName: bank?.bankName ?? '',
    accountName: bank?.accountName ?? '',
    accountNumber: bank?.accountNumber ?? '',
    branch: bank?.branch ?? '',
    accountType: bank?.accountType ?? 'Current',
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
  } else if (form.phoneCountryCode === '+233' && localDigits.length !== 9) {
    errors.phoneLocal = 'Enter a valid Ghana mobile number without the leading zero.'
  }

  if (form.dateOfBirth) {
    const dob = new Date(form.dateOfBirth)
    const now = new Date()
    if (Number.isNaN(dob.getTime()) || dob > now) {
      errors.dateOfBirth = 'Enter a valid date of birth.'
    }
  }

  if (!form.location.trim()) {
    errors.location = 'Location is required.'
  }

  return errors
}

export function validateBusinessForm(form) {
  const errors = {}

  if (!form.businessName.trim()) errors.businessName = 'Business name is required.'
  if (!form.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required.'
  if (!form.businessType.trim()) errors.businessType = 'Business type is required.'
  if (!form.businessEmail.trim()) errors.businessEmail = 'Business email is required.'
  if (!form.address.trim()) errors.address = 'Business address is required.'
  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.region.trim()) errors.region = 'Region is required.'

  const localDigits = String(form.businessPhoneLocal ?? '').replace(/\D/g, '')
  if (!localDigits) {
    errors.businessPhoneLocal = 'Business phone is required.'
  }

  return errors
}

export function validateBankForm(form) {
  const errors = {}

  if (!form.bankName.trim()) errors.bankName = 'Bank name is required.'
  if (!form.accountName.trim()) errors.accountName = 'Account name is required.'
  if (!form.accountNumber.trim()) {
    errors.accountNumber = 'Account number is required.'
  } else if (!/^\d{10,16}$/.test(form.accountNumber.replace(/\s/g, ''))) {
    errors.accountNumber = 'Enter a valid account number (10–16 digits).'
  }
  if (!form.branch.trim()) errors.branch = 'Branch is required.'
  if (!form.accountType.trim()) errors.accountType = 'Account type is required.'

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

// TODO: Confirm date-of-birth validation requirements with backend.
