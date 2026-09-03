import { Banknote, CheckCircle2, Pause, Percent } from 'lucide-react'
import { getCouponStatusMeta, getCouponTypeMeta } from '../../constants/coupons'

const STATUS_ICONS = {
  'check-circle': CheckCircle2,
  pause: Pause,
}

const TYPE_ICONS = {
  percent: Percent,
  banknote: Banknote,
}

export default function CouponStatusBadge({ status }) {
  const meta = getCouponStatusMeta(status)
  const Icon = STATUS_ICONS[meta.icon] ?? Pause

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function CouponTypeBadge({ type }) {
  const meta = getCouponTypeMeta(type)
  const Icon = TYPE_ICONS[meta.icon] ?? Percent

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
