import { Download } from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'
import { ANALYTICS_DATE_RANGES } from '../../constants/analytics'

export default function AnalyticsPageHeader({
  devDataEnabled,
  onDevDataChange,
  dateRange,
  onDateRangeChange,
  onExport,
  hasData,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Analytics & Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track sales performance, customer behaviour, and product trends across your store.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <DevDataToggle
            enabled={devDataEnabled}
            onChange={onDevDataChange}
            ariaLabel="Toggle dummy analytics data"
          />
          <button
            type="button"
            onClick={onExport}
            disabled={!hasData}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Export report
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ANALYTICS_DATE_RANGES.filter((o) => o.value !== 'custom').map((option) => {
            const active = dateRange === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onDateRangeChange(option.value)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
