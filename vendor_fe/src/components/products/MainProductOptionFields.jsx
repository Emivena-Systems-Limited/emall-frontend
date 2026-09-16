import { useEffect, useRef, useState } from 'react'
import { getIn } from 'formik'
import AttributeTypePicker from '../variants/AttributeTypePicker'
import AttributeIcon from '../variants/AttributeIcon'
import { isPresetAttribute } from '../variants/variantConstants'
import { getMainOptionValuePlaceholder } from '../variants/variantFormUtils'
import { FieldHintTooltip, ProductInput } from './ProductFormControls'

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
  const hasSelectedOption = Boolean(attribute)
  const valueInputRef = useRef(null)
  const skipValueFocusRef = useRef(hasSelectedOption)

  useEffect(() => {
    if (attribute && !isPresetAttribute(attribute)) {
      setShowCustom(true)
    }
  }, [attribute])

  useEffect(() => {
    if (!hasSelectedOption) return undefined
    if (skipValueFocusRef.current) {
      skipValueFocusRef.current = false
      return undefined
    }
    const timeoutId = window.setTimeout(() => {
      valueInputRef.current?.focus()
    }, 220)
    return () => window.clearTimeout(timeoutId)
  }, [hasSelectedOption])

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
        <h3 className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <span>How should shoppers pick this product?</span>
          <FieldHintTooltip
            className="w-72"
            label="About this option"
            hint="Choose one property that describes this listing — Color, Size, Material, or your own — and the value that matches what you are selling."
          />
        </h3>
      </div>

      <div>
        <div>
          <p id="main-attribute-label" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <span>
              Option type <span className="text-red-600" aria-hidden="true">*</span>
            </span>
            <FieldHintTooltip
              className="w-72"
              hint="Pick the word shoppers will see above the options, such as Color or Size. The value field appears after you choose a type."
            />
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
            onSaveCustom={(name) => setAttribute(name, { custom: true })}
            onCustomBlur={() => formik.setFieldTouched('main_attribute', true, true)}
            error={attributeError}
          />
          {attributeError ? (
            <p id="main-attribute-error" className="mt-2 text-xs font-semibold text-red-600" role="alert">
              {attributeError}
            </p>
          ) : null}
        </div>

        <div
          className={`grid h-fit transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
            hasSelectedOption ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="h-auto">
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
                ref={valueInputRef}
              />
            </div>

            {value ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100">
                  <AttributeIcon attribute={attribute} className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    {attribute}: {value}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    Uses your product photos, price, and stock. Extra options on later steps can override those when selected. This appears as the locked default on the variations step.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
