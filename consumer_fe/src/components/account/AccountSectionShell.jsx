import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export default function AccountSectionShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  actionLabel,
  actionHref,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">{eyebrow}</p>
          ) : null}
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {Icon ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>

      <div className="px-5 py-6 sm:px-6">{children}</div>

      {actionLabel && actionHref ? (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 text-sm font-bold text-auth-primary hover:underline"
          >
            {actionLabel}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </section>
  )
}
