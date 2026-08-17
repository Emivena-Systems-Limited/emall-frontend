import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Building2, MapPin } from 'lucide-react'
import SearchableSelect from '../auth/SearchableSelect'
import notify from '../../lib/notify'
import { GHANA_COUNTRY, GHANA_REGIONS, getCitiesByRegion } from '../../constants/ghanaRegions'
import { VENDOR_ADDRESS_MAX_LENGTH } from '../../utils/validationSchemas'
import {
  buildVendorAddressUpdatePayload,
  buildVendorInformationUpdatePayload,
  formatPhoneDisplay,
  getVendorAddressId,
  isPlainObjectEqual,
  mapBusinessToForm,
  mapProfileToAddressForm,
  validateAddressForm,
  validateBusinessForm,
} from '../../utils/profileFormUtils'
import ProfileFormActions from './ProfileFormActions'
import ProfilePhoneInput from './ProfilePhoneInput'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileReadOnlyGrid,
  ProfileTextInput,
  ProfileTextarea,
} from './ProfileSectionCard'

function regionLabel(region) {
  const match = GHANA_REGIONS.find((option) => option.value === String(region ?? '').toLowerCase())
  return match?.label ?? region
}

function VendorAddressSection({ profile, onUpdateAddress, isUpdating = false }) {
  const { user } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [form, setForm] = useState(() => mapProfileToAddressForm(profile))
  const [errors, setErrors] = useState({})

  const baseline = useMemo(() => mapProfileToAddressForm(profile), [profile])
  const cityOptions = useMemo(
    () => getCitiesByRegion(form.region).map((city) => ({ value: city, label: city })),
    [form.region],
  )

  useEffect(() => {
    if (!isEditing) {
      setForm(baseline)
      setErrors({})
    }
  }, [baseline, isEditing])

  const isDirty = isEditing && !isPlainObjectEqual(form, baseline)

  const readOnlyItems = [
    { label: 'Country', value: profile?.country || GHANA_COUNTRY },
    { label: 'Region', value: regionLabel(profile?.region) },
    { label: 'Town / City', value: profile?.city_or_town },
    { label: 'GPS', value: profile?.gps_address },
    { label: 'Physical address', value: profile?.address },
    { label: 'Street name', value: profile?.street_name },
    { label: 'Landmark', value: profile?.landmark },
  ]

  const handleFieldChange = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'region' && value !== current.region) {
        next.city_or_town = ''
      }
      return next
    })
    if (errors[field] || (field === 'region' && errors.city_or_town)) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        if (field === 'region') delete next.city_or_town
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
    const nextErrors = validateAddressForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const addressId = getVendorAddressId(user) || getVendorAddressId(profile)
    if (!addressId) {
      notify.error('Unable to update address because no address id was found on your account.')
      return
    }

    try {
      await onUpdateAddress({
        addressId,
        ...buildVendorAddressUpdatePayload(form, user),
      })
      notify.success('Business address updated successfully.')
      setIsEditing(false)
    } catch (error) {
      notify.fromError(error, 'Unable to update business address. Please try again.')
    }
  }

  return (
    <ProfileSectionCard
      icon={MapPin}
      title="Business Address"
      subtitle="The registered location used for your vendor storefront and settlements."
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
          editLabel="Edit Address"
        />
      )}
    >
      {!isEditing ? (
        <ProfileReadOnlyGrid items={readOnlyItems} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <ProfileFieldLabel htmlFor="business-country">Country</ProfileFieldLabel>
            <ProfileTextInput
              id="business-country"
              value={form.country || GHANA_COUNTRY}
              disabled
            />
          </div>
          <SearchableSelect
            id="business-region"
            name="region"
            label="Region"
            options={GHANA_REGIONS}
            value={form.region}
            onChange={(event) => handleFieldChange('region', event.target.value)}
            error={errors.region}
            placeholder="Select region…"
          />
          <SearchableSelect
            key={`city-${form.region || 'none'}`}
            id="business-city"
            name="city_or_town"
            label="Town / City"
            options={cityOptions}
            value={form.city_or_town}
            onChange={(event) => handleFieldChange('city_or_town', event.target.value)}
            error={errors.city_or_town}
            disabled={!form.region}
            placeholder={form.region ? 'Select town or city…' : 'Select region first'}
            allowCustom
            customPlaceholder="Enter town or city…"
          />
          <div>
            <ProfileFieldLabel htmlFor="business-gps">GPS</ProfileFieldLabel>
            <ProfileTextInput
              id="business-gps"
              value={form.gps_address}
              onChange={(event) => handleFieldChange('gps_address', event.target.value)}
              placeholder="GA-145-4789"
              error={errors.gps_address}
            />
          </div>
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="business-physical-address">Physical address</ProfileFieldLabel>
            <ProfileTextarea
              id="business-physical-address"
              value={form.address}
              onChange={(event) => handleFieldChange('address', event.target.value)}
              placeholder="15 Independence Avenue, Near Osu Oxford Street"
              error={errors.address}
              maxLength={VENDOR_ADDRESS_MAX_LENGTH}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-street">Street name</ProfileFieldLabel>
            <ProfileTextInput
              id="business-street"
              value={form.street_name}
              onChange={(event) => handleFieldChange('street_name', event.target.value)}
              placeholder="15 Independence Avenue"
              error={errors.street_name}
            />
          </div>
          <div>
            <ProfileFieldLabel htmlFor="business-landmark">Landmark</ProfileFieldLabel>
            <ProfileTextInput
              id="business-landmark"
              value={form.landmark}
              onChange={(event) => handleFieldChange('landmark', event.target.value)}
              placeholder="Near the main market"
            />
          </div>
        </div>
      )}
    </ProfileSectionCard>
  )
}

export default function BusinessInformationPanel({
  profile,
  onUpdateBusiness,
  onUpdateAddress,
  isUpdating = false,
  isUpdatingAddress = false,
}) {
  const { user } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [form, setForm] = useState(() => mapBusinessToForm(profile))
  const [errors, setErrors] = useState({})

  const baseline = useMemo(() => mapBusinessToForm(profile), [profile])

  useEffect(() => {
    if (!isEditing) {
      setForm(baseline)
      setErrors({})
    }
  }, [baseline, isEditing])

  const isDirty = isEditing && !isPlainObjectEqual(form, baseline)

  const readOnlyItems = [
    { label: 'Business Name', value: profile?.business_name || form.businessName },
    { label: 'Store Name', value: profile?.store_name || form.storeName },
    { label: 'Trading Name', value: profile?.trading_name || form.tradingName },
    { label: 'Business Email', value: profile?.email },
    { label: 'Business Phone', value: formatPhoneDisplay(profile?.phone ?? profile?.phone_number) },
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
      await onUpdateBusiness(buildVendorInformationUpdatePayload(form, user))
      notify.success('Business information updated successfully.')
      setIsEditing(false)
    } catch (error) {
      notify.fromError(error, 'Unable to update business information. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <ProfileSectionCard
        icon={Building2}
        title="Business Information"
        subtitle="Official business details used for your vendor storefront."
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
                placeholder="Emivena Logistics Ventures"
                error={errors.businessName}
              />
            </div>
            <div>
              <ProfileFieldLabel htmlFor="store-name">Store Name</ProfileFieldLabel>
              <ProfileTextInput
                id="store-name"
                value={form.storeName}
                onChange={(event) => handleFieldChange('storeName', event.target.value)}
                placeholder="Eminvena Logistics Stores"
                error={errors.storeName}
              />
            </div>
            <div>
              <ProfileFieldLabel htmlFor="trading-name">Trading Name</ProfileFieldLabel>
              <ProfileTextInput
                id="trading-name"
                value={form.tradingName}
                onChange={(event) => handleFieldChange('tradingName', event.target.value)}
                placeholder="Venna"
                error={errors.tradingName}
              />
            </div>
            <div>
              <ProfileFieldLabel htmlFor="business-email">Business Email</ProfileFieldLabel>
              <ProfileTextInput
                id="business-email"
                type="email"
                value={form.businessEmail}
                disabled
              />
              <p className="mt-1.5 text-[11px] text-slate-400">Same as your personal information.</p>
            </div>
            <div className="sm:col-span-2">
              <ProfilePhoneInput
                idPrefix="business-phone"
                countryCode={form.phoneCountryCode}
                localNumber={form.phoneLocal}
                onCountryCodeChange={(value) => handleFieldChange('phoneCountryCode', value)}
                onLocalNumberChange={(value) => handleFieldChange('phoneLocal', value)}
                error={errors.phoneLocal}
              />
            </div>
          </div>
        )}
      </ProfileSectionCard>

      <VendorAddressSection
        profile={profile}
        onUpdateAddress={onUpdateAddress}
        isUpdating={isUpdatingAddress}
      />
    </div>
  )
}
