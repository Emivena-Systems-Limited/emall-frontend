import { toast } from 'sonner'

const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error
  const responseData = error?.response?.data
  const nestedData = responseData?.data
  const status = error?.response?.status

  const cleanMessage = (message) => {
    if (!message) return ''
    if (/otp.*not available|not available.*otp|otp.*expired|expired.*otp|verification code.*expired/i.test(message)) {
      return 'Your OTP has expired. Please request a new one.'
    }

    if (/SQLSTATE|duplicate key value|constraint|insert into|Connection:/i.test(message)) {
      if (status >= 500) {
        return 'A verification code is already being processed. Please wait a moment, then request a new code.'
      }

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
