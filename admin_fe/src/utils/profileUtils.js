import {
  ADMIN_ACCOUNT_STATUS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
} from '../constants/profile'
import { isValidAdminPhone, toBackendPhoneNumber, toPhoneInputValue } from './phoneUtils'

export { formatPhoneDisplay } from './phoneUtils'

export function composeFullName(firstName, lastName) {
  return [firstName, lastName]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

export function splitName(user) {
  const firstName = String(user?.first_name ?? '').trim()
  const lastName = String(user?.last_name ?? '').trim()
  if (firstName || lastName) {
    return { first_name: firstName, last_name: lastName }
  }

  const parts = String(user?.full_name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first_name: '', last_name: '' }
  if (parts.length === 1) return { first_name: parts[0], last_name: '' }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  }
}

export function getProfileDisplayName(user) {
  return composeFullName(user?.first_name, user?.last_name) || user?.full_name?.trim() || 'Operator'
}

export function getProfileInitials(user) {
  const { first_name: firstName, last_name: lastName } = splitName(user)
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  const name = getProfileDisplayName(user)
  return (name[0] ?? user?.email?.[0] ?? 'A').toUpperCase()
}

export function getAccountStatusMeta(status) {
  return ADMIN_ACCOUNT_STATUS[status] ?? {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    badgeClass: 'bg-slate-50 text-slate-600 ring-slate-100',
    dotClass: 'bg-slate-400',
  }
}

export function formatProfileDate(value, options = {}) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: options.monthYear ? undefined : 'numeric',
      month: 'short',
      year: 'numeric',
      hour: options.withTime ? '2-digit' : undefined,
      minute: options.withTime ? '2-digit' : undefined,
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

export function mapUserToProfileForm(user) {
  const { first_name: firstName, last_name: lastName } = splitName(user)
  return {
    first_name: firstName,
    last_name: lastName,
    phone_number: toPhoneInputValue(user?.phone_number),
    email: user?.email ?? '',
  }
}

export function mapUserToNotificationPreferences(user) {
  const current = user?.notification_preferences ?? {}
  return NOTIFICATION_PREFERENCE_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(current[key] ?? DEFAULT_NOTIFICATION_PREFERENCES[key])
    return acc
  }, {})
}

export function hydrateAdminProfile(user) {
  if (!user || typeof user !== 'object') return user
  const merged = {
    ...user,
    notification_preferences: mapUserToNotificationPreferences(user),
  }
  const { first_name: firstName, last_name: lastName } = splitName(merged)
  return {
    ...merged,
    first_name: firstName,
    last_name: lastName,
    full_name: composeFullName(firstName, lastName) || merged.full_name,
  }
}

export function buildProfileUpdatePayload(form) {
  const firstName = String(form?.first_name ?? '').trim()
  const lastName = String(form?.last_name ?? '').trim()
  return {
    first_name: firstName,
    last_name: lastName,
    phone_number: toBackendPhoneNumber(form?.phone_number),
  }
}

export function buildPasswordChangePayload(form) {
  return {
    current_password: String(form?.current_password ?? ''),
    password_confirmation: String(form?.password_confirmation ?? ''),
    password: String(form?.password ?? ''),
  }
}

export function buildNotificationPreferencesPayload(preferences) {
  return NOTIFICATION_PREFERENCE_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(preferences?.[key])
    return acc
  }, {})
}

export function validateProfileForm(form) {
  const errors = {}
  const firstName = String(form?.first_name ?? '').trim()
  const lastName = String(form?.last_name ?? '').trim()
  const phone = String(form?.phone_number ?? '').trim()

  if (firstName.length < 2) {
    errors.first_name = 'Enter a first name (at least 2 characters).'
  }

  if (lastName.length < 2) {
    errors.last_name = 'Enter a last name (at least 2 characters).'
  }

  if (!phone) {
    errors.phone_number = 'Phone number is required.'
  } else if (!isValidAdminPhone(phone)) {
    errors.phone_number = 'Enter a valid phone number, with or without country code.'
  }

  return errors
}

export function validatePasswordForm(form) {
  const errors = {}
  const current = String(form?.current_password ?? '')
  const password = String(form?.password ?? '')
  const confirmation = String(form?.password_confirmation ?? '')

  if (!current) errors.current_password = 'Current password is required.'

  if (!password) {
    errors.password = 'New password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must include a lowercase letter.'
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must include an uppercase letter.'
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must include a number.'
  } else if (current && password === current) {
    errors.password = 'New password must be different from the current password.'
  }

  if (!confirmation) {
    errors.password_confirmation = 'Please confirm your new password.'
  } else if (confirmation !== password) {
    errors.password_confirmation = 'Passwords must match.'
  }

  return errors
}

export function isPlainObjectEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}
