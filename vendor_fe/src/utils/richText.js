export function stripHtml(html = '') {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
}

export function isRichTextEmpty(html = '') {
  return stripHtml(html).length === 0
}
