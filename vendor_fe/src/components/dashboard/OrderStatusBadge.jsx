import { ORDER_STATUSES } from '../../constants/ordersData'

export default function OrderStatusBadge({ status }) {
  const config = ORDER_STATUSES[status] ?? ORDER_STATUSES.pending

  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ${config.className}`}>
      {config.label}
    </span>
  )
}
