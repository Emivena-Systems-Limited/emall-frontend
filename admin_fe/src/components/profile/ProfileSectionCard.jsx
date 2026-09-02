export default function ProfileSectionCard({ icon: Icon, title, subtitle, children, footer, action }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
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
      <div className="flex-1 px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className="mt-auto border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</div>}
    </section>
  )
}

export function ProfileFieldLabel({ children, htmlFor, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
      {children}
      {hint && <span className="ml-1.5 font-medium text-slate-400">{hint}</span>}
    </label>
  )
}

export function ProfileTextInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  autoComplete,
}) {
  const describedBy = error ? `${id}-error` : undefined

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
        error
          ? 'border-red-400 ring-2 ring-red-100'
          : disabled
            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-500'
            : 'border-slate-200 bg-white text-slate-900'
      }`}
    />
  )
}
