import { PackageSearch } from 'lucide-react'
import { Link } from 'react-router'

export default function CategoryProductsEmptyState({ categoryLabel }) {
  return (
    <div className="flex min-h-112 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center sm:py-16 lg:min-h-136">
      <div className="flex size-16 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-200 sm:size-20">
        <PackageSearch className="size-8 sm:size-9" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900 sm:text-xl">No products yet</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-[0.9375rem]">
        {categoryLabel
          ? `We're stocking up the ${categoryLabel} collection.`
          : "We're stocking up this collection."}{' '}
        Check back soon or explore other categories in the meantime.
      </p>
      <Link
        to="/categories"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-auth-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
      >
        Browse All Categories
      </Link>
    </div>
  )
}
