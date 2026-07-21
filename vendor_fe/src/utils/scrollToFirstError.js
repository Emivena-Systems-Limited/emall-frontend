/**
 * Flattens nested Formik/Yup error objects into dot-notation paths.
 * e.g. { metadata: [{ key: 'Required' }] } → { 'metadata.0.key': 'Required' }
 */
export function flattenFormikErrors(errors, prefix = '') {
  if (!errors) return {}
  if (typeof errors === 'string') return prefix ? { [prefix]: errors } : {}

  return Object.entries(errors).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value == null) return acc

    if (typeof value === 'string') {
      acc[path] = value
      return acc
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        Object.assign(acc, flattenFormikErrors(item, `${path}.${index}`))
      })
      return acc
    }

    if (typeof value === 'object') {
      Object.assign(acc, flattenFormikErrors(value, path))
    }

    return acc
  }, {})
}

/**
 * Keeps only errors belonging to the given step field roots.
 */
export function collectStepErrors(errors, fields) {
  const flat = flattenFormikErrors(errors)
  return Object.fromEntries(
    Object.entries(flat).filter(([path]) =>
      fields.some((field) => path === field || path.startsWith(`${field}.`)),
    ),
  )
}

/**
 * Scrolls to the first form field (by DOM order) that has a Formik error.
 * Relies on `data-field="fieldName"` being on the wrapper element of every input.
 * Pass `scrollContainer` to scroll within a nested panel (e.g. a drawer) instead of the page.
 */
export function scrollToFirstError(errors, scrollContainer = null) {
  const flat = flattenFormikErrors(errors)
  const fieldEls = scrollContainer
    ? Array.from(scrollContainer.querySelectorAll('[data-field]'))
    : Array.from(document.querySelectorAll('[data-field]'))

  const first = fieldEls.find((el) => {
    const name = el.getAttribute('data-field')
    if (!name) return false
    return Object.keys(flat).some(
      (path) => path === name || path.startsWith(`${name}.`),
    )
  })
  if (!first) return

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const targetRect = first.getBoundingClientRect()
    const offset = targetRect.top - containerRect.top + scrollContainer.scrollTop - 24
    scrollContainer.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
  } else {
    first.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const focusable = first.querySelector(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not([type="submit"])',
  )
  focusable?.focus({ preventScroll: true })
}

/** Marks every field root that has a validation error as touched so errors render on submit. */
export function touchFieldsWithErrors(errors) {
  const flat = flattenFormikErrors(errors)
  return Object.keys(flat).reduce((acc, path) => {
    acc[path.split('.')[0]] = true
    return acc
  }, {})
}
