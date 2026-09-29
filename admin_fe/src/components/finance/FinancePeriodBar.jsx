import { FINANCE_PERIODS } from '../../constants/finance'

const DATE_CLASS =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'

export default function FinancePeriodBar({
  period,
  custom,
  rangeError,
  onPeriod,
  onCustom,
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Reporting period</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Updates the totals, chart, payout status, and recent activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Reporting period">
          {FINANCE_PERIODS.map((option) => {
            const active = period === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onPeriod(option.value)}
                className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {period === 'custom' && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
          <label className="block text-xs font-semibold text-slate-600">
            From
            <input
              type="date"
              value={custom.from}
              max={custom.to || undefined}
              onChange={(event) => onCustom({ ...custom, from: event.target.value })}
              className={`mt-1.5 block w-full sm:w-44 ${DATE_CLASS}`}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            To
            <input
              type="date"
              value={custom.to}
              min={custom.from || undefined}
              onChange={(event) => onCustom({ ...custom, to: event.target.value })}
              className={`mt-1.5 block w-full sm:w-44 ${DATE_CLASS}`}
            />
          </label>
          {rangeError ? (
            <p className="text-xs font-medium text-rose-700" role="alert">{rangeError}</p>
          ) : null}
        </div>
      )}
    </section>
  )
}
