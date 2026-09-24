import { Layers3, Loader2 } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import { useProduct } from '../../hooks/useProducts'
import { formatCedi } from '../../utils/formatters'

function variantTitle(variant) {
  const named = String(variant?.variant_name ?? '').trim()
  if (named) return named
  const attributes = Array.isArray(variant?.attributes) ? variant.attributes : []
  const values = attributes.map((item) => String(item?.value ?? '').trim()).filter(Boolean)
  return values.join(' · ') || variant?.sku || 'Variation'
}

function variantDetails(variant) {
  const attributes = Array.isArray(variant?.attributes) ? variant.attributes : []
  return attributes
    .map((item) => {
      const name = String(item?.name ?? '').trim()
      const value = String(item?.value ?? '').trim()
      return name && value ? `${name}: ${value}` : value
    })
    .filter(Boolean)
    .join(' · ')
}

function variantPrice(variant) {
  const amount = Number(variant?.regular_discount_price ?? variant?.discount_price ?? variant?.price)
  return Number.isFinite(amount) ? formatCedi(amount) : '—'
}

function variantStock(variant) {
  const available = variant?.inventory?.available_quantity
  if (available != null && available !== '') return available
  if (variant?.quantity != null && variant?.quantity !== '') return variant.quantity
  return '—'
}

export default function ProductVariationsModal({ open, product, onClose }) {
  const { data: rawRecord, isLoading, isError } = useProduct(open ? product?.id : null)
  const variants = Array.isArray(rawRecord?.variants) && rawRecord.variants.length
    ? rawRecord.variants
    : (Array.isArray(product?.variants) ? product.variants : [])

  if (!open || !product) return null

  return (
    <VendorDialog open onClose={onClose} labelledBy="product-variations-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="product-variations-title"
        icon={Layers3}
        title="Variations"
        subtitle={product.name}
        onClose={onClose}
      />
      <VendorDialogBody className="px-5 py-5 sm:px-6">
        {isLoading && variants.length === 0 ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="size-4 animate-spin text-brand" />
            Loading variations…
          </p>
        ) : variants.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isError
              ? 'Variations could not be loaded.'
              : 'This listing does not have extra variations.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {variants.map((variant) => (
              <li key={variant.id ?? variantTitle(variant)} className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{variantTitle(variant)}</p>
                {variantDetails(variant) ? (
                  <p className="mt-0.5 text-xs text-slate-500">{variantDetails(variant)}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-600">
                  {variant.sku ? `SKU ${variant.sku}` : 'No SKU'}
                  {' · '}
                  {variantPrice(variant)}
                  {' · '}
                  Stock {variantStock(variant)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </VendorDialogBody>
      <VendorDialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Close
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
