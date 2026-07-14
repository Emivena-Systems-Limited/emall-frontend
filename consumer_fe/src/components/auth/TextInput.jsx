import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

export default function TextInput({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  placeholder = '',
  autoComplete,
  className = '',
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} icon={icon} />
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 sm:px-3 sm:py-2.5 min-[1800px]:px-5 min-[1800px]:py-4 min-[1800px]:text-base ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-slate-200 focus:border-auth-primary focus:ring-2 focus:ring-red-100'
        } ${disabled ? 'opacity-60' : ''}`}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}
