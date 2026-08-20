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

  const listSubtotal = toAmount(
    source.items_total
    ?? source.list_subtotal
    ?? source.subtotal
    ?? source.sub_total,
  )
  const payableTotal = toAmount(
    source.payable_subtotal
    ?? source.payable_total
    ?? source.grand_total,
  )
  const discountField = toAmount(source.discount ?? source.discount_amount)
  const savingsTotal = toAmount(
    source.total_savings
    ?? source.savings
    ?? source.discount_total,
  )

  // Backend may expose payable total in `discount` (same quirk as cart summary).
  let resolvedPayable = payableTotal
  let resolvedDiscount = savingsTotal

  if (resolvedPayable == null && discountField != null && listSubtotal != null && discountField > 0) {
    if (discountField < listSubtotal) {
      resolvedPayable = discountField
      resolvedDiscount = listSubtotal - discountField
    } else {
      resolvedDiscount = discountField
      resolvedPayable = Math.max(0, listSubtotal - discountField)
    }
  }

  if (resolvedPayable == null && listSubtotal != null && resolvedDiscount != null) {
    resolvedPayable = Math.max(0, listSubtotal - resolvedDiscount)
  }

  if (resolvedDiscount == null && listSubtotal != null && resolvedPayable != null && resolvedPayable > 0) {
    resolvedDiscount = Math.max(0, listSubtotal - resolvedPayable)
  }

  resolvedDiscount = resolvedDiscount != null && resolvedDiscount > 0 ? resolvedDiscount : 0
  resolvedPayable = resolvedPayable ?? listSubtotal

  return {
    itemCount: toCount(source.items_count ?? source.item_count ?? source.selected_items_count),
    listSubtotal,
    subtotal: listSubtotal ?? resolvedPayable,
    payableTotal: resolvedPayable,
    discount: resolvedDiscount,
    total: resolvedPayable,
    currency: source.currency ?? 'GHS',
    tax: toAmount(source.tax ?? source.tax_amount) ?? 0,
    deliveryFee: toAmount(source.delivery_fee ?? source.deliveryFee) ?? 0,
    freeDelivery: toAmount(source.free_delivery ?? source.freeDelivery) ?? 0,
    couponDiscount: toAmount(source.coupon_discount ?? source.couponDiscount) ?? 0,
  }
}

/**
 * Checkout success / order payloads:
 * subtotal = list price, total_discount_amount = savings, grand_total = amount paid.
 */
export function normalizeOrderMoneyTotals(record) {
  const listSubtotal = toAmount(record?.subtotal ?? record?.list_subtotal) ?? 0
  const discountTotal = toAmount(
    record?.total_discount_amount
    ?? record?.discount_total
    ?? record?.discount_amount,
  ) ?? 0
  const deliveryFee = toAmount(record?.delivery_fee) ?? 0
  const taxTotal = toAmount(record?.tax_total ?? record?.tax) ?? 0
  const namedGrand = toAmount(record?.grand_total ?? record?.total)
  const derivedPayable = Math.max(0, listSubtotal - discountTotal + deliveryFee + taxTotal)
  const grandLooksUndiscounted = namedGrand != null && discountTotal > 0 && namedGrand >= listSubtotal

  return {
    listSubtotal,
    discountTotal,
    payableTotal: grandLooksUndiscounted || namedGrand == null ? derivedPayable : namedGrand,
    deliveryFee,
    taxTotal,
  }
}

export function computeCartOrderTotals(items = []) {
  const selectedItems = items.filter((item) => item.selected !== false)

  return selectedItems.reduce(
    (totals, item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const salePrice = Number(item.price ?? 0)
      const originalPrice = item.compareAt != null && item.compareAt !== ''
        ? Number(item.compareAt)
        : null
      const hasSaleDiscount = (
        originalPrice != null
        && originalPrice > 0
        && salePrice > 0
        && originalPrice > salePrice
      )
      const listUnitPrice = hasSaleDiscount ? originalPrice : salePrice
      const payableUnitPrice = hasSaleDiscount ? salePrice : listUnitPrice
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
