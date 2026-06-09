const cediFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCedi(value) {
  return cediFormatter.format(value)
}

export default formatCedi
