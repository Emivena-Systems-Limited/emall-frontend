import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { User } from 'lucide-react'
import notify from '../../lib/notify'
import { updateUser } from '../../store/slices/authSlice'
import {
  composePhoneNumber,
  formatPhoneDisplay,
  formatProfileDate,
  isPlainObjectEqual,
  mapProfileToPersonalForm,
  validatePersonalForm,
} from '../../utils/profileFormUtils'
import BusinessVerificationSection from './BusinessVerificationSection'
import ProfileFormActions from './ProfileFormActions'
import ProfilePhoneInput from './ProfilePhoneInput'
import ProfileOverview, { AccountSummaryCards } from './ProfileOverview'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileReadOnlyGrid,
  ProfileTextInput,
} from './ProfileSectionCard'

export default function PersonalInformationPanel({
  profile,
  onUpdateProfile,
  onUploadPicture,
  onRemovePicture,
  isUpdating = false,
  isUploadingPicture = false,
  isRemovingPicture = false,
}) {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [form, setForm] = useState(() => mapProfileToPersonalForm(profile))
  const [errors, setErrors] = useState({})

  const baseline = useMemo(() => mapProfileToPersonalForm(profile), [profile])

  useEffect(() => {
    if (!isEditing) {
      setForm(baseline)
      setErrors({})
    }
  }, [baseline, isEditing])

  const isDirty = isEditing && !isPlainObjectEqual(form, baseline)

  const readOnlyItems = [
    { label: 'Full Name', value: profile?.name },
    { label: 'Email Address', value: profile?.email },
    { label: 'Phone Number', value: formatPhoneDisplay(profile?.phone) },
    { label: 'Date of Birth', value: formatProfileDate(profile?.dateOfBirth) },
    { label: 'Location', value: profile?.location },
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
    const nextErrors = validatePersonalForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const payload = {
        name: form.name.trim(),
        phone: composePhoneNumber(form.phoneCountryCode, form.phoneLocal),
        phoneCountryCode: form.phoneCountryCode,
        phoneLocal: form.phoneLocal.replace(/\D/g, ''),
        dateOfBirth: form.dateOfBirth,
        location: form.location.trim(),
      }

      await onUpdateProfile(payload)
      dispatch(updateUser({
        admin_full_name: payload.name,
        phone_number: payload.phone,
      }))
      notify.success('Profile updated successfully.')
      setIsEditing(false)
    } catch {
      notify.error('Unable to update your profile. Please try again.')
    }
  }

  const handleUploadPicture = async (file) => {
    try {
      await onUploadPicture(file)
      notify.success('Profile picture updated.')
    } catch (error) {
      notify.error('Unable to upload profile picture.')
      throw error
    }
  }

  const handleRemovePicture = async () => {
    try {
      await onRemovePicture()
      notify.success('Profile picture removed.')
    } catch (error) {
      notify.error('Unable to remove profile picture.')
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <ProfileOverview
        profile={profile}
        onUploadPicture={handleUploadPicture}
        onRemovePicture={handleRemovePicture}
        isUploadingPicture={isUploadingPicture}
        isRemovingPicture={isRemovingPicture}
      />

      <AccountSummaryCards summary={profile?.accountSummary} />

      <ProfileSectionCard
        icon={User}
        title="Personal Information"
        subtitle="Your personal account details as the store administrator."
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
            editLabel="Edit Profile"
          />
        )}
      >
        {!isEditing ? (
          <ProfileReadOnlyGrid items={readOnlyItems} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ProfileFieldLabel htmlFor="profile-name">Full Name</ProfileFieldLabel>
              <ProfileTextInput
                id="profile-name"
                value={form.name}
                onChange={(event) => handleFieldChange('name', event.target.value)}
                placeholder="Enter your full name"
                error={errors.name}
              />
            </div>
            <div className="sm:col-span-2">
              <ProfileFieldLabel htmlFor="profile-email">Email Address</ProfileFieldLabel>
              <ProfileTextInput
                id="profile-email"
                type="email"
                value={form.email}
                disabled
              />
              <p className="mt-1.5 text-[11px] text-slate-400">Email is read-only for security.</p>
            </div>
            <div className="sm:col-span-2">
              <ProfilePhoneInput
                countryCode={form.phoneCountryCode}
                localNumber={form.phoneLocal}
                onCountryCodeChange={(value) => handleFieldChange('phoneCountryCode', value)}
                onLocalNumberChange={(value) => handleFieldChange('phoneLocal', value)}
                error={errors.phoneLocal}
              />
            </div>
            <div>
              <ProfileFieldLabel htmlFor="profile-dob">Date of Birth</ProfileFieldLabel>
              <ProfileTextInput
                id="profile-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => handleFieldChange('dateOfBirth', event.target.value)}
                error={errors.dateOfBirth}
              />
            </div>
            <div>
              <ProfileFieldLabel htmlFor="profile-location">Location</ProfileFieldLabel>
              <ProfileTextInput
                id="profile-location"
                value={form.location}
                onChange={(event) => handleFieldChange('location', event.target.value)}
                placeholder="Accra, Ghana"
                error={errors.location}
              />
            </div>
          </div>
        )}
      </ProfileSectionCard>

      <BusinessVerificationSection verification={profile?.verification} />
    </div>
  )
}
