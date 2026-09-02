export default function CategoryStatusBadge({ active, featured = false }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
        active
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-amber-50 text-amber-800 ring-amber-200'
      }`}
      >
        {active ? 'Active' : 'Inactive'}
      </span>
      {featured ? (
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
          Featured
        </span>
      ) : null}
    </span>
  )
}
