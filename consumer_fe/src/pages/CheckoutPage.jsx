import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  Home,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  Trash2,
  Truck,
  User,
  UserRound,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import SearchableSelect from '../components/auth/SearchableSelect'
import { notify } from '../lib/notify'
import { getCheckoutPreview, placeCheckoutOrder } from '../services/checkoutService'
import {
  createUserAddress,
  getUserAddresses,
} from '../services/addressService'
import { useCartActions } from '../hooks/useCartActions'
import { selectCartItems } from '../store/slices/cartSlice'
import { normalizePreviewTotals } from '../utils/checkoutTotals'
import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityLabel,
  getCityOptionsByRegion,
} from '../constants/ghanaLocations'
import {
  validateGhanaPhone,
  validatePersonName,
} from '../utils/validateGhanaPhone'
import Images from '../utils/Images'

const regionOptions = GHANA_LOCATIONS.map((region) => ({
  value: region.id,
  label: region.name,
}))

const paymentOptions = [
  { id: 'card', label: 'Debit/Credit Card', type: 'card' },
  { id: 'mtn', label: 'MTN Mobile Money', type: 'mtn', image: Images.networks.mtn_momo },
  { id: 'telecel', label: 'Telecel Cash', type: 'telecel', image: Images.networks.telecel_cash },
  { id: 'airteltigo', label: 'AirtelTigo Cash', type: 'airteltigo', image: Images.networks.at_cash },
]

const initialAddress = {
  id: null,
  firstName: '',
  lastName: '',
  region: '',
  town: '',
  townCustom: '',
  address: '',
  phone: '',
}

const initialCardDetails = {
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
}

function formatCardNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatCardExpiry(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function validateCardName(value) {
  return validatePersonName(value, { fieldLabel: 'Name on card' })
}

function validateCardNumber(value) {
  const digits = String(value ?? '').replace(/\s/g, '')

  if (!digits) {
    return { valid: false, message: 'Card number is required' }
  }

  if (!/^\d{13,19}$/.test(digits)) {
    return { valid: false, message: 'Enter a valid card number' }
  }

  return { valid: true, value: digits }
}

function validateCardExpiry(value) {
  const match = String(value ?? '').trim().match(/^(\d{2})\/(\d{2})$/)

  if (!match) {
    return { valid: false, message: 'Use MM/YY format' }
  }

  const month = Number(match[1])
  const year = Number(`20${match[2]}`)

  if (month < 1 || month > 12) {
    return { valid: false, message: 'Enter a valid expiry month' }
  }

  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999)
  if (expiryEnd < new Date()) {
    return { valid: false, message: 'Card has expired' }
  }

  return { valid: true }
}

function validateCardCvv(value) {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!digits) {
    return { valid: false, message: 'CVV is required' }
  }

  if (!/^\d{3,4}$/.test(digits)) {
    return { valid: false, message: 'Enter a valid CVV' }
  }

  return { valid: true, value: digits }
}

function validateCardFields(card) {
  const errors = {}

  const cardName = validateCardName(card.cardName)
  if (!cardName.valid) errors.cardName = cardName.message

  const cardNumber = validateCardNumber(card.cardNumber)
  if (!cardNumber.valid) errors.cardNumber = cardNumber.message

  const expiry = validateCardExpiry(card.expiry)
  if (!expiry.valid) errors.expiry = expiry.message

  const cvv = validateCardCvv(card.cvv)
  if (!cvv.valid) errors.cvv = cvv.message

  return errors
}

function validateCardField(name, value) {
  switch (name) {
    case 'cardName':
      return validateCardName(value)
    case 'cardNumber':
      return validateCardNumber(value)
    case 'expiry':
      return validateCardExpiry(value)
    case 'cvv':
      return validateCardCvv(value)
    default:
      return { valid: true }
  }
}

function getAddressList(response, type = 'shipping') {
  const candidates = [response, response?.data, response?.result, response?.payload]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (Array.isArray(candidate?.[type])) return candidate[type]
    if (Array.isArray(candidate?.addresses)) return candidate.addresses
    if (Array.isArray(candidate?.data)) return candidate.data
    if (Array.isArray(candidate?.data?.[type])) return candidate.data[type]
    if (Array.isArray(candidate?.data?.addresses)) return candidate.data.addresses
  }

  return []
}

function resolveRegionId(regionValue) {
  const raw = String(regionValue ?? '').trim()
  if (!raw) return ''
  if (GHANA_LOCATIONS.some((region) => region.id === raw)) return raw

  return GHANA_LOCATIONS.find(
    (region) => region.name.toLowerCase() === raw.toLowerCase(),
  )?.id ?? ''
}

function resolveTownFormValues(regionId, townValue) {
  const raw = String(townValue ?? '').trim()
  if (!raw) return { town: '', townCustom: '' }
  if (raw === LOCATION_OTHER_VALUE) return { town: LOCATION_OTHER_VALUE, townCustom: '' }

  const options = getCityOptionsByRegion(regionId)
  const match = options.find(
    (option) => (
      option.value === raw
      || option.city.toLowerCase() === raw.toLowerCase()
      || option.label.toLowerCase() === raw.toLowerCase()
    ),
  )

  if (match) return { town: match.value, townCustom: '' }
  return { town: LOCATION_OTHER_VALUE, townCustom: raw }
}

function getRegionLabel(regionValue) {
  const regionId = resolveRegionId(regionValue)
  return GHANA_LOCATIONS.find((region) => region.id === regionId)?.name
    ?? String(regionValue ?? '').trim()
}

function getTownLabel(regionValue, townValue, townCustom = '') {
  if (townValue === LOCATION_OTHER_VALUE) return String(townCustom ?? '').trim()
  const regionId = resolveRegionId(regionValue)
  return getCityLabel(regionId, townValue) || String(townValue ?? '').trim()
}

function normalizeAddress(address) {
  if (!address || typeof address !== 'object') return initialAddress

  const fullName = address.name ?? address.full_name ?? ''
  const [firstName = '', ...lastNameParts] = String(fullName).trim().split(/\s+/)
  const regionId = resolveRegionId(address.region ?? address.region_id ?? '')
  const townRaw = address.city ?? address.town ?? address.city_or_town ?? address.townCustom ?? ''
  const { town, townCustom } = resolveTownFormValues(
    regionId,
    address.town === LOCATION_OTHER_VALUE
      ? LOCATION_OTHER_VALUE
      : townRaw,
  )

  return {
    id: address.id ?? address.address_id ?? null,
    firstName: address.first_name ?? address.firstName ?? firstName,
    lastName: address.last_name ?? address.lastName ?? lastNameParts.join(' '),
    region: regionId,
    town: address.town === LOCATION_OTHER_VALUE ? LOCATION_OTHER_VALUE : town,
    townCustom: address.town === LOCATION_OTHER_VALUE
      ? String(address.townCustom ?? townRaw).trim()
      : townCustom,
    address: address.address_line_1 ?? address.address ?? address.street_address ?? '',
    phone: address.phone ?? address.phone_number ?? '',
  }
}

function buildCheckoutAddress(address) {
  const firstName = String(address.firstName ?? '').trim()
  const lastName = String(address.lastName ?? '').trim()
  const name = [firstName, lastName].filter(Boolean).join(' ')

  return {
    name,
    phone: String(address.phone ?? '').trim(),
    address: String(address.address ?? '').trim(),
    city: getTownLabel(address.region, address.town, address.townCustom),
    country: 'Ghana',
  }
}

function buildDeliveryPrefill(user) {
  return {
    ...initialAddress,
    firstName: user?.first_name ?? user?.firstName ?? '',
    lastName: user?.last_name ?? user?.lastName ?? '',
    phone: user?.phone_number ?? user?.phone ?? '',
  }
}

function buildBillingPrefill(user, shippingAddress) {
  const savedShipping = normalizeAddress(shippingAddress)
  const regionId = resolveRegionId(user?.region) || savedShipping.region
  const townRaw = user?.city_or_town ?? user?.city ?? user?.town ?? ''
  const townValues = townRaw
    ? resolveTownFormValues(regionId, townRaw)
    : { town: savedShipping.town, townCustom: savedShipping.townCustom }

  return {
    id: null,
    firstName: user?.first_name ?? user?.firstName ?? savedShipping.firstName,
    lastName: user?.last_name ?? user?.lastName ?? savedShipping.lastName,
    region: regionId,
    town: townValues.town,
    townCustom: townValues.townCustom,
    address: user?.address_line_1 ?? user?.address ?? user?.street_address ?? savedShipping.address,
    phone: user?.phone_number ?? user?.phone ?? savedShipping.phone,
  }
}

function buildSavedAddressPayload(address, type = 'shipping') {
  return {
    type,
    first_name: String(address.firstName ?? '').trim(),
    last_name: String(address.lastName ?? '').trim(),
    phone_number: String(address.phone ?? '').trim(),
    region: getRegionLabel(address.region),
    city_or_town: getTownLabel(address.region, address.town, address.townCustom),
    address_line_1: String(address.address ?? '').trim(),
    country: 'Ghana',
  }
}

function getAddressKey(address) {
  const normalized = normalizeAddress(address)

  return [
    normalized.firstName,
    normalized.lastName,
    normalized.address,
    normalized.phone,
    getTownLabel(normalized.region, normalized.town, normalized.townCustom),
    getRegionLabel(normalized.region),
  ]
    .map((value) => String(value).trim().toLowerCase())
    .join('|')
}

function hasAddressContent(address) {
  return [
    address?.firstName,
    address?.lastName,
    address?.region,
    address?.town,
    address?.townCustom,
    address?.address,
    address?.phone,
  ].some((value) => String(value ?? '').trim())
}

function resolveActiveDeliveryAddress({
  address,
  savedAddresses,
  preferredSavedAddress,
  isAddingAddress,
  authenticatedUser,
}) {
  if (isAddingAddress) return address

  if (savedAddresses.length === 1) {
    return normalizeAddress(savedAddresses[0])
  }

  if (address.id) {
    const matchedSavedAddress = savedAddresses.find(
      (item) => normalizeAddress(item).id === address.id,
    )
    if (matchedSavedAddress) return normalizeAddress(matchedSavedAddress)
    return address
  }

  if (preferredSavedAddress) {
    const onlyProfilePrefill = !address.region && !address.town && !address.address
    if (onlyProfilePrefill || !hasAddressContent(address)) {
      return normalizeAddress(preferredSavedAddress)
    }
  }

  if (!hasAddressContent(address) && authenticatedUser) {
    return buildDeliveryPrefill(authenticatedUser)
  }

  return address
}

function resolveEffectiveBillingAddressId({
  billingAddressId,
  billingAddresses,
  preferredBillingAddress,
  isAddingBillingAddress,
}) {
  if (billingAddressId) return billingAddressId
  if (isAddingBillingAddress) return null

  if (billingAddresses.length === 1) {
    return normalizeAddress(billingAddresses[0]).id ?? null
  }

  return normalizeAddress(preferredBillingAddress).id ?? null
}

function resolveActiveBillingAddress({
  billingAddresses,
  effectiveBillingAddressId,
  preferredBillingAddress,
}) {
  const matchedAddress = billingAddresses.find(
    (item) => normalizeAddress(item).id === effectiveBillingAddressId,
  )

  return normalizeAddress(matchedAddress ?? preferredBillingAddress ?? initialAddress)
}

function formatAddressCardLocation(address) {
  return [
    getTownLabel(address.region, address.town, address.townCustom),
    getRegionLabel(address.region),
  ].filter(Boolean).join(', ')
}

function SavedAddressCard({ savedAddress, selected, onSelect }) {
  const normalized = normalizeAddress(savedAddress)
  const fullName = [normalized.firstName, normalized.lastName].filter(Boolean).join(' ')
  const location = formatAddressCardLocation(normalized)
  const isDefault = savedAddress?.is_default === true || savedAddress?.isDefault === true

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
        selected
          ? 'border-auth-primary bg-linear-to-br from-red-50/80 via-white to-white shadow-md shadow-auth-primary/10 ring-2 ring-auth-primary/25'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl transition-opacity ${
          selected ? 'bg-auth-primary/15 opacity-100' : 'bg-slate-200/40 opacity-0 group-hover:opacity-60'
        }`}
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
            selected
              ? 'bg-auth-primary text-white shadow-sm shadow-auth-primary/25'
              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
          }`}
        >
          <MapPin className="size-5" strokeWidth={1.9} aria-hidden />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold tracking-tight text-slate-950">{fullName || 'Saved address'}</span>
            {isDefault ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Default
              </span>
            ) : null}
            {selected ? (
              <span className="rounded-full bg-auth-primary/10 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-auth-primary">
                Selected
              </span>
            ) : null}
          </div>

          {normalized.address ? (
            <p className="text-sm leading-relaxed text-slate-600">{normalized.address}</p>
          ) : null}

          {(location || normalized.phone) ? (
            <div className="flex flex-col gap-2">
              {location ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Building2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {location}
                </p>
              ) : null}

              {normalized.phone ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Phone className="size-3.5 shrink-0 text-auth-primary" strokeWidth={2} aria-hidden />
                  {normalized.phone}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all ${
            selected
              ? 'border-auth-primary bg-auth-primary text-white'
              : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
          }`}
          aria-hidden
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
    </button>
  )
}

function buildCheckoutPayload(shippingAddress, billingAddress) {
  if (shippingAddress.id && billingAddress.id) {
    return {
      shipping_address_id: shippingAddress.id,
      billing_address_id: billingAddress.id,
    }
  }

  const checkoutShippingAddress = buildCheckoutAddress(shippingAddress)
  const checkoutBillingAddress = buildCheckoutAddress(billingAddress)

  return {
    shipping_address: checkoutShippingAddress,
    billing_address: checkoutBillingAddress,
  }
}

function formatCheckoutAmount(value) {
  return `₵${Number(value || 0).toFixed(2)}`
}

function validateRequiredText(value, fieldLabel, { minLength = 2 } = {}) {
  const text = String(value ?? '').trim()

  if (!text) {
    return { valid: false, message: `${fieldLabel} is required` }
  }

  if (text.length < minLength) {
    return { valid: false, message: `${fieldLabel} must be at least ${minLength} characters` }
  }

  return { valid: true, value: text }
}

function validateAddressFields(address) {
  const errors = {}

  const firstName = validatePersonName(address.firstName, { fieldLabel: 'First name' })
  if (!firstName.valid) errors.firstName = firstName.message

  const lastName = validatePersonName(address.lastName, { fieldLabel: 'Last name' })
  if (!lastName.valid) errors.lastName = lastName.message

  if (!address.region) {
    errors.region = 'Please select your region'
  }

  if (!address.town) {
    errors.town = 'Please select your town'
  } else if (address.town === LOCATION_OTHER_VALUE && !String(address.townCustom ?? '').trim()) {
    errors.townCustom = 'Please enter your town'
  }

  const street = validateRequiredText(address.address, 'Address', { minLength: 5 })
  if (!street.valid) errors.address = street.message

  const phone = validateGhanaPhone(address.phone)
  if (!phone.valid) errors.phone = phone.message

  return errors
}

function validateAddressField(name, value, address = {}) {
  switch (name) {
    case 'firstName':
      return validatePersonName(value, { fieldLabel: 'First name' })
    case 'lastName':
      return validatePersonName(value, { fieldLabel: 'Last name' })
    case 'region':
      return value
        ? { valid: true }
        : { valid: false, message: 'Please select your region' }
    case 'town':
      if (!value) return { valid: false, message: 'Please select your town' }
      if (value === LOCATION_OTHER_VALUE && !String(address.townCustom ?? '').trim()) {
        return { valid: false, message: 'Please enter your town' }
      }
      return { valid: true }
    case 'townCustom':
      return String(value ?? '').trim()
        ? { valid: true }
        : { valid: false, message: 'Please enter your town' }
    case 'address':
      return validateRequiredText(value, 'Address', { minLength: 5 })
    case 'phone':
      return validateGhanaPhone(value)
    default:
      return { valid: true }
  }
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  error = '',
  icon: Icon,
  placeholder = '',
  required = false,
  type = 'text',
  inputMode,
  autoComplete,
}) {
  return (
    <label className="grid gap-2">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
        {Icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-auth-primary/10 text-auth-primary">
            <Icon className="size-3.5" strokeWidth={2.1} aria-hidden />
          </span>
        ) : null}
        <span className="min-w-0">
          {label}
          {required ? <span className="ml-1 text-auth-primary">*</span> : null}
        </span>
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={`h-12 rounded-2xl border bg-white px-4 text-sm outline-none transition-colors placeholder:text-slate-300 sm:h-13 ${
          error
            ? 'border-auth-primary focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/15'
            : 'border-slate-300 focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10'
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-auth-primary" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function CheckoutIntro() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Checkout</h1>
      <p className="mt-2 text-sm text-slate-800">Save your information for faster checkout</p>
    </section>
  )
}

function DeliveryInformation({
  address,
  errors = {},
  savedAddresses,
  isAddingAddress,
  isSavingAddress,
  canSaveAddress,
  onAddressChange,
  onAddressBlur,
  onRegionChange,
  onTownChange,
  onTownCustomChange,
  onSelectAddress,
  onAddAddress,
  onSaveAddress,
}) {
  const townOptions = useMemo(
    () => getCityOptionsByRegion(address.region),
    [address.region],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-auth-primary/10 text-auth-primary">
            <Truck className="size-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Information</h2>
            <p className="mt-0.5 text-sm text-slate-500">Where should we deliver your order?</p>
          </div>
        </div>
        {savedAddresses.length > 0 && !isAddingAddress && (
          <button
            type="button"
            onClick={onAddAddress}
            className="inline-flex items-center gap-2 text-sm font-semibold text-auth-primary"
          >
            <Plus className="size-4" />
            Add another address
          </button>
        )}
      </div>

      {savedAddresses.length > 0 && !isAddingAddress && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {savedAddresses.map((savedAddress, index) => {
            const normalized = normalizeAddress(savedAddress)
            const selected = normalized.id
              ? normalized.id === address.id
              : normalized.address === address.address && normalized.phone === address.phone

            return (
              <SavedAddressCard
                key={normalized.id ?? `${normalized.address}-${index}`}
                savedAddress={savedAddress}
                selected={selected}
                onSelect={() => onSelectAddress(savedAddress)}
              />
            )
          })}
        </div>
      )}

      {(savedAddresses.length === 0 || isAddingAddress) && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5">
            <Field
              label="First name"
              name="firstName"
              icon={User}
              required
              value={address.firstName}
              onChange={onAddressChange}
              onBlur={onAddressBlur}
              error={errors.firstName}
              placeholder="e.g. Ama"
              autoComplete="given-name"
            />
            <Field
              label="Last name"
              name="lastName"
              icon={UserRound}
              required
              value={address.lastName}
              onChange={onAddressChange}
              onBlur={onAddressBlur}
              error={errors.lastName}
              placeholder="e.g. Mensah"
              autoComplete="family-name"
            />
            <SearchableSelect
              id="delivery-region"
              label="Region"
              icon={MapPin}
              value={address.region}
              onChange={onRegionChange}
              options={regionOptions}
              placeholder="Search regions…"
              emptyLabel="Select region"
              error={errors.region}
            />
            <SearchableSelect
              id="delivery-town"
              label="Town"
              icon={Building2}
              value={address.town}
              onChange={onTownChange}
              options={townOptions}
              placeholder="Search towns…"
              emptyLabel="Select town"
              allowOther
              otherValue={LOCATION_OTHER_VALUE}
              otherLabel="Other (enter custom town)"
              customValue={address.townCustom}
              onCustomChange={onTownCustomChange}
              customInputPlaceholder="Type your town name"
              error={errors.town}
              customError={errors.townCustom}
              disabled={!address.region}
            />
            <Field
              label="Address"
              name="address"
              icon={Home}
              required
              value={address.address}
              onChange={onAddressChange}
              onBlur={onAddressBlur}
              error={errors.address}
              placeholder="Street, landmark, or digital address"
              autoComplete="street-address"
            />
            <Field
              label="Phone Number"
              name="phone"
              icon={Phone}
              required
              type="tel"
              inputMode="tel"
              value={address.phone}
              onChange={onAddressChange}
              onBlur={onAddressBlur}
              error={errors.phone}
              placeholder="e.g. 024 123 4567"
              autoComplete="tel"
            />
          </div>
          {canSaveAddress && (
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectAddress(savedAddresses[0])}
                  disabled={isSavingAddress}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSaveAddress}
                disabled={isSavingAddress}
                aria-busy={isSavingAddress}
                className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-auth-primary px-5 py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSavingAddress ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  'Save address'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function BillingInformation({
  address,
  draftAddress,
  errors = {},
  savedAddresses,
  isAddingAddress,
  isSavingAddress,
  onAddressChange,
  onAddressBlur,
  onRegionChange,
  onTownChange,
  onTownCustomChange,
  onSelectAddress,
  onAddAddress,
  onCancel,
  onSaveAddress,
}) {
  const townOptions = useMemo(
    () => getCityOptionsByRegion(draftAddress.region),
    [draftAddress.region],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-auth-primary/10 text-auth-primary">
            <CreditCard className="size-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Billing Information</h2>
            <p className="mt-0.5 text-sm text-slate-500">Used for receipts and payment records</p>
          </div>
        </div>
        {!isAddingAddress && (
          <button type="button" onClick={onAddAddress} className="inline-flex items-center gap-2 text-sm font-semibold text-auth-primary">
            <Plus className="size-4" />
            {savedAddresses.length > 0 ? 'Add another billing address' : 'Add billing address'}
          </button>
        )}
      </div>

      {savedAddresses.length === 0 && !isAddingAddress && (
        <p className="mt-3 text-sm text-amber-800">Add a billing address before placing the order.</p>
      )}

      {savedAddresses.length > 0 && !isAddingAddress && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {savedAddresses.map((savedAddress, index) => {
            const normalized = normalizeAddress(savedAddress)
            const selected = normalized.id === address.id

            return (
              <SavedAddressCard
                key={normalized.id ?? `${normalized.address}-${index}`}
                savedAddress={savedAddress}
                selected={selected}
                onSelect={() => onSelectAddress(savedAddress)}
              />
            )
          })}
        </div>
      )}

      {isAddingAddress && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5">
            <Field label="First name" name="firstName" icon={User} required value={draftAddress.firstName} onChange={onAddressChange} onBlur={onAddressBlur} error={errors.firstName} placeholder="e.g. Ama" autoComplete="given-name" />
            <Field label="Last name" name="lastName" icon={UserRound} required value={draftAddress.lastName} onChange={onAddressChange} onBlur={onAddressBlur} error={errors.lastName} placeholder="e.g. Mensah" autoComplete="family-name" />
            <SearchableSelect
              id="billing-region"
              label="Region"
              icon={MapPin}
              value={draftAddress.region}
              onChange={onRegionChange}
              options={regionOptions}
              placeholder="Search regions…"
              emptyLabel="Select region"
              error={errors.region}
            />
            <SearchableSelect
              id="billing-town"
              label="Town"
              icon={Building2}
              value={draftAddress.town}
              onChange={onTownChange}
              options={townOptions}
              placeholder="Search towns…"
              emptyLabel="Select town"
              allowOther
              otherValue={LOCATION_OTHER_VALUE}
              otherLabel="Other (enter custom town)"
              customValue={draftAddress.townCustom}
              onCustomChange={onTownCustomChange}
              customInputPlaceholder="Type your town name"
              error={errors.town}
              customError={errors.townCustom}
              disabled={!draftAddress.region}
            />
            <Field label="Address" name="address" icon={Home} required value={draftAddress.address} onChange={onAddressChange} onBlur={onAddressBlur} error={errors.address} placeholder="Street, landmark, or digital address" autoComplete="street-address" />
            <Field label="Phone Number" name="phone" icon={Phone} required type="tel" inputMode="tel" value={draftAddress.phone} onChange={onAddressChange} onBlur={onAddressBlur} error={errors.phone} placeholder="e.g. 024 123 4567" autoComplete="tel" />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button
              type="button"
              onClick={onSaveAddress}
              disabled={isSavingAddress}
              aria-busy={isSavingAddress}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-auth-primary px-5 py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSavingAddress ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save billing address'
              )}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function PaymentBadge({ type, image, label }) {
  if (type === 'card') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <img
          src={Images.common.visa}
          alt="Visa"
          className="h-6 w-auto object-contain"
        />
        <img
          src={Images.common.mastercard}
          alt="Mastercard"
          className="h-6 w-auto object-contain"
        />
      </span>
    )
  }

  if (image) {
    return (
      <img
        src={image}
        alt={label}
        className="h-8 w-auto max-w-16 object-contain"
      />
    )
  }

  return null
}

function PaymentDetails({
  selectedPayment,
  onSelectPayment,
  cardDetails,
  cardErrors = {},
  onCardChange,
  onCardBlur,
}) {
  const isCard = selectedPayment === 'card'

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Payment Details</h2>
      <div className="mt-4 space-y-3">
        {paymentOptions.map((option) => {
          const selected = selectedPayment === option.id
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onSelectPayment(option.id)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${
                selected ? 'border-auth-primary ring-1 ring-auth-primary' : 'border-slate-300'
              }`}
            >
              <span className={`size-5 rounded-full border ${selected ? 'border-auth-primary bg-auth-primary' : 'border-slate-300'}`} />
              <PaymentBadge type={option.type} image={option.image} label={option.label} />
              <span className="text-sm font-semibold text-slate-800">{option.label}</span>
            </button>
          )
        })}
      </div>

      {isCard && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-red-50/40">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3.5 sm:px-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-auth-primary/10 text-auth-primary">
              <Lock className="size-4.5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Card details</p>
              <p className="text-xs text-slate-500">Your payment information is encrypted and secure</p>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 sm:flex">
              <img src={Images.common.visa} alt="Visa" className="h-5 w-auto object-contain" />
              <img src={Images.common.mastercard} alt="Mastercard" className="h-5 w-auto object-contain" />
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5 sm:p-5">
            <Field
              label="Name on card"
              name="cardName"
              icon={User}
              required
              value={cardDetails.cardName}
              onChange={onCardChange}
              onBlur={onCardBlur}
              error={cardErrors.cardName}
              placeholder="e.g. Ama Mensah"
              autoComplete="cc-name"
            />
            <Field
              label="Card number"
              name="cardNumber"
              icon={CreditCard}
              required
              value={cardDetails.cardNumber}
              onChange={onCardChange}
              onBlur={onCardBlur}
              error={cardErrors.cardNumber}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            <Field
              label="Expiry date"
              name="expiry"
              icon={Calendar}
              required
              value={cardDetails.expiry}
              onChange={onCardChange}
              onBlur={onCardBlur}
              error={cardErrors.expiry}
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
            <Field
              label="CVV"
              name="cvv"
              icon={Lock}
              required
              type="password"
              value={cardDetails.cvv}
              onChange={onCardChange}
              onBlur={onCardBlur}
              error={cardErrors.cvv}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      )}
    </section>
  )
}

function QuantityPill({ value, onDecrease, onIncrease }) {
  return (
    <div className="inline-flex h-8 min-w-24 items-center justify-between rounded-full bg-slate-50 px-2">
      <button type="button" aria-label="Decrease quantity" onClick={onDecrease} disabled={value <= 1} className="flex size-7 items-center justify-center text-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
        <Minus className="size-4" />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold text-auth-primary">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={onIncrease} className="flex size-7 items-center justify-center text-auth-primary">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function OrderSummary({ items, onQuantityChange, onDelete }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Order Summary</h2>
      <div className={`mt-4 divide-y divide-slate-300 ${items.length > 4 ? 'max-h-[31rem] overflow-y-auto pr-1' : ''}`}>
        {items.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-[5.25rem_minmax(0,1fr)_auto] gap-3 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:gap-4"
          >
            <img src={item.image} alt={item.name} className="h-21 w-21 rounded-lg border border-red-100 object-cover sm:h-27 sm:w-27" />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900">{item.name}</h3>
              <p className="mt-1 truncate text-[0.6875rem] text-slate-500">
                Color:{item.variant} <span className="ml-2">Storage:{item.storage}</span>
              </p>
              <div className="mt-5">
                <QuantityPill
                  value={item.quantity}
                  onDecrease={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                  onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
                />
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className="text-base font-bold text-slate-950">{formatCheckoutAmount(item.price)}</p>
              <button type="button" onClick={() => onDelete(item.id)} aria-label={`Remove ${item.name}`} className="text-auth-primary">
                <Trash2 className="size-5" strokeWidth={1.8} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function OrderTotal({ itemCount, subtotal, totals }) {
  const calculatedTotal = subtotal + totals.tax + totals.deliveryFee - totals.freeDelivery - totals.couponDiscount
  const total = totals.total == null
    ? calculatedTotal
    : Math.max(0, Number(totals.total) - Number(totals.couponDiscount))
  const netDelivery = Math.max(0, Number(totals.deliveryFee) - Number(totals.freeDelivery))
  const isFreeDelivery = netDelivery === 0

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <h2 className="text-xl font-semibold text-slate-900">Order Total</h2>
      <dl className="mt-4 space-y-4 border-t border-slate-200 pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Items</dt>
          <dd className="font-semibold text-slate-950">{itemCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Subtotal</dt>
          <dd className="font-semibold text-slate-950">{formatCheckoutAmount(subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex items-center justify-between gap-4 text-auth-primary">
            <dt>Discount</dt>
            <dd className="font-semibold">-{formatCheckoutAmount(totals.discount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Tax</dt>
          <dd className="font-semibold text-slate-950">{formatCheckoutAmount(totals.tax)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Delivery</dt>
          <dd className={`font-semibold ${isFreeDelivery ? 'text-emerald-700' : 'text-slate-950'}`}>
            {isFreeDelivery ? 'Free' : formatCheckoutAmount(netDelivery)}
          </dd>
        </div>
        {totals.couponDiscount > 0 && (
          <div className="flex items-center justify-between gap-4 text-auth-primary">
            <dt>Coupon Discount</dt>
            <dd className="font-semibold">-{formatCheckoutAmount(totals.couponDiscount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-slate-300 pt-4 text-base">
          <dt className="font-bold text-slate-950">Total</dt>
          <dd className="font-extrabold text-slate-950">{formatCheckoutAmount(total)}</dd>
        </div>
      </dl>
    </section>
  )
}

function DeliveryDate() {
  return (
    <section className="px-2 py-3">
      <div className="grid gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <h2 className="font-semibold text-slate-900">Estimated Delivery Date</h2>
          <p className="mt-1 text-xs text-slate-500">Estimated day product is expected to be delivered</p>
        </div>
        <p className="font-semibold text-slate-900 sm:text-right">1 - 2 days (23-25 June)</p>
      </div>
      <div className="mt-8 text-right">
        <button type="button" className="text-xs font-semibold text-auth-primary underline">
          View Delivery Information
        </button>
      </div>
    </section>
  )
}

function PromoCode({ coupon, onCouponChange, onApplyCoupon, couponMessage }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <h2 className="text-lg font-semibold text-slate-900">Promo Code</h2>
      <div className="mt-4 flex gap-3">
        <input
          value={coupon}
          onChange={(event) => onCouponChange(event.target.value)}
          placeholder="EZ-te56"
          className="h-13 min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 text-sm outline-none placeholder:text-slate-300 focus:border-auth-primary"
        />
        <button type="button" onClick={onApplyCoupon} className="min-w-22 rounded-2xl bg-auth-primary px-5 text-base font-bold text-white">
          Apply
        </button>
      </div>
      {couponMessage && <p className="mt-2 text-xs font-semibold text-auth-primary">{couponMessage}</p>}
    </section>
  )
}

export default function CheckoutPage() {
  const queryClient = useQueryClient()
  const items = useSelector(selectCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const authenticatedUser = useSelector((state) => state.auth.user)
  const { updateQuantity, deleteItem } = useCartActions()
  const [address, setAddress] = useState(initialAddress)
  const [addressErrors, setAddressErrors] = useState({})
  const [billingAddressId, setBillingAddressId] = useState(null)
  const [billingAddressDraft, setBillingAddressDraft] = useState(initialAddress)
  const [billingAddressErrors, setBillingAddressErrors] = useState({})
  const [isAddingBillingAddress, setIsAddingBillingAddress] = useState(false)
  const [sessionAddresses, setSessionAddresses] = useState([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('mtn')
  const [cardDetails, setCardDetails] = useState(initialCardDetails)
  const [cardErrors, setCardErrors] = useState({})
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const previewQuery = useQuery({
    queryKey: ['checkout-preview'],
    queryFn: getCheckoutPreview,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  })

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: getUserAddresses,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  })
  const fetchedAddresses = useMemo(() => getAddressList(addressesQuery.data, 'shipping'), [addressesQuery.data])
  const billingAddresses = useMemo(() => getAddressList(addressesQuery.data, 'billing'), [addressesQuery.data])
  const savedAddresses = useMemo(() => {
    const uniqueAddresses = new Map()

    for (const savedAddress of [...fetchedAddresses, ...sessionAddresses]) {
      const key = getAddressKey(savedAddress)
      const existingAddress = uniqueAddresses.get(key)
      const existingHasId = Boolean(normalizeAddress(existingAddress).id)
      const incomingHasId = Boolean(normalizeAddress(savedAddress).id)

      if (key.replaceAll('|', '') && (!existingAddress || incomingHasId || !existingHasId)) {
        uniqueAddresses.set(key, savedAddress)
      }
    }

    return [...uniqueAddresses.values()]
  }, [fetchedAddresses, sessionAddresses])

  const createAddressMutation = useMutation({
    mutationFn: createUserAddress,
    onSuccess: async (response, submittedAddress) => {
      const createdAddress = response?.address
        ?? response?.data?.address
        ?? response?.data
        ?? submittedAddress
      const normalized = normalizeAddress(createdAddress)
      const savedAddress = normalized.address ? createdAddress : submittedAddress

      setSessionAddresses((current) => {
        const savedKey = getAddressKey(savedAddress)
        return [...current.filter((item) => getAddressKey(item) !== savedKey), savedAddress]
      })
      setAddress(normalizeAddress(savedAddress))
      setIsAddingAddress(false)
      await queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      notify.success('Delivery address saved')
    },
    onError: (error) => notify.fromError(error, 'Unable to save delivery address'),
  })

  const createBillingAddressMutation = useMutation({
    mutationFn: createUserAddress,
    onSuccess: async (response, submittedAddress) => {
      const createdAddress = response?.address
        ?? response?.data?.address
        ?? response?.data
        ?? submittedAddress
      const normalized = normalizeAddress(createdAddress)

      if (normalized.id) setBillingAddressId(normalized.id)
      setBillingAddressDraft(initialAddress)
      setIsAddingBillingAddress(false)
      await queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      notify.success('Billing address saved')
    },
    onError: (error) => notify.fromError(error, 'Unable to save billing address'),
  })

  useEffect(() => {
    if (previewQuery.isError) {
      notify.fromError(previewQuery.error, 'Checkout preview is not available yet')
    }
  }, [previewQuery.error, previewQuery.isError])

  useEffect(() => {
    if (addressesQuery.isError) {
      notify.fromError(addressesQuery.error, 'Saved addresses are not available yet')
    }
  }, [addressesQuery.error, addressesQuery.isError])

  const defaultAddress = savedAddresses.find((item) => item?.is_default === true || item?.isDefault === true)
  const preferredSavedAddress = defaultAddress ?? savedAddresses[0]
  const preferredBillingAddress = billingAddresses.find(
    (item) => item?.is_default === true || item?.isDefault === true,
  ) ?? billingAddresses[0]

  const activeAddress = useMemo(
    () => resolveActiveDeliveryAddress({
      address,
      savedAddresses,
      preferredSavedAddress,
      isAddingAddress,
      authenticatedUser,
    }),
    [address, savedAddresses, preferredSavedAddress, isAddingAddress, authenticatedUser],
  )

  const effectiveBillingAddressId = useMemo(
    () => resolveEffectiveBillingAddressId({
      billingAddressId,
      billingAddresses,
      preferredBillingAddress,
      isAddingBillingAddress,
    }),
    [billingAddressId, billingAddresses, preferredBillingAddress, isAddingBillingAddress],
  )

  const activeBillingAddress = useMemo(
    () => resolveActiveBillingAddress({
      billingAddresses,
      effectiveBillingAddressId,
      preferredBillingAddress,
    }),
    [billingAddresses, effectiveBillingAddressId, preferredBillingAddress],
  )

  const previewTotals = normalizePreviewTotals(previewQuery.data)
  const totals = {
    ...previewTotals,
    couponDiscount,
  }
  const orderItemCount = previewTotals.itemCount ?? items.length
  const orderSubtotal = previewTotals.subtotal ?? subtotal

  const hasAddress = [
    activeAddress.firstName,
    activeAddress.lastName,
    activeAddress.region,
    activeAddress.town === LOCATION_OTHER_VALUE
      ? activeAddress.townCustom
      : activeAddress.town,
    activeAddress.address,
    activeAddress.phone,
  ]
    .every((value) => String(value ?? '').trim())
  const hasCheckoutAddress = !isAuthenticated || Boolean(activeAddress.id && activeBillingAddress.id)
  const isCardPaymentValid = useMemo(() => {
    if (selectedPayment !== 'card') return true
    return Object.keys(validateCardFields(cardDetails)).length === 0
  }, [selectedPayment, cardDetails])
  const canPlaceOrder = items.length > 0 && selectedPayment && hasAddress && hasCheckoutAddress && isCardPaymentValid

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
    if (addressErrors[name]) {
      setAddressErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const clearFieldError = (setter, name) => {
    setter((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleAddressBlur = (event) => {
    const { name, value } = event.target
    const result = validateAddressField(name, value, address)
    setAddressErrors((current) => {
      if (result.valid) {
        if (!current[name]) return current
        const next = { ...current }
        delete next[name]
        return next
      }
      return { ...current, [name]: result.message }
    })
  }

  const handleRegionChange = (regionId) => {
    setAddress((current) => ({
      ...current,
      region: regionId,
      town: '',
      townCustom: '',
    }))
    setAddressErrors((current) => {
      const next = { ...current }
      delete next.region
      delete next.town
      delete next.townCustom
      return next
    })
  }

  const handleTownChange = (townValue) => {
    setAddress((current) => ({
      ...current,
      town: townValue,
      townCustom: townValue === LOCATION_OTHER_VALUE ? current.townCustom : '',
    }))
    setAddressErrors((current) => {
      const next = { ...current }
      delete next.town
      if (townValue !== LOCATION_OTHER_VALUE) delete next.townCustom
      return next
    })
  }

  const handleTownCustomChange = (townCustom) => {
    setAddress((current) => ({ ...current, townCustom }))
    clearFieldError(setAddressErrors, 'townCustom')
  }

  const handleSelectAddress = (selectedAddress) => {
    setAddress(normalizeAddress(selectedAddress))
    setAddressErrors({})
    setIsAddingAddress(false)
  }

  const handleAddAddress = () => {
    setAddress(buildDeliveryPrefill(authenticatedUser))
    setAddressErrors({})
    setIsAddingAddress(true)
  }

  const handleSaveAddress = () => {
    if (!isAuthenticated) return

    const errors = validateAddressFields(address)
    setAddressErrors(errors)

    if (Object.keys(errors).length > 0) {
      notify.error('Please fix the highlighted delivery address fields')
      return
    }

    createAddressMutation.mutate(buildSavedAddressPayload(address))
  }

  const handleBillingAddressChange = (event) => {
    const { name, value } = event.target
    setBillingAddressDraft((current) => ({ ...current, [name]: value }))
    clearFieldError(setBillingAddressErrors, name)
  }

  const handleBillingAddressBlur = (event) => {
    const { name, value } = event.target
    const result = validateAddressField(name, value, billingAddressDraft)
    setBillingAddressErrors((current) => {
      if (result.valid) {
        if (!current[name]) return current
        const next = { ...current }
        delete next[name]
        return next
      }
      return { ...current, [name]: result.message }
    })
  }

  const handleBillingRegionChange = (regionId) => {
    setBillingAddressDraft((current) => ({
      ...current,
      region: regionId,
      town: '',
      townCustom: '',
    }))
    setBillingAddressErrors((current) => {
      const next = { ...current }
      delete next.region
      delete next.town
      delete next.townCustom
      return next
    })
  }

  const handleBillingTownChange = (townValue) => {
    setBillingAddressDraft((current) => ({
      ...current,
      town: townValue,
      townCustom: townValue === LOCATION_OTHER_VALUE ? current.townCustom : '',
    }))
    setBillingAddressErrors((current) => {
      const next = { ...current }
      delete next.town
      if (townValue !== LOCATION_OTHER_VALUE) delete next.townCustom
      return next
    })
  }

  const handleBillingTownCustomChange = (townCustom) => {
    setBillingAddressDraft((current) => ({ ...current, townCustom }))
    clearFieldError(setBillingAddressErrors, 'townCustom')
  }

  const handleSaveBillingAddress = () => {
    const errors = validateAddressFields(billingAddressDraft)
    setBillingAddressErrors(errors)

    if (Object.keys(errors).length > 0) {
      notify.error('Please fix the highlighted billing address fields')
      return
    }

    createBillingAddressMutation.mutate(buildSavedAddressPayload(billingAddressDraft, 'billing'))
  }

  const handleCardChange = (event) => {
    const { name, value } = event.target
    let nextValue = value

    if (name === 'cardNumber') nextValue = formatCardNumber(value)
    if (name === 'expiry') nextValue = formatCardExpiry(value)
    if (name === 'cvv') nextValue = String(value ?? '').replace(/\D/g, '').slice(0, 4)

    setCardDetails((current) => ({ ...current, [name]: nextValue }))

    if (cardErrors[name]) {
      setCardErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const handleCardBlur = (event) => {
    const { name, value } = event.target
    const result = validateCardField(name, value)

    setCardErrors((current) => {
      if (result.valid) {
        if (!current[name]) return current
        const next = { ...current }
        delete next[name]
        return next
      }
      return { ...current, [name]: result.message }
    })
  }

  const handleSelectPayment = (paymentId) => {
    setSelectedPayment(paymentId)
    if (paymentId !== 'card') setCardErrors({})
  }

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponDiscount(0)
      setCouponMessage('Enter a promo code')
      return
    }

    if (coupon.trim().toLowerCase() === 'ez-te56') {
      setCouponDiscount(15)
      setCouponMessage('Promo code applied')
      return
    }

    setCouponDiscount(0)
    setCouponMessage('Invalid promo code')
  }

  const handlePlaceOrder = async () => {
    if (selectedPayment === 'card') {
      const errors = validateCardFields(cardDetails)
      setCardErrors(errors)

      if (Object.keys(errors).length > 0) {
        notify.error('Please fix the highlighted card details')
        return
      }
    }

    if (!canPlaceOrder) return

    try {
      await placeCheckoutOrder(buildCheckoutPayload(activeAddress, activeBillingAddress))
      notify.success('Order placed successfully')
    } catch (error) {
      notify.fromError(error, 'Unable to place order')
    }
  }

  return (
    <SiteLayout>
      <main className="bg-white py-7 sm:py-8">
        <Container>
          {items.length === 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">Checkout</h1>
              <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>
              <Link to="/" className="mt-6 inline-flex rounded-lg bg-auth-primary px-6 py-3 text-sm font-bold text-white">
                Continue Shopping
              </Link>
            </section>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
              <div className="space-y-6">
                <CheckoutIntro />
                <DeliveryInformation
                  address={activeAddress}
                  errors={addressErrors}
                  savedAddresses={savedAddresses}
                  isAddingAddress={isAddingAddress}
                  isSavingAddress={createAddressMutation.isPending}
                  canSaveAddress={isAuthenticated}
                  onAddressChange={handleAddressChange}
                  onAddressBlur={handleAddressBlur}
                  onRegionChange={handleRegionChange}
                  onTownChange={handleTownChange}
                  onTownCustomChange={handleTownCustomChange}
                  onSelectAddress={handleSelectAddress}
                  onAddAddress={handleAddAddress}
                  onSaveAddress={handleSaveAddress}
                />
                {isAuthenticated && (
                  <BillingInformation
                    address={activeBillingAddress}
                    draftAddress={billingAddressDraft}
                    errors={billingAddressErrors}
                    savedAddresses={billingAddresses}
                    isAddingAddress={isAddingBillingAddress}
                    isSavingAddress={createBillingAddressMutation.isPending}
                    onAddressChange={handleBillingAddressChange}
                    onAddressBlur={handleBillingAddressBlur}
                    onRegionChange={handleBillingRegionChange}
                    onTownChange={handleBillingTownChange}
                    onTownCustomChange={handleBillingTownCustomChange}
                    onSelectAddress={(selectedAddress) => {
                      setBillingAddressId(normalizeAddress(selectedAddress).id)
                      setBillingAddressErrors({})
                    }}
                    onAddAddress={() => {
                      setBillingAddressDraft(
                        billingAddresses.length === 0
                          ? buildBillingPrefill(authenticatedUser, activeAddress)
                          : buildDeliveryPrefill(authenticatedUser),
                      )
                      setBillingAddressErrors({})
                      setIsAddingBillingAddress(true)
                    }}
                    onCancel={() => {
                      setBillingAddressDraft(initialAddress)
                      setBillingAddressErrors({})
                      setIsAddingBillingAddress(false)
                    }}
                    onSaveAddress={handleSaveBillingAddress}
                  />
                )}
                <PaymentDetails
                  selectedPayment={selectedPayment}
                  onSelectPayment={handleSelectPayment}
                  cardDetails={cardDetails}
                  cardErrors={cardErrors}
                  onCardChange={handleCardChange}
                  onCardBlur={handleCardBlur}
                />
              </div>
              <aside className="space-y-5">
                <OrderSummary items={items} onQuantityChange={updateQuantity} onDelete={deleteItem} />
                <OrderTotal itemCount={orderItemCount} subtotal={orderSubtotal} totals={totals} />
                <DeliveryDate />
                <PromoCode
                  coupon={coupon}
                  onCouponChange={setCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  couponMessage={couponMessage}
                />
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={!canPlaceOrder}
                    className="w-full rounded-lg bg-auth-primary px-5 py-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Place Order
                  </button>
                  <Link
                    to="/cart"
                    className="flex w-full items-center justify-center rounded-lg border border-slate-400 px-5 py-4 text-base font-bold text-slate-800"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>
    </SiteLayout>
  )
}
