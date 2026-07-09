import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Minus, Plus, Trash2 } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { notify } from '../lib/notify'
import { getCheckout, getCheckoutPreview } from '../services/checkoutService'
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
  firstName: '',
  lastName: '',
  region: '',
  town: '',
  address: '',
  phone: '',
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

function DeliveryInformation({ address, onAddressChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5 lg:px-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Information</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5">
        <Field label="First name" name="firstName" value={address.firstName} onChange={onAddressChange} />
        <Field label="First name" name="lastName" value={address.lastName} onChange={onAddressChange} />
        <Field label="Region" name="region" value={address.region} onChange={onAddressChange} />
        <Field label="Town" name="town" value={address.town} onChange={onAddressChange} />
        <Field label="Address" name="address" value={address.address} onChange={onAddressChange} />
        <Field label="Phone Number" name="phone" value={address.phone} onChange={onAddressChange} />
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm text-slate-800">
        <input type="checkbox" defaultChecked className="size-4 rounded border-slate-400 accent-auth-primary" />
        Save this information for next time
      </label>
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
  const total = subtotal + totals.tax + totals.deliveryFee - totals.freeDelivery - totals.couponDiscount
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
  const items = useSelector(selectCartItems)
  const { updateQuantity, deleteItem } = useCartActions()
  const [address, setAddress] = useState(initialAddress)
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const previewQuery = useQuery({
    queryKey: ['checkout-preview'],
    queryFn: getCheckoutPreview,
    staleTime: 60_000,
    retry: 1,
  })

  useEffect(() => {
    if (previewQuery.isError) {
      notify.fromError(previewQuery.error, 'Checkout preview is not available yet')
    }
  }, [previewQuery.error, previewQuery.isError])

  const previewTotals = normalizePreviewTotals(previewQuery.data)
  const totals = {
    ...previewTotals,
    couponDiscount,
  }

  const hasAddress = Object.values(address).every((value) => String(value).trim())
  const canPlaceOrder = items.length > 0 && selectedPayment && hasAddress

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
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
      await getCheckout()
      notify.success('Checkout information is ready')
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
                <DeliveryInformation address={address} onAddressChange={handleAddressChange} />
                <PaymentDetails selectedPayment={selectedPayment} onSelectPayment={setSelectedPayment} />
              </div>
              <aside className="space-y-5">
                <OrderSummary items={items} onQuantityChange={updateQuantity} onDelete={deleteItem} />
                <OrderTotal itemCount={items.length} subtotal={subtotal} totals={totals} />
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
