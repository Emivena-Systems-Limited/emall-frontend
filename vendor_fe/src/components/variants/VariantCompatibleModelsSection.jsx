import { Check, Link2, X } from 'lucide-react'
import CardStepHeader from './CardStepHeader'
import VariantValuesInput from './VariantValuesInput'
import { svFieldError } from './variantFormUtils'

/** Optional "fits these models" list — e.g. phone case variants that fit multiple device models. */
export default function VariantCompatibleModelsSection({ formik, step }) {
  const hasCompatibleModels = formik.values.has_compatible_models

  const setHasCompatibleModels = (next) => {
    formik.setFieldValue('has_compatible_models', next)
    if (!next) formik.setFieldValue('compatible_models', [])
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
      <CardStepHeader
        step={step}
        title="Compatible models"
        subtitle="Does this option fit specific device or product models? e.g. a phone case sized for several handset models."
      />

      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setHasCompatibleModels(false)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            !hasCompatibleModels ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <X className="size-3.5" /> No
        </button>
        <button
          type="button"
          onClick={() => setHasCompatibleModels(true)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            hasCompatibleModels ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Check className="size-3.5" /> Yes, it fits multiple models
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
          hasCompatibleModels ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-xl border border-brand/15 bg-brand-light/20 p-4">
            <VariantValuesInput
              values={formik.values.compatible_models}
              onChange={(next) => formik.setFieldValue('compatible_models', next)}
              label="Compatible models"
              hint="Press Enter or comma after each model name."
              placeholder="iPhone 13, iPhone 13 Pro, iPhone 13 Pro Max"
              dataField="compatible_models"
              error={svFieldError(formik, 'compatible_models')}
            />
            {formik.values.compatible_models.length > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand/80">
                <Link2 className="size-3" />
                Fits {formik.values.compatible_models.length} model{formik.values.compatible_models.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
