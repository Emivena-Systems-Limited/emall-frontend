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

  return {
    itemCount: toCount(
      source.selected_items_count
      ?? source.item_count
      ?? source.items_count
      ?? source.total_items
      ?? source.quantity
      ?? source.items,
    ),
    subtotal: toAmount(
      source.subtotal
      ?? source.items_total
      ?? source.cart_subtotal
      ?? source.sub_total,
    ),
    tax: toAmount(source.tax ?? source.vat ?? source.total_tax) ?? 80,
    deliveryFee: toAmount(
      source.delivery_fee
      ?? source.deliveryFee
      ?? source.total_delivery_fee
      ?? source.shipping_fee,
    ) ?? 70,
    freeDelivery: toAmount(
      source.free_delivery
      ?? source.freeDelivery
      ?? source.delivery_discount
      ?? source.shipping_discount,
    ) ?? 70,
    couponDiscount: toAmount(
      source.coupon_discount
      ?? source.couponDiscount
      ?? source.discount
      ?? source.total_discount,
    ) ?? 0,
    total: toAmount(
      source.total
      ?? source.grand_total
      ?? source.order_total
      ?? source.cart_total,
    ),
  }
}

export function normalizePreviewTotals(preview) {
  const source = preview?.summary ?? preview?.totals ?? preview?.order_total ?? preview ?? {}
  return {
    tax: Number(source.tax ?? source.vat ?? 80),
    deliveryFee: Number(source.delivery_fee ?? source.deliveryFee ?? source.total_delivery_fee ?? 70),
    freeDelivery: Number(source.free_delivery ?? source.freeDelivery ?? 70),
    couponDiscount: Number(source.coupon_discount ?? source.couponDiscount ?? source.discount ?? 0),
  }
}

export function calculateOrderTotal(subtotal, totals = {}) {
  const tax = Number(totals.tax ?? 0)
  const deliveryFee = Number(totals.deliveryFee ?? 0)
  const freeDelivery = Number(totals.freeDelivery ?? 0)
  const couponDiscount = Number(totals.couponDiscount ?? 0)

  return subtotal + tax + deliveryFee - freeDelivery - couponDiscount
}
