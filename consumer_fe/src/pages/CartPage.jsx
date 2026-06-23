import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { cartRelatedProducts, initialCartItems } from '../constants/cartProducts'
import { formatCedi } from '../utils/formatCurrency'

const clampQuantity = (value) => Math.max(1, value)

const cartSeedItems = initialCartItems.map((item, index) => ({
  ...item,
  seller: 'Splinter China Store',
  freeDelivery: true,
  displaySubtotal: [60, 100, 30, 90][index] ?? item.price * item.quantity,
}))

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-7 min-w-23 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={value <= 1}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-6 text-center text-xs font-bold tabular-nums text-auth-primary">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex size-5 items-center justify-center rounded-full text-auth-primary"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function ItemActions({ saved = false, onDelete, onSave }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] font-semibold">
      <button type="button" onClick={onDelete} className="underline hover:text-auth-primary">
        Delete
      </button>
      <button type="button" onClick={onSave} className="underline hover:text-auth-primary">
        {saved ? 'Add to cart' : 'Save For Later'}
      </button>
      <button type="button" className="underline hover:text-auth-primary">
        Share
      </button>
    </div>
  )
}

function CartItemRow({
  item,
  selected,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
}) {
  const subtotal = item.displaySubtotal ?? item.price * item.quantity

  return (
    <article className="grid gap-3 border-b border-slate-200 px-3 py-5 last:border-b-0 sm:px-4 md:grid-cols-[1fr_140px_150px_120px] md:items-center md:gap-4 lg:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
          aria-label={`Select ${item.name}`}
          className="size-3.5 shrink-0 rounded border-slate-300 text-auth-primary focus:ring-auth-primary"
        />
        <img
          src={item.image}
          alt={item.name}
          className="size-16 shrink-0 rounded-md border border-red-100 object-cover sm:size-20"
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-[0.625rem] leading-relaxed text-slate-500">
            Color:{item.variant} <span className="mx-1">Storage:{item.storage}</span>
          </p>
          {item.freeDelivery && (
            <p className="mt-1 w-fit rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[0.5625rem] font-bold text-emerald-700">
              Free Delivery
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1 text-[0.5625rem]">
            <Link to="/" className="font-semibold text-auth-primary underline">
              {item.seller}
            </Link>
            <span className="flex items-center gap-px">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className="size-2.5 text-auth-primary"
                  fill="currentColor"
                  strokeWidth={0}
                />
              ))}
            </span>
            <span className="text-slate-500">(91)</span>
          </div>
          <ItemActions saved={saved} onDelete={onDelete} onSave={onSave} />
        </div>
      </div>

      <div>
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 md:hidden">Price</p>
        <p className="text-sm font-extrabold text-slate-900">{formatCedi(item.price)}</p>
        {item.compareAt && (
          <p className="mt-1 text-[0.5625rem] font-semibold text-slate-400 line-through">
            {formatCedi(item.compareAt)}
          </p>
        )}
      </div>

      <div>
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 md:hidden">Quantity</p>
        <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
      </div>

      <div>
        <p className="mb-1 text-[0.625rem] font-bold uppercase text-slate-400 md:hidden">Subtotal</p>
        <p className="text-sm font-extrabold text-slate-900">{formatCedi(subtotal)}</p>
      </div>
    </article>
  )
}

function ItemTable({
  title,
  subtitle,
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onDelete,
  onSave,
  saved = false,
  clearLabel,
  onClear,
}) {
  return (
    <section aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <div className="mb-4">
        <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-xl font-bold text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="overflow-hidden bg-white">
        <div className="hidden bg-auth-primary px-4 py-4 text-sm font-bold text-white md:grid md:grid-cols-[1fr_140px_150px_120px] md:gap-4 lg:px-5">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
        </div>
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            saved={saved}
            selected={selectedIds.has(item.id)}
            onSelect={(checked) => onSelect(item.id, checked)}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
            onDelete={() => onDelete(item.id)}
            onSave={() => onSave(item.id)}
          />
        ))}
        <div className="flex justify-end px-4 py-5 lg:px-5">
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-slate-400 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-auth-primary hover:text-auth-primary"
          >
            {clearLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

function CartSummary({ itemCount, subtotal, onOpenDelivery }) {
  const tax = 80
  const deliveryFee = 70
  const freeDelivery = 70
  const total = subtotal + tax + deliveryFee - freeDelivery

  return (
    <aside className="rounded-xl bg-white p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-slate-900">Order Total</h2>
      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Items</span>
          <span className="font-bold text-slate-900">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-bold text-slate-900">{formatCedi(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Tax</span>
          <span className="font-bold text-slate-900">{formatCedi(tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Delivery Fee</span>
          <span className="font-bold text-slate-900">{formatCedi(deliveryFee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Free Delivery</span>
          <span className="font-bold text-slate-400 line-through">{formatCedi(freeDelivery)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-300 pt-4 text-base">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-extrabold text-slate-950">{formatCedi(total)}</span>
        </div>
      </div>
      <Link
        to="/checkout"
        className="mt-5 flex w-full items-center justify-center rounded-md bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover"
      >
        Proceed to checkout
      </Link>
      <button
        type="button"
        onClick={onOpenDelivery}
        className="mt-3 block w-full text-right text-[0.625rem] font-semibold text-auth-primary underline"
      >
        View Delivery Information
      </button>
    </aside>
  )
}

function RailProductCard({ product }) {
  const fullStars = Math.floor(product.rating)

  return (
    <article className="min-w-0">
      <Link to={product.href ?? '/cart'} className="group block">
        <span className="relative block aspect-[1.18] overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute left-2 top-2 rounded-sm bg-emerald-500 px-2 py-1 text-[0.5625rem] font-bold text-white">
            Free Delivery
          </span>
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-white">
            <Heart className="size-5" strokeWidth={2.2} />
          </span>
        </span>
        <span className="mt-2 block truncate text-xs font-bold text-slate-900">{product.name}</span>
        <span className="mt-1 block text-sm font-extrabold text-slate-950">{formatCedi(product.price)}</span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`size-3 ${index < fullStars ? 'text-auth-primary' : 'text-slate-300'}`}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
          <span className="text-[0.625rem] text-slate-500">({product.reviewCount})</span>
        </div>
        <Link
          to="/cart"
          aria-label={`Add ${product.name} to cart`}
          className="flex h-7 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-auth-primary hover:bg-auth-primary hover:text-white"
        >
          <ShoppingCart className="size-4" strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  )
}

function ProductRail({ title, products }) {
  return (
    <section className="bg-white px-3 py-4 sm:px-4" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-xl font-bold text-slate-900">
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <RailProductCard key={`${title}-${product.id}`} product={product} />
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <Link
          to="/products"
          className="rounded-full border border-slate-500 px-6 py-2 text-xs font-bold text-slate-600 hover:border-auth-primary hover:text-auth-primary sm:px-8"
        >
          View More Products
        </Link>
      </div>
    </section>
  )
}

function DeliveryModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-5 sm:px-4 sm:py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-6">
          <h2 className="text-xl font-bold text-slate-950 sm:text-3xl">Delivery Information</h2>
          <button type="button" onClick={onClose} aria-label="Close delivery information">
            <X className="size-7 text-black sm:size-9" strokeWidth={2.6} />
          </button>
        </div>

        <div className="grid gap-7 pt-6 text-slate-950 sm:gap-9 sm:pt-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <h3 className="text-lg sm:text-2xl">Delivery Method:</h3>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-2xl">Method of delivery used by seller</p>
            </div>
            <span className="flex size-14 items-center justify-center bg-black text-base font-bold text-white sm:size-16 sm:text-lg">
              Uber
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="text-lg sm:text-2xl">Driver Name:</h3>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-2xl">Name of Delivery driver</p>
            </div>
            <p className="text-xl font-bold text-slate-500 sm:text-2xl">Victor Mensah</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="text-lg sm:text-2xl">Phone Number:</h3>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-2xl">Contact driver via displayed number</p>
            </div>
            <p className="text-xl font-bold text-slate-500 sm:text-2xl">0244123456</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="text-lg sm:text-2xl">Expected Delivery Date</h3>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-2xl">
                Estimated day product is expected to be delivered
              </p>
            </div>
            <p className="text-left text-base font-bold text-slate-500 sm:text-right sm:text-xl">
              Estimated Delivery (1 - 2 days)
              <span className="block font-normal">(23 - 25 June)</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-end gap-4 sm:flex-row">
          <button
            type="button"
            className="w-full rounded-full border-2 border-slate-500 px-8 py-3 text-base font-bold text-slate-500 sm:w-auto sm:px-12 sm:py-4 sm:text-xl"
          >
            Add to Cart
          </button>
          <Link
            to="/checkout"
            className="w-full rounded-full bg-auth-primary px-8 py-3 text-center text-base font-bold text-white sm:w-auto sm:px-9 sm:py-4 sm:text-xl"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const [items, setItems] = useState(cartSeedItems)
  const [savedItems, setSavedItems] = useState(cartSeedItems)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [savedSelectedIds, setSavedSelectedIds] = useState(() => new Set())
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.displaySubtotal ?? item.price * item.quantity), 0),
    [items],
  )

  const updateSelection = (setter) => (itemId, checked) => {
    setter((current) => {
      const next = new Set(current)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }

  const updateQuantity = (setter) => (itemId, quantity) => {
    setter((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, quantity: clampQuantity(quantity), displaySubtotal: item.price * clampQuantity(quantity) }
          : item,
      ),
    )
  }

  const deleteFrom = (setter, selectionSetter) => (itemId) => {
    setter((current) => current.filter((item) => item.id !== itemId))
    selectionSetter((current) => {
      const next = new Set(current)
      next.delete(itemId)
      return next
    })
  }

  const moveToSaved = (itemId) => {
    const item = items.find((current) => current.id === itemId)
    if (!item) return
    setItems((current) => current.filter((current) => current.id !== itemId))
    setSavedItems((current) => (current.some((saved) => saved.id === itemId) ? current : [...current, item]))
  }

  const moveToCart = (itemId) => {
    const item = savedItems.find((current) => current.id === itemId)
    if (!item) return
    setSavedItems((current) => current.filter((current) => current.id !== itemId))
    setItems((current) => (current.some((cartItem) => cartItem.id === itemId) ? current : [...current, item]))
  }

  return (
    <SiteLayout cartCount={items.length}>
      <main className="bg-[#f2f2f2] py-6 sm:py-8">
        <Container className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ItemTable
              title="Shopping Cart"
              subtitle="View your shopping cart and proceed to checkout"
              items={items}
              selectedIds={selectedIds}
              onSelect={updateSelection(setSelectedIds)}
              onQuantityChange={updateQuantity(setItems)}
              onDelete={deleteFrom(setItems, setSelectedIds)}
              onSave={moveToSaved}
              clearLabel="Clear Cart"
              onClear={() => {
                setItems([])
                setSelectedIds(new Set())
              }}
            />

            <div className="pt-14">
              <CartSummary itemCount={items.length} subtotal={subtotal} onOpenDelivery={() => setDeliveryOpen(true)} />
            </div>
          </div>

          <ItemTable
            title="Saved Items"
            subtitle="View your shopping cart and proceed to checkout"
            items={savedItems}
            selectedIds={savedSelectedIds}
            onSelect={updateSelection(setSavedSelectedIds)}
            onQuantityChange={updateQuantity(setSavedItems)}
            onDelete={deleteFrom(setSavedItems, setSavedSelectedIds)}
            onSave={moveToCart}
            saved
            clearLabel="Clear Saved Items"
            onClear={() => {
              setSavedItems([])
              setSavedSelectedIds(new Set())
            }}
          />

          <ProductRail title="Best Deals From Seller" products={cartRelatedProducts} />
          <ProductRail title="Products Related to this Item" products={cartRelatedProducts.slice(1)} />
          <ProductRail title="See Other Amazing Products" products={cartRelatedProducts.slice(2)} />
        </Container>
      </main>

      <DeliveryModal open={deliveryOpen} onClose={() => setDeliveryOpen(false)} />
    </SiteLayout>
  )
}
