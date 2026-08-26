import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Headphones,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react'
import kitchenImage from '../../assets/images/categories/kitchen_utensils.jpg'
import electronicsImage from '../../assets/images/categories/electronics.jpg'
import fashionImage from '../../assets/images/fashion.png'

const returnRequests = [
  {
    id: 'RET-240819-01',
    orderId: 'ORD-20483',
    orderDate: '12 Aug 2026',
    requestedAt: '19 Aug 2026',
    requestedDate: '2026-08-19',
    product: '12-piece silicone kitchen utensil set',
    variation: 'Sage green · 12 pieces',
    quantity: 1,
    image: kitchenImage,
    status: 'In Progress',
    reason: 'Item arrived with a damaged handle',
    refundMethod: 'Original payment method',
    amount: 'GH₵99.95',
    update: 'Your item is being inspected by the seller.',
  },
  {
    id: 'RET-240806-04',
    orderId: 'ORD-20174',
    orderDate: '28 Jul 2026',
    requestedAt: '06 Aug 2026',
    requestedDate: '2026-08-06',
    product: 'Wireless over-ear headphones',
    variation: 'Midnight black',
    quantity: 1,
    image: electronicsImage,
    status: 'Refunded',
    reason: 'Product did not match the listing',
    refundMethod: 'Original payment method',
    amount: 'GH₵245.00',
    update: 'Your refund was completed on 10 Aug 2026.',
  },
  {
    id: 'RET-240721-02',
    orderId: 'ORD-19842',
    orderDate: '15 Jul 2026',
    requestedAt: '21 Jul 2026',
    requestedDate: '2026-07-21',
    product: 'Classic everyday cotton shirt',
    variation: 'Stone · Large',
    quantity: 2,
    image: fashionImage,
    status: 'Cancelled',
    reason: 'Wrong size selected',
    refundMethod: 'Not applicable',
    amount: 'GH₵150.00',
    update: 'This return request was cancelled on 22 Jul 2026.',
  },
  {
    id: 'RET-240820-03',
    orderId: 'ORD-20511',
    orderDate: '14 Aug 2026',
    requestedAt: '20 Aug 2026',
    requestedDate: '2026-08-20',
    product: 'Portable Bluetooth speaker',
    variation: 'Burgundy red',
    quantity: 1,
    image: electronicsImage,
    status: 'Request Raised',
    reason: 'Received the wrong colour',
    refundMethod: 'Original payment method',
    amount: 'GH₵180.00',
    update: 'Your request has been received and is awaiting review.',
  },
]

const statusMeta = {
  'Request Raised': { icon: ReceiptText, badge: 'bg-red-50 text-auth-primary', dot: 'bg-auth-primary' },
  'In Progress': { icon: Clock3, badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-600' },
  Refunded: { icon: CheckCircle2, badge: 'bg-red-50 text-auth-primary', dot: 'bg-auth-primary' },
  Cancelled: { icon: XCircle, badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

const dateFilters = ['All dates', 'Last 30 days', 'Last 3 months', 'This year']
const statusFilters = ['All statuses', 'Request Raised', 'In Progress', 'Refunded', 'Cancelled']

function ReturnStatusBadge({ status }) {
  const meta = statusMeta[status] ?? statusMeta['In Progress']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${meta.badge}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  )
}

function SummaryCard({ label, value }) {
  const meta = statusMeta[label]
  const Icon = meta.icon
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-auth-primary/20 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-slate-950">{value}</span>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-600">{label}</p>
    </article>
  )
}

function ReturnRequestCard({ request }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition hover:border-auth-primary/25 hover:shadow-[0_14px_36px_rgba(15,23,42,0.07)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <div className="flex size-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:size-24">
            <img src={request.image} alt="" className="size-full object-contain p-1" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ReturnStatusBadge status={request.status} />
              <span className="text-[0.68rem] font-medium text-slate-400">{request.requestedAt}</span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-950 sm:text-base">{request.product}</h3>
            <p className="mt-1 text-xs text-slate-500">{request.variation} · Qty {request.quantity}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-slate-100 pt-4 text-xs sm:w-72 sm:shrink-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 lg:w-80">
          <div>
            <p className="text-slate-400">Return ID</p>
            <p className="mt-1 font-bold text-slate-800">{request.id}</p>
          </div>
          <div>
            <p className="text-slate-400">Order</p>
            <p className="mt-1 font-bold text-slate-800">#{request.orderId}</p>
          </div>
          <div>
            <p className="text-slate-400">Order date</p>
            <p className="mt-1 font-semibold text-slate-700">{request.orderDate}</p>
          </div>
          <div className="flex items-end justify-end">
            <Link
              to={`/account/returns/${request.id}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-auth-primary px-4 py-2 font-bold text-white transition hover:bg-auth-primary-hover"
            >
              View details
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function ReturnDetails({ request }) {
  const steps = ['Request Raised', 'In Progress', 'Refunded']
  const currentIndex = request.status === 'Refunded' ? 2 : request.status === 'In Progress' ? 1 : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/account/returns" className="inline-flex items-center gap-1.5 text-xs font-bold text-auth-primary hover:underline">
            <ArrowLeft className="size-3.5" /> Back to returns
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Return request</h1>
          <p className="mt-1 text-sm text-slate-500">{request.id} · Submitted {request.requestedAt}</p>
        </div>
        <ReturnStatusBadge status={request.status} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Latest update</p>
        <h2 className="mt-2 text-lg font-bold text-slate-950">{request.update}</h2>
        {request.status !== 'Cancelled' ? (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {steps.map((step, index) => (
              <div key={step} className="relative text-center">
                {index > 0 ? <span className={`absolute right-1/2 top-4 h-0.5 w-full ${index <= currentIndex ? 'bg-auth-primary' : 'bg-slate-200'}`} /> : null}
                <span className={`relative z-10 mx-auto flex size-8 items-center justify-center rounded-full border-4 border-white ${index <= currentIndex ? 'bg-auth-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {index < currentIndex ? <CheckCircle2 className="size-4" /> : <span className="text-[0.65rem] font-bold">{index + 1}</span>}
                </span>
                <p className="mt-2 text-[0.65rem] font-semibold text-slate-600 sm:text-xs">{step}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-950">Returned item</h2>
          <div className="mt-4 flex gap-4 border-b border-slate-100 pb-5">
            <div className="flex size-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <img src={request.image} alt="" className="size-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-5 text-slate-950">{request.product}</h3>
              <p className="mt-1 text-xs text-slate-500">{request.variation}</p>
              <p className="mt-1 text-xs text-slate-500">Quantity: {request.quantity}</p>
              <p className="mt-3 text-base font-extrabold text-slate-950">{request.amount}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-400">Return reason</dt><dd className="mt-1 font-semibold text-slate-800">{request.reason}</dd></div>
            <div><dt className="text-xs text-slate-400">Refund method</dt><dd className="mt-1 font-semibold text-slate-800">{request.refundMethod}</dd></div>
            <div><dt className="text-xs text-slate-400">Order number</dt><dd className="mt-1 font-semibold text-slate-800">#{request.orderId}</dd></div>
            <div><dt className="text-xs text-slate-400">Order date</dt><dd className="mt-1 font-semibold text-slate-800">{request.orderDate}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-auth-primary shadow-sm"><CircleHelp className="size-5" /></span>
          <h2 className="mt-4 text-base font-bold text-slate-950">Need help with this return?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Our support team can clarify the next step or help if your return is taking longer than expected.</p>
          <Link to="/account/support" className="mt-5 inline-flex items-center gap-2 rounded-full bg-auth-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-auth-primary-hover">
            <Headphones className="size-4" /> Contact support
          </Link>
        </section>
      </div>
    </div>
  )
}

export default function AccountReturnsPanel() {
  const location = useLocation()
  const detailId = location.pathname.match(/\/account\/returns\/([^/]+)/)?.[1]
  const detailRequest = returnRequests.find((request) => request.id === detailId)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [dateRange, setDateRange] = useState('All dates')

  const counts = useMemo(() => Object.fromEntries(statusFilters.slice(1).map((label) => [label, returnRequests.filter((request) => request.status === label).length])), [])

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return returnRequests.filter((request) => {
      const matchesStatus = status === 'All statuses' || request.status === status
      const matchesQuery = !normalizedQuery || [request.product, request.id, request.orderId].some((value) => value.toLowerCase().includes(normalizedQuery))
      const requestedDate = new Date(`${request.requestedDate}T00:00:00`)
      const daysAgo = (new Date('2026-08-22T00:00:00') - requestedDate) / 86_400_000
      const matchesDate = dateRange === 'All dates'
        || (dateRange === 'Last 30 days' && daysAgo <= 30)
        || (dateRange === 'Last 3 months' && daysAgo <= 92)
        || (dateRange === 'This year' && requestedDate.getFullYear() === 2026)
      return matchesStatus && matchesQuery && matchesDate
    })
  }, [query, status, dateRange])

  if (detailId) {
    if (detailRequest) return <ReturnDetails request={detailRequest} />
    return <Navigate to="/account/returns" replace />
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Purchase support</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Returns & Refunds</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Track every return request, refund update, and next step in one place.</p>
        </div>
        <Link to="/account/orders" className="inline-flex w-fit items-center gap-2 rounded-full bg-auth-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-auth-primary-hover">
          <RotateCcw className="size-4" /> Request a return
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statusFilters.slice(1).map((label) => <SummaryCard key={label} label={label} value={counts[label]} />)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
        <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, order or return ID" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-auth-primary/50 focus:ring-4 focus:ring-red-50" />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <label className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-auth-primary/50 sm:w-40">
                  {statusFilters.map((option) => <option key={option}>{option}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              </label>
              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-auth-primary/50 sm:w-36">
                  {dateFilters.map((option) => <option key={option}>{option}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-5">
          <div className="flex items-center justify-between px-1 pb-1">
            <h2 className="text-sm font-bold text-slate-950">Your return requests</h2>
            <span className="text-xs text-slate-400">{filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}</span>
          </div>
          {filteredRequests.length ? filteredRequests.map((request) => <ReturnRequestCard key={request.id} request={request} />) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><PackageCheck className="size-5" /></span>
              <h3 className="mt-4 text-base font-bold text-slate-950">No matching return requests</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">Try changing your search or filters to find another request.</p>
              <button type="button" onClick={() => { setQuery(''); setStatus('All statuses'); setDateRange('All dates') }} className="mt-4 text-xs font-bold text-auth-primary hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-red-100 bg-red-50/60 p-5 sm:p-6">
        <div className="absolute -right-8 -top-10 size-36 rounded-full border-[24px] border-white/45" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-auth-primary shadow-sm"><CircleHelp className="size-5" /></span>
            <div><h2 className="text-base font-bold text-slate-950">Need help with a return or refund?</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">Review eligibility guidance, refund timelines, or speak with our support team.</p></div>
          </div>
          <Link to="/account/support" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-auth-primary/20 bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:border-auth-primary/40 hover:bg-red-50"><Headphones className="size-4" /> Contact support</Link>
        </div>
      </section>
    </div>
  )
}
