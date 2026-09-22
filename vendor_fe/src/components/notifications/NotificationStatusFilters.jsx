import { Trash2 } from 'lucide-react'
import { NOTIFICATION_STATUS_FILTERS } from '../../constants/notifications'

export default function NotificationStatusFilters({
  active,
  onChange,
  onClearRead,
  canClearRead,
  clearLabel = 'Clear all read',
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Notification status"
        className="inline-flex rounded-xl bg-slate-100 p-1"
      >
        {NOTIFICATION_STATUS_FILTERS.map((filter) => {
          const isActive = active === filter.id

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              aria-pressed={isActive}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onClearRead}
        disabled={!canClearRead}
        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="size-3.5" strokeWidth={2} />
        {clearLabel}
      </button>
    </div>
  )
}
