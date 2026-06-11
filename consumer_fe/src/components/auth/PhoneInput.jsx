import { Phone } from 'lucide-react'
import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

function GhanaFlag() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true" className="shrink-0 rounded-[2px]">
      <rect width="22" height="16" fill="#CE1126" />
      <rect width="22" height="5.33" y="5.33" fill="#FCD116" />
      <rect width="22" height="5.34" y="10.66" fill="#006B3F" />
      <polygon points="11,5 11.9,7.7 14.8,7.7 12.45,9.35 13.35,12 11,10.35 8.65,12 9.55,9.35 7.2,7.7 10.1,7.7" fill="#000" />
    </svg>
  )
}

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  label = 'Phone number',
  icon = Phone,
}) {
  return (
    <div>
      <FieldLabel htmlFor="phone" label={label} icon={icon} />
      <div
        className={`flex overflow-hidden rounded-xl border bg-white transition-colors ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-slate-200 focus-within:border-auth-primary focus-within:ring-2 focus-within:ring-red-100'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-2.5 py-3 sm:gap-2 sm:px-3 sm:py-3.5">
          <GhanaFlag />
          <span className="text-xs font-medium text-slate-700 sm:text-sm">+233</span>
        </div>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="55 123 4567"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="min-w-0 flex-1 bg-white px-2.5 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:px-3 sm:py-3.5 sm:text-sm"
        />
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
