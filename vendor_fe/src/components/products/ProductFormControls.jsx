import FieldError from '../auth/FieldError'

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
      {title ? <h3 className="mt-1 text-sm font-bold text-slate-900">{title}</h3> : null}
      {description ? (
        <p className="mt-1 max-w-xl text-xs text-slate-500">{description}</p>
      ) : null}
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

function Label({ id, label, hint, reserveHintSpace = false, optional = false }) {
  return (
    <label htmlFor={id} className="mb-1.5 block">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {optional ? <OptionalBadge /> : null}
      </span>
      <FormFieldHint hint={hint} reserveHintSpace={reserveHintSpace} />
    </label>
  )
}

export function ProductInput({
  id,
  label,
  hint,
  error,
  reserveHintSpace = false,
  optional = false,
  ...props
}) {
  return (
    <div data-field={props.name}>
      <Label
        id={id}
        label={label}
        hint={hint}
        reserveHintSpace={reserveHintSpace}
        optional={optional}
      />
      <input
        id={id}
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
  reserveHintSpace = false,
  optional = false,
  ...props
}) {
  return (
    <ProductInput
      id={id}
      label={label}
      hint={hint}
      error={error}
      reserveHintSpace={reserveHintSpace}
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
