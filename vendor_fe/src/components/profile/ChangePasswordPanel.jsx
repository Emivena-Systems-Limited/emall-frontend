import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import PasswordInput from '../auth/PasswordInput'
import PasswordStrengthBar from '../auth/PasswordStrengthBar'
import notify from '../../lib/notify'
import { validateChangePasswordForm } from '../../utils/profileFormUtils'
import ProfileSectionCard from './ProfileSectionCard'

const EMPTY_FORM = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
}

export default function ChangePasswordPanel({
  onChangePassword,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const handleFieldChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateChangePasswordForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await onChangePassword({
        currentPassword: form.currentPassword,
        password: form.password,
      })
      notify.success('Password changed successfully.')
      setForm(EMPTY_FORM)
      setErrors({})
    } catch {
      notify.error('Unable to change password. Please try again.')
    }
  }

  return (
    <ProfileSectionCard
      icon={KeyRound}
      title="Change Password"
      subtitle="Update your account password. Do not share your password with anyone."
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
        <PasswordInput
          id="current-password"
          name="currentPassword"
          label="Current Password"
          value={form.currentPassword}
          onChange={handleFieldChange('currentPassword')}
          autoComplete="current-password"
          error={errors.currentPassword}
        />

        <div>
          <PasswordInput
            id="new-password"
            name="password"
            label="New Password"
            value={form.password}
            onChange={handleFieldChange('password')}
            autoComplete="new-password"
            error={errors.password}
          />
          <PasswordStrengthBar password={form.password} />
        </div>

        <PasswordInput
          id="confirm-password"
          name="passwordConfirmation"
          label="Confirm New Password"
          value={form.passwordConfirmation}
          onChange={handleFieldChange('passwordConfirmation')}
          autoComplete="new-password"
          error={errors.passwordConfirmation}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200/70">
          <p className="font-semibold text-slate-700">Password requirements</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>At least 8 characters</li>
            <li>Includes uppercase and lowercase letters</li>
            <li>Includes at least one number</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </form>
    </ProfileSectionCard>
  )
}
