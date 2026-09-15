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

function resolveScrollRoot(scrollContainer) {
  if (scrollContainer) return scrollContainer
  return document.querySelector('[data-dashboard-scroll-panel]')
}

function fieldMatchesErrorPath(name, path) {
  return path === name || path.startsWith(`${name}.`)
}

function findErrorElement(flatErrors, scope) {
  const paths = Object.keys(flatErrors)
  if (paths.length === 0) return null

  const fieldEls = Array.from(scope.querySelectorAll('[data-field]'))

  for (const path of paths) {
    const exact = fieldEls.find((el) => el.getAttribute('data-field') === path)
    if (exact) return exact
  }

  let bestMatch = null
  for (const el of fieldEls) {
    const name = el.getAttribute('data-field')
    if (!name) continue
    if (!paths.some((path) => fieldMatchesErrorPath(name, path))) continue
    if (!bestMatch || name.length > bestMatch.name.length) {
      bestMatch = { el, name }
    }
  }

  return bestMatch?.el ?? null
}

function expandCollapsedAncestors(el) {
  const cards = []
  let node = el.parentElement
  while (node && node !== document.body) {
    if (node.matches?.('article, [data-variant-card]')) cards.push(node)
    node = node.parentElement
  }

  let expanded = false
  cards.reverse().forEach((card) => {
    const toggle = card.querySelector(':scope > button[aria-expanded="false"]')
    if (!toggle) return
    toggle.click()
    expanded = true
  })

  return expanded
}

function focusAndScrollTo(el, scrollContainer) {
  const panel = resolveScrollRoot(scrollContainer)

  if (panel) {
    const containerRect = panel.getBoundingClientRect()
    const targetRect = el.getBoundingClientRect()
    const offset = targetRect.top - containerRect.top + panel.scrollTop - 24
    panel.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const focusable = el.querySelector(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not([type="submit"])',
  )
  focusable?.focus({ preventScroll: true })
}

/**
 * Scrolls to the first form field that has a Formik error and focuses it.
 * Relies on `data-field` matching the Formik path (or a parent path).
 * Pass `scrollContainer` to scroll within a nested panel (e.g. a drawer).
 * Otherwise uses the dashboard scroll panel when present.
 */
export function scrollToFirstError(errors, scrollContainer = null) {
  const flat = flattenFormikErrors(errors)
  const scope = scrollContainer || document
  const first = findErrorElement(flat, scope)
  if (!first) return

  const didExpand = expandCollapsedAncestors(first)
  const run = () => focusAndScrollTo(first, scrollContainer)

  if (didExpand) {
    requestAnimationFrame(() => requestAnimationFrame(run))
    return
  }

  run()
}

/** Marks every field root that has a validation error as touched so errors render on submit. */
export function touchFieldsWithErrors(errors) {
  const flat = flattenFormikErrors(errors)
  return Object.keys(flat).reduce((acc, path) => {
    acc[path.split('.')[0]] = true
    return acc
  }, {})
}
