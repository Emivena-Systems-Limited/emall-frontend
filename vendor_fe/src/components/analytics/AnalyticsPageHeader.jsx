import { CalendarRange, Download } from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'
import { ANALYTICS_DATE_RANGES } from '../../constants/analytics'
import {
  formatLocalDateParam,
  getAnalyticsPresetDates,
  getAnalyticsRangeLabel,
  getTodayDateParam,
  matchAnalyticsPreset,
} from '../../utils/analyticsUtils'

function DateField({ label, value, min, max, onChange }) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600">
      {label}
      <input
        type="date"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-[10.75rem] cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
      />
    </label>
  )
}

export default function AnalyticsPageHeader({
  devDataEnabled,
  onDevDataChange,
  startDate,
  endDate,
  onDateRangeChange,
  onExport,
}) {
  const today = getTodayDateParam()
  const activePreset = matchAnalyticsPreset(startDate, endDate)

  const handlePreset = (preset) => {
    onDateRangeChange(getAnalyticsPresetDates(preset))
  }

  const handleStartChange = (nextStart) => {
    const start = formatLocalDateParam(nextStart) || startDate
    const end = endDate && start > endDate ? start : endDate
    onDateRangeChange({ startDate: start, endDate: end })
  }

  const handleEndChange = (nextEnd) => {
    const end = formatLocalDateParam(nextEnd) || endDate
    const start = startDate && end < startDate ? end : startDate
    onDateRangeChange({ startDate: start, endDate: end })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track sales performance, customer behaviour, and product trends across your store.
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Showing data for{' '}
            <span className="text-slate-600">{getAnalyticsRangeLabel(startDate, endDate)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DevDataToggle
            enabled={devDataEnabled}
            onChange={onDevDataChange}
            ariaLabel="Toggle dummy analytics data"
          />
          <button
            type="button"
            onClick={onExport}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
          >
            <Download className="size-4" />
            Export report
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
          <CalendarRange className="size-3.5" />
          Period
        </span>
        {ANALYTICS_DATE_RANGES.map((option) => {
          const active = activePreset === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePreset(option.value)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                active
                  ? 'bg-brand text-white shadow-[0_8px_20px_rgba(199,59,45,0.22)]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          )
        })}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:ml-auto">
          <DateField
            label="From"
            value={startDate}
            max={endDate || today}
            onChange={handleStartChange}
          />
          <DateField
            label="To"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={handleEndChange}
          />
        </div>
      </div>
    </div>
  )
}
