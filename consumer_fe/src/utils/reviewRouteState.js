export function buildLeaveReviewLink({ item, orderId } = {}) {
  const record = item && typeof item === 'object' ? item : null
  const itemId = record?.id ?? record?.order_item_id ?? record?.orderItemId ?? ''
  const productName = record?.product_name ?? record?.name ?? record?.product?.name ?? ''
  const params = new URLSearchParams()

  if (productName) params.set('product', String(productName))
  if (orderId) params.set('order', String(orderId))
  if (itemId) params.set('item', String(itemId))

  const search = params.toString()
  const reviewOrderItem = record
    ? {
        ...record,
        order_number: record.order_number ?? record.order?.order_number ?? orderId,
      }
    : null

  return {
    to: {
      pathname: '/account/reviews/new',
      search: search ? `?${search}` : '',
    },
    state: reviewOrderItem
      ? {
          reviewOrderItem,
          orderId: orderId ?? null,
        }
      : undefined,
  }
}

export function readReviewOrderItem(location) {
  const item = location?.state?.reviewOrderItem
  return item && typeof item === 'object' ? item : null
}
