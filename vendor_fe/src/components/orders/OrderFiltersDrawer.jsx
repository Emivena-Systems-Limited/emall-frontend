import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarRange,
  ChevronDown,
  Package,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import {
  DEFAULT_ORDER_DATE_RANGE,
  STATUS_FILTERS,
  STATUS_FILTER_TABS,
} from '../../constants/orders'

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ORDER_DATE_PRESETS = [
  {
    key: 'last_7',
    label: '7 days',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'last_30',
    label: '30 days',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 30)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'last_90',
    label: '90 days',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 90)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'this_year',
    label: 'This year',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getFullYear(), 0, 1)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
]

const STATUS_GRID_TABS = STATUS_FILTER_TABS.filter((tab) => tab.key !== STATUS_FILTERS.ALL)

function rangesMatch(a, b) {
  return a.startDate === b.startDate && a.endDate === b.endDate
}

function hasCustomDateRange(dateRange) {
  return Boolean(dateRange.startDate || dateRange.endDate)
}

function FilterGridOption({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-xl px-2 text-center text-xs font-semibold leading-tight transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      <span className="line-clamp-2">{label}</span>
    </button>
  )
}

function FilterOptionGrid({ children }) {
  return <div className="grid grid-cols-3 gap-2">{children}</div>
}

function FilterCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <Icon className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  )
}

function CustomToggle({ open, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-1 py-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
    >
      <span>{label}</span>
      <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

function DateField({ label, value, onChange, min, max }) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
      />
    </label>
  )
}

export default function OrderFiltersDrawer({
  open,
  onClose,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  resultCount,
}) {
  const activeDatePreset = ORDER_DATE_PRESETS.find((preset) =>
    rangesMatch(dateRange, preset.getRange()),
  )?.key

  const hasCustomDate = hasCustomDateRange(dateRange) && !activeDatePreset
  const [customDateOpen, setCustomDateOpen] = useState(true)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const activeFilterCount = useMemo(
    () => countOrderDrawerFilters({ statusFilter, dateRange }),
    [statusFilter, dateRange],
  )

  if (!open) return null

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-filters-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl"
      >
        <div className="relative shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <SlidersHorizontal className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2 id="order-filters-title" className="text-lg font-bold text-slate-900">
                  Filter orders
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`
                    : 'Choose a status or order date range'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close filters"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <FilterCard
            icon={Package}
            title="Status"
            description="Filter by delivery status"
          >
            <button
              type="button"
              onClick={() => onStatusFilterChange(STATUS_FILTERS.ALL)}
              className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all ${
                statusFilter === STATUS_FILTERS.ALL
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All statuses
            </button>
            <FilterOptionGrid>
              {STATUS_GRID_TABS.map((tab) => (
                <FilterGridOption
                  key={tab.key}
                  active={statusFilter === tab.key}
                  label={tab.label}
                  onClick={() => onStatusFilterChange(tab.key)}
                />
              ))}
            </FilterOptionGrid>
          </FilterCard>

          <FilterCard
            icon={CalendarRange}
            title="Order date"
            description="Orders placed in the selected period"
          >
            <FilterOptionGrid>
              {ORDER_DATE_PRESETS.map((preset) => (
                <FilterGridOption
                  key={preset.key}
                  active={activeDatePreset === preset.key}
                  label={preset.label}
                  onClick={() => onDateRangeChange(preset.getRange())}
                />
              ))}
              {hasCustomDateRange(dateRange) ? (
                <FilterGridOption
                  active={hasCustomDate}
                  label="Custom"
                  onClick={() => setCustomDateOpen(true)}
                />
              ) : null}
            </FilterOptionGrid>

            <CustomToggle
              open={customDateOpen}
              onToggle={() => setCustomDateOpen((value) => !value)}
              label="Custom date range"
            />

            {customDateOpen ? (
              <div className="space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DateField
                    label="From"
                    value={dateRange.startDate}
                    max={dateRange.endDate || undefined}
                    onChange={(startDate) => onDateRangeChange({ ...dateRange, startDate })}
                  />
                  <DateField
                    label="To"
                    value={dateRange.endDate}
                    min={dateRange.startDate || undefined}
                    onChange={(endDate) => onDateRangeChange({ ...dateRange, endDate })}
                  />
                </div>
                {hasCustomDateRange(dateRange) ? (
                  <button
                    type="button"
                    onClick={() => onDateRangeChange(DEFAULT_ORDER_DATE_RANGE)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset dates
                  </button>
                ) : null}
              </div>
            ) : null}
          </FilterCard>
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white p-4 sm:px-5">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="size-4" />
              Clear all
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Show {resultCount} order{resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}

export function countOrderDrawerFilters({
  statusFilter = STATUS_FILTERS.ALL,
  dateRange = DEFAULT_ORDER_DATE_RANGE,
} = {}) {
  return [
    statusFilter !== STATUS_FILTERS.ALL,
    dateRange.startDate,
    dateRange.endDate,
  ].filter(Boolean).length
}
