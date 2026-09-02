const GHS = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  maximumFractionDigits: 0,
})

const GHS_COMPACT = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCedi(value) {
  return GHS.format(Number(value) || 0)
}

export function formatCediCompact(value) {
  return GHS_COMPACT.format(Number(value) || 0)
}

export function formatCount(value) {
  return new Intl.NumberFormat('en-GH').format(Number(value) || 0)
}

export function formatPercent(value, { signed = false } = {}) {
  const number = Number(value) || 0
  const prefix = signed && number > 0 ? '+' : ''
  return `${prefix}${number.toFixed(1)}%`
}
