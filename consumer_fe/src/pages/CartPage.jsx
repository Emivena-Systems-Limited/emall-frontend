import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Minus, Plus, ShoppingBag, ShoppingCart, Star, Trash2 } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import { cartRelatedProducts, initialCartItems } from '../constants/cartProducts'
import { formatCedi } from '../utils/formatCurrency'

const clampQuantity = (value) => Math.max(1, value)

function getItemDiscount(item) {
  if (!item.compareAt || item.compareAt <= item.price) return 0
  return (item.compareAt - item.price) * item.quantity
}

function QuantityStepper({ value, onChange }) {
  return (
    <div className="inline-flex h-10 min-w-30 items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={value <= 1}
        className="flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums text-auth-primary">
        {value}
      </span>
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

function SelectionCheckbox({ visible, checked, onChange, label }) {
  return (
    <span className="flex w-7 shrink-0 justify-start">
      {visible && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={label}
          className="size-4 rounded border-slate-300 text-auth-primary focus:ring-auth-primary"
        />
      )}
    </span>
  )
}

function CartItemRow({
  item,
  selectionVisible,
  selected,
  onSelect,
  onQuantityChange,
  onRemove,
}) {
  const subtotal = item.price * item.quantity

  return (
    <article className="grid gap-4 border-b border-slate-200 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_0.45fr_0.55fr_0.45fr_0.25fr] lg:items-center lg:gap-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <SelectionCheckbox
          visible={selectionVisible}
          checked={selected}
          onChange={onSelect}
          label={`Select ${item.name}`}
        />
        <img
          src={item.image}
          alt={item.name}
          className="size-20 shrink-0 rounded-lg border border-red-100 object-cover sm:size-22"
        />
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Color: {item.variant}
            <span className="mx-1.5 text-slate-300">|</span>
            Storage: {item.storage}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:contents">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">Price</p>
          <p className="font-bold text-slate-900">{formatCedi(item.price)}</p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">Qty</p>
          <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">Subtotal</p>
          <p className="font-bold text-slate-900">{formatCedi(subtotal)}</p>
        </div>

        <div className="flex items-start justify-end sm:justify-start">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

function CartSummary({ itemCount, subtotal, discount }) {
  const total = Math.max(subtotal - discount, 0)

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold text-slate-900">Order Total</h2>
      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Items in cart</span>
          <span className="font-bold text-slate-900">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-bold text-slate-900">{formatCedi(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Discount</span>
          <span className="font-bold text-red-600">-{formatCedi(discount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-base">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-extrabold text-slate-950">{formatCedi(total)}</span>
        </div>
      </div>
      <button
        type="button"
        disabled={itemCount === 0}
        className="mt-5 w-full rounded-xl bg-auth-primary px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        Proceed to checkout
      </button>
    </aside>
  )
}

function RelatedProductCard({ product }) {
  const fullStars = Math.floor(product.rating)

  return (
    <article className="w-52 shrink-0 sm:w-58">
      <Link to="/cart" className="group block">
        <span className="block aspect-[1.45] overflow-hidden rounded-lg bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </span>
        <span className="mt-2 flex items-start justify-between gap-3">
          <span className="min-w-0 truncate text-base font-bold text-slate-900">
            {product.name}
          </span>
          <span className="shrink-0 text-base font-bold text-slate-900">
            {formatCedi(product.price)}
          </span>
        </span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-3.5 ${index < fullStars ? 'text-auth-primary' : 'text-slate-300'}`}
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">({product.reviewCount})</span>
        </div>
        <Link
          to="/cart"
          aria-label={`Add ${product.name} to cart`}
          className="flex h-8 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-auth-primary hover:bg-auth-primary hover:text-white"
        >
          <ShoppingCart className="size-4" strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  )
}

export default function CartPage() {
  const [items, setItems] = useState(initialCartItems)
  const [selectionVisible, setSelectionVisible] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = items.reduce((sum, item) => sum + getItemDiscount(item), 0)
    return { subtotal, discount }
  }, [items])

  const selectAllActive = selectionVisible && selectedIds.size === items.length && items.length > 0

  const handleToggleSelectAll = () => {
    if (selectAllActive) {
      setSelectedIds(new Set())
      setSelectionVisible(false)
      return
    }

    setSelectionVisible(true)
    setSelectedIds(new Set(items.map((item) => item.id)))
  }

  const updateQuantity = (itemId, quantity) => {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity: clampQuantity(quantity) } : item)),
    )
  }

  const removeItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
    setSelectedIds((current) => {
      const next = new Set(current)
      next.delete(itemId)
      return next
    })
  }

  const updateSelection = (itemId, checked) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }

  return (
    <SiteLayout cartCount={items.length}>
      <section className="bg-white py-7 sm:py-9 lg:py-11">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                My Cart
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                View your shopping cart and proceed to checkout
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              disabled={items.length === 0}
              className="inline-flex w-full items-center justify-center rounded-full border border-auth-primary px-4 py-2.5 text-sm font-bold text-auth-primary transition-colors hover:bg-auth-primary hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:w-auto"
            >
              {selectAllActive ? 'Deselect all items' : 'Select all items'}
            </button>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0">
              <div className="hidden rounded-t-xl bg-auth-primary px-5 py-4 text-sm font-bold text-white lg:grid lg:grid-cols-[minmax(0,1.4fr)_0.45fr_0.55fr_0.45fr_0.25fr] lg:gap-5">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
                <span className="sr-only">Actions</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:rounded-t-none lg:border-t-0">
                {items.length > 0 ? (
                  items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      selectionVisible={selectionVisible}
                      selected={selectedIds.has(item.id)}
                      onSelect={(checked) => updateSelection(item.id, checked)}
                      onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-auth-primary">
                      <ShoppingBag className="size-7" />
                    </span>
                    <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Browse the homepage and tap any product to return here.
                    </p>
                    <Link
                      to="/"
                      className="mt-5 inline-flex rounded-full bg-auth-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover"
                    >
                      Continue shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <CartSummary itemCount={items.length} subtotal={totals.subtotal} discount={totals.discount} />
          </div>
        </Container>
      </section>

      <section className="bg-white pb-10 sm:pb-14 lg:pb-16" aria-labelledby="cart-related-heading">
        <Container>
          <h2 id="cart-related-heading" className="text-2xl font-extrabold tracking-tight text-slate-950">
            Products Related to this Item
          </h2>

          <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {cartRelatedProducts.map((product) => (
              <RelatedProductCard key={`${product.id}-related`} product={product} />
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              to="/"
              className="inline-flex rounded-full border border-slate-400 px-8 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary"
            >
              View More Products
            </Link>
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
