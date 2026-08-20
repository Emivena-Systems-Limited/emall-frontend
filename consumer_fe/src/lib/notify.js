import { toast } from 'sonner'

function isOtpExpiredMessage(message) {
  return /otp.*not available|not available.*otp|otp.*expired|expired.*otp|verification code.*expired/i.test(message)
}

function isOtpDuplicateMessage(message) {
  if (/orders_status_check|relation "orders"|insert into "?orders"?/i.test(message)) {
    return false
  }

  return /otp_verifications|verification code is already being processed|otp.*already (active|pending|exists)/i.test(message)
}

function isInternalDatabaseMessage(message) {
  return /SQLSTATE|duplicate key value|check constraint|violates check|insert into|Connection:/i.test(message)
}

const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error
  const responseData = error?.response?.data
  const nestedData = responseData?.data

  const cleanMessage = (message) => {
    if (!message) return ''

    if (isOtpExpiredMessage(message)) {
      return 'Your OTP has expired. Please request a new one.'
    }

    if (isOtpDuplicateMessage(message)) {
      return 'A verification code is already being processed. Please wait a moment, then request a new code.'
    }

    if (isInternalDatabaseMessage(message)) {
      return fallback
    }

    return message
  }

  if (Array.isArray(nestedData?.errors) && nestedData.errors.length > 0) {
    return cleanMessage(nestedData.errors.join(' '))
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return cleanMessage(responseData.errors.join(' '))
  }

  if (responseData?.message) return cleanMessage(responseData.message)
  if (nestedData?.message) return cleanMessage(nestedData.message)

  const status = error?.response?.status
  if (
    !status &&
    (/network error|failed to fetch/i.test(error?.message ?? '') ||
      error?.code === 'ERR_NETWORK' ||
      error?.code === 'ECONNABORTED')
  ) {
    return 'Connection issue. Please try again.'
  }

  if (error?.message) return cleanMessage(error.message)
  return fallback
}

export const notify = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  info: (message, options) => toast.info(message, options),
  warning: (message, options) => toast.warning(message, options),
  loading: (message, options) => toast.loading(message, options),
  promise: toast.promise,
  dismiss: toast.dismiss,
  fromError: (error, fallback) => toast.error(getErrorMessage(error, fallback)),
}

export default notify
