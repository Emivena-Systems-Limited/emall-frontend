import { Search, X } from 'lucide-react'
import { MESSAGE_CATEGORIES } from '../../constants/messages'

export default function MessagesToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(MESSAGE_CATEGORIES).map(([key, label]) => {
          const active = categoryFilter === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryFilterChange(key)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          )
        })}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
