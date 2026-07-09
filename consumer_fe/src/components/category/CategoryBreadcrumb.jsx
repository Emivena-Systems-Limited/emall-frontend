import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router'

function BreadcrumbSeparator() {
  return <ChevronRight className="size-3.5 shrink-0 text-slate-300" strokeWidth={2.5} aria-hidden />
}

export default function CategoryBreadcrumb({ categoryLabel, categoryHref, subcategoryLabel }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
          >
            <Home className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>Home</span>
          </Link>
        </li>

        <li aria-hidden className="flex items-center">
          <BreadcrumbSeparator />
        </li>

        {subcategoryLabel ? (
          <>
            <li>
              <Link
                to={categoryHref}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
              >
                {categoryLabel}
              </Link>
            </li>
            <li aria-hidden className="flex items-center">
              <BreadcrumbSeparator />
            </li>
            <li aria-current="page">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 sm:text-sm">
                {subcategoryLabel}
              </span>
            </li>
          </>
        ) : (
          <li aria-current="page">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 sm:text-sm">
              {categoryLabel}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}
