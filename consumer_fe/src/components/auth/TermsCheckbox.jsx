import { Check } from 'lucide-react'

export default function TermsCheckbox({ checked, onChange, disabled = false }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-slate-600 sm:gap-3.5 sm:text-sm">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="flex size-5 items-center justify-center rounded-[0.4rem] border-2 border-slate-300 bg-white transition-all duration-200 peer-checked:border-auth-primary peer-checked:bg-auth-primary peer-focus-visible:ring-2 peer-focus-visible:ring-auth-primary/30 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 sm:size-4.5"
        >
          <Check
            className={`size-3.5 stroke-3 text-white transition-opacity duration-150 ${
              checked ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        By continuing you agree to E-Mall{' '}
        <button
          type="button"
          className="text-auth-accent underline-offset-2 hover:underline"
        >
          terms and conditions
        </button>
      </span>
    </label>
  )
}
