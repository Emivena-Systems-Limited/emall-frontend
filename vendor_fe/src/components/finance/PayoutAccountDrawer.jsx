import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Building2,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  User,
  X,
} from 'lucide-react'
import SearchableSelect from '../auth/SearchableSelect'
import { GHANA_BANKS } from '../../constants/finance'
import { validatePayoutAccountForm } from '../../utils/normalizePayoutAccount'

const EMPTY_FORM = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  branch: '',
}

const BANK_SELECT_OPTIONS = GHANA_BANKS.map((bank) => ({
  value: bank,
  label: bank,
}))

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  )
}

function FieldHint({ id, children }) {
  return (
    <p id={id} className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
      {children}
    </p>
  )
}

export default function PayoutAccountDrawer({
  open,
  mode = 'add',
  initialValues = null,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef(form)

  const isEdit = mode === 'edit'
  const bankOptions = useMemo(() => {
    const current = String(form.bankName || initialValues?.bankName || '').trim()
    if (current && !BANK_SELECT_OPTIONS.some((option) => option.value === current)) {
      return [{ value: current, label: current }, ...BANK_SELECT_OPTIONS]
    }
    return BANK_SELECT_OPTIONS
  }, [form.bankName, initialValues?.bankName])

  useEffect(() => {
    formRef.current = form
  }, [form])

  useEffect(() => {
    if (!open) return
    const nextForm = {
      bankName: initialValues?.bankName ?? '',
      accountHolderName: initialValues?.accountHolderName ?? '',
      accountNumber: initialValues?.accountNumber ?? '',
      branch: initialValues?.branch ?? '',
    }
    setForm(nextForm)
    formRef.current = nextForm
    setErrors({})
    setTouched({})
    setIsSaving(false)
  }, [open, initialValues])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, isSaving])

  if (!open) return null

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const updateField = (field, value) => {
    const next = { ...formRef.current, [field]: value }
    formRef.current = next
    setForm(next)
    clearFieldError(field)
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const nextErrors = validatePayoutAccountForm(formRef.current, { mode })
    if (nextErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }))
      return
    }
    clearFieldError(field)
  }

  const handleAccountNumberChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 16)
    updateField('accountNumber', digits)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const currentForm = formRef.current
    const nextErrors = validatePayoutAccountForm(currentForm, { mode })
    setErrors(nextErrors)
    setTouched({
      bankName: true,
      accountHolderName: true,
      accountNumber: true,
      branch: true,
    })

    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    try {
      await onSave({
        bankName: currentForm.bankName.trim(),
        accountHolderName: currentForm.accountHolderName.trim(),
        accountNumber: currentForm.accountNumber.replace(/\D/g, ''),
        branch: currentForm.branch.trim(),
      })
      onClose()
    } catch {
      // Parent surfaces API errors via toast.
    } finally {
      setIsSaving(false)
    }
  }

  const showError = (field) => (touched[field] ? errors[field] : undefined)
  const accountDigitCount = form.accountNumber.replace(/\D/g, '').length

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-[55] bg-slate-900/50 backdrop-blur-sm"
        onClick={() => {
          if (!isSaving) onClose()
        }}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-account-drawer-title"
        className="slide-in-right fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="relative border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
                <CreditCard className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Payout account
                  </p>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isEdit
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                        : 'bg-brand-light text-brand ring-1 ring-brand/15'
                    }`}
                  >
                    {isEdit ? 'Editing' : 'New'}
                  </span>
                </div>
                <h2 id="payout-account-drawer-title" className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  {isEdit ? 'Edit bank account' : 'Add bank account'}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {isEdit
                    ? 'Update the bank details used for vendor payouts.'
                    : 'Link a Ghanaian bank account to receive weekly payouts.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Close panel"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-600">
              Enter the exact name and number on your bank records to avoid payout delays.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <SearchableSelect
              id="payout-bank-name"
              name="bankName"
              label="Bank name"
              icon={Building2}
              options={bankOptions}
              value={form.bankName}
              placeholder="Search banks…"
              allowCustom
              customEntryLabel="My bank is not listed…"
              customPlaceholder="Enter your bank name…"
              customEntityName="bank"
              hint="Search the list, or add your bank if it is missing."
              error={showError('bankName')}
              disabled={isSaving}
              onChange={(event) => updateField('bankName', event.target.value)}
              onBlur={() => handleBlur('bankName')}
            />

            <div>
              <label htmlFor="payout-account-holder" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <User className="size-4 text-slate-400" />
                Account holder name
              </label>
              <input
                id="payout-account-holder"
                type="text"
                autoComplete="name"
                maxLength={80}
                value={form.accountHolderName}
                onChange={(event) => updateField('accountHolderName', event.target.value)}
                onBlur={() => handleBlur('accountHolderName')}
                placeholder="As it appears on the bank account"
                aria-invalid={Boolean(showError('accountHolderName'))}
                aria-describedby={
                  showError('accountHolderName')
                    ? 'payout-account-holder-error'
                    : 'payout-account-holder-hint'
                }
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                  showError('accountHolderName')
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              />
              <FieldError id="payout-account-holder-error" message={showError('accountHolderName')} />
              {!showError('accountHolderName') && (
                <FieldHint id="payout-account-holder-hint">
                  Match the legal name on the account — avoid nicknames or shop names.
                </FieldHint>
              )}
            </div>

            <div>
              <label htmlFor="payout-account-number" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CreditCard className="size-4 text-slate-400" />
                Account number
                {isEdit && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Optional
                  </span>
                )}
              </label>
              <input
                id="payout-account-number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={16}
                value={form.accountNumber}
                onChange={handleAccountNumberChange}
                onBlur={() => handleBlur('accountNumber')}
                placeholder={isEdit ? 'Leave blank to keep current number' : '10–16 digit account number'}
                aria-invalid={Boolean(showError('accountNumber'))}
                aria-describedby={
                  showError('accountNumber')
                    ? 'payout-account-number-error'
                    : 'payout-account-number-hint'
                }
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-sm tracking-wider text-slate-900 outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 ${
                  showError('accountNumber')
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <FieldError id="payout-account-number-error" message={showError('accountNumber')} />
                  {!showError('accountNumber') && (
                    <FieldHint id="payout-account-number-hint">
                      {isEdit
                        ? 'Only enter a new number if you need to change it.'
                        : 'Digits only. Most Ghanaian accounts are 10–16 digits.'}
                    </FieldHint>
                  )}
                </div>
                <span className={`shrink-0 text-[11px] font-medium tabular-nums ${
                  accountDigitCount > 0 && accountDigitCount < 10 ? 'text-amber-600' : 'text-slate-400'
                }`}
                >
                  {accountDigitCount}/16
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="payout-branch" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="size-4 text-slate-400" />
                Branch
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Optional
                </span>
              </label>
              <input
                id="payout-branch"
                type="text"
                maxLength={80}
                value={form.branch}
                onChange={(event) => updateField('branch', event.target.value)}
                onBlur={() => handleBlur('branch')}
                placeholder="e.g. Accra Main Branch"
                aria-invalid={Boolean(showError('branch'))}
                aria-describedby={showError('branch') ? 'payout-branch-error' : undefined}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                  showError('branch')
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              />
              <FieldError id="payout-branch-error" message={showError('branch')} />
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Add account'}
            </button>
          </div>
        </form>
      </aside>
    </>,
    document.body,
  )
}
