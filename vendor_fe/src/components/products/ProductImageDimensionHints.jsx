import { CheckCircle2, Info } from 'lucide-react'

export function ProductImageDimensionGuidance({
  title,
  description,
  guidance,
  footer,
}) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 ring-1 ring-sky-100">
          <Info className="size-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Target</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{guidance.label}</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Accepted width</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {guidance.minWidth}–{guidance.maxWidth} px
              </p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Accepted height</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {guidance.minHeight}–{guidance.maxHeight} px
              </p>
            </div>
          </div>
          {footer && (
            <p className="mt-3 text-[0.6875rem] leading-relaxed text-slate-500">{footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProductImageDimensionBadge({ width, height, evaluateFn }) {
  if (!width || !height) {
    return (
      <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[0.5625rem] font-semibold text-white">
        Checking…
      </span>
    )
  }

  const result = evaluateFn(width, height)
  const toneClass = result.status === 'ideal'
    ? 'bg-emerald-600'
    : result.status === 'acceptable'
      ? 'bg-amber-500'
      : 'bg-red-600'

  return (
    <span className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[0.5625rem] font-semibold text-white ${toneClass}`}>
      {result.dimensionLabel}
    </span>
  )
}

export function ProductImageDimensionLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] text-slate-500">
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="size-3.5 text-emerald-600" />
        Green = close to target
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="size-2 rounded-full bg-amber-500" />
        Amber = acceptable
      </span>
    </div>
  )
}
