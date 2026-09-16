import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp } from 'lucide-react'
import FieldError from '../auth/FieldError'

const TOOLTIP_GAP = 8
const VIEWPORT_PAD = 8

/**
 * Click-to-open tooltip card that sits next to a field label.
 * Portaled to the document so overflow-hidden parents cannot clip it.
 * Closes on: second click, click outside, or Escape key.
 */
export function FieldHintTooltip({ hint, label = 'Show field hint', className = 'w-56' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const close = () => {
    setOpen(false)
    setCoords(null)
  }

  useLayoutEffect(() => {
    if (!open) return undefined

    const place = () => {
      const trigger = triggerRef.current
      const tooltip = tooltipRef.current
      if (!trigger || !tooltip) return

      const triggerRect = trigger.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()

      let left = triggerRect.left
      if (left + tooltipRect.width > window.innerWidth - VIEWPORT_PAD) {
        left = triggerRect.right - tooltipRect.width
      }
      left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - tooltipRect.width - VIEWPORT_PAD))

      let top = triggerRect.bottom + TOOLTIP_GAP
      if (top + tooltipRect.height > window.innerHeight - VIEWPORT_PAD) {
        top = triggerRect.top - tooltipRect.height - TOOLTIP_GAP
      }
      top = Math.max(VIEWPORT_PAD, top)

      setCoords({ top, left })
    }

    const frame = window.requestAnimationFrame(place)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, hint])

  useEffect(() => {
    if (!open) return undefined
    const handleOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return
      if (tooltipRef.current?.contains(e.target)) return
      close()
    }
    const handleKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!hint) return null

  return (
    <span className="inline-flex shrink-0 items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (open) close()
          else setOpen(true)
        }}
        aria-label={label}
        aria-expanded={open}
        className={`inline-flex cursor-pointer items-center justify-center rounded-full transition-colors ${
          open
            ? 'text-brand'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <CircleHelp className="size-3.5" strokeWidth={2} />
      </button>
      {open && createPortal(
        <span
          ref={tooltipRef}
          role="tooltip"
          style={{
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
            visibility: coords ? 'visible' : 'hidden',
          }}
          className={`fixed z-[120] rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.12)] ${className}`}
        >
          <span className="block text-xs leading-relaxed text-slate-600">{hint}</span>
        </span>,
        document.body,
      )}
    </span>
  )
}

/** Keeps hint rows aligned in multi-column grids without adding gap above inputs. */
export const FORM_FIELD_HINT_RESERVE_CLASS = 'min-h-9'

export const OPTIONAL_BADGE_CLASS =
  'rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600'

export function OptionalBadge({ className = '' }) {
  return (
    <span className={[OPTIONAL_BADGE_CLASS, className].filter(Boolean).join(' ')}>
      Optional
    </span>
  )
}

export function OptionalSection({ children, className = '', dataField }) {
  return (
    <section
      data-field={dataField}
      className={[
        'rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 sm:p-5',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </section>
  )
}

export function OptionalSectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">{eyebrow}</p>
        ) : null}
        <OptionalBadge />
      </div>
      {title ? (
        <h3 className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <span>{title}</span>
          <FieldHintTooltip hint={description} className="w-72" label={`About ${title}`} />
        </h3>
      ) : (
        <FieldHintTooltip hint={description} className="w-72" />
      )}
    </div>
  )
}

export function FormFieldHint({ hint, reserveHintSpace = false }) {
  if (hint) {
    return (
      <span
        className={`mt-0.5 block text-xs leading-snug text-slate-500 ${
          reserveHintSpace ? FORM_FIELD_HINT_RESERVE_CLASS : ''
        }`}
      >
        {hint}
      </span>
    )
  }

  if (reserveHintSpace) {
    return (
      <span
        className={`mt-0.5 block text-xs leading-snug text-transparent select-none ${FORM_FIELD_HINT_RESERVE_CLASS}`}
        aria-hidden="true"
      >
        &nbsp;
      </span>
    )
  }

  return null
}

const inputBase = 'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60'
const normalState = 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
const errorState = 'border-red-400 ring-2 ring-red-100'

function Label({ id, label, hint, optional = false, className = '' }) {
  return (
    <label
      htmlFor={id}
      className={['mb-1.5 block', className].filter(Boolean).join(' ')}
    >
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {optional ? <OptionalBadge /> : null}
        {hint ? <FieldHintTooltip hint={hint} /> : null}
      </span>
    </label>
  )
}

export function ProductInput({
  id,
  label,
  hint,
  error,
  // eslint-disable-next-line no-unused-vars
  reserveHintSpace = false, // retained for API compat — hints are now tooltips
  optional = false,
  dataField,
  ref,
  ...props
}) {
  return (
    <div data-field={dataField ?? props.name} className="flex h-full flex-col">
      <Label
        id={id}
        label={label}
        hint={hint}
        optional={optional}
        className="flex-1"
      />
      <input
        id={id}
        ref={ref}
        className={`${inputBase} ${error ? errorState : normalState}`}
        {...props}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}

export function ProductMoneyInput({
  id,
  label,
  hint,
  error,
  // eslint-disable-next-line no-unused-vars
  reserveHintSpace = false, // retained for API compat
  optional = false,
  ...props
}) {
  return (
    <ProductInput
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      type="number"
      step="0.01"
      min="0"
      inputMode="decimal"
      placeholder="0.00"
      {...props}
    />
  )
}

export function ProductTextarea({ id, label, hint, error, rows = 5, optional = false, ...props }) {
  return (
    <div data-field={props.name}>
      <Label id={id} label={label} hint={hint} optional={optional} />
      <textarea
        id={id}
        rows={rows}
        className={`${inputBase} resize-none leading-relaxed ${error ? errorState : normalState}`}
        {...props}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}

export function ProductSelect({ id, label, hint, error, options = [], placeholder, optional = false, ...props }) {
  return (
    <div data-field={props.name}>
      <Label id={id} label={label} hint={hint} optional={optional} />
      <select
        id={id}
        className={`${inputBase} cursor-pointer appearance-none ${error ? errorState : normalState}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <FieldError message={error} />}
    </div>
  )
}

export function GuidanceCard({ icon: Icon, title, children }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-xl bg-white text-cyan-700 ring-1 ring-slate-200">
            <Icon className="size-4" strokeWidth={2} />
          </span>
        )}
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </aside>
  )
}
