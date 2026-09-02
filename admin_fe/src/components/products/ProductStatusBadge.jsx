import { CheckCircle2, Clock, EyeOff, XCircle } from 'lucide-react'
import { getProductApprovalMeta } from '../../constants/adminProducts'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  'x-circle': XCircle,
}

export default function ProductStatusBadge({ status, isActive }) {
  const meta = getProductApprovalMeta(status)
  const Icon = ICONS[meta.icon] ?? Clock

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
        <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        {meta.label}
      </span>
      {isActive === false && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
          <EyeOff className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          Hidden
        </span>
      )}
    </span>
  )
}
