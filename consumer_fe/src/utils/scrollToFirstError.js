const ERROR_FIELD_TARGETS = {
  cityCustom: 'city',
  districtCustom: 'district',
}

export function scrollToFirstError(errors, fieldOrder) {
  const firstKey = fieldOrder.find((key) => errors[key])
  if (!firstKey) return

  const target = ERROR_FIELD_TARGETS[firstKey] ?? firstKey

  requestAnimationFrame(() => {
    const element = document.querySelector(`[data-field="${target}"]`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
