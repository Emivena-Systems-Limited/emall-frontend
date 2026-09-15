import { useEffect, useState } from 'react'
import { Check, PenLine, X } from 'lucide-react'
import { ProductInput } from '../products/ProductFormControls'
import AttributeIcon from './AttributeIcon'
import { ATTRIBUTE_PRESETS, CUSTOM_ATTRIBUTE_LABEL, isPresetAttribute } from './variantConstants'

/** Option type chips + collapsible custom option type input, shared by the single-variant form and the add-variant flow.
 *  Pass `excludeAttributes` (array of strings) to hide specific preset chips — used by SecondaryVariantSection
 *  to prevent the secondary attribute from duplicating the primary attribute type. */
export default function AttributeTypePicker({
  value,
  showCustom,
  onSelectPreset,
  onToggleCustom,
  onCloseCustom,
  onSaveCustom,
  onCustomChange,
  onCustomBlur,
  error,
  excludeAttributes = [],
}) {
  const [draft, setDraft] = useState('')
  const [localError, setLocalError] = useState('')
  const visiblePresets = excludeAttributes.length > 0
    ? ATTRIBUTE_PRESETS.filter(
      (p) => !excludeAttributes.some((ex) => ex?.toLowerCase() === p.toLowerCase()),
    )
    : ATTRIBUTE_PRESETS

  useEffect(() => {
    if (!showCustom) return
    setDraft(isPresetAttribute(value) ? '' : String(value ?? ''))
    setLocalError('')
  }, [showCustom])

  const handleSaveCustom = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setLocalError('Enter an option type name')
      return
    }

    setLocalError('')
    onSaveCustom?.(trimmed)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {visiblePresets.map((preset) => {
            const active = !showCustom && value === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand/50 hover:text-brand'
                }`}
              >
                <AttributeIcon attribute={preset} className="size-3.5" />
                {preset}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onToggleCustom}
          className={`ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-bold transition-all ${
            showCustom || (value && !isPresetAttribute(value))
              ? 'border-rose-400 bg-rose-500 text-white shadow-[0_8px_20px_rgba(244,63,94,0.22)]'
              : 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800'
          }`}
        >
          <PenLine className="size-3.5" />
          {CUSTOM_ATTRIBUTE_LABEL}
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
          showCustom ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-600">
                <PenLine className="size-3.5" />
                {CUSTOM_ATTRIBUTE_LABEL}
              </span>
              <button
                type="button"
                onClick={onCloseCustom}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
                aria-label="Close custom option type input"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <ProductInput
              id="attribute"
              name="attribute"
              label="Option type name"
              hint="e.g. RAM, Voltage, Finish"
              placeholder="e.g. RAM"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                setLocalError('')
                onCustomChange?.(event)
              }}
              onBlur={onCustomBlur}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSaveCustom()
                }
              }}
              error={localError || error}
            />
            <button
              type="button"
              onClick={handleSaveCustom}
              disabled={!draft.trim()}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" />
              Save option type
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-rose-700/80">
              Save the type first. Then you can add values — e.g. 8GB, 16GB, 32GB.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
