import { BadgePercent, Link2, Sparkles } from 'lucide-react'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'

/** Shows the effective "customer pays" price for a variant, noting whether it inherits or overrides the base product's pricing. */
export default function VariantPricingSummary({ variantValue, productValues }) {
  const pricing = resolveVariantPricing(variantValue, productValues)
  const note = pricing.hasSaleOverride
    ? 'Custom sale price set for this value'
    : pricing.isInherited
      ? 'Inherits the base product\'s regular price'
      : 'Custom regular price set for this value'
  const saleNote = !pricing.hasSaleOverride && pricing.isSaleInherited && pricing.hasDiscount
    ? ' · sale % carried over from base discount'
    : ''
  const percentOff = pricing.hasDiscount
    ? Math.round(((pricing.listPrice - pricing.salePrice) / pricing.listPrice) * 100)
    : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand-light/40 via-white to-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">Customer pays</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-extrabold leading-none tracking-tight text-slate-950">
                GH₵ {formatMoney(pricing.hasDiscount ? pricing.salePrice : pricing.listPrice)}
              </span>
              {pricing.hasDiscount && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  GH₵ {formatMoney(pricing.listPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {pricing.hasDiscount && (
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] sm:self-center">
            <BadgePercent className="size-3.5" />
            {percentOff}% OFF
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-brand/10 bg-white/60 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
        <Link2 className="size-3 shrink-0 text-brand/60" />
        <span>{note}{saleNote}</span>
      </div>
    </div>
  )
}
