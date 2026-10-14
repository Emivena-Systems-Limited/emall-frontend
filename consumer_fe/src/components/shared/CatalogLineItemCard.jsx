import { Link } from 'react-router'
import { Check, Minus, Plus, Truck } from 'lucide-react'
import { formatCedi } from '../../utils/formatCurrency'

function QuantityStepper({ value, onChange, disabled = false }) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-0.5">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-6 text-center text-xs font-semibold tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function ItemPrice({ lineTotal, unitPrice, comparePrice }) {
  const showUnit = unitPrice != null && lineTotal != null && Number(lineTotal) !== Number(unitPrice)
  const showCompare = comparePrice != null && Number(comparePrice) > Number(unitPrice ?? lineTotal)

  return (
    <div className="min-w-20 text-right">
      <p className="text-base font-bold tabular-nums text-slate-950 sm:text-lg">
        {formatCedi(lineTotal ?? unitPrice ?? 0)}
      </p>
      {showUnit ? (
        <p className="mt-0.5 text-xs tabular-nums text-slate-500">
          {formatCedi(unitPrice)} each
        </p>
      ) : showCompare ? (
        <p className="mt-0.5 text-xs tabular-nums text-slate-400 line-through">
          {formatCedi(comparePrice)}
        </p>
      ) : null}
    </div>
  )
}

function ActionButton({ action }) {
  const className = `inline-flex cursor-pointer items-center gap-1.5 px-2 text-xs text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-wait disabled:opacity-60 sm:px-2.5 ${action.className ?? ''}`
  const Icon = action.icon

  const content = (
    <>
      {Icon ? <Icon className="size-3.5" strokeWidth={1.75} /> : null}
      {action.label}
    </>
  )

  if (action.to) {
    return (
      <Link
        to={action.to}
        state={action.state}
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        action.onClick?.(event)
      }}
      disabled={action.disabled}
      className={className}
    >
      {content}
    </button>
  )
}

function ActionRow({ actions = [] }) {
  if (!actions.length) return null

  return (
    <div className="flex flex-wrap items-center max-md:w-full max-md:justify-between">
      {actions.map((action, index) => (
        <span key={action.id ?? action.label} className="inline-flex items-center">
          {index > 0 ? <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" /> : null}
          <ActionButton action={action} />
        </span>
      ))}
    </div>
  )
}

/**
 * Cart-style product line card used across account surfaces (wishlist, orders, reviews, returns).
 */
export default function CatalogLineItemCard({
  name,
  href = '/',
  image,
  imageFallback = null,
  optionLabel = '',
  meta = null,
  badges = null,
  freeShipping = false,
  quantity,
  onQuantityChange,
  readOnlyQuantity = false,
  hideQuantity = false,
  unitPrice,
  lineTotal,
  comparePrice,
  selectable = false,
  showCheckboxOnMobile = false,
  selected = false,
  onSelect,
  actions = [],
  footer = null,
  as: As = 'article',
  onClick,
  className = '',
}) {
  const quantityValue = Math.max(1, Number(quantity) || 1)

  const quantityControl = hideQuantity ? null : readOnlyQuantity || !onQuantityChange ? (
    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold tabular-nums text-slate-900">
      {quantityValue}
    </span>
  ) : (
    <QuantityStepper value={quantityValue} onChange={onQuantityChange} />
  )

  const priceBlock = unitPrice != null || lineTotal != null ? (
    <ItemPrice lineTotal={lineTotal} unitPrice={unitPrice} comparePrice={comparePrice} />
  ) : null

  const actionRow = <ActionRow actions={actions} />

  return (
    <As
      className={`rounded-2xl border border-slate-200 bg-white px-3.5 py-4 text-left shadow-sm shadow-slate-200/40 sm:px-5 sm:py-6 ${
        selected ? 'border-auth-primary/30 bg-red-50/20' : ''
      } ${onClick ? 'cursor-pointer transition hover:border-auth-primary/40' : ''} ${className}`}
      onClick={onClick}
      type={As === 'button' ? 'button' : undefined}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        {selectable ? (
          <label
            className={`group relative mt-8 size-5 shrink-0 cursor-pointer items-center justify-center sm:mt-10 ${
              showCheckboxOnMobile ? 'inline-flex' : 'hidden sm:inline-flex'
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => {
                event.stopPropagation()
                onSelect?.(event.target.checked)
              }}
              aria-label={`Select ${name}`}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex size-4.5 items-center justify-center rounded-[0.3rem] border-2 border-slate-300 bg-white transition-colors duration-200 group-hover:border-nav-red peer-checked:border-nav-red peer-checked:bg-nav-red peer-focus-visible:ring-2 peer-focus-visible:ring-nav-red/35 peer-focus-visible:ring-offset-2"
            >
              <Check
                className={`size-3 stroke-3 text-white transition-opacity duration-150 ${
                  selected ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </span>
          </label>
        ) : null}

        <Link
          to={href}
          aria-label={name}
          className="shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="size-[4.5rem] rounded-xl bg-slate-50 object-contain sm:size-28 sm:rounded-2xl"
            />
          ) : (
            <span className="flex size-[4.5rem] items-center justify-center rounded-xl bg-slate-50 text-slate-300 sm:size-28 sm:rounded-2xl">
              {imageFallback}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0">
            <Link
              to={href}
              onClick={(event) => event.stopPropagation()}
              className="block text-sm font-semibold leading-snug text-slate-950 line-clamp-2 wrap-anywhere hover:text-nav-red sm:text-base"
            >
              {name}
            </Link>
            {optionLabel ? <p className="mt-1 text-xs text-slate-500">{optionLabel}</p> : null}
            {meta}
            {badges}
            {freeShipping ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-600">
                <Truck className="size-3" strokeWidth={2} />
                Free Shipping
              </p>
            ) : null}
          </div>

          {(quantityControl || priceBlock) ? (
            <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
              {quantityControl}
              {priceBlock}
            </div>
          ) : null}

          <div className="mt-auto hidden items-end justify-between gap-5 pt-5 sm:flex">
            {actionRow}
            <div className="flex shrink-0 items-center justify-end gap-5">
              {quantityControl}
              {priceBlock}
            </div>
          </div>
        </div>
      </div>

      {actions.length ? (
        <div className="mt-3 border-t border-slate-100 pt-3 sm:hidden">
          {actionRow}
        </div>
      ) : null}

      {footer}
    </As>
  )
}
