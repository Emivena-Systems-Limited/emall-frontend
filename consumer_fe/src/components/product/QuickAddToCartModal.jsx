import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import VariantOptionRow from './VariantOptionRow'
import { useCartActions } from '../../hooks/useCartActions'
import { useQuickAddCatalog } from '../../hooks/useQuickAddCatalog'
import { notify } from '../../lib/notify'
import { formatCedi } from '../../utils/formatCurrency'
import { calculateDisplayDiscountPercent } from '../../utils/productPricing'
import { isSameVariantOption } from '../../utils/productVariantFields'
import { useSelector } from 'react-redux'
import { isProductInCart, selectCartItems } from '../../store/slices/cartSlice'

function isColorAttribute(key = '', label = '') {
  return /color|colour/i.test(String(key)) || /color|colour/i.test(String(label))
}

function groupHasImageForValue(images = {}, value) {
  if (images[value]) return true
  return Object.entries(images).some(([key, url]) => (
    Boolean(url) && isSameVariantOption(key, value)
  ))
}

function resolveGroupPresentation(group, { allowImages = true } = {}) {
  if (!allowImages) return 'chips'

  const values = group?.values ?? []
  const images = group?.images ?? {}
  if (values.length === 0) return 'chips'

  const everyValueHasImage = values.every((value) => groupHasImageForValue(images, value))
  if (everyValueHasImage) return 'images'
  if (isColorAttribute(group?.key, group?.label) && values.some((value) => groupHasImageForValue(images, value))) {
    return 'images'
  }
  return 'chips'
}

function useDialogChrome({ open, dialogRef, onClose }) {
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    previousFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFirst = () => {
      const node = dialogRef.current
      if (!node) return
      const targets = node.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
      const first = [...targets].find((item) => item.getAttribute('aria-label') !== 'Close dialog') ?? targets[0]
      first?.focus()
    }
    const frame = window.requestAnimationFrame(focusFirst)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus?.()
    }
  }, [open, dialogRef, onClose])
}

function StockBadge({ outOfStock, stockCount, lowStockThreshold }) {
  if (outOfStock) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-[0.6875rem] font-bold text-red-600">Out of stock</span>
  }
  if (stockCount <= lowStockThreshold) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[0.6875rem] font-bold text-amber-800">
        Only {stockCount} left
      </span>
    )
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6875rem] font-bold text-emerald-700">In stock</span>
}

function QuantityStepper({ value, onChange, max, disabled }) {
  return (
    <div className="inline-flex h-11 items-center rounded-full bg-slate-100 p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-auth-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums text-slate-950">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-9 items-center justify-center rounded-full text-auth-primary transition hover:bg-white focus-visible:ring-2 focus-visible:ring-auth-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function QuickAddSkeleton() {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden px-5 pb-4 sm:grid-cols-[minmax(13rem,0.85fr)_minmax(0,1.15fr)] sm:grid-rows-1 sm:px-6"
      aria-hidden="true"
    >
      <div className="h-44 shrink-0 animate-pulse rounded-2xl bg-slate-100 sm:aspect-square sm:h-auto sm:max-h-full" />
      <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-50" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-50" />
      </div>
    </div>
  )
}

export default function QuickAddToCartModal({ open, product, onClose, onAdded }) {
  const dialogRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart } = useCartActions()
  const cartItems = useSelector(selectCartItems)
  const {
    productQuery,
    catalog,
    families,
    isMultiFamily,
    activeFamilyId,
    familyPrimary,
    visibleSecondaries,
    visibleOptionGroups,
    selectedOptions,
    selectedSecondary,
    selectFamilyPrimary,
    selectFamilySecondary,
    selectOption,
    activeVariant,
    pricing,
    previewImage,
    stockCount,
    lowStockThreshold,
    outOfStock,
    maxQuantity,
    quantity,
    setQuantity,
    selectedLabel,
  } = useQuickAddCatalog({ open, cardProduct: product })

  useDialogChrome({ open, dialogRef, onClose })

  const discountPercent = calculateDisplayDiscountPercent(pricing.compareAt, pricing.price)
  const unitPrice = pricing.price ?? 0
  const subtotal = unitPrice * quantity
  const detailsHref = product?.href?.replace(/^\/products\//, '/') || (catalog?.slug ? `/${catalog.slug}` : '')
  const variantInCart = isProductInCart(cartItems, product, {
    productId: catalog?.id ?? product?.backendId ?? product?.id,
    variantId: activeVariant?.id ?? null,
  })
  const canSubmit = (!catalog?.variants?.length || Boolean(activeVariant?.id))
    && !isAdding
    && !justAdded

  const addedTimerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(addedTimerRef.current), [])

  const handleAdd = async () => {
    if (!canSubmit) {
      if (catalog?.variants?.length && !activeVariant?.id) {
        notify.error('Please choose an option before adding to cart.')
      }
      return
    }

    setIsAdding(true)
    try {
      const item = await addToCart(product, {
        silentSuccess: true,
        productId: catalog?.id ?? product?.backendId ?? product?.id,
        syncable: Boolean(catalog?.id ?? product?.backendId ?? product?.id),
        quantity,
        price: unitPrice,
        compareAt: pricing.compareAt,
        variantId: activeVariant?.id ?? null,
        product_variant_id: activeVariant?.id ?? null,
        sku: activeVariant?.sku,
        variant: selectedLabel || activeVariant?.variant_name || product?.variant,
        image: previewImage || product?.image,
        variantImage: previewImage || null,
        variantRecord: activeVariant,
      })
      if (!item) return
      setJustAdded(true)
      addedTimerRef.current = window.setTimeout(() => {
        onAdded?.()
        onClose()
        setJustAdded(false)
      }, 700)
    } finally {
      setIsAdding(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[145] flex items-end justify-center sm:items-center sm:p-5">
          <motion.button
            type="button"
            aria-label="Close add to cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative flex h-[min(94dvh,44rem)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.22)] sm:h-[min(88dvh,40rem)] sm:max-w-3xl sm:rounded-3xl sm:shadow-2xl"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden />

            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-3 sm:px-6 sm:pt-5">
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-auth-primary">Quick add</p>
                <h2 id="quick-add-title" className="mt-1 truncate text-lg font-bold text-slate-950">
                  {catalog?.name ?? product?.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-auth-primary/40"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {productQuery.isPending ? <QuickAddSkeleton /> : null}

              {productQuery.isError ? (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-10 text-center sm:px-6">
                  <p className="text-sm font-semibold text-slate-800">Couldn&apos;t load this product&apos;s options.</p>
                  <button
                    type="button"
                    onClick={() => productQuery.refetch()}
                    className="mt-4 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-auth-primary/40"
                  >
                    Try again
                  </button>
                </div>
              ) : null}

              {catalog && !productQuery.isPending ? (
                <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden px-5 pb-4 sm:grid-cols-[minmax(13rem,0.85fr)_minmax(0,1.15fr)] sm:grid-rows-1 sm:px-6">
                  <div className="relative h-44 shrink-0 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100 sm:aspect-square sm:h-auto sm:max-h-full">
                    <img
                      src={previewImage}
                      alt=""
                      className="size-full object-contain p-3 transition duration-300 sm:p-4"
                    />
                    {discountPercent ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#f5d020] px-2.5 py-1 text-[0.6875rem] font-bold text-slate-950">
                        {discountPercent}% off
                      </span>
                    ) : null}
                  </div>

                  <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain pb-2">
                    <div className="flex flex-wrap items-end gap-2">
                      <p className="text-2xl font-extrabold tabular-nums text-slate-950">{formatCedi(unitPrice)}</p>
                      {pricing.compareAt != null && pricing.compareAt > unitPrice ? (
                        <p className="pb-0.5 text-sm text-slate-400 line-through tabular-nums">
                          {formatCedi(pricing.compareAt)}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StockBadge
                        outOfStock={outOfStock}
                        stockCount={stockCount}
                        lowStockThreshold={lowStockThreshold}
                      />
                      {activeVariant?.sku ? (
                        <span className="truncate text-[0.6875rem] font-semibold text-slate-500">
                          SKU {activeVariant.sku}
                        </span>
                      ) : null}
                    </div>
                    {selectedLabel ? (
                      <p className="mt-2 text-sm font-semibold text-slate-700">{selectedLabel}</p>
                    ) : null}

                    {isMultiFamily ? families.map((family, familyIdx) => {
                      const isActive = activeFamilyId === family.id
                      const selectedPrimary = isActive ? (familyPrimary[family.id] ?? '') : ''
                      return (
                        <div key={family.id}>
                          {familyIdx > 0 ? (
                            <div className="my-2 flex items-center gap-2">
                              <div className="h-px flex-1 bg-slate-100" />
                              <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-slate-400">or</span>
                              <div className="h-px flex-1 bg-slate-100" />
                            </div>
                          ) : null}
                          <VariantOptionRow
                            label={family.primaryLabel}
                            values={family.primaryValues}
                            images={family.primaryImages}
                            selected={selectedPrimary}
                            onSelect={(value) => selectFamilyPrimary(family.id, value)}
                            presentation={resolveGroupPresentation({
                              key: family.primaryKey,
                              label: family.primaryLabel,
                              values: family.primaryValues,
                              images: family.primaryImages,
                            })}
                          />
                          {isActive
                            ? visibleSecondaries.map((group) => (
                              <VariantOptionRow
                                key={group.key}
                                label={group.label}
                                values={group.values}
                                selected={selectedSecondary[group.key] ?? ''}
                                onSelect={(value) => selectFamilySecondary(family.id, group.key, value)}
                                presentation="chips"
                              />
                            ))
                            : null}
                        </div>
                      )
                    }) : visibleOptionGroups.map((group, index) => (
                      <VariantOptionRow
                        key={group.key}
                        label={group.label}
                        values={group.values}
                        images={index === 0 ? group.images : undefined}
                        selected={selectedOptions[group.key] ?? ''}
                        onSelect={(value) => selectOption(group.key, value)}
                        presentation={resolveGroupPresentation(group, { allowImages: index === 0 })}
                      />
                    ))}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-950">Quantity</p>
                        <p className="text-[0.6875rem] text-slate-500">Max {maxQuantity}</p>
                      </div>
                      <QuantityStepper
                        value={quantity}
                        onChange={setQuantity}
                        max={maxQuantity}
                        disabled={outOfStock}
                      />
                    </div>

                    {variantInCart ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                        This option is already in your cart. Adding again increases the quantity.
                      </p>
                    ) : null}

                    {detailsHref ? (
                      <Link
                        to={detailsHref}
                        onClick={onClose}
                        className="mt-4 inline-flex text-xs font-bold text-auth-primary hover:underline focus-visible:ring-2 focus-visible:ring-auth-primary/40"
                      >
                        View full product details
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
              <button
                type="button"
                disabled={!canSubmit && !justAdded}
                onClick={handleAdd}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-auth-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(199,59,45,0.8)] transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-auth-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {justAdded ? (
                  <>
                    <Check className="size-4" />
                    Added
                  </>
                ) : isAdding ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    Add {quantity} to cart · {formatCedi(subtotal)}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
