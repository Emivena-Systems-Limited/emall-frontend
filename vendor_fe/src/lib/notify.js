import { toast } from 'sonner'
import { formatApiErrorMessages } from '../utils/parseApiError'

export const notify = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  info: (message, options) => toast.info(message, options),
  warning: (message, options) => toast.warning(message, options),
  loading: (message, options) => toast.loading(message, options),
  promise: toast.promise,
  dismiss: toast.dismiss,
  fromError: (error, fallback) => {
    const message = formatApiErrorMessages(error, fallback)
    const lines = message.split('\n').filter(Boolean)

    if (lines.length > 1) {
      toast.error(lines[0], {
        description: lines.slice(1).join('\n'),
      })
      return
    }

    toast.error(message)
  },
}

export default notify
