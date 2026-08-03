import { LayoutGrid } from 'lucide-react'
import { Link } from 'react-router'

export default function TopCategoryItem({ category }) {
  return (
    <Link
      to={category.href}
      className="@container group flex w-full min-w-0 flex-col items-center gap-[0.375em] text-[clamp(0.625rem,2.5cqi,0.75rem)]"
    >
      <span className="relative mx-auto block aspect-square w-[min(100%,5.5rem)] min-w-0 overflow-hidden rounded-full bg-slate-100 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
        {category.image ? (
          <img
            src={category.image}
            alt={category.label}
            className="size-full min-h-0 min-w-0 object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-linear-to-b from-white to-slate-50">
            <LayoutGrid className="size-[1.75em] text-slate-300" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </span>
      <span className="max-w-full px-0.5 text-center text-[1em] leading-snug font-medium text-slate-700">
        {category.label}
      </span>
    </Link>
  )
}
