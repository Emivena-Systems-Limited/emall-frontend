import { useId } from 'react'
import { GitBranch, Loader2, Plus } from 'lucide-react'
import { getSingleVariantValuePlaceholder } from './variantFormUtils'

/**
 * Full-width action bar at the bottom of an option-type form section.
 * Create flow: add another primary value (Color, Size, …).
 * Edit flow: add a secondary sub-option, then save this variant.
 */
export default function VariantGroupActionBar({
  attribute,
  valueInput = '',
  onValueInputChange,
  onValueInputFocus,
  onValueInputKeyDown,
  onCommitValue,
  valuesError = '',
  secondaryAttribute = '',
  onAddSecondary,
  onSave,
  saveLabel = 'Save variant',
  isSaving = false,
  showSave = false,
  saveDisabled = false,
  addDisabled = false,
}) {
  const inputId = useId()
  const attributeLabel = attribute || 'option'
  const canAdd = Boolean(valueInput.trim())
  const typeLabel = String(secondaryAttribute ?? '').trim() || 'secondary'

  if (onAddSecondary) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl border border-dashed border-brand/50 bg-brand-light/40 px-4 pb-4 pt-6 sm:px-5">
          <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add new secondary variant
          </span>
          <button
            type="button"
            onClick={onAddSecondary}
            disabled={addDisabled}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/20 bg-white px-4 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GitBranch className="size-4" />
            Add another {typeLabel} value
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Adds a sub-option under this variant — e.g. another RAM or size — then save this variant.
          </p>
        </div>

        {showSave && onSave ? (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || saveDisabled}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saveLabel}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border border-dashed border-brand/50 bg-brand-light/40 px-4 pb-4 pt-6 sm:px-5">
        <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">
          <Plus className="size-3.5" strokeWidth={2.5} />
          Add another {attributeLabel.toLowerCase()} value
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id={inputId}
            type="text"
            value={valueInput}
            onChange={onValueInputChange}
            onFocus={onValueInputFocus}
            onKeyDown={onValueInputKeyDown}
            placeholder={getSingleVariantValuePlaceholder(attribute)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={onCommitValue}
            disabled={!canAdd}
            className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Add value
          </button>
        </div>
        {valuesError ? <p className="mt-2 text-xs font-semibold text-red-600">{valuesError}</p> : null}
        <p className="mt-2 text-xs text-slate-500">
          Press Enter or comma after each value, or paste several at once.
        </p>
      </div>

      {showSave && onSave ? (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || saveDisabled}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saveLabel}
        </button>
      ) : null}
    </div>
  )
}
