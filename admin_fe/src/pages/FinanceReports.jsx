import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import YearSelector from '../components/dashboard/YearSelector'
import FinanceShell from '../components/finance/FinanceShell'
import StatGrid from '../components/finance/StatGrid'
import TruncatedCell from '../components/finance/TruncatedCell'
import VendorFilterSelect from '../components/finance/VendorFilterSelect'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../constants/chartTheme'
import { PAYOUT_STATUSES, PAYOUT_STATUS_ORDER } from '../constants/finance'
import {
  FINANCE_CATEGORIES,
  REPORT_TYPES,
  TRANSACTION_METHODS,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_ORDER,
  buildReport,
  buildSalesYearSeries,
  salesReportYears,
} from '../constants/financeLedger'
import { useFinanceData } from '../hooks/useFinanceData'
import notify from '../lib/notify'
import { downloadCsv, downloadExcel, printReport } from '../utils/financeExport'
import { formatCedi, formatCediCompact } from '../utils/formatters'

function SalesTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(payload[0].value)}</p>
    </div>
  )
}

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'
const EMPTY_FILTERS = { from: '', to: '', vendorId: '', categoryId: '', status: '', method: '' }

export default function FinanceReports() {
  const data = useFinanceData()
  const [type, setType] = useState('sales')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const years = useMemo(() => salesReportYears(data.transactions), [data.transactions])
  const [year, setYear] = useState(() => new Date().getFullYear())
  const selectedYear = years.includes(year) ? year : years[years.length - 1]
  const salesSeries = useMemo(
    () => buildSalesYearSeries(data.transactions, selectedYear, filters),
    [data.transactions, selectedYear, filters],
  )
  const report = useMemo(
    () => buildReport(type, data, filters),
    [type, data, filters],
  )
  const isSales = type === 'sales'
  const chartSeries = isSales ? salesSeries : report.series
  const title = REPORT_TYPES.find((item) => item.value === type)?.label ?? 'Report'
  const subtitle = [filters.from, filters.to].filter(Boolean).join(' – ') || 'All loaded dates'
  const statusOptions = type === 'payouts' ? PAYOUT_STATUS_ORDER : TRANSACTION_STATUS_ORDER
  const statusLabels = type === 'payouts' ? PAYOUT_STATUSES : TRANSACTION_STATUSES

  const exportRows = () => {
    if (!report.table.length) {
      notify.error('Nothing to export for the current report filters.')
      return null
    }
    return report.table.map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell))))
  }

  const handleCsv = () => {
    const rows = exportRows()
    if (!rows) return
    downloadCsv(`ezmall-${type}-report.csv`, report.headers, rows)
    notify.success('CSV export ready.')
  }

  const handleExcel = () => {
    const rows = exportRows()
    if (!rows) return
    downloadExcel(`ezmall-${type}-report.xls`, report.headers, rows)
    notify.success('Excel export ready.')
  }

  const handlePdf = () => {
    const rows = exportRows()
    if (!rows) return
    const opened = printReport({ title, subtitle, headers: report.headers, rows })
    if (!opened) notify.error('Allow pop-ups to export a PDF.')
    else notify.success('Print dialog opened. Save it as a PDF.')
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Report type">
            {REPORT_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={type === item.value}
                onClick={() => setType(item.value)}
                className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold ${
                  type === item.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs font-semibold text-slate-500">From
              <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className={`${FIELD} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-slate-500">To
              <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className={`${FIELD} mt-1`} />
            </label>
            <VendorFilterSelect id="report-vendor-filter" value={filters.vendorId} onChange={(vendorId) => setFilters({ ...filters, vendorId })} />
            <select aria-label="Category" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })} className={FIELD}>
              <option value="">All categories</option>
              {FINANCE_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select aria-label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className={FIELD}>
              <option value="">All statuses</option>
              {statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status].label}</option>)}
            </select>
            <select aria-label="Payment method" value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })} className={FIELD}>
              <option value="">All methods</option>
              {TRANSACTION_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
        </section>
      </DashboardReveal>

      <DashboardReveal index={3}>
        <StatGrid items={report.summaryCards.map(([label, value, format]) => ({ label, value, format }))} />
      </DashboardReveal>

      <DashboardReveal index={4}>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                {isSales ? `Paid sales, January–December ${selectedYear}` : subtitle}
              </p>
            </div>
            {isSales ? (
              <YearSelector
                id="sales-report-year"
                value={selectedYear}
                years={years}
                onChange={setYear}
              />
            ) : null}
          </div>
          {!isSales && chartSeries.length === 0 ? (
            <p className="py-12 text-sm text-slate-500">No rows in this report.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <div className="h-64 min-w-[640px]">
                <ResponsiveContainer width="100%" height="100%">
                  {isSales ? (
                    <LineChart data={chartSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={CHART_AXIS_TICK_Y}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        tickFormatter={(value) => formatCediCompact(value)}
                      />
                      <Tooltip content={<SalesTip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Sales"
                        stroke="#c73b2d"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#c73b2d', strokeWidth: 0 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartSeries}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} width={56} />
                      <Tooltip formatter={(value) => formatCedi(value)} />
                      <Bar dataKey="value" name={title} fill="#c73b2d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </DashboardReveal>

      <DashboardReveal index={5}>
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">Report table</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleCsv} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Download className="size-3.5" /> CSV
              </button>
              <button type="button" onClick={handleExcel} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <FileSpreadsheet className="size-3.5" /> Excel
              </button>
              <button type="button" onClick={handlePdf} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                <FileText className="size-3.5" /> PDF
              </button>
            </div>
          </div>
          {report.table.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">Load dummy data, then adjust the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    {report.headers.map((header) => <th key={header} scope="col" className="whitespace-nowrap px-4 py-2.5">{header}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.table.map((row) => (
                    <tr key={row.join('-')}>
                      {row.map((cell, index) => {
                        const header = report.headers[index]
                        const text = typeof cell === 'number' ? formatCedi(cell) : cell
                        const truncate = header === 'Vendor' || header === 'Method'
                        return (
                          <td key={`${header}-${cell}`} className="px-4 py-3 whitespace-nowrap">
                            {truncate ? <TruncatedCell text={text} className="text-sm text-slate-700" /> : text}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DashboardReveal>
    </FinanceShell>
  )
}
