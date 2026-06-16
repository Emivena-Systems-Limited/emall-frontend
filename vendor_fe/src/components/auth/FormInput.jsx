import FieldError from './FieldError'

export default function FormInput({
  id,
  name,
  label,
  icon: Icon,
  type = 'text',
  placeholder = '',
  autoComplete,
  disabled = false,
  value,
  onChange,
  onBlur,
  error,
  hint,
}) {
  return (
    <div data-field={name}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon && <Icon className="size-4 text-slate-400" strokeWidth={1.75} />}
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
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
