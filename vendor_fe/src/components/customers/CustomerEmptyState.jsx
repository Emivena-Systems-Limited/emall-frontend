import { Search, Users } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

export function CustomerSearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <Search className="size-6" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-800">No customers found</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        We couldn&apos;t find any customers matching your search.
        Try a different name, email address, or phone number.
      </p>
    </div>
  )
}

export function CustomerFilterEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <Users className="size-6" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-800">No customers match your filters</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Try adjusting your order date or total spend filters to find the customers you are looking for.
      </p>
    </div>
  )
}

export function CustomerCatalogEmptyState() {
  const preset = EMPTY_STATE_PRESETS.customers

  return (
    <EmptyState
      icon={preset.icon}
      title={preset.title}
      description={preset.description}
    />
  )
}
