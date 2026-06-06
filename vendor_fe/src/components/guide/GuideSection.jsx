export default function GuideSection({ id, icon: Icon, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-slate-200 pb-12 last:border-b-0">
      <div className="mb-6 flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Icon className="size-4" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
