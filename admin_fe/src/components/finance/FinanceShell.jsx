import { NavLink } from 'react-router'
import { CircleDollarSign } from 'lucide-react'
import DashboardLayout from '../dashboard/DashboardLayout'
import DashboardReveal from '../dashboard/DashboardReveal'
import { FINANCE_TABS } from '../../constants/finance'
import FinanceDevDataButton from './FinanceDevDataButton'

export default function FinanceShell({ children }) {
  return (
    <DashboardLayout pageTitle="Finance">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                  <CircleDollarSign className="size-5 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    Treasury
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Finance
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                    Watch marketplace sales, commission, and the payouts waiting to leave the platform.
                  </p>
                </div>
              </div>
              <FinanceDevDataButton />
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <nav aria-label="Finance" className="overflow-x-auto border-b border-slate-200">
            <ul className="flex min-w-max gap-1">
              {FINANCE_TABS.map((tab) => (
                <li key={tab.key}>
                  <NavLink
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                      `inline-flex cursor-pointer border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                        isActive
                          ? 'border-brand text-slate-950'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </DashboardReveal>

        {children}
      </div>
    </DashboardLayout>
  )
}
