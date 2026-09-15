import { Check } from 'lucide-react'
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
  reserved_quantity: 'reserved_quantity',
  low_stock_threshold: 'low_stock_threshold',
  price: 'price',
  discount_price: 'discount_price',
  has_compatible_models: 'has_compatible_models',
  compatible_models: 'compatible_models',
  secondary_variants: 'secondary_variants',
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

  const handleFieldChange = (field, nextValue) => {
    if (field === 'images') {
      onImagesChange?.(mergeDefaultVariantImagesIntoProduct(nextValue, mainImage, subImages))
      return
    }

    if (field === 'secondary_variants') {
      onProductPatch?.({ secondary_variants: nextValue })
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
      cardFooter={
        isOpen ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <Check className="size-4" />
            Looks good
          </button>
        ) : null
      }
    />
  )
}
