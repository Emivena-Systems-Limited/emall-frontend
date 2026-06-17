import FieldError from './FieldError'

export default function FormTextarea({
  id,
  name,
  label,
  icon: Icon,
  placeholder = '',
  disabled = false,
  value,
  onChange,
  onBlur,
  error,
  hint,
  maxLength = 100,
  rows = 3,
}) {
  const count = value?.length ?? 0
  const atLimit = count >= maxLength
  const nearLimit = count >= maxLength * 0.85

  return (
    <div data-field={name}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          {Icon && <Icon className="size-4 text-slate-400" strokeWidth={1.75} />}
          {label}
        </label>
        <span
          className={`shrink-0 text-xs tabular-nums ${
            atLimit
              ? 'font-semibold text-red-600'
              : nearLimit
                ? 'font-medium text-amber-600'
                : 'text-slate-400'
          }`}
          aria-live="polite"
        >
          {count}/{maxLength}
        </span>
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <FieldError message={error} />}
    </div>
  )
}
