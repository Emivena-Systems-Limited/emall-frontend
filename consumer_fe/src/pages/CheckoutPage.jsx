import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  CreditCard,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  Smartphone,
  TicketPercent,
  Trash2,
  X,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { initialCartItems } from '../constants/cartProducts'
import { formatCedi } from '../utils/formatCurrency'

const DELIVERY_FEES = {
  'Noble Phones': 10,
  'Style Hub': 8,
}

const STORES = ['Noble Phones', 'Style Hub']

const savedAddress = {
  name: 'John Doe',
  phone: '+233 55 123 4567',
  address: '23 Independence Avenue, Osu, Accra, Greater Accra',
}

const paymentOptions = [
  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard },
  { id: 'mtn', label: 'MTN MoMo', badge: 'MTN' },
  { id: 'telecel', label: 'Telecel Cash', badge: 'tc' },
  { id: 'airteltigo', label: 'AirtelTigo Cash', badge: 'at' },
]

const checkoutItems = initialCartItems.map((item, index) => ({
  ...item,
  store: STORES[index % STORES.length],
}))

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-9 min-w-24 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-7 text-center text-sm font-bold tabular-nums text-auth-primary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex size-7 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-white"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function CheckoutIntro({ isGuest }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {isGuest ? 'Checkout as Guest' : 'Checkout'}
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            {isGuest ? 'Sign in to save you information for faster checkout' : 'Save your information for faster checkout'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
            <LockKeyhole className="size-4 text-auth-primary" />
            Secure Checkout
          </span>
          {isGuest && (
            <Link
              to="/login"
              className="inline-flex rounded-md border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-auth-primary hover:text-auth-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

function AddressSection({ isGuest }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Information</h2>
        {!isGuest && (
          <Link
            to="/account/address"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-auth-primary hover:text-auth-primary"
          >
            Edit
          </Link>
        )}
      </div>

      {isGuest ? (
        <div className="mt-5 flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
          <div>
            <MapPin className="mx-auto size-8 text-auth-primary" strokeWidth={1.8} />
            <Link
              to="/account/address"
              className="mt-4 inline-flex rounded-lg bg-auth-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover"
            >
              Add Address
            </Link>
          </div>
        </div>
      ) : (
        <article className="mt-5 rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-auth-primary">
              <MapPin className="size-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-950">{savedAddress.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{savedAddress.phone}</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{savedAddress.address}</p>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}

function PaymentSection({ selectedPayment, onSelectPayment }) {
  const isCard = selectedPayment === 'card'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Delivery Information</h2>

      <div className="mt-5 space-y-3">
        {paymentOptions.map(({ id, label, icon: Icon, badge }) => {
          const selected = selectedPayment === id
          return (
            <button
              type="button"
              key={id}
              onClick={() => onSelectPayment(id)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
                selected ? 'border-auth-primary ring-1 ring-auth-primary' : 'border-slate-300 hover:border-auth-primary'
              }`}
            >
              <span className={`size-5 rounded-full border ${selected ? 'border-auth-primary bg-auth-primary' : 'border-slate-300'}`} />
              {Icon ? (
                <Icon className="size-7 text-sky-500" strokeWidth={1.8} />
              ) : (
                <span className="flex h-7 min-w-12 items-center justify-center rounded-sm bg-yellow-300 px-2 text-xs font-black text-slate-950">
                  {badge}
                </span>
              )}
              <span className="text-sm font-semibold text-slate-800">{label}</span>
            </button>
          )
        })}
      </div>

      {isCard && (
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-800">
            <span>Name on Card</span>
            <input className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-auth-primary" placeholder="Yaw Ofosu" />
          </label>
          <label className="grid gap-2 text-sm text-slate-800">
            <span>Card Number</span>
            <input className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-auth-primary" placeholder="1234458768549839" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-800">
              <span>Expiry Date</span>
              <input className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-auth-primary" placeholder="MM/YY" />
            </label>
            <label className="grid gap-2 text-sm text-slate-800">
              <span>CV</span>
              <input className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-auth-primary" placeholder="123" />
            </label>
          </div>
        </div>
      )}
    </section>
  )
}

function StoreReviewCard({ store, items, deliveryFee }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">{store}</h3>
          <p className="mt-1 text-xs text-slate-500">{items.length} items</p>
        </div>
        <p className="text-sm font-bold text-slate-950">{formatCedi(subtotal + deliveryFee)}</p>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[4.75rem_minmax(0,1fr)_auto] gap-3 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="size-19 rounded-lg border border-red-100 object-cover sm:size-22"
            />
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-slate-900 sm:text-base">{item.name}</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Color:{item.variant} <span className="mx-1 text-slate-300">Storage:{item.storage}</span>
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Qty {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-950 sm:text-base">{formatCedi(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <dl className="space-y-3 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-600">Store item subtotal</dt>
          <dd className="font-bold text-slate-950">{formatCedi(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-600">Store delivery fee</dt>
          <dd className="font-bold text-slate-950">{formatCedi(deliveryFee)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold text-slate-950">Store total</dt>
          <dd className="font-extrabold text-slate-950">{formatCedi(subtotal + deliveryFee)}</dd>
        </div>
      </dl>
    </article>
  )
}

function CouponCard({ couponCode, setCouponCode, coupon, setCoupon }) {
  const [message, setMessage] = useState('')

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'EZ-TE56') {
      setCoupon({ code: 'EZ-TE56', amount: 15 })
      setMessage('Coupon applied successfully.')
      return
    }
    setCoupon(null)
    setMessage('Invalid coupon code.')
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponCode('')
    setMessage('')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Promo Code</h2>
      <div className="mt-4 flex gap-3">
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="EZ-te56"
          className="h-14 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 outline-none focus:border-auth-primary"
        />
        <button
          type="button"
          onClick={applyCoupon}
          className="min-w-20 rounded-xl bg-auth-primary px-5 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover"
        >
          Apply
        </button>
      </div>
      {message && (
        <div className={`mt-3 flex items-center justify-between gap-3 text-sm ${coupon ? 'text-emerald-700' : 'text-red-600'}`}>
          <span>{message}</span>
          {coupon && (
            <button type="button" onClick={removeCoupon} className="inline-flex items-center gap-1 font-bold text-auth-primary">
              <X className="size-4" />
              Remove
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function OrderTotal({ subtotal, deliveryFees, couponDiscount }) {
  const total = Math.max(subtotal + deliveryFees - couponDiscount, 0)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Order Total</h2>
      <dl className="mt-5 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Items subtotal</dt>
          <dd className="font-medium text-slate-950">{formatCedi(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Total delivery fees</dt>
          <dd className="font-medium text-slate-950">{formatCedi(deliveryFees)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-700">Coupon discount</dt>
          <dd className="font-medium text-red-600">-{formatCedi(couponDiscount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-300 pt-4 text-base">
          <dt className="font-bold text-slate-950">Total</dt>
          <dd className="font-extrabold text-slate-950">{formatCedi(total)}</dd>
        </div>
      </dl>
    </section>
  )
}

function CheckoutSummary({
  items,
  groupedItems,
  deliveryFees,
  couponCode,
  setCouponCode,
  coupon,
  setCoupon,
  subtotal,
  canPlaceOrder,
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Order Summary</h2>
        <div className="mt-4 divide-y divide-slate-300">
          {items.map((item) => (
            <article key={`${item.id}-summary`} className="grid grid-cols-[4.75rem_minmax(0,1fr)_auto] gap-3 py-3 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]">
              <img src={item.image} alt={item.name} className="size-19 rounded-lg border border-red-100 object-cover sm:size-22" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">{item.name}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Color:{item.variant} <span className="mx-1 text-slate-300">Storage:{item.storage}</span>
                </p>
                <div className="mt-3">
                  <QuantityStepper value={item.quantity} onChange={() => {}} />
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className="text-sm font-bold text-slate-950 sm:text-base">{formatCedi(item.price)}</p>
                <button type="button" aria-label={`Remove ${item.name}`} className="text-auth-primary">
                  <Trash2 className="size-5" strokeWidth={1.7} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CouponCard couponCode={couponCode} setCouponCode={setCouponCode} coupon={coupon} setCoupon={setCoupon} />
      <OrderTotal subtotal={subtotal} deliveryFees={deliveryFees} couponDiscount={coupon?.amount ?? 0} />

      <div className="space-y-3">
        <button
          type="submit"
          form="checkout-form"
          disabled={!canPlaceOrder}
          className="w-full rounded-lg bg-auth-primary px-5 py-4 text-base font-bold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Place Order
        </button>
        <Link
          to="/cart"
          className="flex w-full items-center justify-center rounded-lg border border-slate-400 px-5 py-4 text-base font-bold text-slate-800 transition-colors hover:border-auth-primary hover:text-auth-primary"
        >
          Continue Shopping
        </Link>
      </div>
      <span className="sr-only">{Object.keys(groupedItems).join(', ')}</span>
    </aside>
  )
}

export default function CheckoutPage() {
  const { mode } = useParams()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const isGuest = mode === 'guest' || (!isAuthenticated && mode !== 'user')
  const [items] = useState(checkoutItems)
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)

  const groupedItems = useMemo(
    () =>
      items.reduce((groups, item) => {
        groups[item.store] = groups[item.store] ? [...groups[item.store], item] : [item]
        return groups
      }, {}),
    [items],
  )

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const deliveryFees = useMemo(
    () => Object.keys(groupedItems).reduce((sum, store) => sum + (DELIVERY_FEES[store] ?? 0), 0),
    [groupedItems],
  )
  const hasAddress = !isGuest
  const canPlaceOrder = hasAddress && Boolean(selectedPayment) && items.length > 0

  return (
    <SiteLayout cartCount={items.length}>
      <form id="checkout-form" onSubmit={(event) => event.preventDefault()}>
        <section className="bg-white py-7 sm:py-9 lg:py-11">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
              <div className="space-y-6">
                <CheckoutIntro isGuest={isGuest} />
                <AddressSection isGuest={isGuest} />

                <section className="space-y-4">
                  {Object.entries(groupedItems).map(([store, storeItems]) => (
                    <StoreReviewCard
                      key={store}
                      store={store}
                      items={storeItems}
                      deliveryFee={DELIVERY_FEES[store] ?? 0}
                    />
                  ))}
                </section>

                <PaymentSection selectedPayment={selectedPayment} onSelectPayment={setSelectedPayment} />
              </div>

              <CheckoutSummary
                items={items}
                groupedItems={groupedItems}
                deliveryFees={deliveryFees}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                coupon={coupon}
                setCoupon={setCoupon}
                subtotal={subtotal}
                canPlaceOrder={canPlaceOrder}
              />
            </div>
          </Container>
        </section>
      </form>

      {!canPlaceOrder && (
        <span className="sr-only">
          Place Order is disabled until delivery address, payment method, and cart items are available.
        </span>
      )}
    </SiteLayout>
  )
}
