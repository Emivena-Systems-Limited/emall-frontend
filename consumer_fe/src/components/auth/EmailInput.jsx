import { Mail } from 'lucide-react'
import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

export default function EmailInput({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  label = 'Email address',
  icon = Mail,
}) {
  return (
    <div>
      <FieldLabel htmlFor="email" label={label} icon={icon} />
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-white px-3 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 sm:px-4 sm:py-3.5 sm:text-sm ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-slate-200 focus:border-auth-primary focus:ring-2 focus:ring-red-100'
        } ${disabled ? 'opacity-60' : ''}`}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}
