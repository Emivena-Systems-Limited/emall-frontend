const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i

export function hasHtmlDescription(value) {
  const text = String(value ?? '').trim()
  return Boolean(text && HTML_TAG_PATTERN.test(text))
}

export function stripHtmlToPlainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Normalize API/editor HTML before TipTap ingests it. */
export function prepareDescriptionHtmlForEditor(html = '') {
  const source = String(html ?? '').trim()
  if (!source) return ''

  if (typeof document === 'undefined') return source

  const decoded = (() => {
    if (!source.includes('&lt;') && !source.includes('&gt;') && !source.includes('&amp;')) {
      return source
    }
    const textarea = document.createElement('textarea')
    textarea.innerHTML = source
    return textarea.value.trim() || source
  })()

  return decoded.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>\s*$/i, '')
}

/** Split API/editor HTML from a plain-text fallback for product detail views. */
export function normalizeProductDescription(raw) {
  const source = String(raw ?? '').trim()

  if (!source) {
    return {
      descriptionHtml: null,
      description: 'No description available for this product.',
    }
  }

  if (hasHtmlDescription(source)) {
    return {
      descriptionHtml: prepareDescriptionHtmlForEditor(source) || source,
      description: stripHtmlToPlainText(source) || 'No description available for this product.',
    }
  }

  return {
    descriptionHtml: null,
    description: source,
  }
}
