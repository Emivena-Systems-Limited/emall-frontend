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
      descriptionHtml: source,
      description: stripHtmlToPlainText(source) || 'No description available for this product.',
    }
  }

  return {
    descriptionHtml: null,
    description: source,
  }
}
