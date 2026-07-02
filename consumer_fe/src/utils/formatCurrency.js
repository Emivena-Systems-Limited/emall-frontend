const cediFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCedi(value) {
  return cediFormatter.format(value)
}

export function formatProductPriceParts(value) {
  const num = Number(value)
  if (Number.isNaN(num)) {
    return { currency: 'GHS', amount: '0' }
  }

  const hasFraction = num % 1 !== 0
  const parts = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).formatToParts(num)

  const currency = parts.find((part) => part.type === 'currency')?.value?.trim() || 'GHS'
  const amount = parts
    .filter((part) => ['integer', 'group', 'decimal', 'fraction'].includes(part.type))
    .map((part) => part.value)
    .join('')

  return { currency, amount }
}

export function formatProductListPrice(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return 'GHS0'

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace(/\s/g, '')
}

export default formatCedi
