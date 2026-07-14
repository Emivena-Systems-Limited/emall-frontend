import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

export default function SearchableSelect({
  id,
  label,
  icon,
  value,
  onChange,
  error,
  disabled = false,
  options,
  placeholder = 'Search…',
  emptyLabel = 'Select an option',
  className = '',
  allowOther = false,
  otherValue = '__other__',
  otherLabel = 'Other',
  customValue = '',
  onCustomChange,
  customInputPlaceholder = 'Enter details…',
  customError,
}) {
  const listboxId = useId()
  const customInputId = `${id}-custom`
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const customInputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectableOptions = useMemo(
    () => options.filter((option) => option.value !== '' && !option.disabled),
    [options],
  )

  const selectedOption = useMemo(
    () => selectableOptions.find((option) => option.value === value),
    [selectableOptions, value],
  )

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return selectableOptions

    return selectableOptions.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    )
  }, [query, selectableOptions])

  const isOtherSelected = allowOther && value === otherValue
  const fieldError = error || customError

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      searchRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (isOtherSelected) {
      customInputRef.current?.focus()
    }
  }, [isOtherSelected])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setOpen(false)
    setQuery('')
  }

  const toggleOpen = () => {
    if (disabled) return
    setOpen((prev) => !prev)
    if (open) setQuery('')
  }

  const handleCancelOther = () => {
    onCustomChange?.('')
    onChange('')
  }

  const controlClassName = `rounded-xl border bg-white transition-colors ${
    fieldError
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-slate-200 focus-within:border-auth-primary focus-within:ring-2 focus-within:ring-red-100'
  } ${disabled ? 'opacity-60' : ''}`

  return (
    <div className={className} ref={containerRef}>
      <FieldLabel
        htmlFor={isOtherSelected ? customInputId : id}
        label={label}
        icon={icon}
      />

      <div className="relative">
        {isOtherSelected ? (
          <div className={`flex items-center ${controlClassName}`}>
            <input
              ref={customInputRef}
              id={customInputId}
              type="text"
              value={customValue}
              disabled={disabled}
              placeholder={customInputPlaceholder}
              onChange={(event) => onCustomChange?.(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:px-3 sm:py-2.5 min-[1800px]:px-5 min-[1800px]:py-4 min-[1800px]:text-base"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={handleCancelOther}
              aria-label={`Cancel custom ${label.toLowerCase()}`}
              className="mr-3 flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <button
              id={id}
              type="button"
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listboxId}
              onClick={toggleOpen}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm outline-none sm:px-3 sm:py-2.5 min-[1800px]:px-5 min-[1800px]:py-4 min-[1800px]:text-base ${controlClassName} ${
                !selectedOption ? 'text-slate-400' : 'text-slate-900'
              } ${disabled ? 'cursor-not-allowed' : ''}`}
            >
              <span className="truncate">{selectedOption?.label ?? emptyLabel}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {open && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                <div className="border-b border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                      aria-label={`Search ${label}`}
                    />
                  </div>
                </div>

                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label={label}
                  className="max-h-52 overflow-y-auto py-1"
                >
                  {filteredOptions.length === 0 && !allowOther ? (
                    <li className="px-4 py-3 text-base text-slate-400">No matches found</li>
                  ) : (
                    <>
                      {filteredOptions.map((option) => {
                        const isSelected = option.value === value

                        return (
                          <li key={option.value} role="option" aria-selected={isSelected}>
                            <button
                              type="button"
                              onClick={() => handleSelect(option.value)}
                              className={`flex w-full px-4 py-2.5 text-left text-base transition-colors hover:bg-slate-50 ${
                                isSelected
                                  ? 'bg-red-50 font-medium text-auth-primary'
                                  : 'text-slate-800'
                              }`}
                            >
                              {option.label}
                            </button>
                          </li>
                        )
                      })}

                      {filteredOptions.length === 0 && (
                        <li className="px-4 py-2 text-sm text-slate-400">No matches found</li>
                      )}

                      {allowOther && (
                        <li
                          role="option"
                          aria-selected={false}
                          className="border-t border-slate-100"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(otherValue)}
                            className="flex w-full px-4 py-2.5 text-left text-base text-slate-800 transition-colors hover:bg-slate-50"
                          >
                            {otherLabel}
                          </button>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {fieldError && <FieldError message={fieldError} />}
    </div>
  )
}
