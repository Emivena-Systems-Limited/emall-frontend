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
  onValueInputKeyDown,
  onCommitValue,
  valuesError = '',
  onSave,
  saveLabel,
  isSaving = false,
  showSave = false,
  saveDisabled = false,
}) {
  const attributeLabel = attribute || 'option'

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
          Add another {attributeLabel.toLowerCase()} value
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={valueInput}
            onChange={onValueInputChange}
            onKeyDown={onValueInputKeyDown}
            onBlur={onCommitValue}
            placeholder={getSingleVariantValuePlaceholder(attribute)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
          <button
            type="button"
            onClick={onCommitValue}
            disabled={!valueInput.trim()}
            className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Add value
          </button>
        </div>
        {valuesError && <p className="mt-2 text-xs font-semibold text-red-600">{valuesError}</p>}
        <p className="mt-2 text-[11px] text-slate-400">
          Press Enter or comma after each value, or paste several at once.
        </p>
      </div>

      {showSave && onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || saveDisabled}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {saveLabel}
        </button>
      )}
    </div>
  )
}
