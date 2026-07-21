import { PenLine, X } from 'lucide-react'
import { ProductInput } from '../products/ProductFormControls'
import AttributeIcon from './AttributeIcon'
import { ATTRIBUTE_PRESETS, CUSTOM_ATTRIBUTE_LABEL } from './variantConstants'

/** Attribute type chips + collapsible custom attribute input, shared by the single-variant form and the add-variant flow. */
export default function AttributeTypePicker({
  value,
  showCustom,
  onSelectPreset,
  onToggleCustom,
  onCloseCustom,
  onCustomChange,
  onCustomBlur,
  error,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {ATTRIBUTE_PRESETS.map((preset) => {
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
            showCustom
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
                aria-label="Close custom attribute input"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <ProductInput
              id="attribute"
              name="attribute"
              label="Attribute name"
              hint="e.g. Voltage, Finish, Fragrance"
              placeholder="e.g. Material"
              value={value}
              onChange={onCustomChange}
              onBlur={onCustomBlur}
              error={error}
            />
          </div>
        </div>
      </div>
    </>
  )
}
