import { isReservedKeyDetailKey } from './keyDetailsOrder'

export function mapKeyDetailsFromRecord(record) {
  const fromKeyDetails = Array.isArray(record?.key_details) ? record.key_details : []
  if (fromKeyDetails.length > 0) {
    return fromKeyDetails
      .map((item, index) => {
        if (typeof item === 'string') {
          const trimmed = item.trim()
          if (!trimmed) return null
          try {
            const parsed = JSON.parse(trimmed)
            if (parsed && typeof parsed === 'object') {
              return {
                key: String(parsed.property ?? parsed.key ?? '').trim(),
                value: parsed.value ?? '',
              }
            }
          } catch {
            return { key: trimmed, value: '' }
          }
        }

        return {
          key: String(item?.property ?? item?.key ?? '').trim(),
          value: item?.value ?? '',
        }
      })
      .filter((item) => item?.key)
  }

  return []
}

export function mapKeyDetailsToObject(record) {
  const result = {}
  mapKeyDetailsFromRecord(record).forEach((item) => {
    const key = item?.key?.trim()
    const value = String(item?.value ?? '').trim()
    if (key && value && !isReservedKeyDetailKey(key)) {
      result[key] = value
    }
  })
  return result
}
