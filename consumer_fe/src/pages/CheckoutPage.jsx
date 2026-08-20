import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  Lock,
  MapPin,
  Minus,
  PackageCheck,
  Pencil,
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
import { getCheckoutPreview, placeBuyNowOrder, placeCheckoutOrder } from '../services/checkoutService'
import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  updateUserAddress,
} from '../services/addressService'
import { useCartActions } from '../hooks/useCartActions'
import { selectCartItems } from '../store/slices/cartSlice'
import { formatCartItemOptions, enrichCartItemsForDisplay, extractCheckoutPreviewItems, resolveCartItemDisplayImage } from '../utils/normalizeCart'
import { normalizePreviewTotals, computeCartOrderTotals, calculateOrderTotal, normalizeOrderMoneyTotals } from '../utils/checkoutTotals'
import { resolveOrderItemPricing } from '../utils/normalizeOrders'
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
import { clearBuyNowItem, readBuyNowItem, saveBuyNowItem } from '../utils/buyNowItem'
import { getAddressList } from '../utils/userAddressHelpers'
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

function buildUpdatedAddressPayload(address, type = 'shipping') {
  return buildSavedAddressPayload(address, type)
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

  if (savedAddresses.length > 0 && !address.id) {
    return normalizeAddress(savedAddresses[0])
  }

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

  if (savedAddresses.length === 0 && authenticatedUser) {
    const base = buildDeliveryPrefill(authenticatedUser)
    if (!hasAddressContent(address)) return base
    return { ...base, ...address }
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

  if (billingAddresses.length > 0) {
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

function SavedAddressCard({ savedAddress, selected, onSelect, onEdit, onDelete, isDeleting }) {
  const normalized = normalizeAddress(savedAddress)
  const fullName = [normalized.firstName, normalized.lastName].filter(Boolean).join(' ')
  const location = formatAddressCardLocation(normalized)
  const isDefault = savedAddress?.is_default === true || savedAddress?.isDefault === true
  const metaLine = [location, normalized.phone].filter(Boolean).join(' · ')

  return (
    <div
      className={`relative min-w-0 rounded-xl border transition-colors ${
        selected
          ? 'border-auth-primary bg-red-50/50 ring-1 ring-auth-primary/25'
          : 'border-slate-200 bg-white hover:border-slate-300'
      } ${isDeleting ? 'opacity-70' : ''}`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        disabled={isDeleting}
        className="flex w-full items-start gap-2.5 p-3 pr-16 text-left disabled:cursor-wait"
      >
        <span
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected
              ? 'border-auth-primary bg-auth-primary text-white'
              : 'border-slate-300 bg-white text-transparent'
          }`}
          aria-hidden
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>

        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-slate-950">
              {fullName || 'Saved address'}
            </span>
            {isDefault ? (
              <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-px text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-700">
                Default
              </span>
            ) : null}
          </span>

          {normalized.address ? (
            <span className="line-clamp-2 block text-xs leading-snug text-slate-600">
              {normalized.address}
            </span>
          ) : null}

          {metaLine ? (
            <span className="block truncate text-xs text-slate-500">{metaLine}</span>
          ) : null}
        </span>
      </button>

      <div className="absolute right-2 top-2 flex gap-0.5">
        <button
          type="button"
          onClick={onEdit}
          disabled={isDeleting}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-auth-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/30 disabled:opacity-50"
          aria-label={`Edit ${fullName || 'saved address'}`}
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-wait disabled:opacity-60"
          aria-label={`Delete ${fullName || 'saved address'}`}
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="size-3.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}

function buildCheckoutPayload(shippingAddress, billingAddress) {
  return {
    shipping_address_id: shippingAddress.id,
    billing_address_id: billingAddress.id,
  }
}

// "Buy Now" has no backend cart to key off of, so the single item's
// product/variant/quantity is sent alongside the addresses.
function buildBuyNowCheckoutPayload(item, shippingAddress, billingAddress) {
  return {
    product_id: item.productId,
    product_variant_id: item.variantId ?? null,
    quantity: Math.max(1, Number(item.quantity) || 1),
    shipping_address_id: shippingAddress.id,
    billing_address_id: billingAddress.id,
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
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Checkout</h1>
      <p className="mt-2 text-sm text-slate-800">Save your information for faster checkout</p>
    </section>
  )
}

function CheckoutSkeletonBlock({ lines = 3, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-6 w-48 max-w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`h-12 animate-pulse rounded-2xl bg-slate-100 ${index % 2 === 0 ? 'w-full' : 'w-11/12'}`}
          />
        ))}
      </div>
    </section>
  )
}

function CheckoutPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]" aria-busy="true" aria-label="Loading checkout">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
        </section>
        <CheckoutSkeletonBlock lines={4} />
        <CheckoutSkeletonBlock lines={3} />
        <CheckoutSkeletonBlock lines={2} />
      </div>
      <aside className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <div className="size-21 shrink-0 animate-pulse rounded-lg bg-slate-100 sm:size-27" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex justify-between gap-4">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
        <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
      </aside>
    </div>
  )
}

function DeliveryInformation({
  address,
  errors = {},
  savedAddresses,
  isAddingAddress,
  isEditingAddress,
  isSavingAddress,
  canSaveAddress,
  onAddressChange,
  onAddressBlur,
  onRegionChange,
  onTownChange,
  onTownCustomChange,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  deletingAddressId,
  onAddAddress,
  onSaveAddress,
}) {
  const townOptions = useMemo(
    () => getCityOptionsByRegion(address.region),
    [address.region],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <div className="space-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-auth-primary/10 text-auth-primary">
            <Truck className="size-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Address</h2>
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
            Add another delivery address
          </button>
        )}
      </div>

      {savedAddresses.length > 0 && !isAddingAddress && (
        <div
          className={`mt-4 grid gap-2.5 ${
            savedAddresses.length > 6 ? 'max-h-80 overflow-y-auto pr-1' : ''
          }`}
        >
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
                onEdit={() => onEditAddress(savedAddress)}
                onDelete={() => onDeleteAddress(savedAddress)}
                isDeleting={deletingAddressId === normalized.id}
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
                  isEditingAddress ? 'Save changes' : 'Save address'
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
  isEditingAddress,
  isSavingAddress,
  onAddressChange,
  onAddressBlur,
  onRegionChange,
  onTownChange,
  onTownCustomChange,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  deletingAddressId,
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
      <div className="space-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-auth-primary/10 text-auth-primary">
            <CreditCard className="size-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Billing Information
              <span className="ml-1 text-auth-primary">*</span>
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Required for receipts and payment records</p>
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
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900" role="alert">
          A billing address is required. Add one before placing your order.
        </p>
      )}

      {savedAddresses.length > 0 && !isAddingAddress && (
        <div
          className={`mt-4 grid gap-2.5 ${
            savedAddresses.length > 6 ? 'max-h-80 overflow-y-auto pr-1' : ''
          }`}
        >
          {savedAddresses.map((savedAddress, index) => {
            const normalized = normalizeAddress(savedAddress)
            const selected = normalized.id === address.id

            return (
              <SavedAddressCard
                key={normalized.id ?? `${normalized.address}-${index}`}
                savedAddress={savedAddress}
                selected={selected}
                onSelect={() => onSelectAddress(savedAddress)}
                onEdit={() => onEditAddress(savedAddress)}
                onDelete={() => onDeleteAddress(savedAddress)}
                isDeleting={deletingAddressId === normalized.id}
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
                isEditingAddress ? 'Save changes' : 'Save billing address'
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
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Payment Details</h2>
      <div className="mt-4 space-y-3">
        {paymentOptions.map((option) => {
          const selected = selectedPayment === option.id
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onSelectPayment(option.id)}
              className={`flex min-h-14 min-w-0 w-full items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${
                selected ? 'border-auth-primary ring-1 ring-auth-primary' : 'border-slate-300'
              }`}
            >
              <span className={`size-5 rounded-full border ${selected ? 'border-auth-primary bg-auth-primary' : 'border-slate-300'}`} />
              <PaymentBadge type={option.type} image={option.image} label={option.label} />
              <span className="min-w-0 truncate text-sm font-semibold text-slate-800">{option.label}</span>
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
      <div className="mt-4 divide-y divide-slate-300">
        {items.map((item) => {
          const optionLabel = formatCartItemOptions(item)
          const displayImage = resolveCartItemDisplayImage(item)

          return (
          <article
            key={item.key ?? item.id}
            className="grid grid-cols-[5.25rem_minmax(0,1fr)_auto] gap-3 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:gap-4"
          >
            <img
              src={displayImage}
              alt={item.name}
              className="h-21 w-21 rounded-lg border border-red-100 object-contain p-0.5 sm:h-27 sm:w-27"
            />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900">{item.name}</h3>
              {optionLabel ? (
                <p className="mt-1 truncate text-[0.6875rem] text-slate-500">{optionLabel}</p>
              ) : null}
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
          )
        })}
      </div>
    </section>
  )
}

function OrderTotal({ itemCount, listSubtotal, discountTotal, totals, total }) {
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
          <dd className="font-semibold text-slate-950">{formatCheckoutAmount(listSubtotal)}</dd>
        </div>
        {discountTotal > 0 && (
          <div className="flex items-center justify-between gap-4 text-auth-primary">
            <dt>Discount</dt>
            <dd className="font-semibold">-{formatCheckoutAmount(discountTotal)}</dd>
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

function PaymentProcessingOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      role="alert"
      aria-busy="true"
      aria-live="assertive"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-10 text-center shadow-2xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-auth-primary/10">
          <Loader2 className="size-8 animate-spin text-auth-primary" strokeWidth={2} aria-hidden />
        </div>
        <h2 className="mt-5 text-lg font-bold text-slate-950">Processing your payment…</h2>
        <p className="mt-2 text-sm text-slate-500">Please don't close or refresh this page.</p>
      </div>
    </div>
  )
}

function resolveOrderNumber(order) {
  return order?.order_number ?? order?.orderNumber ?? order?.reference ?? order?.id ?? null
}

function formatOrderDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatOrderAddress(address) {
  if (!address) return null

  return {
    name: [address.first_name, address.last_name].filter(Boolean).join(' '),
    line1: [address.address_line_1, address.address_line_2].filter(Boolean).join(', '),
    location: [address.city_or_town, address.region, address.country].filter(Boolean).join(', '),
    phone: address.phone_number ?? '',
  }
}

function normalizeSuccessItems(order, checkoutItems = []) {
  const apiItems = Array.isArray(order?.items) ? order.items : []
  if (apiItems.length > 0) {
    return apiItems.map((item, index) => {
      const pricing = resolveOrderItemPricing(item)
      return {
        id: item.id ?? `api-item-${index}`,
        name: item.product_name ?? item.name ?? 'Item',
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPrice: pricing.unitPrice,
        totalPrice: pricing.lineTotal,
        comparePrice: pricing.comparePrice,
      }
    })
  }

  return (checkoutItems ?? []).map((item, index) => {
    const quantity = Math.max(1, Number(item.quantity) || 1)
    const unitPrice = Number(item.price ?? 0)
    return {
      id: item.id ?? `checkout-item-${index}`,
      name: item.name ?? 'Item',
      quantity,
      unitPrice,
      totalPrice: Number(item.displaySubtotal ?? unitPrice * quantity),
    }
  })
}

function OrderAddressCard({ title, address }) {
  if (!address) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-900">{address.name || '—'}</p>
      {address.line1 ? <p className="mt-1 text-xs text-slate-600">{address.line1}</p> : null}
      {address.location ? <p className="text-xs text-slate-600">{address.location}</p> : null}
      {address.phone ? <p className="mt-1 text-xs text-slate-600">{address.phone}</p> : null}
    </div>
  )
}

function OrderSuccessScreen({ order, checkoutTotals, checkoutItems = [] }) {
  const orderNumber = resolveOrderNumber(order)
  const orderedAt = formatOrderDate(order?.paid_at ?? order?.point_in_time ?? order?.created_at)
  const items = normalizeSuccessItems(order, checkoutItems)
  const shippingAddress = formatOrderAddress(order?.shipping_address)
  const billingAddress = formatOrderAddress(order?.billing_address)
  const apiTotals = normalizeOrderMoneyTotals(order)
  const paymentStatus = String(order?.payment_status ?? '').trim().toLowerCase()

  const subtotal = Number(apiTotals.listSubtotal || checkoutTotals?.listSubtotal || 0)
  const discountTotal = Number(apiTotals.discountTotal || checkoutTotals?.discountTotal || 0)
  const deliveryFee = Number(apiTotals.deliveryFee || checkoutTotals?.deliveryFee || 0)
  const taxTotal = Number(apiTotals.taxTotal || checkoutTotals?.tax || 0)
  const grandTotal = Number(apiTotals.payableTotal || checkoutTotals?.payableTotal || 0)

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-9 text-emerald-600" strokeWidth={1.8} aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">Payment Successful</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Thank you{shippingAddress?.name ? `, ${shippingAddress.name.split(' ')[0]}` : ''}! Your order has been
          placed successfully. We'll notify you once it's on its way.
        </p>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3">
          {orderNumber ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
              <PackageCheck className="size-4 text-auth-primary" aria-hidden />
              <span className="text-slate-600">Order</span>
              <span className="font-bold text-slate-950">#{orderNumber}</span>
            </div>
          ) : null}
          {paymentStatus === 'paid' ? (
            <div className="inline-flex items-center rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              Paid
            </div>
          ) : paymentStatus ? (
            <div className="inline-flex items-center rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold capitalize text-slate-700">
              {paymentStatus.replaceAll('_', ' ')}
            </div>
          ) : null}
          {orderedAt ? (
            <div className="inline-flex items-center rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
              {orderedAt}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-6">
        {items.length > 0 ? (
          <>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Order Items</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Qty {item.quantity} · {formatCheckoutAmount(item.unitPrice)} each
                      {item.comparePrice != null && item.comparePrice > item.unitPrice ? (
                        <span className="ml-1 text-slate-400 line-through">
                          {formatCheckoutAmount(item.comparePrice)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-950">
                    {formatCheckoutAmount(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <dl className={`space-y-2 text-sm ${items.length > 0 ? 'mt-3 border-t border-slate-200 pt-4' : ''}`}>
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-semibold text-slate-900">{formatCheckoutAmount(subtotal)}</dd>
          </div>
          {discountTotal > 0 && (
            <div className="flex items-center justify-between text-auth-primary">
              <dt>Discount</dt>
              <dd className="font-semibold">-{formatCheckoutAmount(discountTotal)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Delivery</dt>
            <dd className="font-semibold text-slate-900">
              {deliveryFee > 0 ? formatCheckoutAmount(deliveryFee) : 'Free'}
            </dd>
          </div>
          {taxTotal > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd className="font-semibold text-slate-900">{formatCheckoutAmount(taxTotal)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
            <dt className="font-bold text-slate-950">Total Paid</dt>
            <dd className="font-extrabold text-slate-950">{formatCheckoutAmount(grandTotal)}</dd>
          </div>
        </dl>
      </div>

      {(shippingAddress || billingAddress) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <OrderAddressCard title="Delivery Address" address={shippingAddress} />
          <OrderAddressCard title="Billing Address" address={billingAddress} />
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-center">
        <Link
          to="/account/orders"
          className="inline-flex items-center justify-center rounded-lg bg-auth-primary px-6 py-3 text-sm font-bold text-white"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  )
}

export default function CheckoutPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mode } = useParams()
  const isBuyNowMode = mode === 'buy-now'
  const cartItems = useSelector(selectCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const authenticatedUser = useSelector((state) => state.auth.user)
  const { updateQuantity, deleteItem, clearAll } = useCartActions()
  const [buyNowItem, setBuyNowItem] = useState(() => (isBuyNowMode ? readBuyNowItem() : null))
  const [buyNowModeActive, setBuyNowModeActive] = useState(isBuyNowMode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = isBuyNowMode ? (buyNowItem ? [buyNowItem] : []) : cartItems
  const [address, setAddress] = useState(initialAddress)
  const [addressErrors, setAddressErrors] = useState({})
  const [billingAddressId, setBillingAddressId] = useState(null)
  const [billingAddressDraft, setBillingAddressDraft] = useState(initialAddress)
  const [billingAddressErrors, setBillingAddressErrors] = useState({})
  const [isAddingBillingAddress, setIsAddingBillingAddress] = useState(false)
  const [editingBillingAddressId, setEditingBillingAddressId] = useState(null)
  const [sessionAddresses, setSessionAddresses] = useState([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [deletingAddressId, setDeletingAddressId] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState('mtn')
  const [cardDetails, setCardDetails] = useState(initialCardDetails)
  const [cardErrors, setCardErrors] = useState({})
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [orderStatus, setOrderStatus] = useState('idle')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [placedTotals, setPlacedTotals] = useState(null)
  const [placedItems, setPlacedItems] = useState([])
  const hasInitializedDeliveryAddress = useRef(false)
  const [isDeliveryAddressReady, setIsDeliveryAddressReady] = useState(false)
  const [isBillingAddressReady, setIsBillingAddressReady] = useState(false)

  if (buyNowModeActive !== isBuyNowMode) {
    setBuyNowModeActive(isBuyNowMode)
    setBuyNowItem(isBuyNowMode ? readBuyNowItem() : null)
  }

  const previewQuery = useQuery({
    queryKey: ['checkout-preview'],
    queryFn: getCheckoutPreview,
    enabled: isAuthenticated && !isBuyNowMode,
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

  const updateAddressMutation = useMutation({
    mutationFn: updateUserAddress,
    onSuccess: async (_response, { addressId, payload }) => {
      setAddress(normalizeAddress({ ...payload, id: addressId }))
      setEditingAddressId(null)
      setIsAddingAddress(false)
      await queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      notify.success('Delivery address updated')
    },
    onError: (error) => notify.fromError(error, 'Unable to update delivery address'),
  })

  const updateBillingAddressMutation = useMutation({
    mutationFn: updateUserAddress,
    onSuccess: async (_response, { addressId }) => {
      setBillingAddressId(addressId)
      setBillingAddressDraft(initialAddress)
      setEditingBillingAddressId(null)
      setIsAddingBillingAddress(false)
      await queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      notify.success('Billing address updated')
    },
    onError: (error) => notify.fromError(error, 'Unable to update billing address'),
  })

  const deleteAddressMutation = useMutation({
    mutationFn: ({ addressId }) => deleteUserAddress(addressId),
    onMutate: ({ addressId }) => setDeletingAddressId(addressId),
    onSuccess: async (_response, { addressId, type }) => {
      setSessionAddresses((current) => current.filter(
        (item) => normalizeAddress(item).id !== addressId,
      ))

      if (type === 'billing') {
        if (billingAddressId === addressId) setBillingAddressId(null)
        if (editingBillingAddressId === addressId) {
          setEditingBillingAddressId(null)
          setBillingAddressDraft(initialAddress)
          setIsAddingBillingAddress(false)
        }
      } else {
        if (address.id === addressId) setAddress(initialAddress)
        if (editingAddressId === addressId) {
          setEditingAddressId(null)
          setIsAddingAddress(false)
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      notify.success(`${type === 'billing' ? 'Billing' : 'Delivery'} address deleted`)
    },
    onError: (error) => notify.fromError(error, 'Unable to delete address'),
    onSettled: () => setDeletingAddressId(null),
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

  const isCheckoutDataLoading = isAuthenticated && (
    previewQuery.isLoading || addressesQuery.isLoading
  )

  // One-time delivery address init once saved addresses have loaded. Done
  // during render (not inside an Effect) so setting it doesn't trigger an
  // extra post-commit re-render — React just re-runs this render immediately.
  if (
    isAuthenticated
    && !addressesQuery.isLoading
    && !isAddingAddress
    && !isDeliveryAddressReady
    && (savedAddresses.length > 0 || addressesQuery.isSuccess)
  ) {
    setIsDeliveryAddressReady(true)
    if (savedAddresses.length > 0) {
      setAddress(normalizeAddress(savedAddresses[0]))
    }
  }

  // Ref writes must happen in an effect, not during render — this just keeps
  // the ref (read by the effect below) in sync with the state above.
  useEffect(() => {
    if (isDeliveryAddressReady) {
      hasInitializedDeliveryAddress.current = true
    }
  }, [isDeliveryAddressReady])

  // One-time billing address init once saved billing addresses have loaded.
  if (
    isAuthenticated
    && !addressesQuery.isLoading
    && !isAddingBillingAddress
    && !isBillingAddressReady
    && (billingAddresses.length > 0 || addressesQuery.isSuccess)
  ) {
    setIsBillingAddressReady(true)
    if (billingAddresses.length > 0) {
      setBillingAddressId(normalizeAddress(billingAddresses[0]).id)
    }
  }

  useEffect(() => {
    if (savedAddresses.length > 0 || isAddingAddress) return
    if (!authenticatedUser) return
    if (!hasInitializedDeliveryAddress.current) return

    setAddress((current) => (
      hasAddressContent(current) ? current : buildDeliveryPrefill(authenticatedUser)
    ))
  }, [savedAddresses.length, authenticatedUser, isAddingAddress])

  const preferredSavedAddress = savedAddresses[0]
  const preferredBillingAddress = billingAddresses[0]

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

  const previewItems = useMemo(
    () => extractCheckoutPreviewItems(previewQuery.data),
    [previewQuery.data],
  )
  const displayItems = useMemo(
    () => enrichCartItemsForDisplay(items, previewItems),
    [items, previewItems],
  )

  const orderAmounts = useMemo(
    () => computeCartOrderTotals(displayItems.length ? displayItems : items),
    [displayItems, items],
  )

  const previewTotals = normalizePreviewTotals(previewQuery.data)
  const feeTotals = {
    tax: previewTotals.tax ?? 0,
    deliveryFee: previewTotals.deliveryFee ?? 0,
    freeDelivery: previewTotals.freeDelivery ?? 0,
    couponDiscount,
  }
  const orderItemCount = previewTotals.itemCount ?? orderAmounts.itemCount ?? items.length
  const orderListSubtotal = orderAmounts.listSubtotal || previewTotals.listSubtotal || previewTotals.subtotal || 0
  const orderDiscountTotal = orderAmounts.discountTotal || previewTotals.discount || 0
  const orderPayableTotal = orderAmounts.payableTotal || previewTotals.payableTotal || Math.max(0, orderListSubtotal - orderDiscountTotal)
  const orderTotal = calculateOrderTotal(orderPayableTotal, feeTotals)

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
  const hasSavedDeliveryAddress = !isAuthenticated || Boolean(activeAddress.id)
  const hasSavedBillingAddress = !isAuthenticated || Boolean(activeBillingAddress.id)
  const isCardPaymentValid = useMemo(() => {
    if (selectedPayment !== 'card') return true
    return Object.keys(validateCardFields(cardDetails)).length === 0
  }, [selectedPayment, cardDetails])
  const canPlaceOrder = (
    items.length > 0
    && selectedPayment
    && hasAddress
    && hasSavedDeliveryAddress
    && hasSavedBillingAddress
    && isCardPaymentValid
  )

  // Buy Now has no cart line to update on the backend — quantity edits just
  // rewrite the locally held item (and its sessionStorage copy).
  const handleBuyNowQuantityChange = (_itemId, quantity) => {
    setBuyNowItem((current) => {
      if (!current) return current
      const next = { ...current, quantity: Math.max(1, Number(quantity) || 1) }
      saveBuyNowItem(next)
      return next
    })
  }

  const handleBuyNowDelete = () => {
    clearBuyNowItem()
    navigate(buyNowItem?.href || '/', { replace: true })
  }

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
    setEditingAddressId(null)
  }

  const handleAddAddress = () => {
    setAddress(buildDeliveryPrefill(authenticatedUser))
    setAddressErrors({})
    setIsAddingAddress(true)
    setEditingAddressId(null)
  }

  const handleEditAddress = (selectedAddress) => {
    const normalized = normalizeAddress(selectedAddress)
    if (!normalized.id) {
      notify.error('This address cannot be edited until it has been saved')
      return
    }
    setAddress(normalized)
    setAddressErrors({})
    setEditingAddressId(normalized.id)
    setIsAddingAddress(true)
  }

  const handleDeleteAddress = (selectedAddress, type = 'shipping') => {
    const normalized = normalizeAddress(selectedAddress)
    if (!normalized.id) {
      notify.error('This address cannot be deleted until it has been saved')
      return
    }

    const fullName = [normalized.firstName, normalized.lastName].filter(Boolean).join(' ')
    const confirmed = window.confirm(
      `Delete ${fullName ? `${fullName}'s ` : 'this '}${type === 'billing' ? 'billing' : 'delivery'} address? This action cannot be undone.`,
    )
    if (!confirmed) return

    deleteAddressMutation.mutate({ addressId: normalized.id, type })
  }

  const handleSaveAddress = () => {
    if (!isAuthenticated) return

    const errors = validateAddressFields(address)
    setAddressErrors(errors)

    if (Object.keys(errors).length > 0) {
      notify.error('Please fix the highlighted delivery address fields')
      return
    }

    if (editingAddressId) {
      updateAddressMutation.mutate({
        addressId: editingAddressId,
        payload: buildUpdatedAddressPayload(address),
      })
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

    if (editingBillingAddressId) {
      updateBillingAddressMutation.mutate({
        addressId: editingBillingAddressId,
        payload: buildUpdatedAddressPayload(billingAddressDraft, 'billing'),
      })
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

  useLayoutEffect(() => {
    if (orderStatus !== 'success') return
    window.scrollTo(0, 0)
  }, [orderStatus])

  const handlePlaceOrder = async () => {
    if (selectedPayment === 'card') {
      const errors = validateCardFields(cardDetails)
      setCardErrors(errors)

      if (Object.keys(errors).length > 0) {
        notify.error('Please fix the highlighted card details')
        return
      }
    }

    const deliveryErrors = validateAddressFields(activeAddress)
    if (Object.keys(deliveryErrors).length > 0) {
      setAddressErrors(deliveryErrors)
      notify.error('Please complete your delivery address')
      return
    }

    if (isAuthenticated && !activeAddress.id) {
      notify.error('Please save your delivery address before placing the order')
      return
    }

    if (isAuthenticated && !activeBillingAddress.id) {
      notify.error('Please add and save a billing address before placing the order')
      return
    }

    if (!canPlaceOrder) return

    setOrderStatus('processing')

    try {
      // No real payment gateway yet — simulate processing time so the
      // overlay doesn't just flash if the API responds instantly.
      const minProcessingDelay = new Promise((resolve) => setTimeout(resolve, 1800))
      const orderPromise = isBuyNowMode
        ? placeBuyNowOrder(buildBuyNowCheckoutPayload(items[0], activeAddress, activeBillingAddress))
        : placeCheckoutOrder(buildCheckoutPayload(activeAddress, activeBillingAddress))
      const [response] = await Promise.all([orderPromise, minProcessingDelay])

      setPlacedTotals({
        listSubtotal: orderListSubtotal,
        discountTotal: orderDiscountTotal,
        payableTotal: orderTotal,
        deliveryFee: feeTotals.deliveryFee,
        tax: feeTotals.tax,
      })
      setPlacedItems(items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        displaySubtotal: item.displaySubtotal,
      })))
      setPlacedOrder(response)
      setOrderStatus('success')
      if (isBuyNowMode) {
        clearBuyNowItem()
      } else {
        await clearAll()
      }
    } catch (error) {
      setOrderStatus('idle')
      notify.fromError(error, 'Unable to place order')
    }
  }

  return (
    <SiteLayout>
      <main className="bg-white py-7 sm:py-8">
        <Container>
          {orderStatus === 'success' ? (
            <OrderSuccessScreen
              order={placedOrder}
              checkoutTotals={placedTotals}
              checkoutItems={placedItems}
            />
          ) : items.length === 0 && !isCheckoutDataLoading ? (
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">Checkout</h1>
              <p className="mt-2 text-sm text-slate-600">
                {isBuyNowMode
                  ? 'This item is no longer available. Please go back and select it again.'
                  : 'Your cart is empty.'}
              </p>
              <Link to="/" className="mt-6 inline-flex rounded-lg bg-auth-primary px-6 py-3 text-sm font-bold text-white">
                Continue Shopping
              </Link>
            </section>
          ) : isCheckoutDataLoading ? (
            <CheckoutPageSkeleton />
          ) : (
            <div className="space-y-6">
              <CheckoutIntro />

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-start">
                <div className={`grid gap-6 ${isAuthenticated ? 'lg:grid-cols-2' : ''}`}>
                  <DeliveryInformation
                  address={address}
                  errors={addressErrors}
                  savedAddresses={savedAddresses}
                  isAddingAddress={isAddingAddress}
                  isEditingAddress={Boolean(editingAddressId)}
                  isSavingAddress={createAddressMutation.isPending || updateAddressMutation.isPending}
                  canSaveAddress={isAuthenticated}
                  onAddressChange={handleAddressChange}
                  onAddressBlur={handleAddressBlur}
                  onRegionChange={handleRegionChange}
                  onTownChange={handleTownChange}
                  onTownCustomChange={handleTownCustomChange}
                  onSelectAddress={handleSelectAddress}
                  onEditAddress={handleEditAddress}
                  onDeleteAddress={(selectedAddress) => handleDeleteAddress(selectedAddress, 'shipping')}
                  deletingAddressId={deletingAddressId}
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
                    isEditingAddress={Boolean(editingBillingAddressId)}
                    isSavingAddress={createBillingAddressMutation.isPending || updateBillingAddressMutation.isPending}
                    onAddressChange={handleBillingAddressChange}
                    onAddressBlur={handleBillingAddressBlur}
                    onRegionChange={handleBillingRegionChange}
                    onTownChange={handleBillingTownChange}
                    onTownCustomChange={handleBillingTownCustomChange}
                    onSelectAddress={(selectedAddress) => {
                      setBillingAddressId(normalizeAddress(selectedAddress).id)
                      setBillingAddressErrors({})
                      setEditingBillingAddressId(null)
                    }}
                    onEditAddress={(selectedAddress) => {
                      const normalized = normalizeAddress(selectedAddress)
                      if (!normalized.id) {
                        notify.error('This address cannot be edited until it has been saved')
                        return
                      }
                      setBillingAddressDraft(normalized)
                      setBillingAddressErrors({})
                      setEditingBillingAddressId(normalized.id)
                      setIsAddingBillingAddress(true)
                    }}
                    onDeleteAddress={(selectedAddress) => handleDeleteAddress(selectedAddress, 'billing')}
                    deletingAddressId={deletingAddressId}
                    onAddAddress={() => {
                      setBillingAddressDraft(
                        billingAddresses.length === 0
                          ? buildBillingPrefill(authenticatedUser, activeAddress)
                          : buildDeliveryPrefill(authenticatedUser),
                      )
                      setBillingAddressErrors({})
                      setEditingBillingAddressId(null)
                      setIsAddingBillingAddress(true)
                    }}
                    onCancel={() => {
                      setBillingAddressDraft(initialAddress)
                      setBillingAddressErrors({})
                      setEditingBillingAddressId(null)
                      setIsAddingBillingAddress(false)
                    }}
                    onSaveAddress={handleSaveBillingAddress}
                    />
                  )}
                </div>

              <OrderTotal
                  itemCount={orderItemCount}
                  listSubtotal={orderListSubtotal}
                  discountTotal={orderDiscountTotal}
                  totals={feeTotals}
                  total={orderTotal}
                />
              </div>

              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
                <div className="order-1 lg:col-start-1 lg:row-start-2">
                  <PaymentDetails
                    selectedPayment={selectedPayment}
                    onSelectPayment={handleSelectPayment}
                    cardDetails={cardDetails}
                    cardErrors={cardErrors}
                    onCardChange={handleCardChange}
                    onCardBlur={handleCardBlur}
                  />
                </div>

                <div className="order-2 lg:col-span-2 lg:row-start-1">
                  <OrderSummary
                    items={displayItems}
                    onQuantityChange={isBuyNowMode ? handleBuyNowQuantityChange : updateQuantity}
                    onDelete={isBuyNowMode ? handleBuyNowDelete : deleteItem}
                  />
                </div>

                <aside className="order-3 min-w-0 space-y-5 lg:col-start-2 lg:row-start-2">
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
                    disabled={!canPlaceOrder || orderStatus === 'processing'}
                    aria-busy={orderStatus === 'processing'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-auth-primary px-5 py-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {orderStatus === 'processing' ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Processing…
                        </>
                      ) : (
                        'Place Order'
                      )}
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
            </div>
          )}
        </Container>
      </main>
      {orderStatus === 'processing' && <PaymentProcessingOverlay />}
    </SiteLayout>
  )
}
