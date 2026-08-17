import {
  PROFILE_INNER_SURFACE_CLASS,
  PROFILE_SURFACE_CLASS,
  PROFILE_SURFACE_DIVIDER_CLASS,
} from '../../constants/profile'

export default function ProfileSectionCard({ icon: Icon, title, subtitle, children, footer, action }) {
  return (
    <section className={PROFILE_SURFACE_CLASS}>
      <div className={`border-b ${PROFILE_SURFACE_DIVIDER_CLASS} px-5 py-4 sm:px-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand/10">
                <Icon className="size-4" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className={`border-t ${PROFILE_SURFACE_DIVIDER_CLASS} px-5 py-4 sm:px-6`}>{footer}</div>}
    </section>
  )
}

export function ProfileFieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
      {children}
    </label>
  )
}

export function ProfileTextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
          error
            ? 'border-red-300 bg-white text-slate-900 ring-1 ring-red-100'
            : disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500'
              : 'border-slate-300 bg-white text-slate-900 ring-1 ring-slate-200/60'
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function ProfileTextarea({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  rows = 3,
  maxLength,
}) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
          error
            ? 'border-red-300 bg-white text-slate-900 ring-1 ring-red-100'
            : disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500'
              : 'border-slate-300 bg-white text-slate-900 ring-1 ring-slate-200/60'
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function ProfileReadOnlyGrid({ items }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className={`${PROFILE_INNER_SURFACE_CLASS} px-4 py-3`}>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
