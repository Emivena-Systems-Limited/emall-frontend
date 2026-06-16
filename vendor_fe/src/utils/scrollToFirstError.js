/**
 * Scrolls to the first form field (by DOM order) that has a Formik error.
 * Relies on `data-field="fieldName"` being on the wrapper element of every input.
 */
export function scrollToFirstError(errors) {
  const fieldEls = Array.from(document.querySelectorAll('[data-field]'))
  const first = fieldEls.find((el) => el.getAttribute('data-field') in errors)
  if (!first) return

  first.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const focusable = first.querySelector(
    'input:not([disabled]), select:not([disabled]), button:not([disabled]):not([type="submit"])',
  )
  focusable?.focus({ preventScroll: true })
}
