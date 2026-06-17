import { useEffect, useRef, useState } from 'react'
import { ChevronDown, PenLine, Search, X } from 'lucide-react'
import FieldError from './FieldError'

export default function SearchableSelect({
  id,
  name,
  label,
  icon: Icon,
  options = [],
  value = '',
  onChange,
  onBlur,
  error,
  disabled = false,
  placeholder = 'Select…',
  customPlaceholder = 'Type your own value…',
  allowCustom = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isCustom, setIsCustom] = useState(() => (
    Boolean(value && !options.find((o) => o.value === value))
  ))
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const emitChange = (val) => onChange?.({ target: { name, value: val } })
  const emitBlur = () => onBlur?.({ target: { name } })

  const handleBlur = (event) => {
    const next = event.relatedTarget
    if (next && containerRef.current?.contains(next)) return
    emitBlur()
  }

  const handleSelect = (optVal) => {
    emitChange(optVal)
    setIsCustom(false)
    setOpen(false)
    setSearch('')
    setTimeout(() => emitBlur(), 0)
  }

  const enableCustom = () => {
    emitChange('')
    setIsCustom(true)
    setOpen(false)
    setSearch('')
  }

  const clearCustom = () => {
    setIsCustom(false)
    emitChange('')
    setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const ring     = 'focus:ring-2 focus:ring-brand-light'
  const bdNormal = `border-slate-200 hover:border-slate-300 focus:border-brand ${ring}`
  const bdError  = 'border-red-400 ring-2 ring-red-100'
  const baseCls  = 'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400'

  return (
    <div ref={containerRef} data-field={name} className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"
      >
        {Icon && <Icon className="size-4 text-slate-400" strokeWidth={1.75} />}
        {label}
      </label>

      {isCustom ? (
        <div className="relative fade-in">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => emitChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={customPlaceholder}
            disabled={disabled}
            autoFocus
            className={`${baseCls} pr-10 ${error ? bdError : bdNormal} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          />
          <button
            type="button"
            onClick={clearCustom}
            title="Back to list"
            aria-label="Back to dropdown list"
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded text-slate-400 transition-colors hover:text-brand"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setOpen((v) => !v)}
            onBlur={handleBlur}
            className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all ${
              value ? 'text-slate-900' : 'text-slate-400'
            } ${error ? bdError : bdNormal} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <span className="truncate">{selectedLabel || placeholder}</span>
            <ChevronDown
              className={`ml-2 size-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="fade-in absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 p-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <Search className="size-4 shrink-0 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="cursor-pointer text-slate-400 hover:text-slate-700"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <ul className="max-h-52 overflow-y-auto p-1.5">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2.5 text-sm italic text-slate-500">
                    No results for &ldquo;{search}&rdquo;
                  </li>
                ) : (
                  filtered.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light hover:text-brand ${
                          value === opt.value
                            ? 'bg-brand-light font-semibold text-brand'
                            : 'text-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))
                )}

                {allowCustom && (
                  <li className="mt-1 border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={enableCustom}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                    >
                      <PenLine className="size-3.5 text-brand" />
                      Enter manually…
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {error && <FieldError message={error} />}
    </div>
  )
}
