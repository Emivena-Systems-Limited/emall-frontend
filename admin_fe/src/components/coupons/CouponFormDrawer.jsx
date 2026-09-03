import { Formik } from 'formik'
import { Loader2, Pencil, TicketPercent } from 'lucide-react'
import FieldError from '../auth/FieldError'
import SlideDrawer from '../vendors/SlideDrawer'
import { COUPON_DESCRIPTION_MAX, COUPON_TYPES, getCouponTypeMeta } from '../../constants/coupons'
import { useCreateCouponMutation, useUpdateCouponMutation } from '../../hooks/useAdminCoupons'
import { parseApiError } from '../../utils/parseApiError'
import { couponToFormValues, formatCouponOffer, formatCouponRedemptionSummary } from '../../utils/normalizeAdminCoupons'
import { getCouponFormSchema } from '../../utils/validationSchemas'
import CouponVendorPicker from './CouponVendorPicker'

const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60'

const FIELD_MAP = {
  vendor_id: 'vendorId',
  code: 'code',
  type: 'type',
  value: 'value',
  minimum_purchase: 'minimumPurchase',
  usage_limit: 'usageLimit',
  per_user_limit: 'perUserLimit',
  maximum_discount: 'maximumDiscount',
  is_stackable: 'stackable',
  description: 'description',
}

function applyServerErrors(error, setErrors, setFieldError) {
  const parsed = parseApiError(error)
  const next = {}
  Object.entries(parsed.fieldErrors ?? {}).forEach(([field, message]) => {
    const key = FIELD_MAP[field] || field
    next[key] = message
  })
  if (Object.keys(next).length > 0) {
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) setFieldError(first, next[first])
  }
}

function CouponForm({ mode, coupon, onClose }) {
  const isEdit = mode === 'edit'
  const createMutation = useCreateCouponMutation()
  const updateMutation = useUpdateCouponMutation()
  const mutation = isEdit ? updateMutation : createMutation

  return (
    <Formik
      initialValues={couponToFormValues(isEdit ? coupon : null)}
      validationSchema={getCouponFormSchema(isEdit)}
      onSubmit={async (values, helpers) => {
        try {
          if (isEdit) {
            await updateMutation.mutateAsync({ id: coupon.id, ...values })
          } else {
            await createMutation.mutateAsync(values)
          }
          onClose()
        } catch (error) {
          applyServerErrors(error, helpers.setErrors, helpers.setFieldError)
        } finally {
          helpers.setSubmitting(false)
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        submitCount,
        isSubmitting,
        submitForm,
      }) => {
        const busy = isSubmitting || mutation.isPending
        const typeMeta = getCouponTypeMeta(values.type)
        const showError = (field) => (touched[field] || submitCount > 0) && errors[field]
        const errorEntries = Object.entries(errors).filter(([field, message]) => (
          message && (touched[field] || submitCount > 0)
        ))

        return (
          <SlideDrawer
              open
              onClose={() => {
                if (busy) return
                onClose()
              }}
              labelledBy="coupon-form-title"
              title={isEdit ? 'Edit coupon' : 'New coupon'}
              subtitle={isEdit ? coupon?.code : 'Create a checkout code for a store'}
              icon={isEdit ? Pencil : TicketPercent}
              widthClass="max-w-lg"
              footer={(
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (busy) return
                      onClose()
                    }}
                    className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitForm()}
                    className="inline-flex flex-[1.4] cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    {isEdit ? 'Save changes' : 'Create coupon'}
                  </button>
                </div>
              )}
            >
              <div className="space-y-4">
                {errorEntries.length > 0 && (
                  <div
                    tabIndex={-1}
                    role="alert"
                    aria-labelledby="coupon-form-errors"
                    className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <h3 id="coupon-form-errors" className="text-sm font-bold text-rose-900">
                      There is a problem
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {errorEntries.map(([field, message]) => (
                        <li key={field}>
                          <a
                            href={`#coupon-${field}`}
                            className="text-xs font-semibold text-rose-800 underline-offset-2 hover:underline"
                          >
                            {message}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative bg-slate-950 px-4 py-5">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                      {isEdit ? 'Editing' : 'Preview'}
                    </p>
                    <p className="mt-1 truncate text-lg font-bold tracking-wide text-white">
                      {values.code.trim().toUpperCase() || 'NEWCODE'}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      {formatCouponOffer({ type: values.type, value: values.value || 0 })}
                      {values.vendorName ? ` · ${values.vendorName}` : ''}
                    </p>
                  </div>
                </section>

                {!isEdit ? (
                  <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <span className="text-xs font-semibold text-slate-700">Store</span>
                      <div className="mt-1.5">
                        <CouponVendorPicker
                          id="coupon-vendorId"
                          valueId={values.vendorId}
                          valueName={values.vendorName}
                          disabled={busy}
                          error={showError('vendorId')}
                          onChange={({ vendorId, vendorName }) => {
                            setFieldValue('vendorId', vendorId)
                            setFieldValue('vendorName', vendorName)
                            setFieldTouched('vendorId', true, false)
                          }}
                        />
                      </div>
                      {showError('vendorId') ? <FieldError id="coupon-vendorId-error" message={errors.vendorId} /> : null}
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Store</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{coupon?.vendorName || 'Store'}</p>
                  </section>
                )}

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="block" htmlFor="coupon-code">
                    <span className="text-xs font-semibold text-slate-700">Code</span>
                    <input
                      id="coupon-code"
                      name="code"
                      value={values.code}
                      disabled={busy}
                      onChange={(event) => setFieldValue('code', event.target.value.toUpperCase())}
                      onBlur={handleBlur}
                      placeholder="ADMIN10"
                      aria-invalid={Boolean(showError('code'))}
                      className={`${INPUT_CLASS} tracking-wide ${
                        showError('code') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                      }`}
                    />
                    {showError('code') ? <FieldError id="coupon-code-error" message={errors.code} /> : null}
                  </label>

                  <fieldset>
                    <legend className="text-xs font-semibold text-slate-700">Discount</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {COUPON_TYPES.map((option) => {
                        const active = values.type === option.key
                        return (
                          <button
                            key={option.key}
                            type="button"
                            disabled={busy}
                            aria-pressed={active}
                            onClick={() => {
                              setFieldValue('type', option.key)
                              if (option.key !== 'percentage') setFieldValue('maximumDiscount', '')
                            }}
                            className={`rounded-xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                              active
                                ? 'border-slate-900 bg-slate-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">{option.hint}</span>
                          </button>
                        )
                      })}
                    </div>
                    {showError('type') ? <FieldError message={errors.type} /> : null}
                  </fieldset>

                  <label className="block" htmlFor="coupon-value">
                    <span className="text-xs font-semibold text-slate-700">
                      {values.type === 'fixed' ? 'Amount off (GHS)' : 'Percent off'}
                    </span>
                    <input
                      id="coupon-value"
                      name="value"
                      type="number"
                      inputMode="decimal"
                      min={values.type === 'fixed' ? '0.01' : '1'}
                      max={values.type === 'percentage' ? '100' : undefined}
                      step={values.type === 'fixed' ? '0.01' : '1'}
                      value={values.value}
                      disabled={busy}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={values.type === 'fixed' ? '10.00' : '10'}
                      aria-invalid={Boolean(showError('value'))}
                      className={`${INPUT_CLASS} ${
                        showError('value') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                      }`}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">{typeMeta.helper}</p>
                    {showError('value') ? <FieldError id="coupon-value-error" message={errors.value} /> : null}
                  </label>

                  <label className="block" htmlFor="coupon-minimumPurchase">
                    <span className="text-xs font-semibold text-slate-700">Minimum purchase amount</span>
                    <input
                      id="coupon-minimumPurchase"
                      name="minimumPurchase"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={values.minimumPurchase}
                      disabled={busy}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Optional"
                      className={`${INPUT_CLASS} ${
                        showError('minimumPurchase') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                      }`}
                    />
                    {showError('minimumPurchase') ? (
                      <FieldError id="coupon-minimumPurchase-error" message={errors.minimumPurchase} />
                    ) : null}
                  </label>

                  {values.type === 'percentage' ? (
                    <label className="block" htmlFor="coupon-maximumDiscount">
                      <span className="text-xs font-semibold text-slate-700">Discount cap (GHS)</span>
                      <input
                        id="coupon-maximumDiscount"
                        name="maximumDiscount"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={values.maximumDiscount}
                        disabled={busy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Optional"
                        className={`${INPUT_CLASS} ${
                          showError('maximumDiscount') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                        }`}
                      />
                      {showError('maximumDiscount') ? (
                        <FieldError id="coupon-maximumDiscount-error" message={errors.maximumDiscount} />
                      ) : null}
                    </label>
                  ) : null}

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-xs font-semibold text-slate-800">Redemption limits</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                      These are checkout counts, not a headcount of people who can receive the code.
                    </p>

                    <label className="mt-3 block" htmlFor="coupon-usageLimit">
                      <span className="text-xs font-semibold text-slate-700">Total checkouts allowed</span>
                      <input
                        id="coupon-usageLimit"
                        name="usageLimit"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={values.usageLimit}
                        disabled={busy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="No overall cap"
                        aria-describedby="coupon-usageLimit-hint"
                        className={`${INPUT_CLASS} ${
                          showError('usageLimit') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                        }`}
                      />
                      <p id="coupon-usageLimit-hint" className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        Across every shopper combined. If you set 100, the 101st checkout is declined.
                      </p>
                      {showError('usageLimit') ? (
                        <FieldError id="coupon-usageLimit-error" message={errors.usageLimit} />
                      ) : null}
                    </label>

                    <label className="mt-3 block" htmlFor="coupon-perUserLimit">
                      <span className="text-xs font-semibold text-slate-700">Times per shopper</span>
                      <input
                        id="coupon-perUserLimit"
                        name="perUserLimit"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={values.perUserLimit}
                        disabled={busy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="No per-shopper cap"
                        aria-describedby="coupon-perUserLimit-hint"
                        className={`${INPUT_CLASS} ${
                          showError('perUserLimit') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                        }`}
                      />
                      <p id="coupon-perUserLimit-hint" className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        How many times the same person can redeem it. 1 means each shopper gets one checkout with this code.
                      </p>
                      {showError('perUserLimit') ? (
                        <FieldError id="coupon-perUserLimit-error" message={errors.perUserLimit} />
                      ) : null}
                    </label>

                    <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
                      {formatCouponRedemptionSummary(values.usageLimit, values.perUserLimit)}
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3">
                    <input
                      type="checkbox"
                      name="stackable"
                      checked={Boolean(values.stackable)}
                      disabled={busy}
                      onChange={(event) => setFieldValue('stackable', event.target.checked)}
                      className="mt-0.5 size-4 cursor-pointer rounded accent-brand"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">Allow stacking</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        Let this code combine with another offer on the same basket
                      </span>
                    </span>
                  </label>

                  <label className="block" htmlFor="coupon-description">
                    <span className="text-xs font-semibold text-slate-700">Note</span>
                    <textarea
                      id="coupon-description"
                      name="description"
                      rows={3}
                      maxLength={COUPON_DESCRIPTION_MAX}
                      value={values.description}
                      disabled={busy}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Why this code exists"
                      className={`${INPUT_CLASS} resize-none ${
                        showError('description') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                      }`}
                    />
                    <p className="mt-1 text-right text-[11px] text-slate-400">
                      {String(values.description || '').length}/{COUPON_DESCRIPTION_MAX}
                    </p>
                    {showError('description') ? (
                      <FieldError id="coupon-description-error" message={errors.description} />
                    ) : null}
                  </label>
                </section>
              </div>
            </SlideDrawer>
        )
      }}
    </Formik>
  )
}

export default function CouponFormDrawer({
  open,
  mode = 'create',
  coupon = null,
  onClose,
}) {
  if (!open) return null
  if (mode === 'edit' && !coupon) return null

  return (
    <CouponForm
      key={mode === 'edit' ? coupon.id : 'create'}
      mode={mode}
      coupon={coupon}
      onClose={onClose}
    />
  )
}
