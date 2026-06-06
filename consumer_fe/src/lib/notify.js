import { toast } from 'sonner'

const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
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
