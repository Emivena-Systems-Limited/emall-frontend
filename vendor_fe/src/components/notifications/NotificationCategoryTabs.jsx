import { NOTIFICATION_CATEGORY_TABS } from '../../constants/notifications'

export default function NotificationCategoryTabs({ active, counts, onChange }) {
  return (
    <nav aria-label="Notification categories" className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max flex-wrap gap-2">
        {NOTIFICATION_CATEGORY_TABS.map((tab) => {
          const isActive = active === tab.id
          const count = counts?.[tab.id]
          const showCount = Number.isFinite(count)

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-pressed={isActive}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)]'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
              }`}
            >
              {tab.label}
              {showCount && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                    isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
