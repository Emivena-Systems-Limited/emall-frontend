export default function CardStepHeader({ step, title, subtitle, required = false }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
        {step}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-slate-900">
          {title}
          {required && (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-100">
              Required
            </span>
          )}
        </p>
        {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}
