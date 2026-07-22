/** Nearest whole % for storefront badges; never returns 0 when a discount exists. */
export function calculateDisplayDiscountPercent(listPrice, salePrice) {
  const list = Number(listPrice)
  const sale = Number(salePrice)
  if (!Number.isFinite(list) || !Number.isFinite(sale) || list <= 0 || sale <= 0 || sale >= list) {
    return null
  }

  const rounded = Math.round(((list - sale) / list) * 100)
  if (rounded <= 0) return 1
  return rounded
}
