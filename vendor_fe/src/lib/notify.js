import { toast } from 'sonner'
import { getApiErrorMessage } from '../utils/parseApiError'

export const notify = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  info: (message, options) => toast.info(message, options),
  warning: (message, options) => toast.warning(message, options),
  loading: (message, options) => toast.loading(message, options),
  promise: toast.promise,
  dismiss: toast.dismiss,
  fromError: (error, fallback) => toast.error(getApiErrorMessage(error, fallback)),
}

export default notify
