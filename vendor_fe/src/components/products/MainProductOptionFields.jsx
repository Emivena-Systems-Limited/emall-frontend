import { useEffect, useState } from 'react'
import { getIn } from 'formik'
import { Check } from 'lucide-react'
import AttributeTypePicker from '../variants/AttributeTypePicker'
import AttributeIcon from '../variants/AttributeIcon'
import { isPresetAttribute } from '../variants/variantConstants'
import { getMainOptionValuePlaceholder } from '../variants/variantFormUtils'
import { ProductInput } from './ProductFormControls'
import CompatibleModelsField from './CompatibleModelsField'

function fieldError(formik, name) {
  const touched = getIn(formik.touched, name) || formik.submitCount > 0
  const error = getIn(formik.errors, name)
  return touched && typeof error === 'string' ? error : undefined
}

export default function MainProductOptionFields({ formik }) {
  const attribute = String(formik.values.main_attribute ?? '').trim()
  const value = String(formik.values.main_attribute_value ?? '').trim()
  const [showCustom, setShowCustom] = useState(() => Boolean(attribute && !isPresetAttribute(attribute)))
  const attributeError = fieldError(formik, 'main_attribute')
  const valueError = fieldError(formik, 'main_attribute_value')
  const compatibleError = fieldError(formik, 'compatible_models')
  const compatibleModels = Array.isArray(formik.values.compatible_models)
    ? formik.values.compatible_models
    : []
  const hasCompatibleModels = Boolean(formik.values.has_compatible_models)

  useEffect(() => {
    if (attribute && !isPresetAttribute(attribute)) {
      setShowCustom(true)
    }
  }, [attribute])

  const setAttribute = (next, { custom = false } = {}) => {
    setShowCustom(custom)
    formik.setFieldValue('main_attribute', next, true)
    formik.setFieldTouched('main_attribute', true, false)
    if (String(next ?? '').trim()) {
      formik.setFieldError('main_attribute', undefined)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-field="main_attribute">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Primary Product Identifier</p>
          <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-100">
            Required
          </span>
        </div>
        <h3 className="mt-1 text-sm font-bold text-slate-900">How should shoppers pick this product?</h3>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
          Choose one property that describes this listing — Color, Size, Material, or your own — and the value that matches
          what you are selling.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p id="main-attribute-label" className="mb-1.5 text-sm font-semibold text-slate-800">
            Option type <span className="text-red-600" aria-hidden="true">*</span>
          </p>
          <AttributeTypePicker
            value={attribute}
            showCustom={showCustom}
            onSelectPreset={(preset) => setAttribute(preset)}
            onToggleCustom={() => {
              setShowCustom(true)
              if (isPresetAttribute(attribute)) {
                formik.setFieldValue('main_attribute', '', false)
              }
            }}
            onCloseCustom={() => {
              setShowCustom(false)
              if (!isPresetAttribute(attribute)) {
                formik.setFieldValue('main_attribute', '', false)
              }
            }}
            onCustomChange={(event) => setAttribute(event.target.value, { custom: true })}
            onCustomBlur={() => formik.setFieldTouched('main_attribute', true, true)}
            error={attributeError}
          />
          {attributeError ? (
            <p id="main-attribute-error" className="mt-2 text-xs font-semibold text-red-600" role="alert">
              {attributeError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Pick the word shoppers will see above the options, such as Color or Size.
            </p>
          )}
        </div>

        <ProductInput
          id="main_attribute_value"
          name="main_attribute_value"
          label="Option value"
          hint="Required. This is the choice selected first on your product page."
          placeholder={getMainOptionValuePlaceholder(attribute)}
          value={formik.values.main_attribute_value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={valueError}
          aria-required="true"
          aria-describedby={valueError ? 'main_attribute_value-error' : undefined}
        />

        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-800">Compatible models</p>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            Optional. Use this when the default option fits more than one device or product model — for example a case that works on several phones.
          </p>
          <CompatibleModelsField
            enabled={hasCompatibleModels}
            values={compatibleModels}
            onEnabledChange={(next) => {
              formik.setFieldValue('has_compatible_models', next, true)
              formik.setFieldTouched('has_compatible_models', true, false)
              if (!next) {
                formik.setFieldValue('compatible_models', [], false)
                formik.setFieldError('compatible_models', undefined)
              }
            }}
            onValuesChange={(next) => {
              formik.setFieldValue('compatible_models', next, true)
              formik.setFieldValue('has_compatible_models', next.length > 0, false)
              formik.setFieldTouched('compatible_models', true, false)
            }}
            error={compatibleError}
          />
        </div>
      </div>

      {attribute && value ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100">
            <AttributeIcon attribute={attribute} className="size-4" />
          </span>
          <div className="min-w-0">
            
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {attribute}: {value}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Uses your product photos, price, and stock
              {compatibleModels.length > 0
                ? `, and fits ${compatibleModels.length} model${compatibleModels.length === 1 ? '' : 's'}`
                : ''}
              . Extra options on later steps can override those when selected. This appears as the locked default on the variations step.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
