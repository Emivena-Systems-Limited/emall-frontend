import { ChevronDown, Ruler, Scale } from 'lucide-react'
import { FormFieldHint, OptionalBadge, ProductInput } from '../products/ProductFormControls'
import FieldError from '../auth/FieldError'
import CardStepHeader from './CardStepHeader'
import { BARCODE_TYPE_OPTIONS, VARIANT_DESCRIPTION_MAX_LENGTH } from './variantConstants'
import { svFieldError } from './variantFormUtils'

/** Barcode type + value as one compound control, so the field's total height never depends on how long the hint text is. */
function BarcodeField({ formik }) {
  const error = svFieldError(formik, 'barcode')
  const selectedType = BARCODE_TYPE_OPTIONS.find((option) => option.value === formik.values.barcode_type)

  return (
    <div data-field="barcode">
      <label htmlFor="barcode" className="mb-1.5 block">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Barcode</span>
          <OptionalBadge />
        </span>
        <FormFieldHint hint={selectedType?.hint} reserveHintSpace />
      </label>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-white transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light ${
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
        }`}
      >
        <div className="relative shrink-0 border-r border-slate-200 bg-slate-50">
          <select
            name="barcode_type"
            aria-label="Barcode type"
            value={formik.values.barcode_type}
            onChange={formik.handleChange}
            className="h-full cursor-pointer appearance-none bg-transparent py-3 pl-3 pr-6 text-xs font-bold text-slate-600 outline-none"
          >
            {BARCODE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
        </div>
        <input
          id="barcode"
          name="barcode"
          value={formik.values.barcode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="e.g. 012345678905"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}

function DimensionInput({ formik, id, label, unit }) {
  return (
    <div data-field={id}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-white transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light ${
          svFieldError(formik, id) ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
        }`}
      >
        <input
          id={id}
          name={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="0"
          value={formik.values[id]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <span className="flex shrink-0 items-center bg-slate-50 px-3 text-xs font-bold text-slate-400">
          {unit}
        </span>
      </div>
      {svFieldError(formik, id) && <FieldError message={svFieldError(formik, id)} />}
    </div>
  )
}

/** SKU, barcode, weight/dimensions, and description — used as a standalone step in the variant detail flow. */
export default function VariantIdentitySection({ formik, step }) {
  const descriptionLength = formik.values.description?.length ?? 0
  const nearLimit = descriptionLength >= VARIANT_DESCRIPTION_MAX_LENGTH * 0.9
  const atLimit = descriptionLength >= VARIANT_DESCRIPTION_MAX_LENGTH

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
      <CardStepHeader
        step={step}
        title="Identification & specs"
        subtitle="Help warehouse staff and customers tell this option apart from the others."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ProductInput
          id="sku"
          name="sku"
          label="Variant SKU"
          hint="Leave blank to use the product SKU"
          optional
          reserveHintSpace
          placeholder="AUD-001-BLK"
          value={formik.values.sku}
          onChange={(e) => formik.setFieldValue('sku', e.target.value.toUpperCase())}
          onBlur={formik.handleBlur}
          error={svFieldError(formik, 'sku')}
        />
        <BarcodeField formik={formik} />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Ruler className="size-3.5" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Package dimensions <span className="text-slate-400">(optional)</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DimensionInput formik={formik} id="length" label="Length" unit="cm" />
          <DimensionInput formik={formik} id="width" label="Width" unit="cm" />
          <DimensionInput formik={formik} id="height" label="Height" unit="cm" />
          <DimensionInput formik={formik} id="weight" label="Weight" unit="kg" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Scale className="size-3" />
          Used for accurate shipping estimates. Leave blank to inherit the base product's shipping weight.
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5" data-field="description">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor="description" className="text-sm font-semibold text-slate-800">
            Value description <span className="font-normal text-slate-400">Optional</span>
          </label>
          <span className={`shrink-0 text-xs font-semibold tabular-nums ${
            atLimit ? 'text-red-500' : nearLimit ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {descriptionLength}/{VARIANT_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={VARIANT_DESCRIPTION_MAX_LENGTH}
          placeholder="Anything unique about this option — fit notes, care instructions, what's included…"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
            svFieldError(formik, 'description') ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
          }`}
        />
        {svFieldError(formik, 'description') && <FieldError message={svFieldError(formik, 'description')} />}
      </div>
    </div>
  )
}
