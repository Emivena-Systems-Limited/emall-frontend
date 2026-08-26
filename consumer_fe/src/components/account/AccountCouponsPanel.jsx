import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight, BadgePercent, CalendarDays, Check, ChevronDown, ChevronRight,
  Copy, Filter, Gift, RotateCcw, Search, Sparkles, Tag, TicketPercent, X, Zap,
} from 'lucide-react'
import promotionsHeroLifestyle from '../../assets/images/hero-banners/promotions-lifestyle.png'
import promotionsHeroProduct from '../../assets/images/hero-banners/promotions-product.png'
import { notify } from '../../lib/notify'

const COUPONS = [
  { id: 1, code: 'WELCOME15', title: 'Welcome shopping reward', description: 'Enjoy 15% off your next marketplace order.', discount: '15% OFF', discountValue: 15, type: 'Percentage Discount', category: 'All Categories', minimum: 'GH₵150', maximum: 'GH₵80', expiry: 'Sep 12, 2026', expiryTime: '2026-09-12', createdTime: '2026-08-18', status: 'Available', eligibleHref: '/products' },
  { id: 2, code: 'SAVE25GH', title: 'Spend more, save more', description: 'Get an instant GH₵25 reduction on eligible electronics.', discount: 'GH₵25 OFF', discountValue: 25, type: 'Fixed Amount', category: 'Electronics', minimum: 'GH₵200', maximum: 'GH₵25', expiry: 'Sep 18, 2026', expiryTime: '2026-09-18', createdTime: '2026-08-16', status: 'Available', eligibleHref: '/products?category=electronics' },
  { id: 3, code: 'SHIPFREE', title: 'Free delivery weekend', description: 'We will cover delivery on your next qualifying order.', discount: 'FREE SHIPPING', discountValue: 30, type: 'Free Shipping', category: 'All Categories', minimum: 'GH₵100', maximum: 'GH₵30', expiry: 'Sep 30, 2026', expiryTime: '2026-09-30', createdTime: '2026-08-14', status: 'Available', eligibleHref: '/products' },
  { id: 4, code: 'BEAUTY20', title: 'Beauty essentials offer', description: 'Refresh your routine with savings on beauty products.', discount: '20% OFF', discountValue: 20, type: 'Percentage Discount', category: 'Beauty', minimum: 'GH₵120', maximum: 'GH₵60', expiry: 'Oct 03, 2026', expiryTime: '2026-10-03', createdTime: '2026-08-12', status: 'Available', eligibleHref: '/products?category=beauty' },
  { id: 5, code: 'HOME40', title: 'Home refresh voucher', description: 'Save on selected home, décor, and kitchen essentials.', discount: 'GH₵40 OFF', discountValue: 40, type: 'Fixed Amount', category: 'Home & Kitchen', minimum: 'GH₵250', maximum: 'GH₵40', expiry: 'Oct 15, 2026', expiryTime: '2026-10-15', createdTime: '2026-08-10', status: 'Available', eligibleHref: '/products?category=home-kitchen' },
  { id: 6, code: 'FASHION10', title: 'Fresh fashion savings', description: 'Take 10% off selected clothing and accessories.', discount: '10% OFF', discountValue: 10, type: 'Percentage Discount', category: 'Fashion', minimum: 'GH₵80', maximum: 'GH₵35', expiry: 'Oct 22, 2026', expiryTime: '2026-10-22', createdTime: '2026-08-08', status: 'Available', eligibleHref: '/products?category=fashion' },
  { id: 7, code: 'JULYDEAL', title: 'July special reward', description: 'A seasonal voucher applied to your recent purchase.', discount: '12% OFF', discountValue: 12, type: 'Percentage Discount', category: 'All Categories', minimum: 'GH₵100', maximum: 'GH₵50', expiry: 'Jul 20, 2026', expiryTime: '2026-07-20', createdTime: '2026-07-01', status: 'Used', eligibleHref: '/products' },
  { id: 8, code: 'FLASH30', title: 'Flash sale voucher', description: 'A limited promotional saving for selected items.', discount: 'GH₵30 OFF', discountValue: 30, type: 'Fixed Amount', category: 'Electronics', minimum: 'GH₵180', maximum: 'GH₵30', expiry: 'Jun 30, 2026', expiryTime: '2026-06-30', createdTime: '2026-06-15', status: 'Expired', eligibleHref: '/products?category=electronics' },
]

const TABS = ['All Coupons', 'Available', 'Used', 'Expired']
const SORT_OPTIONS = ['Expiry Date (Soonest)', 'Expiry Date (Latest)', 'Highest Discount', 'Lowest Discount', 'Recently Added']
const TYPE_OPTIONS = ['All Types', 'Percentage Discount', 'Fixed Amount', 'Free Shipping']
const CATEGORY_OPTIONS = ['All Categories', 'Electronics', 'Beauty', 'Home & Kitchen', 'Fashion']
const OFFERS = [
  { title: "Today's Deals", description: 'Fresh discounts on popular products, updated throughout the day.', icon: Sparkles, image: promotionsHeroLifestyle, href: '/promotions?filter=todays-deals' },
  { title: 'Flash Sale', description: 'Short-lived offers with exceptional prices while stock lasts.', icon: Zap, image: promotionsHeroProduct, href: '/promotions?filter=flash-sales' },
  { title: 'Clearance Sale', description: 'Last-chance savings across fashion, home, electronics, and more.', icon: Tag, image: promotionsHeroLifestyle, href: '/promotions?filter=clearance' },
]

function SelectField({ id, label, value, onChange, options }) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className="relative block">
        <select id={id} value={value} onChange={onChange} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  )
}

function CouponCard({ coupon, onCopy, onDetails }) {
  const available = coupon.status === 'Available'
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_18px_40px_rgba(88,31,26,0.1)]">
      <div className={`h-1.5 w-full ${available ? 'bg-auth-primary' : 'bg-slate-300'}`} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex min-h-20 min-w-24 shrink-0 flex-col justify-center rounded-2xl border px-4 py-3 ${available ? 'border-auth-primary/15 bg-red-50 text-auth-primary' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            <TicketPercent className="size-5" />
            <strong className="mt-2 max-w-28 text-base font-extrabold leading-tight">{coupon.discount}</strong>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold ${available ? 'bg-auth-primary/10 text-auth-primary' : 'bg-slate-100 text-slate-500'}`}>
            {available ? <Check className="size-3" /> : null}{coupon.status}
          </span>
        </div>
        <div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-dashed border-auth-primary/25 bg-[#fff9f8] p-2.5">
          <span className="min-w-0 truncate pl-1 font-mono text-sm font-extrabold tracking-[0.1em] text-slate-900">{coupon.code}</span>
          <button type="button" onClick={() => onCopy(coupon.code)} disabled={!available} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-auth-primary px-3 text-xs font-bold text-white transition hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
            <Copy className="size-3.5" />Copy
          </button>
        </div>
        <span className="mt-5 w-fit rounded-full bg-red-50 px-2.5 py-1 text-[0.6875rem] font-bold text-auth-primary">{coupon.category}</span>
        <h3 className="mt-3 text-base font-bold text-slate-950">{coupon.title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{coupon.description}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-xs">
          <div><dt className="text-slate-400">Minimum spend</dt><dd className="mt-1 font-bold text-slate-800">{coupon.minimum}</dd></div>
          <div><dt className="text-slate-400">Maximum discount</dt><dd className="mt-1 font-bold text-slate-800">{coupon.maximum}</dd></div>
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CalendarDays className="size-3.5 text-auth-primary" />Expires {coupon.expiry}</span>
          <button type="button" onClick={() => onDetails(coupon)} className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">View Details<ChevronRight className="size-3.5" /></button>
        </div>
      </div>
    </article>
  )
}

function CouponDetailsModal({ coupon, onClose, onCopy }) {
  useEffect(() => {
    if (!coupon) return undefined
    const handleEscape = (event) => { if (event.key === 'Escape') onClose() }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [coupon, onClose])

  if (!coupon) return null
  const available = coupon.status === 'Available'
  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="coupon-details-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <header className="relative overflow-hidden bg-auth-primary p-6 text-white sm:p-7">
          <div className="absolute -right-10 -top-10 size-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start justify-between gap-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/12"><TicketPercent className="size-5" /></span>
            <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="Close coupon details"><X className="size-4" /></button>
          </div>
          <p className="relative mt-6 text-3xl font-extrabold">{coupon.discount}</p>
          <h2 id="coupon-details-title" className="relative mt-1 text-sm font-semibold text-white/80">{coupon.title}</h2>
        </header>
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-3 rounded-2xl border border-auth-primary/15 bg-red-50 p-4 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
            <div className="min-w-0"><p className="text-[0.6875rem] font-bold uppercase tracking-wider text-auth-primary">Coupon code</p><p className="mt-1 truncate font-mono text-lg font-extrabold tracking-wider text-slate-950">{coupon.code}</p></div>
            <button type="button" onClick={() => onCopy(coupon.code)} disabled={!available} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-auth-primary px-4 text-sm font-bold text-white transition hover:bg-auth-primary-hover disabled:bg-slate-300"><Copy className="size-4" />Copy Code</button>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">{coupon.description}</p>
          <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {[['Category', coupon.category], ['Coupon type', coupon.type], ['Minimum spend', coupon.minimum], ['Maximum discount', coupon.maximum], ['Expiry date', coupon.expiry], ['Status', coupon.status]].map(([label, value]) => (
              <div key={label} className="border-b border-slate-100 pb-3"><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-800">{value}</dd></div>
            ))}
          </dl>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Close</button>
            <Link to={coupon.eligibleHref} onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-auth-primary-hover">Shop eligible products<ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function OfferCard({ offer }) {
  const Icon = offer.icon
  return (
    <article className="group relative isolate min-h-64 overflow-hidden rounded-2xl border border-auth-primary/15 bg-auth-primary shadow-[0_14px_35px_rgba(87,25,20,0.12)]">
      <img src={offer.image} alt="" className="absolute inset-0 -z-20 size-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#5f1b16] via-auth-primary/90 to-auth-primary/55" />
      <div className="flex h-full min-h-64 flex-col p-5 text-white sm:p-6">
        <span className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm"><Icon className="size-5" /></span>
        <div className="mt-auto pt-8"><h3 className="text-lg font-bold">{offer.title}</h3><p className="mt-2 text-xs leading-5 text-white/75">{offer.description}</p>
          <Link to={offer.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-red-50">View Offers<ArrowRight className="size-3.5" /></Link>
        </div>
      </div>
    </article>
  )
}

export default function AccountCouponsPanel() {
  const [tab, setTab] = useState('All Coupons')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Expiry Date (Soonest)')
  const [type, setType] = useState('All Types')
  const [category, setCategory] = useState('All Categories')
  const [selectedCoupon, setSelectedCoupon] = useState(null)

  const counts = useMemo(() => Object.fromEntries(TABS.map((item) => [item, item === 'All Coupons' ? COUPONS.length : COUPONS.filter((coupon) => coupon.status === item).length])), [])
  const visibleCoupons = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const filtered = COUPONS.filter((coupon) => {
      const matchesTab = tab === 'All Coupons' || coupon.status === tab
      const matchesType = type === 'All Types' || coupon.type === type
      const matchesCategory = category === 'All Categories' || coupon.category === category
      const searchable = `${coupon.code} ${coupon.title} ${coupon.description} ${coupon.category}`.toLowerCase()
      return matchesTab && matchesType && matchesCategory && (!needle || searchable.includes(needle))
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'Expiry Date (Latest)') return b.expiryTime.localeCompare(a.expiryTime)
      if (sort === 'Highest Discount') return b.discountValue - a.discountValue
      if (sort === 'Lowest Discount') return a.discountValue - b.discountValue
      if (sort === 'Recently Added') return b.createdTime.localeCompare(a.createdTime)
      return a.expiryTime.localeCompare(b.expiryTime)
    })
  }, [category, search, sort, tab, type])
  const hasActiveFilters = search || type !== 'All Types' || category !== 'All Categories'
  const clearFilters = () => { setSearch(''); setType('All Types'); setCategory('All Categories'); setSort('Expiry Date (Soonest)') }
  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); notify.success(`${code} copied to clipboard`) }
    catch { notify.error('Could not copy the coupon code. Please copy it manually.') }
  }

  return (
    <section className="min-w-0 pb-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500"><Link to="/" className="transition hover:text-auth-primary">Home</Link><ChevronRight className="size-3.5" /><span className="font-semibold text-slate-900">Coupons & Offers</span></nav>
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">Savings centre</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Coupons & Offers</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Save more with exclusive coupons and exciting offers.</p></div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-auth-primary ring-1 ring-auth-primary/10"><Gift className="size-5" /></span>
      </header>
      <section className="relative mt-6 overflow-hidden rounded-2xl bg-auth-primary px-5 py-6 text-white shadow-[0_18px_42px_rgba(109,30,24,0.18)] sm:px-7 sm:py-7">
        <div className="absolute -right-14 -top-16 size-52 rounded-full border-[34px] border-white/5" /><div className="absolute -bottom-20 right-24 size-40 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">Your coupon wallet</p><p className="mt-2 text-xl font-bold sm:text-2xl">You have {counts.Available} available coupons</p><p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Select a coupon and apply it at checkout to enjoy extra savings.</p></div><span className="hidden size-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex"><BadgePercent className="size-8" /></span></div>
      </section>
      <div className="mt-6 overflow-x-auto border-b border-slate-200"><div className="flex min-w-max gap-6" role="tablist" aria-label="Coupon status">
        {TABS.map((item) => { const active = tab === item; return <button key={item} type="button" role="tab" aria-selected={active} onClick={() => setTab(item)} className={`relative flex items-center gap-2 pb-3 text-sm font-bold transition ${active ? 'text-auth-primary' : 'text-slate-500 hover:text-slate-800'}`}>{item}<span className={`rounded-full px-2 py-0.5 text-[0.6875rem] ${active ? 'bg-auth-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{counts[item]}</span>{active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-auth-primary" /> : null}</button> })}
      </div></div>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-5">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-auth-primary"><Filter className="size-4" /></span>Sort & Filter</div>{hasActiveFilters ? <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-auth-primary hover:underline"><RotateCcw className="size-3.5" />Clear filters</button> : null}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.3fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_minmax(11rem,0.9fr)]">
          <label className="block min-w-0"><span className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-slate-500">Search</span><span className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 px-3 transition focus-within:border-auth-primary focus-within:ring-2 focus-within:ring-auth-primary/10"><Search className="size-4 shrink-0 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Coupon name or code" className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400" /></span></label>
          <SelectField id="coupon-type" label="Coupon type" value={type} onChange={(event) => setType(event.target.value)} options={TYPE_OPTIONS} />
          <SelectField id="coupon-category" label="Category" value={category} onChange={(event) => setCategory(event.target.value)} options={CATEGORY_OPTIONS} />
          <SelectField id="coupon-sort" label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} options={SORT_OPTIONS} />
        </div>
      </section>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-slate-900">{visibleCoupons.length} {visibleCoupons.length === 1 ? 'coupon' : 'coupons'}</p><p className="text-xs text-slate-500">Showing {tab.toLowerCase()}</p></div>
      {visibleCoupons.length ? <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{visibleCoupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} onCopy={copyCode} onDetails={setSelectedCoupon} />)}</div> : <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-auth-primary/20 bg-red-50/40 px-5 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-white text-auth-primary shadow-sm"><Search className="size-6" /></span><h2 className="mt-4 text-lg font-bold text-slate-950">No coupons found</h2><p className="mt-1 text-sm text-slate-500">Try another status, search term, or filter.</p><button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-auth-primary-hover">Reset filters</button></div>}
      <section className="mt-12"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">More ways to save</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Exclusive offers</h2><p className="mt-2 text-sm text-slate-500">Explore limited-time promotions selected for you.</p></div><Link to="/promotions" className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">View all offers<ArrowRight className="size-4" /></Link></div><div className="mt-5 grid gap-5 md:grid-cols-3">{OFFERS.map((offer) => <OfferCard key={offer.title} offer={offer} />)}</div></section>
      <CouponDetailsModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} onCopy={copyCode} />
    </section>
  )
}
