import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Copy,
  Filter,
  Gift,
  Search,
  Sparkles,
  Tag,
  TicketPercent,
  X,
  Zap,
} from 'lucide-react'
import promotionsHeroLifestyle from '../../assets/images/hero-banners/promotions-lifestyle.png'
import promotionsHeroProduct from '../../assets/images/hero-banners/promotions-product.png'
import { notify } from '../../lib/notify'

const coupons = [
  { id: 1, code: 'WELCOME15', title: 'Welcome shopping reward', description: 'Enjoy 15% off your next marketplace order.', discount: '15% OFF', type: 'Percentage Discount', category: 'All Categories', minimum: 'GH₵150', maximum: 'GH₵80', expiry: 'Aug 12, 2026', expiryTime: '2026-08-12', status: 'Available', tone: 'from-rose-500 to-red-600' },
  { id: 2, code: 'SAVE25GH', title: 'Spend more, save more', description: 'Get an instant GH₵25 reduction on eligible products.', discount: 'GH₵25 OFF', type: 'Fixed Amount', category: 'Electronics', minimum: 'GH₵200', maximum: 'GH₵25', expiry: 'Aug 18, 2026', expiryTime: '2026-08-18', status: 'Available', tone: 'from-violet-500 to-purple-600' },
  { id: 3, code: 'SHIPFREE', title: 'Free delivery weekend', description: 'We will cover delivery on your next qualifying order.', discount: 'FREE SHIPPING', type: 'Free Shipping', category: 'All Categories', minimum: 'GH₵100', maximum: 'GH₵30', expiry: 'Jul 31, 2026', expiryTime: '2026-07-31', status: 'Available', tone: 'from-emerald-500 to-teal-600' },
  { id: 4, code: 'BEAUTY20', title: 'Beauty essentials offer', description: 'Refresh your routine with savings on beauty products.', discount: '20% OFF', type: 'Percentage Discount', category: 'Beauty', minimum: 'GH₵120', maximum: 'GH₵60', expiry: 'Aug 03, 2026', expiryTime: '2026-08-03', status: 'Available', tone: 'from-pink-500 to-fuchsia-600' },
  { id: 5, code: 'HOME40', title: 'Home refresh voucher', description: 'Save on selected home, decor, and kitchen essentials.', discount: 'GH₵40 OFF', type: 'Fixed Amount', category: 'Home & Kitchen', minimum: 'GH₵250', maximum: 'GH₵40', expiry: 'Sep 01, 2026', expiryTime: '2026-09-01', status: 'Available', tone: 'from-amber-500 to-orange-600' },
  { id: 6, code: 'FASHION10', title: 'Fresh fashion savings', description: 'Take 10% off selected clothing and accessories.', discount: '10% OFF', type: 'Percentage Discount', category: 'Fashion', minimum: 'GH₵80', maximum: 'GH₵35', expiry: 'Aug 22, 2026', expiryTime: '2026-08-22', status: 'Available', tone: 'from-sky-500 to-blue-600' },
  { id: 7, code: 'JULYDEAL', title: 'July special reward', description: 'A seasonal voucher applied to your recent purchase.', discount: '12% OFF', type: 'Percentage Discount', category: 'All Categories', minimum: 'GH₵100', maximum: 'GH₵50', expiry: 'Jul 20, 2026', expiryTime: '2026-07-20', status: 'Used', tone: 'from-slate-400 to-slate-500' },
  { id: 8, code: 'FLASH30', title: 'Flash sale voucher', description: 'Limited promotional saving for selected items.', discount: 'GH₵30 OFF', type: 'Fixed Amount', category: 'Electronics', minimum: 'GH₵180', maximum: 'GH₵30', expiry: 'Jun 30, 2026', expiryTime: '2026-06-30', status: 'Expired', tone: 'from-slate-400 to-slate-500' },
]

const offers = [
  { title: "Today's Deals", description: 'Fresh discounts on popular products, updated throughout the day.', icon: Sparkles, image: promotionsHeroLifestyle, href: '/promotions?filter=todays-deals', tone: 'bg-amber-50 text-amber-700' },
  { title: 'Flash Sale', description: 'Short-lived offers with exceptional prices while stock lasts.', icon: Zap, image: promotionsHeroProduct, href: '/promotions?filter=flash-sale', tone: 'bg-red-50 text-auth-primary' },
  { title: 'Clearance Sale', description: 'Last-chance savings across fashion, home, electronics, and more.', icon: Tag, image: promotionsHeroLifestyle, href: '/promotions?filter=clearance', tone: 'bg-violet-50 text-violet-700' },
]

const tabs = ['All Coupons', 'Available', 'Used', 'Expired']

function CouponCard({ coupon, onCopy, onDetails }) {
  const inactive = coupon.status !== 'Available'
  return (
    <article className={`group relative overflow-hidden rounded-3xl border bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] ${inactive ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-auth-primary/25'}`}>
      <div className={`bg-linear-to-br ${coupon.tone} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><TicketPercent className="size-5" /></span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide backdrop-blur">{coupon.status}</span>
        </div>
        <p className="mt-6 text-2xl font-extrabold tracking-tight">{coupon.discount}</p>
        <p className="mt-1 text-xs font-medium text-white/80">{coupon.category}</p>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-bold tracking-wider text-slate-900">{coupon.code}</span>
          <button type="button" onClick={() => onCopy(coupon.code)} disabled={inactive} aria-label={`Copy ${coupon.code}`} className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-auth-primary hover:bg-red-50 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"><Copy className="size-4" /></button>
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-950">{coupon.title}</h3>
        <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{coupon.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
          <div><dt className="text-slate-400">Minimum spend</dt><dd className="mt-1 font-bold text-slate-800">{coupon.minimum}</dd></div>
          <div><dt className="text-slate-400">Maximum discount</dt><dd className="mt-1 font-bold text-slate-800">{coupon.maximum}</dd></div>
        </dl>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CalendarDays className="size-3.5" />{coupon.expiry}</span>
          <button type="button" onClick={() => onDetails(coupon)} className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">View Details<ChevronRight className="size-3.5" /></button>
        </div>
      </div>
    </article>
  )
}

function CouponDetailsModal({ coupon, onClose, onCopy }) {
  if (!coupon) return null
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="coupon-details-title">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className={`bg-linear-to-br ${coupon.tone} p-6 text-white`}>
          <div className="flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-white/15"><TicketPercent className="size-6" /></span><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Close coupon details"><X className="size-4" /></button></div>
          <p className="mt-6 text-3xl font-extrabold">{coupon.discount}</p><p className="mt-1 text-sm text-white/80">{coupon.title}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="text-xs text-slate-400">Coupon code</p><p className="mt-1 font-mono text-lg font-bold tracking-wider">{coupon.code}</p></div><button type="button" onClick={() => onCopy(coupon.code)} disabled={coupon.status !== 'Available'} className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300"><Copy className="size-4" />Copy Code</button></div>
          <p className="mt-5 text-sm leading-6 text-slate-600">{coupon.description}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">{[['Category', coupon.category], ['Coupon type', coupon.type], ['Minimum spend', coupon.minimum], ['Maximum discount', coupon.maximum], ['Expires', coupon.expiry], ['Status', coupon.status]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-800">{value}</dd></div>)}</dl>
          <button type="button" onClick={onClose} className="mt-7 w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AccountCouponsPanel() {
  const [tab, setTab] = useState('All Coupons')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Expiry Date (Soonest)')
  const [type, setType] = useState('All Types')
  const [category, setCategory] = useState('All Categories')
  const [selectedCoupon, setSelectedCoupon] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const counts = Object.fromEntries(tabs.map((item) => [item, item === 'All Coupons' ? coupons.length : coupons.filter((coupon) => coupon.status === item).length]))
  const visibleCoupons = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const filtered = coupons.filter((coupon) => {
      const matchesTab = tab === 'All Coupons' || coupon.status === tab
      const matchesType = type === 'All Types' || coupon.type === type
      const matchesCategory = category === 'All Categories' || coupon.category === category
      const matchesSearch = !needle || `${coupon.code} ${coupon.title} ${coupon.description} ${coupon.category}`.toLowerCase().includes(needle)
      return matchesTab && matchesType && matchesCategory && matchesSearch
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'Expiry Date (Latest)') return b.expiryTime.localeCompare(a.expiryTime)
      if (sort === 'Highest Discount') return Number.parseInt(b.discount, 10) - Number.parseInt(a.discount, 10)
      if (sort === 'Lowest Discount') return Number.parseInt(a.discount, 10) - Number.parseInt(b.discount, 10)
      if (sort === 'Recently Added') return b.id - a.id
      return a.expiryTime.localeCompare(b.expiryTime)
    })
  }, [category, search, sort, tab, type])

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    notify.success(`${code} copied to clipboard`)
  }

  return (
    <section>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500"><Link to="/" className="hover:text-auth-primary">Home</Link><ChevronRight className="size-3.5" /><span className="font-semibold text-slate-900">Coupons & Offers</span></nav>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Savings centre</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Coupons & Offers</h2><p className="mt-2 text-sm text-slate-500">Save more with exclusive coupons and exciting offers.</p></div><span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-auth-primary"><Gift className="size-6" /></span></div>
      <div className="mt-6 overflow-hidden rounded-3xl bg-linear-to-br from-[#a92f24] via-auth-primary to-[#e65b44] p-6 text-white shadow-[0_18px_45px_rgba(192,57,43,0.2)] sm:p-8"><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-white/75">Your coupon wallet</p><p className="mt-2 text-2xl font-bold">You have <span className="text-amber-200">6 available coupons</span></p><p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Select a coupon and apply it at checkout to enjoy extra savings.</p></div><span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur"><TicketPercent className="size-9" /></span></div></div>
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition ${tab === item ? 'bg-auth-primary text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-red-50 hover:text-auth-primary'}`}>{item}<span className={`rounded-full px-2 py-0.5 ${tab === item ? 'bg-white/20' : 'bg-slate-100'}`}>{counts[item]}</span></button>)}</div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><div className="grid gap-3 xl:grid-cols-[minmax(15rem,1fr)_auto_auto_auto]"><label className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-auth-primary"><Search className="size-4 text-slate-400" /><span className="sr-only">Search coupons</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coupons or codes" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><label className="sr-only" htmlFor="coupon-type">Coupon type</label><select id="coupon-type" value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"><option>All Types</option><option>Percentage Discount</option><option>Fixed Amount</option><option>Free Shipping</option></select><label className="sr-only" htmlFor="coupon-category">Category</label><select id="coupon-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"><option>All Categories</option><option>Electronics</option><option>Beauty</option><option>Home & Kitchen</option><option>Fashion</option></select><label className="flex items-center gap-2 text-xs font-bold text-slate-500"><Filter className="size-4" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"><option>Expiry Date (Soonest)</option><option>Expiry Date (Latest)</option><option>Highest Discount</option><option>Lowest Discount</option><option>Recently Added</option></select></label></div></div>
      {visibleCoupons.length ? <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{visibleCoupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} onCopy={copyCode} onDetails={setSelectedCoupon} />)}</div> : <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center"><Search className="size-9 text-slate-300" /><h3 className="mt-4 font-bold text-slate-900">No coupons found</h3><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p></div>}
      <div className="mt-10 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">More ways to save</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Exclusive offers</h2><p className="mt-2 text-sm text-slate-500">Explore limited-time promotions selected for you.</p></div><Link to="/promotions" className="hidden items-center gap-1 text-xs font-bold text-auth-primary hover:underline sm:inline-flex">View all offers<ArrowRight className="size-4" /></Link></div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">{offers.map((offer) => { const Icon = offer.icon; return <article key={offer.title} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"><div className="relative h-36 overflow-hidden"><img src={offer.image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-linear-to-t from-slate-950/45 to-transparent" /><span className={`absolute left-4 top-4 flex size-10 items-center justify-center rounded-xl ${offer.tone}`}><Icon className="size-5" /></span></div><div className="p-5"><h3 className="font-bold text-slate-950">{offer.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{offer.description}</p><Link to={offer.href} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-auth-primary-hover">View Offers<ArrowRight className="size-3.5" /></Link></div></article> })}</div>
      <CouponDetailsModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} onCopy={copyCode} />
    </section>
  )
}
