function toAmount(value) {
  if (value === undefined || value === null || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

function toCount(value) {
  if (value === undefined || value === null || value === '') return null
  const count = Number(value)
  return Number.isFinite(count) ? count : null
}

export function normalizeCartSummary(summary) {
  const source = summary?.summary ?? summary?.totals ?? summary?.cart_summary ?? summary ?? {}

  // GET /cart/items summary: subtotal=list total, discount=payable total, total=savings.
  const listSubtotal = toAmount(
    source.items_total
    ?? source.cart_subtotal
    ?? source.sub_total
    ?? source.subtotal,
  )
  const payableTotal = toAmount(
    source.payable_subtotal
    ?? source.payable_total
    ?? source.discount,
  )
  const savingsTotal = toAmount(
    source.total_savings
    ?? source.savings
    ?? source.total,
  )

  return {
    itemCount: toCount(
      source.selected_items_count
      ?? source.item_count
      ?? source.items_count
      ?? source.total_items
      ?? source.quantity
      ?? source.items,
    ),
    listSubtotal,
    subtotal: payableTotal ?? listSubtotal,
    savings: savingsTotal,
    tax: 0,
    deliveryFee: 0,
    freeDelivery: 0,
    couponDiscount: toAmount(
      source.coupon_discount
      ?? source.couponDiscount,
    ) ?? 0,
    total: payableTotal ?? listSubtotal,
  }
}

export function normalizePreviewTotals(preview) {
  const source = preview?.summary ?? preview?.totals ?? preview?.order_total ?? preview ?? {}
  return {
    tax: 0,
    deliveryFee: 0,
    freeDelivery: 0,
    couponDiscount: Number(source.coupon_discount ?? source.couponDiscount ?? source.discount ?? 0),
  }
}

export function computeCartOrderTotals(items = []) {
  const selectedItems = items.filter((item) => item.selected !== false)

  return selectedItems.reduce(
    (totals, item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const listUnitPrice = Number(item.compareAt ?? item.price ?? 0)
      const hasSaleDiscount = item.compareAt != null && Number(item.compareAt) > Number(item.price)
      const payableUnitPrice = hasSaleDiscount ? Number(item.price) : listUnitPrice
      const listLineTotal = listUnitPrice * quantity
      const payableLineTotal = item.displaySubtotal ?? payableUnitPrice * quantity

      totals.itemCount += quantity
      totals.listSubtotal += listLineTotal
      totals.payableTotal += payableLineTotal
      totals.discountTotal += Math.max(0, listLineTotal - payableLineTotal)
      return totals
    },
    {
      itemCount: 0,
      listSubtotal: 0,
      payableTotal: 0,
      discountTotal: 0,
    },
  )
}

export function calculateOrderTotal(subtotal, totals = {}) {
  const tax = Number(totals.tax ?? 0)
  const deliveryFee = Number(totals.deliveryFee ?? 0)
  const freeDelivery = Number(totals.freeDelivery ?? 0)
  const couponDiscount = Number(totals.couponDiscount ?? 0)

  return subtotal + tax + deliveryFee - freeDelivery - couponDiscount
}
