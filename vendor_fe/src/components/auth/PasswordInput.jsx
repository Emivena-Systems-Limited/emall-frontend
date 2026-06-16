import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FieldError from './FieldError'

export default function PasswordInput({
  id,
  name,
  label,
  icon: Icon,
  placeholder = '',
  autoComplete,
  disabled = false,
  value,
  onChange,
  onBlur,
  error,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div data-field={name}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon && <Icon className="size-4 text-slate-400" strokeWidth={1.75} />}
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
            error
              ? 'border-red-400 ring-2 ring-red-100'
              : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-light'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
