import { Check, Link2, X } from 'lucide-react'
import VariantValuesInput from '../variants/VariantValuesInput'

/** Compact yes/no + chips for “fits these models” — used on the primary identifier and default variant. */
export default function CompatibleModelsField({
  enabled = false,
  values = [],
  onEnabledChange,
  onValuesChange,
  error,
  compact = false,
}) {
  return (
    <div className={compact ? '' : 'space-y-3'}>
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            onEnabledChange(false)
            onValuesChange([])
          }}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            !enabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <X className="size-3.5" />
          No
        </button>
        <button
          type="button"
          onClick={() => onEnabledChange(true)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            enabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Check className="size-3.5" />
          Yes, it fits multiple models
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
          enabled ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-xl border border-brand/15 bg-brand-light/20 p-3 sm:p-4">
            <VariantValuesInput
              values={values}
              onChange={(next) => {
                onValuesChange(next)
                onEnabledChange(next.length > 0)
              }}
              label="Compatible models"
              hint="Press Enter or comma after each model name."
              placeholder="iPhone 13, iPhone 13 Pro, iPhone 13 Pro Max"
              dataField="compatible_models"
              error={error}
            />
            {values.length > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand/80">
                <Link2 className="size-3" />
                Fits {values.length} model{values.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
