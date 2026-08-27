const TONES = {
  live: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  partial: 'bg-amber-50 text-amber-800 ring-amber-200',
  mock: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const LABELS = {
  live: 'Live API',
  partial: 'Partial',
  mock: 'Mock',
}

export default function GuideStatusBadge({ status = 'live' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${TONES[status] ?? TONES.mock}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
