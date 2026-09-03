import { Form, Formik } from 'formik'
import { Loader2, RotateCcw, X } from 'lucide-react'
import VendorDialog, { VendorDialogFooter } from '../vendors/VendorDialog'
import PaymentStatusBadge from '../orders/PaymentStatusBadge'
import { useRefundPaymentMutation } from '../../hooks/useAdminPayments'
import { formatOrderMoney } from '../../utils/formatters'
import { paymentRefundSchema } from '../../utils/validationSchemas'

export default function PaymentRefundModal({ open, item, onClose }) {
  if (!open || !item) return null
  return <PaymentRefundForm key={item.id} item={item} onClose={onClose} />
}

function PaymentRefundForm({ item, onClose }) {
  const mutation = useRefundPaymentMutation()
  const busy = mutation.isPending

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  return (
    <Formik
      initialValues={{ reason: '' }}
      validationSchema={paymentRefundSchema}
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync({ id: item.id, reason: values.reason.trim() })
          onClose()
        } catch {
          /* toast handled */
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => {
        const pending = busy || isSubmitting
        return (
          <VendorDialog open onClose={handleClose} labelledBy="payment-refund-title" widthClass="max-w-md">
            <Form>
              <div className="relative overflow-hidden">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-rose-600" />
                <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                    <RotateCcw className="size-5" strokeWidth={2} />
                  </span>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={pending}
                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-5 pt-4 sm:px-6">
                  <h2 id="payment-refund-title" className="text-xl font-bold tracking-tight text-slate-950">
                    Issue this refund?
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {formatOrderMoney(item.amount)} will be returned to the shopper. This cannot be undone from here.
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.orderNumber || item.reference || 'Checkout'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{item.shopperName || 'Shopper'}</p>
                  </div>
                  <PaymentStatusBadge status={item.status} />
                </div>

                <label htmlFor="payment-refund-reason" className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason
                  </span>
                  <textarea
                    id="payment-refund-reason"
                    name="reason"
                    rows={3}
                    value={values.reason}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={pending}
                    placeholder="Duplicate charge, cancelled order, shopper request…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light disabled:opacity-60"
                  />
                  {touched.reason && errors.reason ? (
                    <span className="mt-1.5 block text-xs font-medium text-rose-600">{errors.reason}</span>
                  ) : null}
                </label>
              </div>

              <VendorDialogFooter>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleClose}
                  className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep payment
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Issue refund
                </button>
              </VendorDialogFooter>
            </Form>
          </VendorDialog>
        )
      }}
    </Formik>
  )
}
