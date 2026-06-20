function unwrapApiEnvelope(body) {
  if (!body || typeof body !== 'object') return body

  if ('in_error' in body || 'status_code' in body || 'errors' in body) return body

  if (body.data && typeof body.data === 'object') {
    const inner = body.data
    if ('in_error' in inner || 'status_code' in inner || 'errors' in inner) return inner
  }

  return body
}

function normalizeCategoryRecord(record) {
  if (!record || typeof record !== 'object') return null

  return {
    id: record.id,
    slug: record.slug,
    name: record.category_name ?? record.name ?? '',
    isActive: record.is_active ?? true,
    image: record.image ?? record.image_url ?? record.icon ?? record.thumbnail ?? null,
  }
}

export function extractCategoryList(body) {
  const envelope = unwrapApiEnvelope(body)
  const list = Array.isArray(envelope?.data) ? envelope.data : []

  return list
    .map(normalizeCategoryRecord)
    .filter((category) => category && category.isActive && category.slug && category.name)
}
