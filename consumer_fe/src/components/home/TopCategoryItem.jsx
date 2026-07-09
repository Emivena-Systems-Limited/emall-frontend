import { LayoutGrid } from 'lucide-react'
import { Link } from 'react-router'

export default function TopCategoryItem({ category }) {
  return (
    <Link
      to={category.href}
      className="group flex w-23 shrink-0 flex-col items-center gap-2.5 sm:w-26"
    >
      <span className="relative block size-19 shrink-0 overflow-hidden rounded-full bg-slate-100 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 sm:size-22 lg:size-23">
        {category.image ? (
          <img
            src={category.image}
            alt={category.label}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-linear-to-b from-white to-slate-50">
            <LayoutGrid className="size-7 text-slate-300" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </span>
      <span className="max-w-23 text-center text-[0.6875rem] leading-snug font-medium text-slate-700 sm:max-w-26 sm:text-xs lg:max-w-22">
        {category.label}
      </span>
    </Link>
  )
}
