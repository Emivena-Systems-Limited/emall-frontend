import { ChevronDown } from 'lucide-react'

const SELECT_CLASS =
  'inline-flex max-w-[11.5rem] cursor-pointer appearance-none truncate rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-[11px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light'

export default function ChartSelect({ id, value, options, onChange, label }) {
  return (
    <div className="relative shrink-0">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASS}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  )
}
