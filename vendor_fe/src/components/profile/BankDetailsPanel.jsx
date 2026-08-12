import { useEffect, useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { GHANA_BANKS } from '../../constants/finance'
import notify from '../../lib/notify'
import {
  isPlainObjectEqual,
  mapBankToForm,
  maskBankAccountNumber,
  validateBankForm,
} from '../../utils/profileFormUtils'
import ProfileFormActions from './ProfileFormActions'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileReadOnlyGrid,
  ProfileTextInput,
} from './ProfileSectionCard'

export default function BankDetailsPanel({
  bankDetails,
  onUpdateBankDetails,
  isUpdating = false,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [form, setForm] = useState(() => mapBankToForm(bankDetails))
  const [errors, setErrors] = useState({})

  const baseline = useMemo(() => mapBankToForm(bankDetails), [bankDetails])

  useEffect(() => {
    if (!isEditing) {
      setForm(baseline)
      setErrors({})
    }
  }, [baseline, isEditing])

  const isDirty = isEditing && !isPlainObjectEqual(form, baseline)

  const readOnlyItems = [
    { label: 'Bank Name', value: bankDetails?.bankName },
    { label: 'Account Name', value: bankDetails?.accountName },
    { label: 'Account Number', value: maskBankAccountNumber(bankDetails?.accountNumber) },
    { label: 'Branch', value: bankDetails?.branch },
    { label: 'Account Type', value: bankDetails?.accountType },
  ]

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    setIsEditing(false)
    setForm(baseline)
    setErrors({})
  }

  const handleDiscardConfirm = () => {
    setDiscardOpen(false)
    setIsEditing(false)
    setForm(baseline)
    setErrors({})
  }

  const handleSave = async () => {
    const nextErrors = validateBankForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await onUpdateBankDetails({
        bankName: form.bankName.trim(),
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.replace(/\s/g, ''),
        branch: form.branch.trim(),
        accountType: form.accountType.trim(),
      })
      notify.success('Bank details updated successfully.')
      setIsEditing(false)
    } catch {
      notify.error('Unable to update bank details. Please try again.')
    }
  }

  if (!bankDetails?.bankName && !isEditing) {
    return (
      <ProfileSectionCard
        icon={CreditCard}
        title="Bank Details"
        subtitle="Add payout bank details for receiving vendor settlements."
        footer={(
          <ProfileFormActions
            isEditing={false}
            onEdit={() => setIsEditing(true)}
            editLabel="Add Bank Details"
          />
        )}
      >
        <p className="text-sm text-slate-500">No bank details on file yet.</p>
      </ProfileSectionCard>
    )
  }

  return (
    <ProfileSectionCard
      icon={CreditCard}
      title="Bank Details"
      subtitle="Secure payout information for your vendor account."
      footer={(
        <ProfileFormActions
          isEditing={isEditing}
          isDirty={isDirty}
          isSubmitting={isUpdating}
          discardOpen={discardOpen}
          onDiscardClose={() => setDiscardOpen(false)}
          onDiscardConfirm={handleDiscardConfirm}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          editLabel="Edit Bank Details"
        />
      )}
    >
      {!isEditing ? (
        <ProfileReadOnlyGrid items={readOnlyItems} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="bank-name">Bank Name</ProfileFieldLabel>
            <select
              id="bank-name"
              value={form.bankName}
              onChange={(event) => handleFieldChange('bankName', event.target.value)}
              className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light ${
                errors.bankName ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300 bg-white text-slate-900 ring-1 ring-slate-200/60'
              }`}
            >
              <option value="">Select bank</option>
              {GHANA_BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bankName && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.bankName}</p>}
          </div>
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="account-name">Account Name</ProfileFieldLabel>
            <ProfileTextInput
              id="account-name"
              value={form.accountName}
              onChange={(event) => handleFieldChange('accountName', event.target.value)}
              error={errors.accountName}
            />
          </div>
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="account-number">Account Number</ProfileFieldLabel>
            <ProfileTextInput
              id="account-number"
              value={form.accountNumber}
              onChange={(event) => handleFieldChange('accountNumber', event.target.value)}
              placeholder="Enter full account number"
              error={errors.accountNumber}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="bank-branch">Branch</ProfileFieldLabel>
            <ProfileTextInput
              id="bank-branch"
              value={form.branch}
              onChange={(event) => handleFieldChange('branch', event.target.value)}
              error={errors.branch}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="account-type">Account Type</ProfileFieldLabel>
            <select
              id="account-type"
              value={form.accountType}
              onChange={(event) => handleFieldChange('accountType', event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            >
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
            </select>
          </div>
        </div>
      )}
    </ProfileSectionCard>
  )
}
