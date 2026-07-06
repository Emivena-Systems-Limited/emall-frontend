export function formatProductCount(count = 0) {
  if (count >= 1000) {
    const value = count / 1000
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1)
    return `${formatted}k`
  }

  return new Intl.NumberFormat('en-US').format(count)
}
