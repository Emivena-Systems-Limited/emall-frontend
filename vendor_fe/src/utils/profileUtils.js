import { VENDOR_ACCOUNT_STATUS, VENDOR_ROLE_LABELS } from '../constants/profile'
import { getVendorAccountLabel } from './vendorAuth'

export function getProfileDisplayName(user) {
  const name = user?.admin_full_name?.trim()
  if (name) return name
  return getVendorAccountLabel(user)
}

export function getProfileInitials(user) {
  const name = getProfileDisplayName(user)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
  }
  return (name[0] ?? user?.email?.[0] ?? 'V').toUpperCase()
}

export function getProfileRoleLabel(user) {
  const raw = user?.vendor_role ?? user?.role ?? ''
  const key = String(raw).toLowerCase()
  return VENDOR_ROLE_LABELS[key] ?? raw ?? 'Store Admin'
}

export function getAccountStatusMeta(status) {
  return VENDOR_ACCOUNT_STATUS[status] ?? {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    badgeClass: 'bg-slate-50 text-slate-600 ring-slate-100',
    dotClass: 'bg-slate-400',
  }
}

export function formatProfileDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

export function mapUserToProfileForm(user) {
  return {
    admin_full_name: user?.admin_full_name ?? '',
    phone_number: user?.phone_number ?? '',
    email: user?.email ?? '',
  }
}

export function isProfileComplete(user) {
  return Boolean(
    user?.admin_full_name?.trim()
    && user?.phone_number?.trim()
    && user?.email?.trim(),
  )
}
