import { ChevronDown } from 'lucide-react'
import { CHART_YEARS } from '../../constants/dashboardData'

export default function YearDropdown({ value, onChange, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="inline-flex cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-[11px] font-semibold text-slate-600 transition-colors hover:border-cyan-200 hover:text-cyan-700 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        aria-label="Select year"
      >
        {CHART_YEARS.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  )
}
