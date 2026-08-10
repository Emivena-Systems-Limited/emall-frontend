import { NavLink } from 'react-router'
import { PROFILE_SURFACE_CLASS, PROFILE_TABS } from '../../constants/profile'

export default function ProfileNavigation() {
  return (
    <nav
      aria-label="Profile sections"
      className={`${PROFILE_SURFACE_CLASS} overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      <div className="flex min-w-max gap-2">
        {PROFILE_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `inline-flex shrink-0 cursor-pointer items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)]'
                  : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
