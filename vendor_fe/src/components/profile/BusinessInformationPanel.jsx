import { useEffect, useMemo, useState } from 'react'
import { Building2 } from 'lucide-react'
import { GHANA_REGIONS } from '../../constants/storeSettings'
import notify from '../../lib/notify'
import {
  composePhoneNumber,
  formatPhoneDisplay,
  isPlainObjectEqual,
  mapBusinessToForm,
  validateBusinessForm,
} from '../../utils/profileFormUtils'
import ProfileFormActions from './ProfileFormActions'
import ProfilePhoneInput from './ProfilePhoneInput'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileReadOnlyGrid,
  ProfileTextInput,
} from './ProfileSectionCard'

export default function BusinessInformationPanel({
  business,
  onUpdateBusiness,
  isUpdating = false,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [form, setForm] = useState(() => mapBusinessToForm(business))
  const [errors, setErrors] = useState({})

  const baseline = useMemo(() => mapBusinessToForm(business), [business])

  useEffect(() => {
    if (!isEditing) {
      setForm(baseline)
      setErrors({})
    }
  }, [baseline, isEditing])

  const isDirty = isEditing && !isPlainObjectEqual(form, baseline)

  const readOnlyItems = [
    { label: 'Business Name', value: business?.businessName },
    { label: 'Business Registration Number', value: business?.registrationNumber },
    { label: 'Business Type', value: business?.businessType },
    { label: 'Business Email', value: business?.businessEmail },
    { label: 'Business Phone', value: formatPhoneDisplay(business?.businessPhone) },
    { label: 'Business Address', value: business?.address },
    { label: 'City', value: business?.city },
    { label: 'Region', value: business?.region },
    { label: 'Country', value: business?.country },
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
    const nextErrors = validateBusinessForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await onUpdateBusiness({
        ...form,
        businessName: form.businessName.trim(),
        registrationNumber: form.registrationNumber.trim(),
        businessType: form.businessType.trim(),
        businessEmail: form.businessEmail.trim(),
        businessPhone: composePhoneNumber(form.businessPhoneCountryCode, form.businessPhoneLocal),
        address: form.address.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        country: form.country.trim(),
      })
      notify.success('Business information updated successfully.')
      setIsEditing(false)
    } catch {
      notify.error('Unable to update business information. Please try again.')
    }
  }

  if (!business?.businessName && !isEditing) {
    return (
      <ProfileSectionCard
        icon={Building2}
        title="Business Information"
        subtitle="Add your business information to complete your vendor profile."
        footer={(
          <ProfileFormActions
            isEditing={false}
            onEdit={() => setIsEditing(true)}
            editLabel="Add Business Information"
          />
        )}
      >
        <p className="text-sm text-slate-500">No business information available yet.</p>
      </ProfileSectionCard>
    )
  }

  return (
    <ProfileSectionCard
      icon={Building2}
      title="Business Information"
      subtitle="Official business details used for verification and payouts."
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
          editLabel="Edit Business Information"
        />
      )}
    >
      {!isEditing ? (
        <ProfileReadOnlyGrid items={readOnlyItems} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="business-name">Business Name</ProfileFieldLabel>
            <ProfileTextInput
              id="business-name"
              value={form.businessName}
              onChange={(event) => handleFieldChange('businessName', event.target.value)}
              error={errors.businessName}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-reg">Business Registration Number</ProfileFieldLabel>
            <ProfileTextInput
              id="business-reg"
              value={form.registrationNumber}
              onChange={(event) => handleFieldChange('registrationNumber', event.target.value)}
              error={errors.registrationNumber}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-type">Business Type</ProfileFieldLabel>
            <ProfileTextInput
              id="business-type"
              value={form.businessType}
              onChange={(event) => handleFieldChange('businessType', event.target.value)}
              error={errors.businessType}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-email">Business Email</ProfileFieldLabel>
            <ProfileTextInput
              id="business-email"
              type="email"
              value={form.businessEmail}
              onChange={(event) => handleFieldChange('businessEmail', event.target.value)}
              error={errors.businessEmail}
            />
          </div>
          <div className="sm:col-span-2">
            <ProfilePhoneInput
              idPrefix="business-phone"
              countryCode={form.businessPhoneCountryCode}
              localNumber={form.businessPhoneLocal}
              onCountryCodeChange={(value) => handleFieldChange('businessPhoneCountryCode', value)}
              onLocalNumberChange={(value) => handleFieldChange('businessPhoneLocal', value)}
              error={errors.businessPhoneLocal}
            />
          </div>
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="business-address">Business Address</ProfileFieldLabel>
            <ProfileTextInput
              id="business-address"
              value={form.address}
              onChange={(event) => handleFieldChange('address', event.target.value)}
              error={errors.address}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-city">City</ProfileFieldLabel>
            <ProfileTextInput
              id="business-city"
              value={form.city}
              onChange={(event) => handleFieldChange('city', event.target.value)}
              error={errors.city}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-region">Region</ProfileFieldLabel>
            <select
              id="business-region"
              value={form.region}
              onChange={(event) => handleFieldChange('region', event.target.value)}
              className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light ${
                errors.region ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300 bg-white text-slate-900 ring-1 ring-slate-200/60'
              }`}
            >
              <option value="">Select region</option>
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {errors.region && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.region}</p>}
          </div>
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="business-country">Country</ProfileFieldLabel>
            <ProfileTextInput
              id="business-country"
              value={form.country}
              onChange={(event) => handleFieldChange('country', event.target.value)}
              error={errors.country}
            />
          </div>
        </div>
      )}
    </ProfileSectionCard>
  )
}
