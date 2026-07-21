import { Edit2, Package, Tag, Trash2 } from 'lucide-react'
import { resolveStockStatus } from './variantFormUtils'

export default function VariantCard({ variation, variantValue, onEdit, onRemove }) {
  const stock = resolveStockStatus(variantValue.quantity, variantValue.low_stock_threshold)
  const thumbnail = variantValue.images?.[0]?.preview
  const hasPrice = variantValue.price !== '' && variantValue.price != null
  const hasSale = variantValue.discount_price !== '' && variantValue.discount_price != null
  const displayName = variantValue.variant_name || variantValue.value || '—'

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md sm:flex sm:items-center sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 sm:size-16">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-slate-50">
              <Package className="size-5 text-slate-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1.5">
            <p className="text-sm font-bold leading-snug text-slate-900 sm:text-base">
              {displayName}
            </p>
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-100">
              <Tag className="size-2.5 shrink-0" />
              <span className="truncate">
                {variation.attribute}: {variantValue.value}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            {variantValue.sku ? (
              <span className="text-xs text-slate-400">SKU: {variantValue.sku}</span>
            ) : null}
            {hasPrice && (
              <span className="text-xs font-semibold text-slate-700">
                {hasSale ? (
                  <>
                    <span className="whitespace-nowrap text-brand">
                      GH₵ {Number(variantValue.discount_price).toFixed(2)}
                    </span>
                    {' '}
                    <span className="whitespace-nowrap text-slate-400 line-through">
                      GH₵ {Number(variantValue.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">
                    GH₵ {Number(variantValue.price).toFixed(2)}
                  </span>
                )}
              </span>
            )}
            <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${stock.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${stock.dotClass}`} />
              {stock.label}
            </span>
          </div>
        </div>
      </div>

      {/* Actions — full width on mobile, inline on sm+ */}
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 sm:mt-0 sm:w-auto sm:shrink-0 sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand sm:flex-none sm:rounded-lg sm:py-1.5"
          aria-label={`Edit ${displayName} variant`}
        >
          <Edit2 className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 sm:flex-none sm:rounded-lg sm:py-1.5"
          aria-label={`Remove ${displayName} variant`}
        >
          <Trash2 className="size-3.5" />
          Remove
        </button>
      </div>
    </div>
  )
}
