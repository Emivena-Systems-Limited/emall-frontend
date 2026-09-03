import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BarChart3,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Loader2,
  MapPin,
  Package,
  PieChart,
  Truck,
  Users,
  X,
} from 'lucide-react'
import {
  ANALYTICS_EXPORT_DATE_PRESETS,
  ANALYTICS_EXPORT_REPORTS,
  ANALYTICS_EXPORT_REPORT_KEYS,
  ANALYTICS_FULFILLMENT_PERIODS,
  ANALYTICS_MONTHS,
} from '../../constants/analytics'
import {
  formatLocalDateParam,
  getAnalyticsPresetDates,
  getAnalyticsRangeLabel,
  getAnalyticsYearOptions,
  getDefaultFulfillmentPeriod,
  getFulfillmentPeriodLabel,
  getTodayDateParam,
  isFulfillmentPeriodValid,
  matchAnalyticsPreset,
  resolveFulfillmentPeriod,
} from '../../utils/analyticsUtils'

const REPORT_ICONS = {
  summary: LayoutDashboard,
  revenue_orders: BarChart3,
  sales_by_category: PieChart,
  customer_growth: Users,
  sales_by_region: MapPin,
  top_products: Package,
  order_fulfillment: Truck,
  fulfillment: Truck,
  full: FileSpreadsheet,
}

const SELECT_CLASS =
  'w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light'

function StepHeading({ step, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
        {step}
      </span>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
      {label}
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={SELECT_CLASS}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </span>
    </label>
  )
}

function monthOptionsForYear(year, today = new Date()) {
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const maxMonth = Number(year) === currentYear ? currentMonth : 12
  return ANALYTICS_MONTHS.filter((month) => month.value <= maxMonth).map((month) => ({
    value: month.value,
    label: month.label,
  }))
}

function FulfillmentDurationFields({ period, onChange }) {
  const today = new Date()
  const yearOptions = getAnalyticsYearOptions(today).map((year) => ({ value: year, label: String(year) }))
  const monthOptions = monthOptionsForYear(period.year, today)
  const startMonthOptions = monthOptionsForYear(period.startYear, today)
  const endMonthOptions = monthOptionsForYear(period.endYear, today)

  const setField = (patch) => {
    const next = { ...period, ...patch }
    const start = Number(next.startYear) * 12 + Number(next.startMonth)
    const end = Number(next.endYear) * 12 + Number(next.endMonth)
    if (next.type === 'month_range' && start > end) {
      next.endYear = next.startYear
      next.endMonth = next.startMonth
    }
    onChange(next)
  }

  const handleTypeChange = (type) => {
    onChange({ ...getDefaultFulfillmentPeriod(today), ...period, type })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ANALYTICS_FULFILLMENT_PERIODS.map((option) => {
          const active = period.type === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => handleTypeChange(option.value)}
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

      {period.type === 'current_year' ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          Uses {today.getFullYear()} from 1 January through today.
        </p>
      ) : null}

      {period.type === 'year' ? (
        <div className="mt-4 max-w-xs">
          <SelectField
            id="fulfillment-year"
            label="Year"
            value={period.year}
            onChange={(value) => setField({ year: Number(value) })}
            options={yearOptions}
          />
        </div>
      ) : null}

      {period.type === 'month' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            id="fulfillment-month-year"
            label="Year"
            value={period.year}
            onChange={(value) => {
              const year = Number(value)
              const months = monthOptionsForYear(year, today)
              const month = months.some((item) => item.value === period.month)
                ? period.month
                : months.at(-1)?.value
              setField({ year, month })
            }}
            options={yearOptions}
          />
          <SelectField
            id="fulfillment-month"
            label="Month"
            value={period.month}
            onChange={(value) => setField({ month: Number(value) })}
            options={monthOptions}
          />
        </div>
      ) : null}

      {period.type === 'year_range' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            id="fulfillment-start-year"
            label="From year"
            value={period.startYear}
            onChange={(value) => {
              const startYear = Number(value)
              setField({
                startYear,
                endYear: period.endYear < startYear ? startYear : period.endYear,
              })
            }}
            options={yearOptions}
          />
          <SelectField
            id="fulfillment-end-year"
            label="To year"
            value={period.endYear}
            onChange={(value) => {
              const endYear = Number(value)
              setField({
                endYear,
                startYear: period.startYear > endYear ? endYear : period.startYear,
              })
            }}
            options={yearOptions}
          />
        </div>
      ) : null}

      {period.type === 'month_range' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            id="fulfillment-range-start-year"
            label="From year"
            value={period.startYear}
            onChange={(value) => {
              const startYear = Number(value)
              const months = monthOptionsForYear(startYear, today)
              const startMonth = months.some((item) => item.value === period.startMonth)
                ? period.startMonth
                : months.at(-1)?.value
              setField({ startYear, startMonth })
            }}
            options={yearOptions}
          />
          <SelectField
            id="fulfillment-range-start-month"
            label="From month"
            value={period.startMonth}
            onChange={(value) => setField({ startMonth: Number(value) })}
            options={startMonthOptions}
          />
          <SelectField
            id="fulfillment-range-end-year"
            label="To year"
            value={period.endYear}
            onChange={(value) => {
              const endYear = Number(value)
              const months = monthOptionsForYear(endYear, today)
              const endMonth = months.some((item) => item.value === period.endMonth)
                ? period.endMonth
                : months.at(-1)?.value
              setField({ endYear, endMonth })
            }}
            options={yearOptions}
          />
          <SelectField
            id="fulfillment-range-end-month"
            label="To month"
            value={period.endMonth}
            onChange={(value) => setField({ endMonth: Number(value) })}
            options={endMonthOptions}
          />
        </div>
      ) : null}
    </>
  )
}

function DateRangeDurationFields({ range, today, activePreset, onPreset, onStartChange, onEndChange }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ANALYTICS_EXPORT_DATE_PRESETS.map((option) => {
          const active = activePreset === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onPreset(option.value)}
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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
          From
          <input
            type="date"
            value={range.startDate}
            max={range.endDate || today}
            onChange={(event) => onStartChange(event.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
          To
          <input
            type="date"
            value={range.endDate}
            min={range.startDate || undefined}
            max={today}
            onChange={(event) => onEndChange(event.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
        </label>
      </div>
    </>
  )
}

export default function AnalyticsExportDrawer({
  open,
  onClose,
  initialRange,
  onExport,
  isExporting = false,
}) {
  const today = getTodayDateParam()
  const [reportKey, setReportKey] = useState('summary')
  const [range, setRange] = useState(initialRange)
  const [fulfillmentPeriod, setFulfillmentPeriod] = useState(getDefaultFulfillmentPeriod)

  const isFulfillment = reportKey === ANALYTICS_EXPORT_REPORT_KEYS.ORDER_FULFILLMENT

  useEffect(() => {
    if (!open) return
    setReportKey('summary')
    setRange({
      startDate: initialRange.startDate,
      endDate: initialRange.endDate,
    })
    setFulfillmentPeriod(getDefaultFulfillmentPeriod())
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isExporting) onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, isExporting])

  const selectedReport = ANALYTICS_EXPORT_REPORTS.find((report) => report.key === reportKey)
  const activePreset = matchAnalyticsPreset(range.startDate, range.endDate)
  const fulfillmentDates = useMemo(
    () => resolveFulfillmentPeriod(fulfillmentPeriod),
    [fulfillmentPeriod],
  )
  const canExport = isFulfillment
    ? isFulfillmentPeriodValid(fulfillmentPeriod)
    : Boolean(reportKey && range.startDate && range.endDate && range.startDate <= range.endDate)
  const rangeLabel = useMemo(() => {
    if (isFulfillment) return getFulfillmentPeriodLabel(fulfillmentPeriod)
    return getAnalyticsRangeLabel(range.startDate, range.endDate)
  }, [isFulfillment, fulfillmentPeriod, range.startDate, range.endDate])

  if (!open) return null

  const handleStartChange = (nextStart) => {
    const start = formatLocalDateParam(nextStart) || range.startDate
    const end = range.endDate && start > range.endDate ? start : range.endDate
    setRange({ startDate: start, endDate: end })
  }

  const handleEndChange = (nextEnd) => {
    const end = formatLocalDateParam(nextEnd) || range.endDate
    const start = range.startDate && end < range.startDate ? end : range.startDate
    setRange({ startDate: start, endDate: end })
  }

  const handleExport = () => {
    if (!canExport || isExporting) return
    onExport({
      reportKey,
      reportLabel: selectedReport?.label,
      startDate: isFulfillment ? fulfillmentDates.startDate : range.startDate,
      endDate: isFulfillment ? fulfillmentDates.endDate : range.endDate,
      periodLabel: rangeLabel,
    })
  }

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={isExporting ? undefined : onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-export-title"
        aria-busy={isExporting}
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-linear-to-br from-brand-light/50 via-white to-slate-50 px-5 py-5 sm:px-6">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-brand/5" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
                <Download className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
                  Generate Excel
                </p>
                <h2 id="analytics-export-title" className="text-lg font-bold text-slate-900">
                  Export report
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Choose a report, set the period, then download.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close export drawer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <section className="mb-8">
            <StepHeading
              step="1"
              title="Choose a report"
              description="Pick one dataset, or export everything together."
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ANALYTICS_EXPORT_REPORTS.map((report) => {
                const Icon = REPORT_ICONS[report.key] ?? FileSpreadsheet
                const active = reportKey === report.key
                return (
                  <button
                    key={report.key}
                    type="button"
                    onClick={() => setReportKey(report.key)}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 text-left transition-all ${
                      active
                        ? 'bg-brand-light ring-2 ring-brand shadow-[0_8px_24px_rgba(199,59,45,0.12)]'
                        : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
                        active ? 'bg-white text-brand ring-brand/15' : 'bg-slate-50 text-slate-500 ring-slate-200'
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{report.label}</span>
                        {active ? (
                          <Check className="size-4 shrink-0 text-brand" strokeWidth={2.5} />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                        {report.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mb-8">
            <StepHeading
              step="2"
              title="Set the duration"
              description={
                isFulfillment
                  ? 'Choose a calendar period: year, month, or a range.'
                  : 'Presets fill the dates. Adjust From and To if you need a custom window.'
              }
            />
            {isFulfillment ? (
              <FulfillmentDurationFields
                period={fulfillmentPeriod}
                onChange={setFulfillmentPeriod}
              />
            ) : (
              <DateRangeDurationFields
                range={range}
                today={today}
                activePreset={activePreset}
                onPreset={(value) => setRange(getAnalyticsPresetDates(value))}
                onStartChange={handleStartChange}
                onEndChange={handleEndChange}
              />
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ready to export</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {selectedReport?.label} · {rangeLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">Downloads as an Excel file.</p>
          </section>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport || isExporting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isExporting ? 'Exporting…' : 'Export Excel'}
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body,
  )
}
