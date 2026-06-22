const FIELD_NAME_PATTERN = /^The (.+?) field\b/i

export function unwrapApiEnvelope(body) {
  if (!body || typeof body !== 'object') return body

  if ('in_error' in body || 'status_code' in body || 'errors' in body) {
    return body
  }

  if (body.data && typeof body.data === 'object') {
    const inner = body.data
    if ('in_error' in inner || 'status_code' in inner || 'errors' in inner) {
      return inner
    }
  }

  return body
}

export function normalizeErrorsList(errors) {
  if (!errors) return []
  if (Array.isArray(errors)) return errors.filter(Boolean)
  if (typeof errors === 'object') {
    return Object.values(errors).flat().filter(Boolean)
  }
  return []
}

export function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}

  return Object.entries(errors).reduce((acc, [field, messages]) => {
    const list = Array.isArray(messages) ? messages : [messages]
    if (list[0]) acc[field] = list[0]
    return acc
  }, {})
}

function inferFieldFromMessage(message) {
  const match = String(message).match(FIELD_NAME_PATTERN)
  if (!match) return null

  return match[1].trim().replace(/\s+/g, '_').toLowerCase()
}

export function buildFieldErrors(errors) {
  const fieldErrors = normalizeFieldErrors(errors)
  if (Object.keys(fieldErrors).length > 0) return fieldErrors

  return normalizeErrorsList(errors).reduce((acc, message) => {
    const field = inferFieldFromMessage(message)
    if (field && !acc[field]) acc[field] = message
    return acc
  }, {})
}

export function parseApiError(error, fallback = 'Something went wrong') {
  const responseData = error?.response?.data
  const envelope = unwrapApiEnvelope(responseData) ?? {}
  const errors =
    envelope.errors ??
    responseData?.errors ??
    error?.validationErrors
  const fieldErrors =
    Object.keys(error?.fieldErrors ?? {}).length > 0
      ? error.fieldErrors
      : buildFieldErrors(errors)
  const errorList = normalizeErrorsList(errors)
  const message =
    envelope.message ||
    responseData?.message ||
    error?.message ||
    fallback

  return {
    message,
    errors: errorList.length > 0 ? errorList : [message],
    fieldErrors,
    statusCode: envelope.status_code ?? error?.response?.status ?? null,
  }
}

export function formatApiErrorMessages(error, fallback = 'Something went wrong') {
  const parsed = parseApiError(error, fallback)
  const messages = parsed.errors.filter(
    (entry) => entry && entry !== parsed.message,
  )

  if (messages.length > 0) {
    return messages.join('\n')
  }

  return parsed.message || fallback
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  return formatApiErrorMessages(error, fallback)
}
