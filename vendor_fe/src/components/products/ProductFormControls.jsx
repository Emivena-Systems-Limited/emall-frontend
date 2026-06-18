import FieldError from '../auth/FieldError'

const inputBase = 'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60'
const normalState = 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
const errorState = 'border-red-400 ring-2 ring-red-100'

function Label({ id, label, hint, reserveHintSpace = false }) {
  return (
    <label
      htmlFor={id}
      className={`mb-1.5 block ${reserveHintSpace ? 'min-h-[3.25rem]' : ''}`}
    >
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{hint}</span>
      ) : reserveHintSpace ? (
        <span className="mt-0.5 block text-xs leading-relaxed text-transparent select-none" aria-hidden="true">
          &nbsp;
        </span>
      ) : null}
    </label>
  )
}

export function ProductInput({ id, label, hint, error, reserveHintSpace = false, ...props }) {
  return (
    <div data-field={props.name} className="flex h-full flex-col">
      <Label id={id} label={label} hint={hint} reserveHintSpace={reserveHintSpace} />
      <input
        id={id}
        className={`${inputBase} ${error ? errorState : normalState}`}
        {...props}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}

export function ProductMoneyInput({ id, label, hint, error, reserveHintSpace = false, ...props }) {
  return (
    <ProductInput
      id={id}
      label={label}
      hint={hint}
      error={error}
      reserveHintSpace={reserveHintSpace}
      type="number"
      step="0.01"
      min="0"
      inputMode="decimal"
      placeholder="0.00"
      {...props}
    />
  )
}

export function ProductTextarea({ id, label, hint, error, rows = 5, ...props }) {
  return (
    <div data-field={props.name}>
      <Label id={id} label={label} hint={hint} />
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

export function ProductSelect({ id, label, hint, error, options = [], placeholder, ...props }) {
  return (
    <div data-field={props.name}>
      <Label id={id} label={label} hint={hint} />
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
