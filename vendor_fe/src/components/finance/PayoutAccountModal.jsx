import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, CreditCard, Loader2, User, X } from 'lucide-react'
import { GHANA_BANKS } from '../../constants/finance'
import { maskAccountNumber } from '../../utils/financeUtils'

const EMPTY_FORM = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  branch: '',
}

export default function PayoutAccountModal({ open, mode, initialValues, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(initialValues ?? EMPTY_FORM)
    setErrors({})
  }, [open, initialValues])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!form.bankName.trim()) next.bankName = 'Select a bank'
    if (!form.accountHolderName.trim()) next.accountHolderName = 'Enter account holder name'
    if (!form.accountNumber.trim()) {
      next.accountNumber = 'Enter account number'
    } else if (!/^\d{10,16}$/.test(form.accountNumber.replace(/\s/g, ''))) {
      next.accountNumber = 'Enter a valid account number (10–16 digits)'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    onSave({
      bankName: form.bankName,
      accountHolderName: form.accountHolderName.trim(),
      accountNumber: maskAccountNumber(form.accountNumber),
      accountNumberRaw: form.accountNumber.replace(/\s/g, ''),
      branch: form.branch.trim(),
      status: mode === 'edit' && initialValues?.status === 'verified' ? 'verified' : 'pending_verification',
      addedAt: initialValues?.addedAt ?? new Date().toISOString(),
    })

    setIsSaving(false)
    onClose()
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 id="payout-modal-title" className="text-lg font-bold text-slate-900">
                {mode === 'edit' ? 'Edit Payout Account' : 'Add Payout Account'}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {mode === 'edit'
                  ? 'Update your bank details for receiving payouts.'
                  : 'Link your bank account to receive weekly payouts.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Building2 className="size-4 text-slate-400" />
                Bank Name
              </span>
              <select
                value={form.bankName}
                onChange={updateField('bankName')}
                className={`w-full cursor-pointer rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
                  errors.bankName
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              >
                <option value="">Select a bank</option>
                {GHANA_BANKS.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
              {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="size-4 text-slate-400" />
                Account Holder Name
              </span>
              <input
                type="text"
                value={form.accountHolderName}
                onChange={updateField('accountHolderName')}
                placeholder="As it appears on your bank account"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                  errors.accountHolderName
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              />
              {errors.accountHolderName && (
                <p className="mt-1 text-xs text-red-600">{errors.accountHolderName}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CreditCard className="size-4 text-slate-400" />
                Account Number
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={updateField('accountNumber')}
                placeholder="Enter account number"
                className={`w-full rounded-xl border bg-white px-4 py-3 font-mono text-sm tracking-wider text-slate-900 outline-none transition-colors placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal ${
                  errors.accountNumber
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
                }`}
              />
              {errors.accountNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 text-sm font-medium text-slate-700">Branch (optional)</span>
              <input
                type="text"
                value={form.branch}
                onChange={updateField('branch')}
                placeholder="e.g. Accra Main Branch"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {mode === 'edit' ? 'Save Changes' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  )
}

export function RemovePayoutAccountModal({ open, account, onClose, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="remove-payout-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 id="remove-payout-title" className="text-lg font-bold text-slate-900">
            Remove payout account?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This will remove <span className="font-semibold text-slate-700">{account?.bankName}</span>
            {' '}({account?.accountNumber}). You won&apos;t receive payouts until you add a new account.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 cursor-pointer rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            >
              Remove Account
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
