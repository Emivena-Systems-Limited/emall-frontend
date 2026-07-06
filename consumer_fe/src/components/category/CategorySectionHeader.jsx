import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

export default function CategorySectionHeader({
  title,
  viewAllHref,
  viewAllLabel,
  subcategoryCount = 0,
  accent,
}) {
  const resolvedViewAllLabel = viewAllLabel ?? `View ${title}`

  return (
    <div className="flex items-end justify-between gap-3 border-b border-slate-200/90 pb-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            {title}
          </h2>
          {subcategoryCount > 0 && accent?.badge ? (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ${accent.badge}`}>
              {subcategoryCount} subcategories
            </span>
          ) : null}
        </div>
      </div>

      {viewAllHref ? (
        <Link
          to={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-auth-primary sm:px-3.5 sm:py-2 sm:text-sm"
        >
          {resolvedViewAllLabel}
          <ArrowUpRight className="size-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}
