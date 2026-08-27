import GuideStatusBadge from './GuideStatusBadge'

export default function GuideSection({ id, icon: Icon, title, description, badge, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          {Icon ? (
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted">
              <Icon className="size-4" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
              {badge ? <GuideStatusBadge status={badge} /> : null}
            </div>
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">{children}</div>
      </article>
    </section>
  )
}
