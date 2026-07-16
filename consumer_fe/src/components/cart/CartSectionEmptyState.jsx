import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export default function CartSectionEmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  ctaLabel = 'Start Shopping',
  ctaHref = '/',
  compact = false,
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white px-5 text-center ${
        compact ? 'min-h-48 py-10 sm:min-h-52 sm:py-12' : 'min-h-56 py-12 sm:min-h-64 sm:py-14'
      }`}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-10 size-36 rounded-full bg-auth-primary/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-14 -left-10 size-40 rounded-full bg-slate-200/70 blur-3xl"
        aria-hidden
      />

      <div className="relative flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-auth-primary ring-1 ring-slate-200 sm:size-16">
        <Icon className="size-7 sm:size-8" strokeWidth={1.5} aria-hidden />
      </div>

      {eyebrow ? (
        <p className="relative mt-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
          {eyebrow}
        </p>
      ) : null}

      <h3 className="relative mt-2 text-base font-bold tracking-tight text-slate-950 sm:text-lg">
        {title}
      </h3>
      <p className="relative mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      <Link
        to={ctaHref}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
      >
        {ctaLabel}
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  )
}
