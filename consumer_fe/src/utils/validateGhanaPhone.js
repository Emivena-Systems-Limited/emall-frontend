const VALID_GHANA_PREFIXES = new Set([
  '20', '23', '24', '25', '26', '27', '28',
  '50', '54', '55', '56', '57', '59',
])

export function stripPhoneDigits(value) {
  return value.replace(/\D/g, '')
}

export function normalizeGhanaPhone(value) {
  const digits = stripPhoneDigits(value)

  if (digits.startsWith('233')) {
    return digits.slice(3, 12)
  }

  if (digits.startsWith('0')) {
    return digits.slice(1, 10)
  }

  return digits.slice(0, 9)
}

export function formatGhanaPhoneDisplay(localDigits) {
  if (localDigits.length <= 3) return localDigits
  if (localDigits.length <= 6) {
    return `${localDigits.slice(0, 3)} ${localDigits.slice(3)}`
  }
  return `${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6)}`
}

export function validateGhanaPhone(value) {
  const local = normalizeGhanaPhone(value)

  if (!local) {
    return { valid: false, message: 'Phone number is required' }
  }

  if (local.length < 9) {
    return { valid: false, message: 'Enter the full 9-digit mobile number' }
  }

  if (local.length > 9) {
    return { valid: false, message: 'Phone number is too long' }
  }

  if (!/^[25]/.test(local)) {
    return { valid: false, message: 'Ghana mobile numbers start with 2 or 5' }
  }

  const prefix = local.slice(0, 2)
  if (!VALID_GHANA_PREFIXES.has(prefix)) {
    return {
      valid: false,
      message: 'Enter a valid MTN, Telecel, or AT mobile number',
    }
  }

  return {
    valid: true,
    local,
    e164: `+233${local}`,
    display: `+233 ${formatGhanaPhoneDisplay(local)}`,
  }
}

export function validateEmail(value) {
  const email = value.trim()

  if (!email) {
    return { valid: false, message: 'Email address is required' }
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
  if (!pattern.test(email)) {
    return { valid: false, message: 'Enter a valid email address' }
  }

  return { valid: true, email }
}
