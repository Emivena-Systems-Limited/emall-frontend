export default function SectionHeading({ step, icon: Icon, title, description }) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-3">
        {step && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 shrink-0 text-brand" strokeWidth={2} />}
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          </div>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-slate-100" />
    </div>
  )
}
