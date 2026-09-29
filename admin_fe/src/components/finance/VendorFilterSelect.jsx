import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { FINANCE_VENDORS } from '../../constants/finance'

export default function VendorFilterSelect({
  id,
  value = '',
  onChange,
  vendors = FINANCE_VENDORS,
  label = 'Vendor',
}) {
  const listId = useId()
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedName = vendors.find((vendor) => vendor.id === value)?.name ?? 'All vendors'

  const options = useMemo(() => {
    const queryText = query.trim().toLowerCase()
    const matches = vendors.filter((vendor) => vendor.name.toLowerCase().includes(queryText))
    const includeAll = !queryText || 'all vendors'.includes(queryText)
    return includeAll ? [{ id: '', name: 'All vendors' }, ...matches] : matches
  }, [query, vendors])

  useEffect(() => {
    if (!open) return undefined
    const active = rootRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open, options.length])

  useEffect(() => {
    if (!open) return undefined
    searchRef.current?.focus()
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [open])

  const choose = (vendorId) => {
    onChange(vendorId)
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }

  const moveActive = (direction) => {
    if (!options.length) return
    setActiveIndex((current) => (current + direction + options.length) % options.length)
  }

  return (
    <div ref={rootRef} className={`relative ${open ? 'z-20' : ''}`}>
      <button
        id={id}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand-light"
      >
        <span className="truncate">{selectedName}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 p-2">
            <label className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <Search className="size-3.5 shrink-0 text-slate-400" />
              <span className="sr-only">Search vendors</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    moveActive(1)
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    moveActive(-1)
                  } else if (event.key === 'Enter') {
                    event.preventDefault()
                    const option = options[activeIndex]
                    if (option) choose(option.id)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    setOpen(false)
                    setQuery('')
                  }
                }}
                placeholder="Search vendors"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
          <ul id={listId} role="listbox" aria-label={label} className="max-h-56 overflow-y-auto p-1.5">
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">No vendors match that search.</li>
            ) : options.map((vendor, index) => {
              const selected = vendor.id === value
              const active = index === activeIndex
              return (
                <li key={vendor.id || 'all'} role="presentation">
                  <button
                    type="button"
                    role="option"
                    data-active={active ? 'true' : 'false'}
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(vendor.id)}
                    className={`w-full cursor-pointer truncate rounded-lg px-3 py-2 text-left text-sm ${
                      selected || active ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {vendor.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
