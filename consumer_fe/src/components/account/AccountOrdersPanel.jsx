import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  MoreVertical,
  Package,
  Search,
  Truck,
  XCircle,
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
  { id: 'ORD-20483', status: 'Out for Delivery', date: 'Jul 18, 2026 • 10:24 AM', title: 'Everyday Essentials', delivery: 'Arriving today', items: 4, amount: 280, images: [phoneImage, decorImage] },
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

function OrderCard({ order, onOpen }) {
  return (
    <article className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-950">Order #{order.id}</h3><span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${statusStyles[order.status]}`}>{order.status}</span></div><p className="mt-1.5 text-xs text-slate-500">{order.date}</p></div>
        <button type="button" aria-label="Order actions" className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><MoreVertical className="size-4" /></button>
      </div>
      <div className="mt-5 flex min-w-0 items-center gap-3 sm:gap-4">
        <ProductStack images={order.images} remaining={Math.max(0, order.items - order.images.length)} />
        <div className="min-w-0 border-l border-slate-200 pl-4"><p className="truncate text-sm font-semibold text-slate-900">{order.title}</p><p className="mt-1 truncate text-xs text-slate-500">{order.delivery}</p></div>
      </div>
      <div className="mt-5 flex flex-col items-start gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[0.68rem] font-medium text-slate-500">{order.items} {order.items === 1 ? 'Item' : 'Items'} • Total Amount</p><p className="mt-1 text-xl font-bold tracking-tight text-slate-950">{currency.format(order.amount)}</p></div>
        <button type="button" onClick={() => onOpen(order.id)} className={`w-full rounded-full px-5 py-2.5 text-xs font-bold transition sm:w-auto ${order.status === 'Cancelled' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-auth-primary text-white hover:bg-auth-primary-hover'}`}>{order.status === 'Cancelled' ? 'View Info' : 'View Details'}</button>
      </div>
    </article>
  )
}

function OrdersList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All Orders')
  const [search, setSearch] = useState('')
  const visibleOrders = useMemo(() => orders.filter((order) => {
    const matchesStatus = filter === 'All Orders' || order.status === filter
    const needle = search.trim().toLowerCase()
    return matchesStatus && (!needle || `${order.id} ${order.title} ${order.delivery}`.toLowerCase().includes(needle))
  }), [filter, search])

  return (
    <section>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Order history</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Orders</h2><p className="mt-2 text-sm text-slate-500">Track, view and manage all your orders in one place.</p></div>
        <label className="flex h-12 w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] xl:max-w-md"><Search className="size-4 text-slate-400" /><span className="sr-only">Search orders</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, products, or order numbers" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" /></label>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">{['All Orders', 'Processing', 'Delivered', 'Cancelled'].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${filter === item ? 'bg-auth-primary text-white' : 'bg-white text-slate-600 hover:bg-red-50 hover:text-auth-primary'}`}>{item}</button>)}</div>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-auth-primary"><option>Sort: All</option><option>Newest first</option><option>Highest amount</option></select>
      </div>
      {visibleOrders.length ? <div className="mt-5 grid gap-4 xl:grid-cols-2">{visibleOrders.map((order) => <OrderCard key={order.id} order={order} onOpen={(id) => navigate(`/account/orders/${id}`)} />)}</div> : <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center"><Package className="size-10 text-slate-300" /><h3 className="mt-4 font-bold text-slate-900">No matching orders</h3><p className="mt-1 text-sm text-slate-500">Try another status or search term.</p></div>}
      <div className="mt-7 flex items-center justify-center gap-2"><button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400"><ChevronLeft className="size-4" /></button><button className="size-9 rounded-lg bg-auth-primary text-sm font-bold text-white">1</button><button className="size-9 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white">2</button><button className="size-9 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white">3</button><span className="px-1 text-slate-400">…</span><button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"><ChevronRight className="size-4" /></button></div>
    </section>
  )
}

function OrderDetails({ id }) {
  const order = orders.find((item) => item.id === id) ?? orders[4]
  const products = [
    { name: 'iPhone 17', detail: 'Natural space grey · 256GB', price: 16, quantity: 4, image: phoneImage },
    { name: 'Smart Watch', detail: 'Phantom Black · 128GB', price: 20, quantity: 5, image: homeImage },
    { name: 'Polo Shirt', detail: 'Obsidian · 256GB', price: 25, quantity: 6, image: decorImage },
    { name: 'JBL Headset', detail: 'Eternal Green · 256GB', price: 18, quantity: 4, image: kitchenImage },
  ]
  const steps = [
    { title: 'Order Placed', text: 'We received your request and started processing.', done: true },
    { title: 'Confirmed', text: 'Order has been verified and confirmed by the partner.', done: true },
    { title: 'Preparing', text: 'Your items are being meticulously packed for transport.', done: true },
    { title: 'Out For Delivery', text: 'A local courier has been assigned for final delivery.', active: true },
    { title: 'Delivered', text: 'Order completion and confirmation.' },
  ]
  return (
    <section>
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm font-bold text-auth-primary hover:underline"><ArrowLeft className="size-4" />Back to orders</Link>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Order details</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Order #{order.id}</h2><p className="mt-2 text-sm font-semibold text-slate-600">Estimated delivery: July 20, 2026</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-auth-primary-hover"><Download className="size-4" />Download invoice</button><button className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-300">Cancel request</button></div></div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="hidden grid-cols-[minmax(0,1.5fr)_0.6fr_0.6fr_0.7fr] gap-4 bg-auth-primary px-5 py-4 text-xs font-bold text-white sm:grid"><span>Product</span><span>Price</span><span>Quantity</span><span className="text-right">Subtotal</span></div><div className="divide-y divide-slate-100">{products.map((product) => <div key={product.name} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1.5fr)_0.6fr_0.6fr_0.7fr] sm:items-center"><div className="flex items-center gap-3"><img src={product.image} alt="" className="size-14 rounded-xl border border-red-100 object-cover" /><div><h3 className="text-sm font-bold text-slate-900">{product.name}</h3><p className="mt-1 text-[0.68rem] text-slate-500">{product.detail}</p><span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-700">Free Delivery</span></div></div><p className="text-sm font-bold text-slate-800">{currency.format(product.price)}</p><span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-auth-primary">{product.quantity}</span><p className="text-right text-sm font-bold text-slate-900">{currency.format(product.price * product.quantity)}</p></div>)}</div></div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><Truck className="size-5" /></span><h3 className="text-lg font-bold text-slate-950">Order status</h3></div><ol className="mt-6">{steps.map((step, index) => <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0"><div className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-auth-primary bg-auth-primary text-white' : step.active ? 'border-auth-primary bg-white text-auth-primary' : 'border-slate-200 bg-white text-slate-300'}`}>{step.done ? <Check className="size-3.5" /> : step.active ? <Clock3 className="size-3.5" /> : <XCircle className="size-3.5" />}</div>{index < steps.length - 1 ? <span className={`absolute left-[0.82rem] top-7 h-[calc(100%-1.75rem)] w-0.5 ${step.done ? 'bg-auth-primary' : 'bg-slate-200'}`} /> : null}<div><div className="flex flex-wrap items-center gap-2"><h4 className={`text-sm font-bold ${step.active || step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</h4>{step.active ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.62rem] font-bold text-amber-700">In transit</span> : null}</div><p className={`mt-1 text-xs leading-5 ${step.active || step.done ? 'text-slate-500' : 'text-slate-300'}`}>{step.text}</p></div></li>)}</ol></aside>
      </div>
    </section>
  )
}

export default function AccountOrdersPanel() {
  const { pathname } = useLocation()
  const id = pathname.split('/account/orders/')[1]
  return id ? <OrderDetails id={decodeURIComponent(id)} /> : <OrdersList />
}
