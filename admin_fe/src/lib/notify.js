import { toast } from 'sonner'

function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
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
