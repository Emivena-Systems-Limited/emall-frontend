import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export default function CategoryBreadcrumb({
  parentLabel,
  parentSlug,
  subcategoryLabel,
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs font-normal text-slate-500">
      <Link to="/" className="shrink-0 transition-colors hover:text-slate-800">
        Home
      </Link>
      <ChevronRight className="size-3 shrink-0 text-slate-300" strokeWidth={2} aria-hidden />
      <Link
        to={`/categories/${parentSlug}`}
        className="truncate transition-colors hover:text-slate-800"
      >
        {parentLabel}
      </Link>
      {subcategoryLabel ? (
        <>
          <ChevronRight className="size-3 shrink-0 text-slate-300" strokeWidth={2} aria-hidden />
          <span className="truncate text-slate-700">{subcategoryLabel}</span>
        </>
      ) : null}
    </nav>
  )
}
