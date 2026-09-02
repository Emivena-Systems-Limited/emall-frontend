import { Check, Link2, Pin } from 'lucide-react'
import VariantAccordionCard from './VariantAccordionCard'
import { getDefaultVariantImageUploadHint } from './variantConstants'
import {
  applyDefaultVariationDraftToProduct,
  buildDefaultVariationCardValues,
  mergeDefaultVariantImagesIntoProduct,
} from '../../utils/defaultProductVariation'

const PRODUCT_FIELD_BY_DRAFT = {
  value: 'main_attribute_value',
  quantity: 'quantity',
  price: 'price',
  discount_price: 'discount_price',
  has_compatible_models: 'has_compatible_models',
  compatible_models: 'compatible_models',
}

/**
 * Locked default option on the create variations step.
 * Edits write straight back to product info (identifier, price, stock, photos, models).
 */
export default function DefaultVariationCard({
  attribute,
  productValues = {},
  mainImage = null,
  subImages = [],
  onProductPatch,
  onImagesChange,
  isOpen,
  onToggle,
  idPrefix = 'default-variation',
}) {
  const values = buildDefaultVariationCardValues(productValues, mainImage, subImages)
  const compatibleCount = values.compatible_models?.length ?? 0

  const handleFieldChange = (field, nextValue) => {
    if (field === 'images') {
      onImagesChange?.(mergeDefaultVariantImagesIntoProduct(nextValue, mainImage, subImages))
      return
    }

    const productField = PRODUCT_FIELD_BY_DRAFT[field]
    if (!productField) return

    const draft = { ...values, [field]: nextValue }
    const { productPatch } = applyDefaultVariationDraftToProduct(draft)
    const patch = { [productField]: productPatch[productField] }

    if (field === 'price' || field === 'discount_price') {
      patch.discount_mode = 'amount'
      if (field === 'price') patch.price = productPatch.price
      if (field === 'discount_price') patch.discount_price = productPatch.discount_price
    }

    if (field === 'compatible_models' || field === 'has_compatible_models') {
      patch.has_compatible_models = productPatch.has_compatible_models
      patch.compatible_models = productPatch.compatible_models
    }

    onProductPatch?.(patch)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-50 px-4 py-3.5 sm:px-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-200">
          <Pin className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Default option</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-bold text-cyan-800">
              <Link2 className="size-3" />
              Synced with product info
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {attribute || 'Option'}: {values.value?.trim() || 'Set a value'}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Shoppers see this first. Editing price, stock, photos, the identifier value, or compatible models
            also updates product info
            {compatibleCount > 0
              ? ` · fits ${compatibleCount} model${compatibleCount === 1 ? '' : 's'}`
              : ''}
            . This option cannot be deleted.
          </p>
        </div>
      </div>

      <VariantAccordionCard
        idPrefix={idPrefix}
        attribute={attribute}
        values={values}
        onFieldChange={handleFieldChange}
        isCustomPrice
        onToggleCustomPrice={() => {}}
        productValues={productValues}
        isOpen={isOpen}
        onToggle={onToggle}
        isDefault
        priceAsProduct
        hideSku
        imageHint={getDefaultVariantImageUploadHint()}
        footer={
          isOpen ? (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(14,116,144,0.22)] transition-colors hover:bg-cyan-800"
            >
              <Check className="size-4" />
              Looks good
            </button>
          ) : null
        }
      />
    </div>
  )
}
