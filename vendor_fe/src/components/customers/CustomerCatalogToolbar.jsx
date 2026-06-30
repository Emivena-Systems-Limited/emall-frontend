import { ChevronDown, Search } from 'lucide-react'
import {
  ORDER_DATE_FILTER_OPTIONS,
  SPEND_FILTER_OPTIONS,
} from '../../constants/customers'

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-[180px] flex-1">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

export default function CustomerCatalogToolbar({
  search,
  onSearchChange,
  orderDateFilter,
  onOrderDateFilterChange,
  spendFilter,
  onSpendFilterChange,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, email, or phone number…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FilterSelect
            label="Order Date"
            value={orderDateFilter}
            onChange={onOrderDateFilterChange}
            options={ORDER_DATE_FILTER_OPTIONS}
          />
          <FilterSelect
            label="Total Spend"
            value={spendFilter}
            onChange={onSpendFilterChange}
            options={SPEND_FILTER_OPTIONS}
          />
        </div>
      </div>
    </div>
  )
}
