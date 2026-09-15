import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import DevDataToggle from '../../components/dev/DevDataToggle'
import { NOTIFICATION_PREFERENCE_ROWS } from '../../constants/notifications'
import { useVendorNotifications } from '../../components/notifications/VendorNotificationsProvider'
import notify from '../../lib/notify'
import { clonePreferences } from '../../utils/notificationUtils'

function PreferenceToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-brand' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function NotificationSettings() {
  const { preferences, savePreferences, devDataEnabled, setDevDataEnabled } = useVendorNotifications()
  const [draft, setDraft] = useState(() => clonePreferences(preferences))

  useEffect(() => {
    setDraft(clonePreferences(preferences))
  }, [preferences])

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(preferences),
    [draft, preferences],
  )

  const setChannel = (category, channel, value) => {
    setDraft((current) => ({
      ...current,
      [category]: { ...current[category], [channel]: value },
    }))
  }

  const handleSave = () => {
    savePreferences(draft)
    notify.success('Notification preferences saved.')
  }

  return (
    <DashboardLayout pageTitle="Notification Settings">
      <div className="page-enter mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            to="/notifications"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to notifications
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Notification preferences</h1>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
                Choose which alerts appear in your dashboard and which ones also go to email.
              </p>
            </div>
            <DevDataToggle
              enabled={devDataEnabled}
              onChange={setDevDataEnabled}
              ariaLabel="Toggle dummy notification data"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="hidden grid-cols-[1fr_88px_88px] gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
            <span>Category</span>
            <span className="text-center">In-app</span>
            <span className="text-center">Email</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {NOTIFICATION_PREFERENCE_ROWS.map((row) => {
              const value = draft[row.id] ?? { inApp: true, email: false }

              return (
                <li key={row.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_88px_88px] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{row.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-center">
                    <span className="text-xs font-semibold text-slate-500 sm:hidden">In-app</span>
                    <PreferenceToggle
                      checked={value.inApp}
                      onChange={(next) => setChannel(row.id, 'inApp', next)}
                      label={`${row.label} in-app alerts`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-center">
                    <span className="text-xs font-semibold text-slate-500 sm:hidden">Email</span>
                    <PreferenceToggle
                      checked={value.email}
                      onChange={(next) => setChannel(row.id, 'email', next)}
                      label={`${row.label} email alerts`}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex justify-end border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="size-4" />
              Save preferences
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
