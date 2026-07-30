import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'

export function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim()) ?? ''
}

export function getProfile(user) {
  const firstName = firstValue(user?.first_name, user?.firstName)
  const lastName = firstValue(user?.last_name, user?.lastName)
  const fullName = firstValue(user?.full_name, user?.name, [firstName, lastName].filter(Boolean).join(' '), 'Customer')

  return {
    fullName,
    email: firstValue(user?.email, 'Not provided'),
    phone: firstValue(user?.phone_number, user?.phone, 'Not provided'),
    joined: firstValue(user?.date_joined, user?.joined_at, user?.created_at),
    photo: resolveBackendMediaUrl(firstValue(user?.profile_photo_url, user?.profile_picture, user?.avatar)),
  }
}

export function formatJoinedDate(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export { getDefaultShippingAddress, getShippingAddresses } from './userAddressHelpers'
