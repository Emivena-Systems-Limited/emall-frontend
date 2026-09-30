import { Bell } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import NotificationManagementWorkspace from '../components/notifications/NotificationManagementWorkspace'

export default function Notifications() {
  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Bell className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Communication</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Notifications</h2>
                <p className="mt-1.5 text-sm text-slate-500">Create, schedule, and monitor marketplace notifications from one workspace.</p>
              </div>
            </div>
          </header>
        </DashboardReveal>
        <DashboardReveal index={1}>
          <NotificationManagementWorkspace />
        </DashboardReveal>
      </div>
    </DashboardLayout>
  )
}
