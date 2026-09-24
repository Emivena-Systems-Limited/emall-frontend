import { CheckCircle2, Clock, Eye, EyeOff, XCircle } from 'lucide-react'
import { getProductApprovalMeta } from '../../constants/adminProducts'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  'x-circle': XCircle,
}

export function ProductVisibilityBadge({ isActive, approvalStatus }) {
  const visible = approvalStatus !== 'rejected' && isActive !== false

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
        visible
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-slate-50 text-slate-500 ring-slate-200'
      }`}
    >
      {visible ? (
        <Eye className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <EyeOff className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      )}
      {visible ? 'Visible to shoppers' : 'Hidden from shoppers'}
    </span>
  )
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
      {isActive != null && (
        <ProductVisibilityBadge isActive={isActive} approvalStatus={status} />
      )}
    </span>
  )
}
