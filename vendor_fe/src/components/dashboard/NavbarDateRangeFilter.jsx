import { useState } from 'react'
import { CalendarRange, ChevronDown } from 'lucide-react'

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
]

export default function NavbarDateRangeFilter({ value = '30d', onChange }) {
  const [internalValue, setInternalValue] = useState(value)
  const selected = DATE_RANGE_OPTIONS.find((opt) => opt.value === internalValue) ?? DATE_RANGE_OPTIONS[2]

  const handleChange = (nextValue) => {
    setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  return (
    <div className="relative hidden md:block">
      <label htmlFor="navbar-date-range" className="sr-only">Date range</label>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <CalendarRange className="size-4" strokeWidth={2} />
      </div>
      <select
        id="navbar-date-range"
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
        aria-label="Filter by date range"
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <span className="sr-only">Selected range: {selected.label}</span>
    </div>
  )
}
