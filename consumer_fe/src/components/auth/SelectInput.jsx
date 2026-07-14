import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

export default function SelectInput({
  id,
  label,
  icon,
  value,
  onChange,
  error,
  disabled = false,
  options,
  className = '',
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} icon={icon} />
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors sm:px-3 sm:py-2.5 min-[1800px]:px-5 min-[1800px]:py-4 min-[1800px]:text-base ${
            !value ? 'text-slate-400' : ''
          } ${
            error
              ? 'border-red-400 ring-2 ring-red-100'
              : 'border-slate-200 focus:border-auth-primary focus:ring-2 focus:ring-red-100'
          } ${disabled ? 'opacity-60' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
          ▾
        </span>
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
