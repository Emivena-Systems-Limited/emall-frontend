/**
 * A vendor is considered verified when at least one of email or phone is verified.
 */
export function isVendorVerified(vendor) {
  if (!vendor) return false
  return Boolean(vendor.email_verified_at || vendor.phone_verified_at)
}
