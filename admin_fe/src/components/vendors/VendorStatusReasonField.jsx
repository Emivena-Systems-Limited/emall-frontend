import { VENDOR_STATUS_REASON_MAX_LENGTH } from '../../constants/vendors'

export default function VendorStatusReasonField({
  id = 'vendor-status-reason',
  value,
  onChange,
  error,
  disabled = false,
  label = 'Rejection reason',
  hint = 'Shown to the vendor. Maximum 500 characters.',
}) {
  const length = String(value ?? '').length
  const remaining = Math.max(0, VENDOR_STATUS_REASON_MAX_LENGTH - length)

  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className={`text-[11px] tabular-nums ${remaining < 40 ? 'font-medium text-rose-600' : 'text-slate-400'}`}>
          {length}/{VENDOR_STATUS_REASON_MAX_LENGTH}
        </span>
      </span>
      <textarea
        id={id}
        rows={4}
        value={value}
        disabled={disabled}
        maxLength={VENDOR_STATUS_REASON_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Explain why this application is being declined"
        className={`mt-1.5 w-full resize-y rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-brand'
        }`}
      />
      <span className={`mt-1.5 block text-xs ${error ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
        {error || hint}
      </span>
    </label>
  )
}
