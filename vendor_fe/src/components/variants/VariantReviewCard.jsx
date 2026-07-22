import { BadgePercent, ImageIcon, Link2, Package, Tag } from 'lucide-react'
import AttributeIcon from './AttributeIcon'
import {
  isBlankVariantField,
  resolveStockStatus,
  resolveVariantMinimumThreshold,
} from './variantFormUtils'
import { formatMoney, resolveVariantPricing, calculateDisplayDiscountPercent } from '../../utils/productPricing'

function formatOptionalField(value) {
  if (isBlankVariantField(value) || String(value).trim() === 'N/A') return null
  return String(value).trim()
}

function getVariantPrimaryPreview(variantValue) {
  if (variantValue?.images?.length > 0) return variantValue.images[0].preview
  return variantValue?.image_url || null
}

function formatVariantDimensions(variantValue) {
  const parts = [variantValue.length, variantValue.width, variantValue.height]
    .map((value) => formatOptionalField(value))
    .filter(Boolean)

  return parts.length ? `${parts.join(' × ')} cm` : null
}

function ReviewDetail({ label, value, className = '' }) {
  if (value == null || value === '') return null

  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-xs font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

export default function VariantReviewCard({ attribute, variantValue, productValues }) {
  const pricing = resolveVariantPricing(variantValue, productValues)
  const threshold = resolveVariantMinimumThreshold(variantValue.minimum_threshold)
  const stock = resolveStockStatus(variantValue.quantity, threshold)
  const thumbnail = getVariantPrimaryPreview(variantValue)
  const imageCount = variantValue.images?.length ?? 0
  const displayName = formatOptionalField(variantValue.variant_name) || variantValue.value || '—'
  const sku = formatOptionalField(variantValue.sku)
  const barcode = formatOptionalField(variantValue.barcode)
  const weight = formatOptionalField(variantValue.weight)
  const dimensions = formatVariantDimensions(variantValue)
  const description = formatOptionalField(variantValue.description)
  const reservedQty = formatOptionalField(variantValue.reserved_quantity)
  const quantity = formatOptionalField(variantValue.quantity)
  const thresholdLabel = isBlankVariantField(variantValue.minimum_threshold)
    || String(variantValue.minimum_threshold).trim() === 'N/A'
    ? `${threshold} (default)`
    : String(threshold)

  const pricingNote = pricing.hasSaleOverride
    ? 'Custom sale price'
    : pricing.isInherited
      ? 'Inherits base price'
      : 'Custom price'

  const saleNote = !pricing.hasSaleOverride && pricing.isSaleInherited && pricing.hasDiscount
    ? ' · sale from base discount'
    : ''

  const percentOff = pricing.hasDiscount
    ? (calculateDisplayDiscountPercent(pricing.listPrice, pricing.salePrice) ?? 0)
    : 0

  const compatibleModels = (variantValue.compatible_models ?? [])
    .map((model) => formatOptionalField(model?.name ?? model))
    .filter(Boolean)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="size-20 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 sm:size-24">
            {thumbnail ? (
              <img src={thumbnail} alt={displayName} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <AttributeIcon attribute={attribute} className="size-6 text-brand/35" />
              </div>
            )}
          </div>
          {imageCount > 0 && (
            <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center gap-0.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <ImageIcon className="size-2.5" />
              {imageCount}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-900 sm:text-base">{displayName}</p>
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-100">
              <Tag className="size-2.5 shrink-0" />
              <span className="truncate">
                {attribute}: {variantValue.value}
              </span>
            </span>
          </div>

          <div className="rounded-xl border border-brand/10 bg-gradient-to-br from-brand-light/30 via-white to-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">Customer pays</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-extrabold text-slate-950">
                    GH₵ {formatMoney(pricing.customerPrice)}
                  </span>
                  {pricing.hasDiscount && (
                    <span className="text-xs font-semibold text-slate-400 line-through">
                      GH₵ {formatMoney(pricing.listPrice)}
                    </span>
                  )}
                </div>
              </div>
              {pricing.hasDiscount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">
                  <BadgePercent className="size-3" />
                  {percentOff}% off
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
              <Link2 className="size-3 shrink-0 text-brand/60" />
              {pricingNote}{saleNote}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <ReviewDetail label="SKU" value={sku} />
            <ReviewDetail label="Stock" value={quantity} />
            <ReviewDetail label="Reserved" value={reservedQty} />
            <ReviewDetail label="Low stock alert" value={thresholdLabel} />
            <ReviewDetail
              label="Barcode"
              value={barcode ? `${barcode}${variantValue.barcode_type && variantValue.barcode_type !== 'N/A' ? ` (${variantValue.barcode_type})` : ''}` : null}
            />
            <ReviewDetail label="Weight" value={weight ? `${weight} kg` : null} />
            <ReviewDetail label="Dimensions" value={dimensions} className="sm:col-span-2" />
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${stock.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${stock.dotClass}`} />
              {stock.label}
            </span>
            {!quantity && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
                <Package className="size-2.5" />
                Missing stock
              </span>
            )}
            {imageCount === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
                <ImageIcon className="size-2.5" />
                Missing photo
              </span>
            )}
          </div>

          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{description}</p>
          )}

          {compatibleModels.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Compatible models</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {compatibleModels.map((model) => (
                  <span
                    key={model}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
