import { ORDER_STATUSES } from '../../constants/orders'

export default function OrderStatusBadge({ status }) {
  const config = ORDER_STATUSES[status] ?? ORDER_STATUSES.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}
