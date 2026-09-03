export const LOW_STOCK_THRESHOLD = 10

export function isLowStock(stock) {
  return stock <= LOW_STOCK_THRESHOLD
}
