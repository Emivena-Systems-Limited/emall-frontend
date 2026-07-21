import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Search,
  Share2,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import phoneImage from '../../assets/images/categories/phones_and_accesories.png'
import homeImage from '../../assets/images/categories/home_and_kitchen.png'
import decorImage from '../../assets/images/categories/home_decor.jpg'
import kitchenImage from '../../assets/images/categories/kitchen_utensils.jpg'
import { notify } from '../../lib/notify'

const initialItems = [
  { id: 'iphone-17', name: 'iPhone 17', color: 'Natural space grey', storage: '256GB', price: 16, oldPrice: 34.42, quantity: 4, image: phoneImage, store: 'Spintex China Store', category: 'Electronics' },
  { id: 'smart-watch', name: 'Smart Watch', color: 'Phantom Black', storage: '128GB', price: 20, oldPrice: 57.82, quantity: 5, image: homeImage, store: 'Spintex China Store', category: 'Electronics' },
  { id: 'polo-shirt', name: 'Polo Shirt', color: 'Obsidian', storage: '256GB', price: 25, oldPrice: 45, quantity: 6, image: decorImage, store: 'Spintex China Store', category: 'Fashion' },
  { id: 'jbl-headset', name: 'JBL Headset', color: 'Eternal Green', storage: '256GB', price: 18, oldPrice: 31, quantity: 4, image: kitchenImage, store: 'Spintex China Store', category: 'Electronics' },
]

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 })

function FilterButton({ children, muted = false, expanded, onClick }) {
  return <button type="button" onClick={onClick} disabled={muted} aria-expanded={expanded} className={`flex w-full items-center justify-between rounded-lg px-1 py-2 text-left text-xs font-bold ${muted ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:text-auth-primary'}`}><span>{children}</span><ChevronDown className={`size-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} /></button>
}

function FilterSection({ label, open, onToggle, children, muted = false }) {
  return (
    <div>
      <FilterButton expanded={open} onClick={onToggle} muted={muted}>{label}</FilterButton>
      <div className={`grid overflow-hidden pl-2 transition-all duration-200 ${open ? 'max-h-52 gap-1 opacity-100' : 'max-h-0 gap-0 opacity-0'}`} aria-hidden={!open}>
        {children}
      </div>
    </div>
  )
}

function FilterOption({ children, active = false, disabled = false, onClick, open }) {
  return <button type="button" disabled={disabled} tabIndex={open ? 0 : -1} onClick={onClick} className={`rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${active ? 'bg-red-50 text-auth-primary' : disabled ? 'cursor-not-allowed text-slate-300' : 'text-slate-500 hover:bg-slate-50'}`}>{children}</button>
}

function Filters({ search, setSearch, category, setCategory, onClear }) {
  const [openGroups, setOpenGroups] = useState({})
  const [selectedFilters, setSelectedFilters] = useState({})
  const toggleGroup = (group) => setOpenGroups((current) => ({ ...current, [group]: !current[group] }))
  const selectFilter = (group, value) => setSelectedFilters((current) => ({ ...current, [group]: value }))
  const clearAllFilters = () => { setOpenGroups({}); setSelectedFilters({}); onClear() }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:sticky lg:top-5 lg:self-start">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><SlidersHorizontal className="size-4" /></span><div><h3 className="text-base font-bold text-slate-950">Filters</h3><p className="text-[0.68rem] text-slate-500">Narrow your wishlist</p></div></div>
      <label className="mt-4 grid gap-2 text-xs font-bold text-slate-700"><span>Search</span><span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-auth-primary"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product name" className="min-w-0 flex-1 bg-transparent font-normal outline-none" /><Search className="size-4 text-slate-400" /></span></label>
      <div className="mt-4 space-y-1">
        <FilterSection label="Categories" open={Boolean(openGroups.categories)} onToggle={() => toggleGroup('categories')}>{['All', 'Electronics', 'Fashion'].map((item) => <FilterOption key={item} open={Boolean(openGroups.categories)} active={category === item} onClick={() => setCategory(item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Sub-categories" open={Boolean(openGroups.subcategories)} onToggle={() => toggleGroup('subcategories')}>{(category === 'Fashion' ? ['Clothing', 'Shoes', 'Accessories'] : category === 'Electronics' ? ['Phones', 'Audio', 'Wearables'] : ['Select a category first']).map((item) => <FilterOption key={item} open={Boolean(openGroups.subcategories)} disabled={category === 'All'} active={selectedFilters.subcategories === item} onClick={() => selectFilter('subcategories', item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Promotional Deals" open={Boolean(openGroups.deals)} onToggle={() => toggleGroup('deals')}>{['On sale', 'Free delivery', 'New arrivals'].map((item) => <FilterOption key={item} open={Boolean(openGroups.deals)} active={selectedFilters.deals === item} onClick={() => selectFilter('deals', item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Brand" open={Boolean(openGroups.brand)} onToggle={() => toggleGroup('brand')}>{['Apple', 'Samsung', 'JBL'].map((item) => <FilterOption key={item} open={Boolean(openGroups.brand)} active={selectedFilters.brand === item} onClick={() => selectFilter('brand', item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Color" open={Boolean(openGroups.color)} onToggle={() => toggleGroup('color')}>{['Black', 'Grey', 'Green'].map((item) => <FilterOption key={item} open={Boolean(openGroups.color)} active={selectedFilters.color === item} onClick={() => selectFilter('color', item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Size" open={Boolean(openGroups.size)} onToggle={() => toggleGroup('size')}>{['Small', 'Medium', 'Large'].map((item) => <FilterOption key={item} open={Boolean(openGroups.size)} active={selectedFilters.size === item} onClick={() => selectFilter('size', item)}>{item}</FilterOption>)}</FilterSection>
        <FilterSection label="Price" open={Boolean(openGroups.price)} onToggle={() => toggleGroup('price')}>{['Under GH₵50', 'GH₵50 – GH₵200', 'Above GH₵200'].map((item) => <FilterOption key={item} open={Boolean(openGroups.price)} active={selectedFilters.price === item} onClick={() => selectFilter('price', item)}>{item}</FilterOption>)}</FilterSection>
      </div>
      <label className="mt-3 grid gap-2 text-xs font-bold text-slate-700"><span>Stores</span><select className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-auth-primary"><option>All Stores</option><option>Spintex China Store</option></select></label>
      <button type="button" onClick={clearAllFilters} className="mt-5 w-full rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-100">Clear All</button>
    </aside>
  )
}

function EmptyWishlist() {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center">
      <span className="relative flex size-24 items-center justify-center rounded-full bg-red-50 text-auth-primary"><Heart className="size-10" /><span className="absolute right-2 top-1 flex size-7 items-center justify-center rounded-full bg-white shadow"><Plus className="size-4" /></span></span>
      <h3 className="mt-5 text-xl font-bold text-slate-950">Your wishlist is empty</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Save items you love and find them here anytime.</p>
      <Link to="/products" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover">Continue Shopping<ChevronRight className="size-4" /></Link>
    </div>
  )
}

function WishlistItem({ item, selected, onSelect, onDelete, onQuantity }) {
  return (
    <article className={`grid gap-4 border-b border-slate-100 p-4 transition last:border-b-0 sm:grid-cols-[auto_minmax(0,1.45fr)_0.55fr_0.7fr_0.65fr] sm:items-center sm:p-5 ${selected ? 'bg-red-50/50' : 'bg-white hover:bg-slate-50/60'}`}>
      <input type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} aria-label={`Select ${item.name}`} className="size-4 accent-auth-primary" />
      <div className="flex min-w-0 items-center gap-4"><img src={item.image} alt="" className="size-20 shrink-0 rounded-xl border border-red-100 object-cover" /><div className="min-w-0"><h3 className="truncate text-sm font-bold text-slate-950">{item.name}</h3><p className="mt-1 truncate text-[0.68rem] text-slate-500">Color: {item.color} · Storage: {item.storage}</p><span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-1 text-[0.62rem] font-bold text-emerald-700">Free Delivery</span><p className="mt-1 text-[0.65rem] font-semibold text-auth-primary underline">{item.store}</p><div className="mt-2 flex flex-wrap gap-3 text-[0.64rem] font-bold text-slate-600"><button onClick={onDelete} className="hover:text-red-600">Delete</button><button onClick={() => notify.success(`${item.name} is ready to add to cart`)} className="hover:text-auth-primary">Add to cart</button><button onClick={() => notify.success('Share link copied')} className="inline-flex items-center gap-1 hover:text-auth-primary">Share<Share2 className="size-3" /></button></div></div></div>
      <div><p className="text-sm font-bold text-slate-900">{currency.format(item.price)}</p><p className="mt-1 text-[0.65rem] text-slate-400 line-through">{currency.format(item.oldPrice)}</p></div>
      <div className="inline-flex w-fit items-center rounded-full bg-slate-50 p-1"><button type="button" onClick={() => onQuantity(Math.max(1, item.quantity - 1))} aria-label={`Decrease ${item.name} quantity`} className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-auth-primary"><Minus className="size-3" /></button><span className="min-w-8 text-center text-xs font-bold text-auth-primary">{item.quantity}</span><button type="button" onClick={() => onQuantity(item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} className="flex size-7 items-center justify-center rounded-full text-auth-primary hover:bg-white"><Plus className="size-3" /></button></div>
      <p className="text-left text-sm font-bold text-slate-950 sm:text-right">{currency.format(item.price * item.quantity)}</p>
    </article>
  )
}

export default function AccountWishlistPanel() {
  const [items, setItems] = useState(initialItems)
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Popular')
  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const result = items.filter((item) => (category === 'All' || item.category === category) && (!needle || `${item.name} ${item.color} ${item.store}`.toLowerCase().includes(needle)))
    return [...result].sort((a, b) => sort === 'Price: Low to High' ? a.price - b.price : sort === 'Price: High to Low' ? b.price - a.price : sort === 'Newest' ? b.id.localeCompare(a.id) : 0)
  }, [items, search, category, sort])
  const removeItems = (ids) => { setItems((current) => current.filter((item) => !ids.includes(item.id))); setSelected((current) => current.filter((id) => !ids.includes(id))) }
  const clearFilters = () => { setSearch(''); setCategory('All'); setSort('Popular') }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Saved products</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">My Wishlist</h2><p className="mt-2 text-sm text-slate-500">Keep track of products you love and move them to your cart when ready.</p></div><label className="flex items-center gap-2 text-xs font-bold text-slate-600"><span>Sort by:</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 font-semibold outline-none focus:border-auth-primary"><option>Popular</option><option>Newest</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Top Rated</option></select></label></div>
      {selected.length ? <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-auth-primary">{selected.length} {selected.length === 1 ? 'item' : 'items'} selected</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => removeItems(selected)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 className="size-4" />Delete</button><button type="button" onClick={() => notify.success(`${selected.length} items are ready to add to cart`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-auth-primary hover:text-auth-primary"><ShoppingCart className="size-4" />Add to Cart</button></div></div> : null}
      <div className="mt-5 grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)]"><Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} onClear={clearFilters} /><div className="min-w-0">{items.length === 0 ? <EmptyWishlist /> : filteredItems.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><div className="hidden grid-cols-[auto_minmax(0,1.45fr)_0.55fr_0.7fr_0.65fr] gap-4 bg-auth-primary px-5 py-4 text-xs font-bold text-white sm:grid"><span className="w-4" /><span>Product</span><span>Price</span><span>Quantity</span><span className="text-right">Subtotal</span></div>{filteredItems.map((item) => <WishlistItem key={item.id} item={item} selected={selected.includes(item.id)} onSelect={(checked) => setSelected((current) => checked ? [...current, item.id] : current.filter((id) => id !== item.id))} onDelete={() => removeItems([item.id])} onQuantity={(quantity) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity } : entry))} />)}<div className="flex justify-end p-4"><button type="button" onClick={() => { setItems([]); setSelected([]) }} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600">Clear Wishlist</button></div></div> : <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center"><Search className="size-9 text-slate-300" /><h3 className="mt-4 font-bold text-slate-900">No matching products</h3><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p><button onClick={clearFilters} className="mt-4 text-sm font-bold text-auth-primary hover:underline">Clear filters</button></div>}</div></div>
    </section>
  )
}
