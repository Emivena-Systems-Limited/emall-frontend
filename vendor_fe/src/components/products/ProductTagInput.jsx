import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import FieldError from '../auth/FieldError'
import { FormFieldHint } from './ProductFormControls'

export default function ProductTagInput({
  tags = [],
  onChange,
  error,
  label = 'Tags',
  hint,
  maxTags = 15,
  reserveHintSpace = false,
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30)
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return
    onChange([...tags, tag])
    setInput('')
  }

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag))

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(input)
    } else if (event.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div data-field="tags">
      {label && (
        <label className="mb-1.5 block">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <FormFieldHint hint={hint} reserveHintSpace={reserveHintSpace} />
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-12 cursor-text flex-wrap items-center gap-1.5 rounded-xl border bg-white px-4 py-3 transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light ${
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
        }`}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="cursor-pointer rounded-full text-slate-400 transition-colors hover:text-red-500"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) addTag(input) }}
            placeholder={tags.length === 0 ? 'Type and press Enter or comma…' : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        )}
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
