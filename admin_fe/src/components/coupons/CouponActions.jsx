import { Eye, Pause, Play, Pencil, Trash2 } from 'lucide-react'
import ActionTooltip from '../common/ActionTooltip'

export default function CouponActions({ coupon, onView, onEdit, onStatus, onRemove }) {
  const code = coupon.code || 'this coupon'
  const live = coupon.status === 'live'

  return (
    <div className="flex items-center justify-end gap-1">
      <ActionTooltip
        icon={Eye}
        label="View coupon"
        hint="Open the offer, store, and usage details"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onView?.(coupon)
          }}
          aria-label={`View ${code}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Eye className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>

      <ActionTooltip
        icon={Pencil}
        label="Edit coupon"
        hint="Change the code, discount, or limits"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onEdit?.(coupon)
          }}
          aria-label={`Edit ${code}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Pencil className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>

      <ActionTooltip
        icon={live ? Pause : Play}
        tone="brand"
        label={live ? 'Pause coupon' : 'Turn coupon on'}
        hint={live ? 'Stop accepting this code at checkout' : 'Let shoppers use this code again'}
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onStatus?.(coupon)
          }}
          aria-label={live ? `Pause ${code}` : `Turn on ${code}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {live
            ? <Pause className="size-3.5" strokeWidth={2} aria-hidden="true" />
            : <Play className="size-3.5" strokeWidth={2} aria-hidden="true" />}
        </button>
      </ActionTooltip>

      <ActionTooltip
        icon={Trash2}
        tone="danger"
        label="Remove coupon"
        hint="Delete this code from the marketplace"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove?.(coupon)
          }}
          aria-label={`Remove ${code}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>
    </div>
  )
}
