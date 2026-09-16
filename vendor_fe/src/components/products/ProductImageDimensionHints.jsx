import { CheckCircle2 } from 'lucide-react'
import { FieldHintTooltip } from './ProductFormControls'

export function ImageSectionHeader({ eyebrow, title, hint }) {
  return (
    <div className="mb-3">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">{eyebrow}</p>
      ) : null}
      <h3 className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
        <span>{title}</span>
        <FieldHintTooltip hint={hint} className="w-72" label={`About ${title}`} />
      </h3>
    </div>
  )
}

export function ProductImageDimensionGuidance({ sizeLabel, hint }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700">
        Recommended {sizeLabel}
      </span>
      <FieldHintTooltip hint={hint} className="w-72" label="Recommended image size" />
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
