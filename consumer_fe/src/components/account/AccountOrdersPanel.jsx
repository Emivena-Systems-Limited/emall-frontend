import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  Bike,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock3,
  Download,
  Grid2X2,
  List,
  Package,
  Search,
  Share2,
  Star,
} from 'lucide-react'
import phoneImage from '../../assets/images/categories/phones_and_accesories.png'
import homeImage from '../../assets/images/categories/home_and_kitchen.png'
import decorImage from '../../assets/images/categories/home_decor.jpg'
import kitchenImage from '../../assets/images/categories/kitchen_utensils.jpg'

const orders = [
  { id: 'CN-92041', status: 'Processing', date: 'May 24, 2024 • 10:42 AM', title: 'Luxury Bundle +3 more items', delivery: 'Premium Express Delivery', items: 4, amount: 1240, images: [phoneImage, homeImage] },
  { id: 'CN-77312', status: 'Processing', date: 'May 19, 2024 • 09:20 AM', title: 'Artisan Homeware', delivery: 'Fragile Handling Priority', items: 1, amount: 320, images: [decorImage] },
  { id: 'CN-88421', status: 'Delivered', date: 'May 21, 2024 • 03:15 PM', title: 'Audio & Living Set', delivery: 'Standard Concierge Shipping', items: 2, amount: 890, images: [homeImage, phoneImage] },
  { id: 'CN-76500', status: 'Cancelled', date: 'May 15, 2024 • 05:45 PM', title: 'Office Refinement Kit', delivery: 'Refund issued', items: 2, amount: 450, images: [kitchenImage] },
]

const cardOrders = [
  orders[0],
  orders[2],
  orders[1],
  orders[3],
  { ...orders[1], recordKey: 'CN-77312-repeat' },
  { ...orders[0], recordKey: 'CN-92041-repeat' },
]

const statusStyles = {
  Processing: 'bg-blue-50 text-blue-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-600',
  'Out for Delivery': 'bg-amber-50 text-amber-700',
}

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 })

function ProductStack({ images, remaining = 0 }) {
  return (
    <div className="flex shrink-0 items-center">
      {images.slice(0, 2).map((image, index) => (
        <span key={`${image}-${index}`} className={`${index ? '-ml-3' : ''} relative flex size-14 overflow-hidden rounded-xl border-4 border-white bg-slate-100`}>
          <img src={image} alt="" className="size-full object-cover" />
        </span>
      ))}
      {remaining > 0 ? <span className="-ml-3 flex size-14 items-center justify-center rounded-xl border-4 border-white bg-slate-100 text-xs font-bold text-slate-500">+{remaining}</span> : null}
    </div>
  )
}

function OrderActions({ order, onOpen, onTrack, viewMode }) {
  const canTrack = viewMode === 'cards'
    ? order.status === 'Processing' || order.status === 'Cancelled'
    : order.status === 'Processing' || order.status === 'Delivered'
  const showInfo = viewMode === 'list' && order.status === 'Cancelled'
  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
      {canTrack ? <button type="button" onClick={() => onTrack(order)} className="flex-1 rounded-full bg-slate-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-600 sm:flex-none">Track order</button> : null}
      <button type="button" onClick={() => onOpen(order.id)} className={`flex-1 rounded-full px-5 py-2.5 text-xs font-bold transition sm:flex-none ${showInfo ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-auth-primary text-white hover:bg-auth-primary-hover'}`}>{showInfo ? 'View Info' : 'View Details'}</button>
    </div>
  )
}

function OrderCard({ order, onOpen, onTrack }) {
  return (
    <article className="min-w-0 w-full max-w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-950">Order #{order.id}</h3><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${statusStyles[order.status]}`}>{order.status}</span></div><p className="mt-1.5 text-xs text-slate-500">{order.date}</p></div>
      </div>
      <div className="mt-5 flex min-w-0 items-center gap-3 sm:gap-4">
        <ProductStack images={order.images} remaining={Math.max(0, order.items - order.images.length)} />
        <div className="min-w-0 border-l border-slate-200 pl-4"><p className="truncate text-sm font-semibold text-slate-900">{order.title}</p><p className="mt-1 truncate text-xs text-slate-500">{order.delivery}</p></div>
      </div>
      <div className="mt-5 flex flex-col items-start gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[0.68rem] font-medium text-slate-500">{order.items} {order.items === 1 ? 'Item' : 'Items'} • Total Amount</p><p className="mt-1 text-xl font-bold tracking-tight text-slate-950">{currency.format(order.amount)}</p></div>
        <OrderActions order={order} onOpen={onOpen} onTrack={onTrack} viewMode="cards" />
      </div>
    </article>
  )
}

function OrderListRow({ order, onOpen, onTrack }) {
  return (
    <article className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:border-auth-primary/25 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-950">Order #{order.id}</h3><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${statusStyles[order.status]}`}>{order.status}</span></div>
        <p className="mt-1.5 text-xs text-slate-500">{order.date}</p>
        <div className="mt-4 grid min-w-0 gap-5 border-t border-slate-100 pt-4 lg:grid-cols-[minmax(16rem,1.25fr)_minmax(9rem,0.6fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3"><ProductStack images={order.images} remaining={Math.max(0, order.items - order.images.length)} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{order.title}</p><p className="mt-1 truncate text-xs text-slate-500">{order.delivery}</p></div></div>
          <div><p className="text-[0.68rem] font-medium text-slate-500">{order.items} {order.items === 1 ? 'Item' : 'Items'} • Total Amount</p><p className="mt-1 text-xl font-bold tracking-tight text-slate-950">{currency.format(order.amount)}</p></div>
          <OrderActions order={order} onOpen={onOpen} onTrack={onTrack} viewMode="list" />
        </div>
      </div>
    </article>
  )
}

function TrackOrderModal({ order, onClose }) {
  if (!order) return null
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true" aria-labelledby="track-order-title">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><span className="flex size-11 items-center justify-center rounded-full bg-emerald-100"><CircleCheck className="size-7" /></span></span>
        <h2 id="track-order-title" className="mt-6 text-2xl font-bold text-slate-950">Track Order</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">You can successfully track and manage your order <strong className="text-slate-700">#{order.id}</strong> in the associated application.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50">Cancel</button><button type="button" onClick={onClose} className="rounded-xl bg-auth-primary px-5 py-3.5 font-bold text-white transition hover:bg-auth-primary-hover">Go To app</button></div>
      </div>
    </div>
  )
}

function OrdersList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All Orders')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [trackingOrder, setTrackingOrder] = useState(null)
  const sourceOrders = viewMode === 'cards' ? cardOrders : orders
  const visibleOrders = useMemo(() => sourceOrders.filter((order) => {
    const matchesStatus = filter === 'All Orders' || order.status === filter
    const needle = search.trim().toLowerCase()
    return matchesStatus && (!needle || `${order.id} ${order.title} ${order.delivery}`.toLowerCase().includes(needle))
  }), [filter, search, sourceOrders])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Link to="/" className="transition hover:text-auth-primary">Home</Link><ChevronRight className="size-3.5" /><span className="font-semibold text-slate-900">Orders</span></nav>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-950">Orders</h2><p className="mt-2 text-sm text-slate-500">Track, view and manage all your orders in one place.</p></div>
        <label className="flex h-14 w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] xl:max-w-xl"><Search className="size-4 text-slate-500" /><span className="sr-only">Search orders</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, products, or order numbers" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" /></label>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">{['All Orders', 'Processing', 'Delivered', 'Cancelled'].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${filter === item ? 'bg-auth-primary text-white' : 'bg-white text-slate-600 hover:bg-red-50 hover:text-auth-primary'}`}>{item}</button>)}</div>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs font-bold text-slate-600"><span>Sort by:</span><select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"><option>All</option><option>Newest first</option><option>Highest amount</option></select></label><div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" aria-label="Order view"><button type="button" onClick={() => setViewMode('cards')} aria-pressed={viewMode === 'cards'} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === 'cards' ? 'bg-red-50 text-auth-primary' : 'text-slate-500 hover:bg-slate-50'}`}><Grid2X2 className="size-4" />Cards</button><button type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === 'list' ? 'bg-red-50 text-auth-primary' : 'text-slate-500 hover:bg-slate-50'}`}><List className="size-4" />List</button></div></div>
      </div>
      {visibleOrders.length ? <div className={`mt-5 grid gap-5 ${viewMode === 'cards' ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>{visibleOrders.map((order) => viewMode === 'cards' ? <OrderCard key={order.recordKey ?? order.id} order={order} onOpen={(id) => navigate(`/account/orders/${id}`)} onTrack={setTrackingOrder} /> : <OrderListRow key={order.id} order={order} onOpen={(id) => navigate(`/account/orders/${id}`)} onTrack={setTrackingOrder} />)}</div> : <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center"><Package className="size-10 text-slate-300" /><h3 className="mt-4 font-bold text-slate-900">No matching orders</h3><p className="mt-1 text-sm text-slate-500">Try another status or search term.</p></div>}
      <div className="mt-7 flex items-center justify-center gap-2"><button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400"><ChevronLeft className="size-4" /></button><button className="size-9 rounded-lg bg-auth-primary text-sm font-bold text-white">1</button><button className="size-9 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white">2</button><button className="size-9 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white">3</button><span className="px-1 text-slate-400">…</span><button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"><ChevronRight className="size-4" /></button></div>
      <TrackOrderModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
    </section>
  )
}

function OrderDetails({ id }) {
  const order = orders.find((item) => item.id === id) ?? orders[0]
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const products = [
    { name: 'Iphone 17', detail: 'Color: Natural space grey   Storage: 256GB', price: 16, oldPrice: 36.42, quantity: 4, subtotal: 60, image: phoneImage },
    { name: 'Swatch Watch', detail: 'Color: Phantom Black   Storage: 128GB', price: 20, oldPrice: 57.42, quantity: 5, subtotal: 100, image: homeImage },
    { name: 'Polo Shirt', detail: 'Color: Obsidian   Storage: 256GB', price: 25, quantity: 6, subtotal: 30, image: decorImage },
    { name: 'JBL Headset', detail: 'Color: Eternal Green   Storage: 256GB', price: 18, quantity: 4, subtotal: 90, image: kitchenImage },
  ]
  const steps = [
    { title: 'Order Placed', icon: ClipboardList, done: true },
    { title: 'Confirmed', icon: Box, done: true },
    { title: 'Preparing', icon: Clock3, done: true },
    { title: 'Out For Delivery', icon: Bike, active: true },
    { title: 'Delivered', icon: Check },
  ]
  return (
    <section>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><Link to="/" className="hover:text-auth-primary">Home</Link><ChevronRight className="size-3.5" /><Link to="/account/orders" className="font-semibold text-slate-700 hover:text-auth-primary">Orders</Link><ChevronRight className="size-3.5" /><span className="font-bold text-slate-900">#{order.id}</span></nav>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-3xl font-bold tracking-tight text-slate-950">Order #{order.id}</h2><p className="mt-2 text-xl font-bold text-slate-700">Estimated Delivery: July 20, 2026</p></div><div className="flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover"><Download className="size-4" />Download Invoice</button><button className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200">Cancel Request</button></div></div>
      <div className="mt-10"><h3 className="text-2xl font-semibold text-slate-900">Order Status</h3><ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-5 sm:gap-0">{steps.map((step, index) => { const Icon = step.icon; return <li key={step.title} className="relative flex items-center gap-4 sm:flex-col sm:items-start"><span className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-auth-primary bg-auth-primary text-white' : step.active ? 'border-auth-primary bg-red-50 text-auth-primary' : 'border-slate-200 bg-slate-100 text-slate-400'}`}><Icon className="size-5" /></span>{index < steps.length - 1 ? <span className={`absolute left-6 top-12 h-[calc(100%+0.25rem)] w-0.5 sm:left-12 sm:top-6 sm:h-0.5 sm:w-[calc(100%-3rem)] ${step.done ? 'bg-auth-primary' : 'bg-slate-200'}`} /> : null}<span className="text-sm font-semibold text-slate-800 sm:mt-3">{step.title}</span></li> })}</ol></div>
      <div className="mt-12 overflow-x-auto rounded-t-lg"><div className="min-w-190"><div className="grid grid-cols-[minmax(22rem,1.5fr)_0.55fr_0.6fr_0.55fr] gap-4 bg-auth-primary px-5 py-5 text-sm font-bold text-white"><span>Product</span><span>Price</span><span>Quantity</span><span className="text-right">Subtotal</span></div><div className="divide-y divide-slate-200 bg-white">{products.map((product) => <div key={product.name} className="grid grid-cols-[minmax(22rem,1.5fr)_0.55fr_0.6fr_0.55fr] gap-4 px-5 py-8 sm:items-center"><div className="flex items-center gap-4"><input type="checkbox" aria-label={`Select ${product.name}`} className="size-4 rounded border-slate-300 accent-auth-primary" /><img src={product.image} alt="" className="size-20 rounded-lg border border-red-200 object-cover" /><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900">{product.name}</h3>{product.name === 'JBL Headset' ? <Share2 className="size-3.5" /> : null}</div><p className="mt-1 text-[0.68rem] text-slate-500">{product.detail}</p><span className="mt-2 inline-block rounded-lg bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold text-emerald-700">Free Delivery</span><div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem]"><a href="#store" className="font-semibold text-auth-primary underline">Spintex China Store</a><span className="flex items-center text-auth-primary">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="size-2.5 fill-current" />)}</span><span className="text-slate-500">(91)</span></div><div className="mt-2 flex gap-3 text-[0.65rem] font-semibold text-slate-800 underline"><button>Buy Again</button><button>Return Item</button><button>Leave Review</button></div></div></div><div><p className="font-bold text-slate-800">{currency.format(product.price)}</p>{product.oldPrice ? <p className="mt-2 text-[0.65rem] text-slate-400 line-through">{currency.format(product.oldPrice)}</p> : null}</div><div className="inline-flex w-fit items-center gap-4 rounded-full bg-slate-50 px-4 py-2 text-sm"><button className="text-slate-400">−</button><span className="font-bold text-auth-primary">{product.quantity}</span><button className="text-auth-primary">＋</button></div><p className="text-right font-bold text-slate-900">{currency.format(product.subtotal)}</p></div>)}</div></div></div>
    </section>
  )
}

export default function AccountOrdersPanel() {
  const { pathname } = useLocation()
  const id = pathname.split('/account/orders/')[1]
  return id ? <OrderDetails id={decodeURIComponent(id)} /> : <OrdersList />
}
