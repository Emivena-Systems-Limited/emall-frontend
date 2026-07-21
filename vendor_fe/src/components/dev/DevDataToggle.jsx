import { Bug } from 'lucide-react'
import { isLocalEnvironment } from '../../utils/environment'

export default function DevDataToggle({
  enabled,
  onChange,
  count,
  label = 'Dummy data',
  ariaLabel = 'Toggle dummy data',
}) {
  if (!isLocalEnvironment()) return null

  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-amber-400 bg-amber-50 px-3 py-2 ring-1 ring-amber-200/60">
      <Bug className="size-3.5 shrink-0 text-amber-700" strokeWidth={2} />
      <span className="text-xs font-semibold text-amber-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          enabled ? 'bg-amber-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      {enabled && typeof count === 'number' && (
        <span className="text-[10px] font-bold tabular-nums text-amber-700">{count}</span>
      )}
    </label>
  )
}
