import { useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react'
import { ProductInput } from '../products/ProductFormControls'
import { singleVariantSchema } from '../../utils/validationSchemas'
import AttributeTypePicker from './AttributeTypePicker'
import CardStepHeader from './CardStepHeader'
import VariantDetailFields from './VariantDetailFields'
import VariantPreviewChip from './VariantPreviewChip'
import { isPresetAttribute } from './variantConstants'
import { EMPTY_VARIANT_VALUES, getVariantValuePlaceholder, svFieldError } from './variantFormUtils'

export default function SingleVariantForm({ mode, initialValues, productValues, onSave, onSaveAndAddAnother, onCancel, isSaving }) {
  const isEdit = mode === 'edit'
  const mainQty = productValues?.quantity ? Number(productValues.quantity) : null
  const [showAdvanced, setShowAdvanced] = useState(() => Boolean(initialValues.variant_name))
  const [isCustomPrice, setIsCustomPrice] = useState(() =>
    initialValues.price !== '' && initialValues.price != null,
  )
  const [justAddedAnother, setJustAddedAnother] = useState(false)
  const [showCustomAttribute, setShowCustomAttribute] = useState(() =>
    Boolean(initialValues.attribute && !isPresetAttribute(initialValues.attribute)),
  )

  useEffect(() => {
    if (!justAddedAnother) return undefined
    const timer = setTimeout(() => setJustAddedAnother(false), 4000)
    return () => clearTimeout(timer)
  }, [justAddedAnother])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={singleVariantSchema}
      validationContext={mainQty != null ? { mainProductQuantity: mainQty } : undefined}
      validateOnBlur
      validateOnChange={false}
      onSubmit={async (values, actions) => {
        try {
          await onSave(values)
        } finally {
          actions.setSubmitting(false)
        }
      }}
    >
      {(formik) => {
        const attributeType = formik.values.attribute || initialValues.attribute || ''
        const valuePlaceholder = getVariantValuePlaceholder(attributeType)

        const handleSaveAndAddAnother = async () => {
          formik.setStatus('add-another')
          formik.setSubmitting(true)
          try {
            const errors = await formik.validateForm()
            if (Object.keys(errors).length > 0) {
              formik.setTouched(
                Object.keys(errors).reduce((touched, key) => ({ ...touched, [key]: true }), {}),
                false,
              )
              return
            }
            await onSaveAndAddAnother(formik.values)
            formik.resetForm({ values: { ...EMPTY_VARIANT_VALUES, attribute: formik.values.attribute } })
            setShowAdvanced(false)
            setIsCustomPrice(false)
            setJustAddedAnother(true)
          } finally {
            formik.setSubmitting(false)
            formik.setStatus(undefined)
          }
        }

        return (
          <Form className="space-y-6">
          <VariantPreviewChip attribute={attributeType} value={formik.values.value} isEdit={isEdit} />

          {justAddedAnother && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0" />
              Value added. Keep adding more {attributeType || 'option'} values below, or head back when you're done.
            </div>
          )}

          {/* Step 1: Variation type */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={1}
              title="What are you offering options for?"
              subtitle="Pick a common type, or choose Custom attribute to enter your own."
              required
            />
            <AttributeTypePicker
              value={formik.values.attribute}
              showCustom={showCustomAttribute}
              onSelectPreset={(preset) => {
                setShowCustomAttribute(false)
                formik.setFieldValue('attribute', preset)
              }}
              onToggleCustom={() => {
                setShowCustomAttribute(true)
                if (isPresetAttribute(formik.values.attribute)) {
                  formik.setFieldValue('attribute', '')
                }
              }}
              onCloseCustom={() => {
                setShowCustomAttribute(false)
                formik.setFieldValue('attribute', '')
              }}
              onCustomChange={formik.handleChange}
              onCustomBlur={formik.handleBlur}
              error={svFieldError(formik, 'attribute')}
            />
          </div>

          {/* Step 2: Value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={2}
              title="Set the value for this option"
              subtitle="This is what customers will pick, e.g. a specific colour or size."
              required
            />
            <ProductInput
              id="value"
              name="value"
              label={attributeType ? `${attributeType} value` : 'Variation value'}
              hint={valuePlaceholder}
              placeholder={valuePlaceholder.replace(/^e\.g\.\s*/, '')}
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={svFieldError(formik, 'value')}
            />

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-brand"
            >
              {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {showAdvanced ? 'Hide display name' : 'Add a display name (optional)'}
            </button>

            {showAdvanced && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ProductInput
                  id="variant_name"
                  name="variant_name"
                  label="Variant display name"
                  hint={`Defaults to "${formik.values.value || 'value'}" if empty.`}
                  optional
                  placeholder={formik.values.value || 'e.g. Midnight Black'}
                  value={formik.values.variant_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'variant_name')}
                />
              </div>
            )}
          </div>

          <VariantDetailFields
            formik={formik}
            productValues={productValues}
            isCustomPrice={isCustomPrice}
            setIsCustomPrice={setIsCustomPrice}
            mainQty={mainQty}
            startStep={3}
          />

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              disabled={formik.isSubmitting || isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft className="size-4" />
              Back to variants
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {!isEdit && onSaveAndAddAnother && (
                <button
                  type="button"
                  onClick={handleSaveAndAddAnother}
                  disabled={formik.isSubmitting || isSaving}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand-light/50 px-5 py-3 text-sm font-bold text-brand transition-colors hover:border-brand/50 hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formik.isSubmitting && formik.status === 'add-another' ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Plus className="size-4" /> Save & add another value</>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={formik.isSubmitting || isSaving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formik.isSubmitting && formik.status !== 'add-another' ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving…</>
                ) : isEdit ? (
                  <>Save changes <ArrowRight className="size-4" /></>
                ) : (
                  <>Add variant & finish <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          </div>
          </Form>
        )
      }}
    </Formik>
  )
}
