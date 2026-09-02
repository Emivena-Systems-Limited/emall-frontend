import { useId } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { getSingleVariantValuePlaceholder } from './variantFormUtils'

/**
 * Full-width action bar at the bottom of an option-type form section —
 * add another value inline, then save the batch (edit flow).
 */
export default function VariantGroupActionBar({
  attribute,
  valueInput = '',
  onValueInputChange,
  onValueInputFocus,
  onValueInputKeyDown,
  onCommitValue,
  valuesError = '',
  onSave,
  saveLabel,
  isSaving = false,
  showSave = false,
  saveDisabled = false,
}) {
  const inputId = useId()
  const attributeLabel = attribute || 'option'
  const canAdd = Boolean(valueInput.trim())

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-dashed border-brand/40 bg-brand-light px-4 py-4 sm:px-5">
        <label htmlFor={inputId} className="mb-3 flex items-center gap-2.5 text-sm font-bold text-slate-900">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
          Add another {attributeLabel.toLowerCase()} value
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={valueInput}
            onChange={onValueInputChange}
            onFocus={onValueInputFocus}
            onKeyDown={onValueInputKeyDown}
            onBlur={onCommitValue}
            placeholder={getSingleVariantValuePlaceholder(attribute)}
            className="min-w-0 flex-1 rounded-xl border-2 border-brand/25 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={onCommitValue}
            disabled={!canAdd}
            className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Add value
          </button>
        </div>
        {valuesError ? <p className="mt-2 text-xs font-semibold text-red-600">{valuesError}</p> : null}
        <p className="mt-2 text-xs text-slate-600">
          Press Enter or comma after each value, or paste several at once.
        </p>
      </div>

      {showSave && onSave ? (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || saveDisabled}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saveLabel}
        </button>
      ) : null}
    </div>
  )
}
