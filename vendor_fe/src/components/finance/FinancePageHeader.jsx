import { CalendarRange, Download } from 'lucide-react'
import { DATE_RANGE_OPTIONS } from '../../constants/finance'
import { getRangeLabel } from '../../utils/financeUtils'

function CustomRangeInputs({ customRange, onStartChange, onEndChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
        From
        <input
          type="date"
          value={customRange.startDate}
          max={customRange.endDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
        To
        <input
          type="date"
          value={customRange.endDate}
          min={customRange.startDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </label>
    </div>
  )
}

export default function FinanceDateRangeFilter({
  range,
  onRangeChange,
  customRange,
  onCustomStartChange,
  onCustomEndChange,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
          <CalendarRange className="size-3.5" />
          Period
        </span>
        {DATE_RANGE_OPTIONS.map((option) => {
          const active = range === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onRangeChange(option.value)}
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
      </div>

      {range === 'custom' && (
        <CustomRangeInputs
          customRange={customRange}
          onStartChange={onCustomStartChange}
          onEndChange={onCustomEndChange}
        />
      )}
    </div>
  )
}

export function FinancePageHeader({
  range,
  onRangeChange,
  customRange,
  onCustomStartChange,
  onCustomEndChange,
  onExport,
  exportCount,
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Finance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your earnings, payouts and financial transactions.
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Showing data for{' '}
            <span className="text-slate-600">{getRangeLabel(range, customRange)}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
        >
          <Download className="size-4" />
          Export {exportCount > 0 ? `(${exportCount})` : ''}
        </button>
      </div>

      <FinanceDateRangeFilter
        range={range}
        onRangeChange={onRangeChange}
        customRange={customRange}
        onCustomStartChange={onCustomStartChange}
        onCustomEndChange={onCustomEndChange}
      />
    </div>
  )
}
