import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarRange,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react'
import { DEFAULT_ORDER_DATE_RANGE } from '../../constants/customers'
import { MOCK_CUSTOMERS_REFERENCE_DATE } from '../../mocks/customerMockData'

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getReferenceDate() {
  return new Date(MOCK_CUSTOMERS_REFERENCE_DATE)
}

const ORDER_DATE_PRESETS = [
  {
    key: 'last_7',
    label: '7 days',
    getRange: () => {
      const end = getReferenceDate()
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'last_30',
    label: '30 days',
    getRange: () => {
      const end = getReferenceDate()
      const start = new Date(end)
      start.setDate(start.getDate() - 30)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'last_90',
    label: '90 days',
    getRange: () => {
      const end = getReferenceDate()
      const start = new Date(end)
      start.setDate(start.getDate() - 90)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
  {
    key: 'this_year',
    label: 'This year',
    getRange: () => {
      const end = getReferenceDate()
      const start = new Date(end.getFullYear(), 0, 1)
      return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
    },
  },
]

const SPEND_PRESETS = [
  { key: 'under_200', label: 'Under 200', minSpend: '', maxSpend: '199.99' },
  { key: '200_500', label: '200 – 500', minSpend: '200', maxSpend: '500' },
  { key: 'over_500', label: 'Over 500', minSpend: '500', maxSpend: '' },
]

function rangesMatch(a, b) {
  return a.startDate === b.startDate && a.endDate === b.endDate
}

function spendMatchesPreset(minSpend, maxSpend, preset) {
  return minSpend === preset.minSpend && maxSpend === preset.maxSpend
}

function hasCustomDateRange(orderDateRange) {
  return Boolean(orderDateRange.startDate || orderDateRange.endDate)
}

function hasCustomSpendRange(minSpend, maxSpend) {
  return minSpend !== '' || maxSpend !== ''
}

function PresetPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  )
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

function AmountField({ label, value, onChange, placeholder }) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-slate-400">
          GH₵
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </label>
  )
}

export default function CustomerFiltersDrawer({
  open,
  onClose,
  orderDateRange,
  onOrderDateRangeChange,
  minSpend,
  onMinSpendChange,
  maxSpend,
  onMaxSpendChange,
  onClearFilters,
  resultCount,
}) {
  const activeDatePreset = ORDER_DATE_PRESETS.find((preset) =>
    rangesMatch(orderDateRange, preset.getRange()),
  )?.key

  const activeSpendPreset = SPEND_PRESETS.find((preset) =>
    spendMatchesPreset(minSpend, maxSpend, preset),
  )?.key

  const hasCustomDate = hasCustomDateRange(orderDateRange) && !activeDatePreset
  const hasCustomSpend = hasCustomSpendRange(minSpend, maxSpend) && !activeSpendPreset

  const [customDateOpen, setCustomDateOpen] = useState(true)
  const [customSpendOpen, setCustomSpendOpen] = useState(true)

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
    () => countCustomerDrawerFilters({ orderDateRange, minSpend, maxSpend }),
    [orderDateRange, minSpend, maxSpend],
  )

  if (!open) return null

  const handleDatePreset = (preset) => {
    onOrderDateRangeChange(preset.getRange())
  }

  const handleSpendPreset = (preset) => {
    onMinSpendChange(preset.minSpend)
    onMaxSpendChange(preset.maxSpend)
  }

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
        aria-labelledby="customer-filters-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl"
      >
        <div className="relative shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <SlidersHorizontal className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2 id="customer-filters-title" className="text-lg font-bold text-slate-900">
                  Filter customers
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`
                    : 'Choose a quick filter or set a custom range'}
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
            icon={CalendarRange}
            title="Order date"
            description="Customers with at least one order in the period"
          >
            <div className="flex flex-wrap gap-2">
              {ORDER_DATE_PRESETS.map((preset) => (
                <PresetPill
                  key={preset.key}
                  active={activeDatePreset === preset.key}
                  label={preset.label}
                  onClick={() => handleDatePreset(preset)}
                />
              ))}
              {hasCustomDateRange(orderDateRange) && (
                <PresetPill
                  active={hasCustomDate}
                  label="Custom"
                  onClick={() => setCustomDateOpen(true)}
                />
              )}
            </div>

            <CustomToggle
              open={customDateOpen}
              onToggle={() => setCustomDateOpen((value) => !value)}
              label="Custom date range"
            />

            {customDateOpen && (
              <div className="space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DateField
                    label="From"
                    value={orderDateRange.startDate}
                    max={orderDateRange.endDate || undefined}
                    onChange={(startDate) => onOrderDateRangeChange({ ...orderDateRange, startDate })}
                  />
                  <DateField
                    label="To"
                    value={orderDateRange.endDate}
                    min={orderDateRange.startDate || undefined}
                    onChange={(endDate) => onOrderDateRangeChange({ ...orderDateRange, endDate })}
                  />
                </div>
                {hasCustomDateRange(orderDateRange) && (
                  <button
                    type="button"
                    onClick={() => onOrderDateRangeChange(DEFAULT_ORDER_DATE_RANGE)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset dates
                  </button>
                )}
              </div>
            )}
          </FilterCard>

          <FilterCard
            icon={Wallet}
            title="Total spend"
            description="Lifetime spend in GH₵ on your store"
          >
            <div className="flex flex-wrap gap-2">
              {SPEND_PRESETS.map((preset) => (
                <PresetPill
                  key={preset.key}
                  active={activeSpendPreset === preset.key}
                  label={preset.label}
                  onClick={() => handleSpendPreset(preset)}
                />
              ))}
              {hasCustomSpendRange(minSpend, maxSpend) && (
                <PresetPill
                  active={hasCustomSpend}
                  label="Custom"
                  onClick={() => setCustomSpendOpen(true)}
                />
              )}
            </div>

            <CustomToggle
              open={customSpendOpen}
              onToggle={() => setCustomSpendOpen((value) => !value)}
              label="Custom amount range"
            />

            {customSpendOpen && (
              <div className="space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AmountField
                    label="Minimum"
                    value={minSpend}
                    onChange={onMinSpendChange}
                    placeholder="0.00"
                  />
                  <AmountField
                    label="Maximum"
                    value={maxSpend}
                    onChange={onMaxSpendChange}
                    placeholder="No limit"
                  />
                </div>
                {hasCustomSpendRange(minSpend, maxSpend) && (
                  <button
                    type="button"
                    onClick={() => {
                      onMinSpendChange('')
                      onMaxSpendChange('')
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset amounts
                  </button>
                )}
              </div>
            )}
          </FilterCard>
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white p-4 sm:px-5">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClearFilters()
              }}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="size-4" />
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Show {resultCount} customer{resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}

export function countCustomerDrawerFilters({
  orderDateRange = DEFAULT_ORDER_DATE_RANGE,
  minSpend = '',
  maxSpend = '',
} = {}) {
  return [
    orderDateRange.startDate,
    orderDateRange.endDate,
    minSpend !== '',
    maxSpend !== '',
  ].filter(Boolean).length
}
