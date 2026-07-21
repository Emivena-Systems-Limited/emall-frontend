import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Form, Formik } from 'formik'
import { ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react'
import { singleVariantSchema } from '../../utils/validationSchemas'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import { scrollToFirstError, touchFieldsWithErrors } from '../../utils/scrollToFirstError'
import AttributeIcon from './AttributeIcon'
import VariantDetailFields from './VariantDetailFields'
import { normalizeVariantOptionalFields } from './variantFormUtils'

function VariantDrawerHeader({ attribute, value, formik, productValues, onClose }) {
  const pricing = resolveVariantPricing(formik.values, productValues)
  const hasImage = (formik.values.images ?? []).length > 0

  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-brand-light/60 via-white to-white px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
            <AttributeIcon attribute={attribute} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
              {attribute || 'Option'} value
            </p>
            <p id="variant-drawer-title" className="truncate text-lg font-bold leading-tight text-slate-900">
              {value}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Photos, specs, pricing, stock & compatibility for this option.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close panel"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
          GH₵ {formatMoney(pricing.hasDiscount ? pricing.salePrice : pricing.listPrice)}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            hasImage
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
          }`}
        >
          <CheckCircle2 className="size-3" />
          {hasImage ? 'Photo added' : 'Needs a photo'}
        </span>
      </div>
    </div>
  )
}

function VariantDetailsForm({ attribute, value, initialValues, productValues, onClose, onSave, isSaving }) {
  const mainQty = productValues?.quantity ? Number(productValues.quantity) : null
  const scrollContainerRef = useRef(null)
  const [isCustomPrice, setIsCustomPrice] = useState(() =>
    initialValues.price !== '' && initialValues.price != null,
  )

  const validateCustomPrice = (values) => {
    if (!isCustomPrice) return {}
    if (values.price === '' || values.price == null) {
      return { price: 'Enter a regular price for custom pricing' }
    }
    return {}
  }

  const handleAttemptSave = async (formik) => {
    const errors = await formik.validateForm()
    if (Object.keys(errors).length > 0) {
      formik.setTouched(touchFieldsWithErrors(errors), false)
      requestAnimationFrame(() => {
        scrollToFirstError(errors, scrollContainerRef.current)
      })
      return
    }

    await formik.submitForm()
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={singleVariantSchema}
      validate={validateCustomPrice}
      validationContext={mainQty != null ? { mainProductQuantity: mainQty } : undefined}
      validateOnBlur
      validateOnChange={false}
      onSubmit={async (values, actions) => {
        try {
          const normalized = normalizeVariantOptionalFields(values, { isCustomPrice })
          await onSave(normalized)
        } finally {
          actions.setSubmitting(false)
        }
      }}
    >
      {(formik) => (
        <Form className="flex h-full flex-col">
          <VariantDrawerHeader
            attribute={attribute}
            value={value}
            formik={formik}
            productValues={productValues}
            onClose={onClose}
          />

          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6"
          >
            <VariantDetailFields
              formik={formik}
              productValues={productValues}
              isCustomPrice={isCustomPrice}
              setIsCustomPrice={setIsCustomPrice}
              mainQty={mainQty}
              startStep={1}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={formik.isSubmitting || isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAttemptSave(formik)}
              disabled={formik.isSubmitting || isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formik.isSubmitting || isSaving ? (
                <><Loader2 className="size-4 animate-spin" /> Saving…</>
              ) : (
                <>Save details <ArrowRight className="size-4" /></>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

/** Right-side panel used to fill in photo, pricing, and stock for a single variant value. */
export default function VariantDetailsDrawer({ open, attribute, value, initialValues, productValues, onClose, onSave, isSaving }) {
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-120" role="dialog" aria-modal="true" aria-labelledby="variant-drawer-title">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="overlay-appear absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />
      <div className="slide-in-right absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-slate-50 shadow-[-24px_0_60px_rgba(15,23,42,0.25)]">
        {value != null && (
          <VariantDetailsForm
            key={`${attribute}::${value}`}
            attribute={attribute}
            value={value}
            initialValues={initialValues}
            productValues={productValues}
            onClose={onClose}
            onSave={onSave}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
