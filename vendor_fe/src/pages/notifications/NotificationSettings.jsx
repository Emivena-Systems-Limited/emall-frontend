import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, ArrowLeft, Check, RefreshCw } from 'lucide-react'
import { SkeletonBlock } from '../../components/common/skeleton'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import DevDataToggle from '../../components/dev/DevDataToggle'
import { useVendorNotifications } from '../../components/notifications/VendorNotificationsProvider'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_ROWS,
} from '../../constants/notifications'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferenceMutation,
} from '../../hooks/useNotifications'
import { parseApiError } from '../../utils/parseApiError'

function PreferenceToggle({ checked, onChange, label, pending = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={pending}
      disabled={pending}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-wait ${
        checked ? 'bg-brand' : 'bg-slate-300'
      } ${pending ? 'opacity-70' : ''}`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function PreferencesSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading notification preferences">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_88px_88px] sm:items-center">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-56" />
          </div>
          <SkeletonBlock className="mx-auto h-5 w-9 rounded-full" />
          <SkeletonBlock className="mx-auto h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function NotificationSettings() {
  const { preferences: localPreferences, savePreferences, devDataEnabled, setDevDataEnabled } = useVendorNotifications()
  const preferencesQuery = useNotificationPreferences({ enabled: !devDataEnabled })
  const updatePreference = useUpdateNotificationPreferenceMutation()
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef(null)

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const preferences = devDataEnabled
    ? localPreferences
    : (preferencesQuery.data ?? DEFAULT_NOTIFICATION_PREFERENCES)

  const flashSaved = () => {
    setJustSaved(true)
    clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setJustSaved(false), 1600)
  }

  const setChannel = (category, channel, value) => {
    if (devDataEnabled) {
      savePreferences({
        ...preferences,
        [category]: { ...preferences[category], [channel]: value },
      })
      flashSaved()
      return
    }

    updatePreference.mutate(
      { category, channel, value },
      { onSuccess: flashSaved },
    )
  }

  const pendingKey = updatePreference.isPending
    ? `${updatePreference.variables?.category}:${updatePreference.variables?.channel}`
    : ''
  const errorMessage = parseApiError(
    preferencesQuery.error,
    'Something went wrong while loading your notification preferences.',
  ).message

  return (
    <DashboardLayout pageTitle="Notification Settings">
      <div className="page-enter w-full space-y-6">
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-950">Notification preferences</h1>
                {justSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700" aria-live="polite">
                    <Check className="size-3.5" strokeWidth={2.4} />
                    Saved
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
                Choose which alerts appear in your dashboard and which ones also go to email. Changes save as you toggle them.
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

          {!devDataEnabled && preferencesQuery.isLoading ? (
            <PreferencesSkeleton />
          ) : !devDataEnabled && preferencesQuery.isError ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                <AlertTriangle className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-950">Unable to load preferences</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{errorMessage}</p>
              <button
                type="button"
                onClick={() => preferencesQuery.refetch()}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`size-4 ${preferencesQuery.isFetching ? 'animate-spin' : ''}`} />
                Try Again
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {NOTIFICATION_PREFERENCE_ROWS.map((row) => {
                const value = preferences[row.id] ?? { inApp: true, email: false }

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
                        pending={pendingKey === `${row.id}:inApp`}
                        onChange={(next) => setChannel(row.id, 'inApp', next)}
                        label={`${row.label} in-app alerts`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-center">
                      <span className="text-xs font-semibold text-slate-500 sm:hidden">Email</span>
                      <PreferenceToggle
                        checked={value.email}
                        pending={pendingKey === `${row.id}:email`}
                        onChange={(next) => setChannel(row.id, 'email', next)}
                        label={`${row.label} email alerts`}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
