import { AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react'
import AttributeIcon from './AttributeIcon'
import { resolveStockStatus } from './variantFormUtils'

/** Card shown in the add-variant flow for each value, before and after its details are saved. */
export default function VariantValueDraftCard({ attribute, value, persistedEntry, onEdit, onRemove, isRemoving }) {
  if (persistedEntry) {
    const { variantValue } = persistedEntry
    const stock = resolveStockStatus(variantValue.quantity, variantValue.low_stock_threshold)
    const thumbnail = variantValue.images?.[0]?.preview
    const hasPrice = variantValue.price !== '' && variantValue.price != null
    const hasSale = variantValue.discount_price !== '' && variantValue.discount_price != null

    return (
      <article className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_4px_24px_rgba(15,23,42,0.06),0_12px_40px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_8px_32px_rgba(15,23,42,0.1),0_20px_48px_rgba(199,59,45,0.08)] sm:p-4">
        <div className="mx-auto size-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
          {thumbnail ? (
            <img src={thumbnail} alt={value} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <AttributeIcon attribute={attribute} className="size-5 text-brand/40" />
            </div>
          )}
        </div>

        <div className="mt-3 min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-slate-900">{value}</p>
          <div className="mt-2 flex flex-col items-center gap-1.5">
            {hasPrice && (
              <span className="text-xs font-semibold text-slate-700">
                {hasSale ? (
                  <>
                    <span className="whitespace-nowrap text-brand">
                      GH₵ {Number(variantValue.discount_price).toFixed(2)}
                    </span>{' '}
                    <span className="whitespace-nowrap text-slate-400 line-through">
                      GH₵ {Number(variantValue.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">GH₵ {Number(variantValue.price).toFixed(2)}</span>
                )}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${stock.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${stock.dotClass}`} />
              {stock.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              <CheckCircle2 className="size-2.5" /> Ready
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-brand/30 hover:text-brand hover:shadow-md"
            aria-label={`Edit ${value}`}
          >
            <Edit2 className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-100 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Remove ${value}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-dashed border-slate-200 bg-white p-3.5 shadow-[0_4px_24px_rgba(15,23,42,0.05),0_12px_40px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_8px_32px_rgba(15,23,42,0.08),0_20px_48px_rgba(199,59,45,0.06)] sm:p-4">
      <div className="mx-auto flex size-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
        <AttributeIcon attribute={attribute} className="size-5 text-brand/35" />
      </div>

      <div className="mt-3 min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-bold text-slate-900">{value}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
          <AlertTriangle className="size-2.5" /> Needs details
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
        >
          <Edit2 className="size-3.5" /> Add details
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
          aria-label={`Remove ${value}`}
        >
          <Trash2 className="size-3.5" /> Remove
        </button>
      </div>
    </article>
  )
}
