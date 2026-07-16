import { ArrowRight, Sparkles, Tag } from 'lucide-react'
import { Link } from 'react-router'

export default function PromotionsProductsEmptyState({ categoryLabel }) {
  const label = categoryLabel ?? 'all categories'

  return (
    <div className="relative flex min-h-72 flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 text-center sm:min-h-88 sm:px-10 sm:py-16 lg:min-h-104">
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-[#C9A227]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 size-44 rounded-full bg-[#FFF4C2] blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <div
          className="absolute -inset-3 rounded-[1.75rem] bg-[#C9A227]/10"
          aria-hidden
        />
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-white text-[#C9A227] shadow-sm shadow-[#C9A227]/15 ring-1 ring-[#E8D48A] sm:size-24">
          <Tag className="size-9 sm:size-10" strokeWidth={1.5} aria-hidden />
        </div>
        <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-auth-primary text-white shadow-sm sm:size-8">
          <Sparkles className="size-3.5 sm:size-4" strokeWidth={2} aria-hidden />
        </span>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7B1A]">
        Deals incoming
      </p>
      <h3 className="mt-2 max-w-lg text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        No promotions for {label} yet
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-[0.9375rem]">
        Fresh deals and limited-time offers are on the way. Check back soon or browse every
        promotion across the store.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <Link
          to="/promotions"
          className="inline-flex items-center gap-2 rounded-full bg-auth-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-auth-primary/20 transition-colors hover:bg-auth-primary-hover"
        >
          View All Promotions
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </Link>
        <Link
          to="/categories"
          className="text-sm font-medium text-slate-600 transition-colors hover:text-auth-primary"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  )
}
