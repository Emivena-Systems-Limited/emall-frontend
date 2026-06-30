import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, PenLine, Search, X } from 'lucide-react'
import FieldError from './FieldError'
import { FormFieldHint } from '../products/ProductFormControls'

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
  customEntryLabel = 'Enter manually…',
  customSubmitLabel = 'Add brand',
  hint,
  reserveHintSpace = false,
  onCustomModeStart,
  onCustomSubmit,
  isCustomSubmitting = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customDraft, setCustomDraft] = useState('')
  const [isCustom, setIsCustom] = useState(() => (
    Boolean(value && !options.find((o) => o.value === value) && !onCustomSubmit)
  ))
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!value) {
      setIsCustom(false)
      return
    }
    if (onCustomSubmit) {
      setIsCustom(false)
      return
    }
    if (!options.find((o) => o.value === value)) {
      setIsCustom(true)
    } else {
      setIsCustom(false)
    }
  }, [value, options, onCustomSubmit])

  useEffect(() => {
    if (!isCustom) setCustomDraft('')
  }, [isCustom])

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
    setIsCustom(true)
    setCustomDraft('')
    setOpen(false)
    setSearch('')
    onCustomModeStart?.()
  }

  const clearCustom = () => {
    setIsCustom(false)
    setCustomDraft('')
    if (!onCustomSubmit) {
      emitChange('')
    }
    setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const applyCustomValue = async (customValue) => {
    const nextValue = customValue.trim()
    if (!nextValue || isCustomSubmitting) return

    if (onCustomSubmit) {
      try {
        await onCustomSubmit(nextValue)
        setIsCustom(false)
        setCustomDraft('')
        setOpen(false)
        setSearch('')
      } catch {
        // handled by caller
      }
      return
    }

    emitChange(nextValue)
    setIsCustom(true)
    setOpen(false)
    setSearch('')
    setTimeout(() => emitBlur(), 0)
  }

  const submitCustomDraft = async () => {
    await applyCustomValue(customDraft)
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''
  const trimmedSearch = search.trim()
  const hasExactOptionMatch = options.some(
    (option) =>
      option.value === trimmedSearch
      || option.label.toLowerCase() === trimmedSearch.toLowerCase(),
  )
  const showAddFromSearch = allowCustom && trimmedSearch && !hasExactOptionMatch
  const triggerLabel = selectedLabel || (value && !selectedLabel ? value : '') || placeholder

  const ring     = 'focus:ring-2 focus:ring-brand-light'
  const bdNormal = `border-slate-200 hover:border-slate-300 focus:border-brand ${ring}`
  const bdError  = 'border-red-400 ring-2 ring-red-100'
  const baseCls  = 'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400'

  return (
    <div ref={containerRef} data-field={name} className="relative">
      <label htmlFor={id} className="mb-1.5 block">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {Icon && <Icon className="size-4 shrink-0 text-slate-400" strokeWidth={1.75} />}
          {label}
        </span>
        <FormFieldHint hint={hint} reserveHintSpace={reserveHintSpace} />
      </label>

      {isCustom ? (
        <div className="fade-in space-y-2">
          <div className="relative">
            <input
              id={id}
              type="text"
              value={onCustomSubmit ? customDraft : value}
              onChange={(e) => {
                if (onCustomSubmit) {
                  setCustomDraft(e.target.value)
                  return
                }
                emitChange(e.target.value)
              }}
              onKeyDown={(event) => {
                if (onCustomSubmit && event.key === 'Enter') {
                  event.preventDefault()
                  submitCustomDraft()
                }
              }}
              onBlur={onCustomSubmit ? undefined : handleBlur}
              placeholder={customPlaceholder}
              disabled={disabled || isCustomSubmitting}
              autoFocus
              className={`${baseCls} pr-10 ${error ? bdError : bdNormal} ${disabled || isCustomSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
            />
            <button
              type="button"
              onClick={clearCustom}
              title="Back to list"
              aria-label="Back to dropdown list"
              disabled={isCustomSubmitting}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded text-slate-400 transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-4" />
            </button>
          </div>
          {onCustomSubmit && (
            <button
              type="button"
              onClick={submitCustomDraft}
              disabled={disabled || isCustomSubmitting || !customDraft.trim()}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCustomSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding brand…
                </>
              ) : (
                customSubmitLabel
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
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
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown
              className={`ml-2 size-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="fade-in absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
                {showAddFromSearch && (
                  <li className="mb-1">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyCustomValue(trimmedSearch)}
                      disabled={isCustomSubmitting}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-brand-light px-3 py-2.5 text-left text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCustomSubmitting ? (
                        <Loader2 className="size-3.5 shrink-0 animate-spin" />
                      ) : (
                        <PenLine className="size-3.5 shrink-0" />
                      )}
                      Add brand &ldquo;{trimmedSearch}&rdquo;
                    </button>
                  </li>
                )}

                {filtered.length === 0 ? (
                  !showAddFromSearch && (
                    <li className="px-3 py-2.5 text-sm italic text-slate-500">
                      No results for &ldquo;{search}&rdquo;
                    </li>
                  )
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
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={enableCustom}
                      disabled={isCustomSubmitting}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PenLine className="size-3.5 text-brand" />
                      {customEntryLabel}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <FieldError message={error} />}
    </div>
  )
}
