/**
 * A vendor is considered verified when at least one of email or phone is verified.
 */
export function isVendorVerified(vendor) {
  if (!vendor) return false
  return Boolean(vendor.email_verified_at || vendor.phone_verified_at)
}

export function isVendorPendingApproval(vendor) {
  if (!vendor) return false
  return vendor.status === 'pending_approval'
}

export function getVendorAccountLabel(vendor) {
  return vendor?.business_name ?? vendor?.store_name ?? vendor?.trading_name ?? 'Your store'
}
