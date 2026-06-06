import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'

const tabs = [
  { id: 'phone', label: 'Phone Number', shortLabel: 'Phone', icon: Phone },
  { id: 'email', label: 'Email', shortLabel: 'Email', icon: Mail },
]

export default function AuthTabs({ activeTab, onChange }) {
  return (
    <div className="mb-5 max-[740px]:mb-4 sm:mb-6">
      <div className="relative rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/70 sm:rounded-2xl sm:p-1.5">
        <div className="relative grid grid-cols-2 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`relative z-10 flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors duration-200 sm:min-h-12 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm ${
                  isActive ? 'text-auth-primary' : 'text-auth-muted hover:text-slate-700'
                }`}
              >
                <Icon
                  className={`size-3.5 shrink-0 sm:size-4 ${
                    isActive ? 'text-auth-primary' : 'text-slate-400'
                  }`}
                />
                <span className="truncate sm:hidden">{tab.shortLabel}</span>
                <span className="hidden truncate sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18),0_2px_8px_-2px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 sm:rounded-xl"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
