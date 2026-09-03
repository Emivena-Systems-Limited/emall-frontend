import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Search, Store, X } from 'lucide-react'
import { useVendorChoices } from '../../hooks/useAdminCoupons'

export default function CouponVendorPicker({
  id = 'coupon-vendor',
  valueId = '',
  valueName = '',
  disabled = false,
  error = '',
  onChange,
  placeholder = 'Search a live store',
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')
  const rootRef = useRef(null)
  const selected = Boolean(valueId)
  const { data: vendors = [], isFetching, isError } = useVendorChoices(debounced, { enabled: open && !selected })

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [])

  const options = useMemo(
    () => (Array.isArray(vendors) ? vendors : []).filter((vendor) => vendor?.id),
    [vendors],
  )

  if (selected) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
              <Store className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">{valueName || 'Selected store'}</p>
          </div>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onChange?.({ vendorId: '', vendorName: '' })}
              aria-label="Clear selected store"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="sr-only">Store</label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-xl border bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
        }`}
      />
      {open ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
        >
          {isError ? (
            <li className="px-3.5 py-3 text-sm text-slate-500">Could not load stores. Try again in a moment.</li>
          ) : isFetching && options.length === 0 ? (
            <li className="flex items-center gap-2 px-3.5 py-3 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Looking up stores
            </li>
          ) : options.length === 0 ? (
            <li className="px-3.5 py-3 text-sm text-slate-500">
              {query.trim() ? 'No stores match that search. Try another name.' : 'No live stores to attach yet.'}
            </li>
          ) : options.map((vendor) => (
            <li key={vendor.id} role="option">
              <button
                type="button"
                onClick={() => {
                  onChange?.({ vendorId: vendor.id, vendorName: vendor.store })
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                  <Store className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{vendor.store}</span>
                  {vendor.owner && vendor.owner !== '—' ? (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{vendor.owner}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
