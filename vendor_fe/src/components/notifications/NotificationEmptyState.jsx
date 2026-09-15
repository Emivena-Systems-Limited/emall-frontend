import { Bell, Bug } from 'lucide-react'
import { isLocalEnvironment } from '../../utils/environment'

export default function NotificationEmptyState({
  filtered = false,
  onLoadDummy,
  canLoadDummy = false,
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
      <div className="relative mb-6 flex size-28 items-center justify-center">
        <span className="absolute size-28 rounded-full bg-brand-light" />
        <span className="absolute size-20 rounded-full bg-white ring-1 ring-brand-muted" />
        <span className="relative flex size-16 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand-muted">
          <Bell className="size-7" strokeWidth={1.6} />
        </span>
      </div>

      <h2 className="text-lg font-bold text-slate-950">
        {filtered ? 'Nothing in this view' : 'You\'re all caught up!'}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {filtered
          ? 'There are no notifications for this category or status. Try another filter, or check back later.'
          : 'There are no new notifications at the moment.'}
      </p>

      {canLoadDummy && isLocalEnvironment() && !filtered && (
        <button
          type="button"
          onClick={onLoadDummy}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-200/60 transition-colors hover:bg-amber-100"
        >
          <Bug className="size-4" strokeWidth={2} />
          Load dummy data
        </button>
      )}
    </div>
  )
}
