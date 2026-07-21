import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import FieldError from '../auth/FieldError'
import { FormFieldHint } from '../products/ProductFormControls'
import { parseMultiValues } from './variantFormUtils'

/** Multi-value input for variant option values — chips render inside the field as values are added. */
export default function VariantValuesInput({
  values = [],
  onChange,
  error,
  label,
  hint,
  placeholder = 'Red, Blue, Green',
  maxValues = 50,
  dataField = 'variant-values',
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const valuesLower = new Set(values.map((item) => item.toLowerCase()))

  const addValue = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed || values.length >= maxValues) return false
    const key = trimmed.toLowerCase()
    if (valuesLower.has(key)) return false
    onChange([...values, trimmed])
    return true
  }

  const addMany = (raw) => {
    const parsed = parseMultiValues(raw)
    if (parsed.length === 0) return
    const next = [...values]
    const seen = new Set(values.map((item) => item.toLowerCase()))
    parsed.forEach((entry) => {
      const key = entry.toLowerCase()
      if (seen.has(key) || next.length >= maxValues) return
      seen.add(key)
      next.push(entry)
    })
    onChange(next)
  }

  const removeValue = (value) => onChange(values.filter((item) => item !== value))

  const commitInput = () => {
    if (!input.trim()) return
    if (input.includes(',')) {
      addMany(input)
    } else {
      addValue(input)
    }
    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitInput()
    } else if (event.key === 'Backspace' && !input && values.length > 0) {
      removeValue(values[values.length - 1])
    }
  }

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text')
    if (!pasted.includes(',')) return
    event.preventDefault()
    addMany(pasted)
    setInput('')
  }

  return (
    <div data-field={dataField}>
      {label && (
        <label className="mb-1.5 block">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <FormFieldHint hint={hint} />
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-12 cursor-text flex-wrap items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light ${
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
        }`}
      >
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex max-w-full items-center gap-1 rounded-lg bg-brand-light/70 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-brand/15"
          >
            <span className="truncate">{value}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                removeValue(value)
              }}
              className="cursor-pointer shrink-0 rounded-full text-brand/60 transition-colors hover:text-red-500"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {values.length < maxValues && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={commitInput}
            placeholder={values.length === 0 ? placeholder : 'Add another…'}
            className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        )}
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
