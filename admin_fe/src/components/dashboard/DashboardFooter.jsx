import { Link } from 'react-router'
import { MapPin } from 'lucide-react'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'



function formatSnapshot(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export default function DashboardFooter() {
  const year = new Date().getFullYear()
  const snapshot = formatSnapshot(ADMIN_DASHBOARD.generatedAt)

  return (
    <footer className="mt-8 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">EZ-Mall Admin</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            Command center · Accra, Ghana
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <p className="text-xs text-slate-400">© {year} EZ-Mall</p>
        </div>
      </div>
    </footer>
  )
}
