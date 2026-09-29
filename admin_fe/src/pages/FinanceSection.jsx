import { Navigate, useParams } from 'react-router'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import FinanceShell from '../components/finance/FinanceShell'
import FinanceCommissions from './FinanceCommissions'
import FinancePayouts from './FinancePayouts'
import FinanceReports from './FinanceReports'
import FinanceSettings from './FinanceSettings'
import FinanceTransactions from './FinanceTransactions'

const PAGES = {
  payouts: FinancePayouts,
  transactions: FinanceTransactions,
  commissions: FinanceCommissions,
  reports: FinanceReports,
  settings: FinanceSettings,
}

export default function FinanceSection() {
  const { section } = useParams()
  if (section === 'invoices') {
    return (
      <FinanceShell>
        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Not in this task</p>
            <h3 className="mt-2 text-lg font-bold text-slate-950">Invoices / Statements</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Vendor statements and platform invoices were not specified in this finance task.
            </p>
          </section>
        </DashboardReveal>
      </FinanceShell>
    )
  }

  const Page = PAGES[section]
  if (!Page) return <Navigate to="/finance" replace />
  return <Page />
}
