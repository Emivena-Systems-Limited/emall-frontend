import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, MapPin, Minus, Plus, Trash2 } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { notify } from '../lib/notify'
import { getCheckoutPreview, placeCheckoutOrder } from '../services/checkoutService'
import {
  createUserAddress,
  getUserAddresses,
} from '../services/addressService'
import { useCartActions } from '../hooks/useCartActions'
import { selectCartItems } from '../store/slices/cartSlice'
import { normalizePreviewTotals } from '../utils/checkoutTotals'

const paymentOptions = [
  { id: 'card', label: 'Debit/Credit Card', type: 'card' },
  { id: 'mtn', label: 'MTN MoMo', type: 'mtn' },
  { id: 'telecel', label: 'Telecel Cash', type: 'telecel' },
  { id: 'airteltigo', label: 'AirtelTigo Cash', type: 'airteltigo' },
]

const initialAddress = {
  id: null,
  firstName: '',
  lastName: '',
  region: '',
  town: '',
  address: '',
  phone: '',
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

function normalizeAddress(address) {
  if (!address || typeof address !== 'object') return initialAddress

  const fullName = address.name ?? address.full_name ?? ''
  const [firstName = '', ...lastNameParts] = String(fullName).trim().split(/\s+/)

  return {
    id: address.id ?? address.address_id ?? null,
    firstName: address.first_name ?? address.firstName ?? firstName,
    lastName: address.last_name ?? address.lastName ?? lastNameParts.join(' '),
    region: address.region ?? '',
    town: address.city ?? address.town ?? address.city_or_town ?? '',
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
    city: String(address.town ?? '').trim(),
    country: 'Ghana',
  }
}

function buildBillingPrefill(user, shippingAddress) {
  const savedShipping = normalizeAddress(shippingAddress)

  return {
    id: null,
    firstName: user?.first_name ?? user?.firstName ?? savedShipping.firstName,
    lastName: user?.last_name ?? user?.lastName ?? savedShipping.lastName,
    region: user?.region ?? savedShipping.region,
    town: user?.city_or_town ?? user?.city ?? user?.town ?? savedShipping.town,
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
    region: String(address.region ?? '').trim(),
    city_or_town: String(address.town ?? '').trim(),
    address_line_1: String(address.address ?? '').trim(),
    country: 'Ghana',
  }
}

function getAddressKey(address) {
  const normalized = normalizeAddress(address)
  if (normalized.id) return `id:${normalized.id}`

  return [normalized.address, normalized.phone, normalized.town]
    .map((value) => String(value).trim().toLowerCase())
    .join('|')
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

function Field({ label, name, value, onChange, placeholder = '' }) {
  return (
    <label className="grid gap-2 text-sm text-slate-800">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition-colors placeholder:text-slate-300 focus:border-auth-primary sm:h-13"
      />
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
  savedAddresses,
  isAddingAddress,
  isSavingAddress,
  canSaveAddress,
  onAddressChange,
  onSelectAddress,
  onAddAddress,
  onSaveAddress,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Information</h2>
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
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {savedAddresses.map((savedAddress, index) => {
            const normalized = normalizeAddress(savedAddress)
            const selected = normalized.id
              ? normalized.id === address.id
              : normalized.address === address.address && normalized.phone === address.phone

            return (
              <button
                type="button"
                key={normalized.id ?? `${normalized.address}-${index}`}
                onClick={() => onSelectAddress(savedAddress)}
                className={`flex min-h-28 gap-3 rounded-lg border p-4 text-left transition-colors ${
                  selected
                    ? 'border-auth-primary bg-red-50/40 ring-1 ring-auth-primary'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <MapPin className={`mt-0.5 size-5 shrink-0 ${selected ? 'text-auth-primary' : 'text-slate-500'}`} />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-950">
                    {[normalized.firstName, normalized.lastName].filter(Boolean).join(' ')}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">
                    {[normalized.address, normalized.town, normalized.region].filter(Boolean).join(', ')}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{normalized.phone}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {(savedAddresses.length === 0 || isAddingAddress) && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5">
            <Field label="First name" name="firstName" value={address.firstName} onChange={onAddressChange} />
            <Field label="Last name" name="lastName" value={address.lastName} onChange={onAddressChange} />
            <Field label="Region" name="region" value={address.region} onChange={onAddressChange} />
            <Field label="Town" name="town" value={address.town} onChange={onAddressChange} />
            <Field label="Address" name="address" value={address.address} onChange={onAddressChange} />
            <Field label="Phone Number" name="phone" value={address.phone} onChange={onAddressChange} />
          </div>
          {canSaveAddress && (
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectAddress(savedAddresses[0])}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSaveAddress}
                disabled={isSavingAddress}
                className="rounded-lg bg-auth-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingAddress ? 'Saving...' : 'Save address'}
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
  savedAddresses,
  isAddingAddress,
  isSavingAddress,
  onAddressChange,
  onSelectAddress,
  onAddAddress,
  onCancel,
  onSaveAddress,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Billing Information</h2>
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
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {savedAddresses.map((savedAddress, index) => {
            const normalized = normalizeAddress(savedAddress)
            const selected = normalized.id === address.id

            return (
              <button type="button" key={normalized.id ?? `${normalized.address}-${index}`} onClick={() => onSelectAddress(savedAddress)} className={`flex min-h-28 gap-3 rounded-lg border p-4 text-left transition-colors ${selected ? 'border-auth-primary bg-red-50/40 ring-1 ring-auth-primary' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <MapPin className={`mt-0.5 size-5 shrink-0 ${selected ? 'text-auth-primary' : 'text-slate-500'}`} />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-950">{[normalized.firstName, normalized.lastName].filter(Boolean).join(' ')}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">{[normalized.address, normalized.town, normalized.region].filter(Boolean).join(', ')}</span>
                  <span className="mt-1 block text-sm text-slate-600">{normalized.phone}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {isAddingAddress && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5">
            <Field label="First name" name="firstName" value={draftAddress.firstName} onChange={onAddressChange} />
            <Field label="Last name" name="lastName" value={draftAddress.lastName} onChange={onAddressChange} />
            <Field label="Region" name="region" value={draftAddress.region} onChange={onAddressChange} />
            <Field label="Town" name="town" value={draftAddress.town} onChange={onAddressChange} />
            <Field label="Address" name="address" value={draftAddress.address} onChange={onAddressChange} />
            <Field label="Phone Number" name="phone" value={draftAddress.phone} onChange={onAddressChange} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="button" onClick={onSaveAddress} disabled={isSavingAddress} className="rounded-lg bg-auth-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSavingAddress ? 'Saving...' : 'Save billing address'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function PaymentBadge({ type }) {
  if (type === 'card') return <CreditCard className="size-7 text-sky-500" strokeWidth={1.8} />
  if (type === 'mtn') {
    return <span className="flex h-7 w-10 items-center justify-center bg-yellow-300 text-[0.55rem] font-black text-slate-950">MTN</span>
  }
  if (type === 'telecel') {
    return <span className="flex h-7 w-10 items-center justify-center rounded bg-white text-xl font-black text-red-600">t</span>
  }
  return <span className="flex h-7 w-10 items-center justify-center rounded bg-white text-xl font-black text-[#3155c7]">at</span>
}

function PaymentDetails({ selectedPayment, onSelectPayment }) {
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
              <PaymentBadge type={option.type} />
              <span className="text-sm font-semibold text-slate-800">{option.label}</span>
            </button>
          )
        })}
      </div>

      {isCard && (
        <div className="mt-5 grid gap-4">
          <Field label="Name on Card" name="cardName" value="" onChange={() => {}} placeholder="Yaw Ofosu" />
          <Field label="Card Number" name="cardNumber" value="" onChange={() => {}} placeholder="1234458768549839" />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
            <Field label="Expiry Date" name="expiry" value="" onChange={() => {}} placeholder="MM/YY" />
            <Field label="CV" name="cv" value="" onChange={() => {}} placeholder="123" />
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
  const [billingAddressId, setBillingAddressId] = useState(null)
  const [billingAddressDraft, setBillingAddressDraft] = useState(initialAddress)
  const [isAddingBillingAddress, setIsAddingBillingAddress] = useState(false)
  const [sessionAddresses, setSessionAddresses] = useState([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('card')
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
      if (key && key !== '||') uniqueAddresses.set(key, savedAddress)
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
  const matchingSavedAddress = savedAddresses.find((item) => getAddressKey(item) === getAddressKey(address))
  const activeAddress = isAddingAddress
    ? address
    : normalizeAddress(matchingSavedAddress ?? (address.address ? address : preferredSavedAddress))
  const preferredBillingAddress = billingAddresses.find(
    (item) => item?.is_default === true || item?.isDefault === true,
  ) ?? billingAddresses[0]
  const activeBillingAddress = normalizeAddress(
    billingAddresses.find((item) => normalizeAddress(item).id === billingAddressId)
      ?? preferredBillingAddress,
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
    activeAddress.town,
    activeAddress.address,
    activeAddress.phone,
  ]
    .every((value) => String(value).trim())
  const hasCheckoutAddress = !isAuthenticated || Boolean(activeAddress.id && activeBillingAddress.id)
  const canPlaceOrder = items.length > 0 && selectedPayment && hasAddress && hasCheckoutAddress

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const handleSelectAddress = (selectedAddress) => {
    setAddress(normalizeAddress(selectedAddress))
    setIsAddingAddress(false)
  }

  const handleAddAddress = () => {
    setAddress(initialAddress)
    setIsAddingAddress(true)
  }

  const handleSaveAddress = () => {
    if (!isAuthenticated) return

    if (!hasAddress) {
      notify.error('Complete all required delivery address fields')
      return
    }

    createAddressMutation.mutate(buildSavedAddressPayload(address))
  }

  const handleBillingAddressChange = (event) => {
    const { name, value } = event.target
    setBillingAddressDraft((current) => ({ ...current, [name]: value }))
  }

  const handleSaveBillingAddress = () => {
    const isComplete = [
      billingAddressDraft.firstName,
      billingAddressDraft.lastName,
      billingAddressDraft.region,
      billingAddressDraft.town,
      billingAddressDraft.address,
      billingAddressDraft.phone,
    ].every((value) => String(value).trim())

    if (!isComplete) {
      notify.error('Complete all required billing address fields')
      return
    }

    createBillingAddressMutation.mutate(buildSavedAddressPayload(billingAddressDraft, 'billing'))
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
                  savedAddresses={savedAddresses}
                  isAddingAddress={isAddingAddress}
                  isSavingAddress={createAddressMutation.isPending}
                  canSaveAddress={isAuthenticated}
                  onAddressChange={handleAddressChange}
                  onSelectAddress={handleSelectAddress}
                  onAddAddress={handleAddAddress}
                  onSaveAddress={handleSaveAddress}
                />
                {isAuthenticated && (
                  <BillingInformation
                    address={activeBillingAddress}
                    draftAddress={billingAddressDraft}
                    savedAddresses={billingAddresses}
                    isAddingAddress={isAddingBillingAddress}
                    isSavingAddress={createBillingAddressMutation.isPending}
                    onAddressChange={handleBillingAddressChange}
                    onSelectAddress={(selectedAddress) => {
                      setBillingAddressId(normalizeAddress(selectedAddress).id)
                    }}
                    onAddAddress={() => {
                      setBillingAddressDraft(
                        billingAddresses.length === 0
                          ? buildBillingPrefill(authenticatedUser, activeAddress)
                          : initialAddress,
                      )
                      setIsAddingBillingAddress(true)
                    }}
                    onCancel={() => {
                      setBillingAddressDraft(initialAddress)
                      setIsAddingBillingAddress(false)
                    }}
                    onSaveAddress={handleSaveBillingAddress}
                  />
                )}
                <PaymentDetails selectedPayment={selectedPayment} onSelectPayment={setSelectedPayment} />
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
