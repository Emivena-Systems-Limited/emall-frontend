import { USER_TABS } from '../../constants/usersPermissions'

const TAB_LABELS = {
  [USER_TABS.ALL]: 'All Users',
  [USER_TABS.PENDING]: 'Pending Invitations',
  [USER_TABS.DEACTIVATED]: 'Deactivated Users',
}

export default function UserTabs({ activeTab, counts, onChange }) {
  return (
    <nav aria-label="User views" className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2">
        {Object.values(USER_TABS).map((tab) => {
          const isActive = activeTab === tab
          const count = counts[tab] ?? 0

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] ring-1 ring-slate-900'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
              }`}
            >
              {TAB_LABELS[tab]}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
              }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
