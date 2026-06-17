import { useEffect, useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { LogOut, Store } from 'lucide-react'

export default function LogoutOverlay() {
  const mutatingCount = useIsMutating({ mutationKey: ['vendor-auth', 'logout'] })
  const isMutating = mutatingCount > 0
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isMutating) setVisible(true)
  }, [isMutating])

  useEffect(() => {
    if (!isMutating && visible) {
      const timer = window.setTimeout(() => setVisible(false), 480)
      return () => window.clearTimeout(timer)
    }
  }, [isMutating, visible])

  if (!visible) return null

  return (
    <div
      className="logout-overlay fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Signing out"
    >
      <div className="logout-overlay-card w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-2xl shadow-slate-900/10">
        <div className="relative mx-auto mb-6 flex size-16 items-center justify-center">
          <span className="logout-overlay-ring absolute inset-0 rounded-2xl border-2 border-brand/20" />
          <span className="logout-overlay-ring logout-overlay-ring--delayed absolute inset-0 rounded-2xl border-2 border-brand/10" />
          <span className="relative flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
            <Store className="size-5" strokeWidth={1.75} />
          </span>
          <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-white ring-2 ring-white">
            <LogOut className="size-3.5 text-brand" strokeWidth={2.25} />
          </span>
        </div>

        <p className="text-base font-semibold tracking-tight text-slate-900">
          Signing you out
        </p>
        <p className="mt-1.5 text-sm text-slate-500">
          Securing your session and clearing local data…
        </p>

        <div className="dashboard-loader-bar mt-7" aria-hidden="true" />
      </div>
    </div>
  )
}
