import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useMiniCart } from '../../context/MiniCartContext'
import { useCartActions } from '../../hooks/useCartActions'
import { selectCartCount, selectCartItems } from '../../store/slices/cartSlice'
import { formatCedi } from '../../utils/formatCurrency'

const drawerEase = [0.16, 1, 0.3, 1]

function clampQuantity(value) {
  return Math.max(1, Number(value) || 1)
}

function MiniQuantityStepper({ value, onChange, disabled = false }) {
  return (
    <div className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-1 ring-1 ring-slate-200/80">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={disabled || value <= 1}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3" strokeWidth={2.5} />
      </button>
      <span className="min-w-5 text-center text-xs font-bold tabular-nums text-slate-800">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="flex size-5 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  )
}

function MiniCartItem({ item, onQuantityChange, onRemove, onNavigate }) {
  const productHref = item.href?.replace(/^\/products\//, '/') ?? '/'
  const lineTotal = item.displaySubtotal ?? (Number(item.price) || 0) * (Number(item.quantity) || 0)

  return (
    <article className="rounded-xl bg-slate-50/90 p-2.5 ring-1 ring-slate-200/60">
      <div className="flex gap-2.5">
        <Link
          to={productHref}
          onClick={onNavigate}
          className="size-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/70"
        >
          <img
            src={item.image}
            alt=""
            className="size-full object-contain p-0.5"
            loading="lazy"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={productHref}
            onClick={onNavigate}
            className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-slate-900 transition-colors hover:text-auth-primary"
          >
            {item.name}
          </Link>
          <p className="mt-0.5 text-xs font-bold tabular-nums text-auth-primary">
            {formatCedi(item.price)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <MiniQuantityStepper
          value={item.quantity}
          onChange={(quantity) => onQuantityChange(item.id, quantity)}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tabular-nums text-slate-700">
            {formatCedi(lineTotal)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
            className="flex size-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary"
          >
            <X className="size-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </article>
  )
}

function EmptyMiniCart({ onClose }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ShoppingBag className="size-6" strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-900">Your cart is empty</p>
      <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-slate-500">
        Add items from product cards to see them here.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 rounded-full bg-auth-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-auth-primary-hover"
      >
        Continue shopping
      </button>
    </div>
  )
}

export default function MiniCartDrawer() {
  const { isOpen, closeMiniCart } = useMiniCart()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const itemCount = useSelector(selectCartCount)
  const { updateQuantity, deleteItem } = useCartActions()

  const subtotal = items.reduce((total, item) => {
    const lineTotal = item.displaySubtotal ?? (Number(item.price) || 0) * (Number(item.quantity) || 0)
    return total + lineTotal
  }, 0)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMiniCart()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeMiniCart])

  const handleViewCart = () => {
    closeMiniCart()
    navigate('/cart')
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-80" role="dialog" aria-modal="true" aria-label="Your cart">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMiniCart}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(100vw-0.75rem,20rem)] flex-col border-l border-slate-200/80 bg-white shadow-[-8px_0_32px_-12px_rgba(15,23,42,0.28)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: drawerEase }}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-auth-primary/10 text-auth-primary">
                  <ShoppingBag className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold tracking-tight text-slate-900">Cart</h2>
                  <p className="text-xs text-slate-500">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMiniCart}
                aria-label="Close cart"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </header>

            {items.length === 0 ? (
              <EmptyMiniCart onClose={closeMiniCart} />
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <MiniCartItem
                          item={item}
                          onQuantityChange={updateQuantity}
                          onRemove={deleteItem}
                          onNavigate={closeMiniCart}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="shrink-0 border-t border-slate-200/80 bg-slate-50/60 px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">Subtotal</span>
                    <span className="text-base font-bold tabular-nums text-slate-900">
                      {formatCedi(subtotal)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[0.6875rem] text-slate-500">
                    Shipping and taxes calculated at checkout.
                  </p>

                  <button
                    type="button"
                    onClick={handleViewCart}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-auth-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
                  >
                    View cart
                    <ArrowRight className="size-4" strokeWidth={2.25} />
                  </button>

                  <button
                    type="button"
                    onClick={closeMiniCart}
                    className="mt-2 w-full py-1 text-center text-xs font-medium text-slate-500 transition-colors hover:text-auth-primary"
                  >
                    Continue shopping
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
