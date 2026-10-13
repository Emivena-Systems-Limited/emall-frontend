import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import VariantOptionRow from './VariantOptionRow'
import { useCartActions } from '../../hooks/useCartActions'
import { useQuickAddCatalog } from '../../hooks/useQuickAddCatalog'
import { notify } from '../../lib/notify'
import { formatCedi } from '../../utils/formatCurrency'
import { calculateDisplayDiscountPercent } from '../../utils/productPricing'
import { isSameVariantOption } from '../../utils/productVariantFields'
import { useSelector } from 'react-redux'
import { isProductInCart, selectCartItems } from '../../store/slices/cartSlice'
import { resolveBrandName } from '../../utils/productVariantFields'

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
    return <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[0.625rem] font-bold text-red-600">Out of stock</span>
  }
  if (stockCount <= lowStockThreshold) {
    return (
      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[0.625rem] font-bold text-amber-800">
        Only {stockCount} left
      </span>
    )
  }
  return (
    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">
      {stockCount} in stock
    </span>
  )
}

function QuantityStepper({ value, onChange, max, disabled }) {
  return (
    <div className="inline-flex h-12 shrink-0 items-center rounded-xl bg-slate-100 p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-auth-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus className="size-4" strokeWidth={2.25} />
      </button>
      <span className="min-w-7 text-center text-sm font-bold tabular-nums text-slate-950">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-10 items-center justify-center rounded-lg text-nav-red transition hover:bg-white focus-visible:ring-2 focus-visible:ring-auth-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  )
}

function QuickAddSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex gap-3.5">
        <div className="size-[4.5rem] shrink-0 animate-pulse rounded-xl bg-slate-100 sm:size-24" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="h-2.5 w-14 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="h-14 animate-pulse rounded-xl bg-slate-50" />
      <div className="h-9 animate-pulse rounded-full bg-slate-50" />
    </div>
  )
}

export default function QuickAddToCartModal({ open, product, onClose, onAdded }) {
  const dialogRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [addFailed, setAddFailed] = useState(false)
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
  const brandName = resolveBrandName(productQuery.data) || product?.brand || ''
  const unitPrice = pricing.price ?? 0
  const subtotal = unitPrice * quantity
  const detailsHref = product?.href?.replace(/^\/products\//, '/') || (catalog?.slug ? `/${catalog.slug}` : '')
  const variantInCart = isProductInCart(cartItems, product, {
    productId: catalog?.id ?? product?.backendId ?? product?.id,
    variantId: activeVariant?.id ?? null,
  })
  const canSubmit = (!catalog?.variants?.length || Boolean(activeVariant?.id))
    && !isAdding

  const simpleStartedRef = useRef(false)
  const handleAddRef = useRef(null)

  const buildSnapshot = () => ({
    name: catalog?.name ?? product?.name,
    image: previewImage || product?.image,
    brand: resolveBrandName(productQuery.data) || product?.brand || '',
    price: unitPrice,
    variantLabel: catalog?.isSimpleListing ? 'Color: Default' : (selectedLabel || 'Color: Default'),
  })

  const handleAdd = async () => {
    if (!canSubmit) {
      if (catalog?.variants?.length && !activeVariant?.id) {
        notify.error('Please choose an option before adding to cart.')
      }
      return false
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
      if (!item) {
        if (catalog?.isSimpleListing) setAddFailed(true)
        return false
      }
      onAdded?.(buildSnapshot())
      onClose()
      return true
    } finally {
      setIsAdding(false)
    }
  }

  handleAddRef.current = handleAdd

  useEffect(() => {
    if (!open) {
      simpleStartedRef.current = false
      setAddFailed(false)
      return
    }
    if (!catalog?.isSimpleListing || simpleStartedRef.current) return
    simpleStartedRef.current = true
    void handleAddRef.current()
  }, [open, catalog?.isSimpleListing, catalog?.id])

  if (typeof document === 'undefined') return null

  const showVariantSheet = Boolean(open && catalog && !catalog.isSimpleListing && !productQuery.isPending)

  return createPortal(
    <AnimatePresence>
      {open && !showVariantSheet ? (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add to cart"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <div
            role="status"
            className="relative flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-2xl"
          >
            {productQuery.isError || addFailed ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">Couldn&apos;t add this item.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <Loader2 className="size-4 animate-spin text-nav-red" />
                <p className="text-sm font-semibold text-slate-800">
                  {productQuery.isPending ? 'Checking options…' : 'Adding to cart…'}
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}

      {showVariantSheet ? (
        <div className="fixed inset-0 z-[145] flex items-end justify-center sm:items-center sm:p-5">
          <motion.button
            type="button"
            aria-label="Close add to cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 440, damping: 36 }}
            className="relative flex max-h-[min(88dvh,36rem)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_24px_64px_-20px_rgba(15,23,42,0.45)] sm:max-w-[26rem] sm:rounded-3xl"
          >
            <div className="relative flex shrink-0 items-center justify-center px-4 pt-2.5 pb-1 sm:pt-3.5 sm:pb-0">
              <div className="h-1 w-9 rounded-full bg-slate-200 sm:hidden" aria-hidden />
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="absolute top-2 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-nav-red/40 sm:top-3 sm:right-3.5"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 sm:px-5 sm:pb-4">
              {productQuery.isPending ? <QuickAddSkeleton /> : null}

              {productQuery.isError ? (
                <div className="px-2 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-800">Couldn&apos;t load this product&apos;s options.</p>
                  <button
                    type="button"
                    onClick={() => productQuery.refetch()}
                    className="mt-4 cursor-pointer rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-nav-red/40"
                  >
                    Try again
                  </button>
                </div>
              ) : null}

              {catalog && !productQuery.isPending ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#f4f5f6] ring-1 ring-slate-200/70 sm:size-[5.25rem]">
                      <img
                        src={previewImage}
                        alt=""
                        className="size-full object-contain p-1.5 transition duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1 pr-6 pt-0.5">
                      {brandName ? (
                        <p className="truncate text-[0.625rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                          {brandName}
                        </p>
                      ) : null}
                      <h2 id="quick-add-title" className="mt-0.5 line-clamp-2 text-[0.9375rem] leading-snug font-bold text-slate-950 sm:text-base">
                        {catalog?.name ?? product?.name}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-base font-extrabold tabular-nums text-slate-950 sm:text-lg">
                          {formatCedi(unitPrice)}
                        </p>
                        {pricing.compareAt != null && pricing.compareAt > unitPrice ? (
                          <p className="text-xs text-slate-400 line-through tabular-nums">
                            {formatCedi(pricing.compareAt)}
                          </p>
                        ) : null}
                        {discountPercent ? (
                          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[0.625rem] font-bold text-nav-red">
                            -{discountPercent}%
                          </span>
                        ) : null}
                        <StockBadge
                          outOfStock={outOfStock}
                          stockCount={stockCount}
                          lowStockThreshold={lowStockThreshold}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-1">
                    {isMultiFamily ? families.map((family, familyIdx) => {
                      const isActive = activeFamilyId === family.id
                      const selectedPrimary = isActive ? (familyPrimary[family.id] ?? '') : ''
                      return (
                        <div key={family.id}>
                          {familyIdx > 0 ? (
                            <div className="my-2.5 flex items-center gap-2">
                              <div className="h-px flex-1 bg-slate-100" />
                              <span className="text-[0.625rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">or</span>
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
                            size="compact"
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
                                size="compact"
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
                        size="compact"
                      />
                    ))}
                  </div>

                  {variantInCart ? (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[0.6875rem] font-semibold leading-snug text-slate-600">
                      This option is already in your cart. Adding again increases the quantity.
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-3.5 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  max={maxQuantity}
                  disabled={outOfStock}
                />
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleAdd}
                  className="flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-nav-red px-3 text-[0.8125rem] font-semibold text-white transition hover:bg-nav-red-deep focus-visible:ring-2 focus-visible:ring-nav-red/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-4 shrink-0" />
                      <span className="truncate">Add · {formatCedi(subtotal)}</span>
                    </>
                  )}
                </button>
              </div>
              {detailsHref ? (
                <div className="mt-2.5 text-center">
                  <Link
                    to={detailsHref}
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline focus-visible:ring-2 focus-visible:ring-nav-red/40"
                  >
                    View full product details
                  </Link>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
