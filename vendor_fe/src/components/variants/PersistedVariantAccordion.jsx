import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import VariantAccordionCard from './VariantAccordionCard'
import { toVariantFormValues } from './variantFormUtils'
import { getDefaultVariantImageUploadHint } from './variantConstants'
import { overlayProductFieldsOnVariantDraft } from '../../utils/defaultProductVariation'

function buildDraft({
  isDefault,
  variantValue,
  variation,
  productValues,
  mainImage,
  subImages,
}) {
  const base = toVariantFormValues(variantValue, variation.attribute)
  if (!isDefault) return base
  return overlayProductFieldsOnVariantDraft(base, productValues, mainImage, subImages)
}

/** Accordion card for an already-saved variant — expand to edit fields inline, then Save or Cancel. */
export default function PersistedVariantAccordion({
  variation,
  variantValue,
  productValues,
  mainImage = null,
  subImages = [],
  isOpen,
  onToggle,
  onSave,
  onRemove,
  isSaving = false,
  isRemoving = false,
  isDefault = false,
}) {
  const [draft, setDraft] = useState(() => buildDraft({
    isDefault,
    variantValue,
    variation,
    productValues,
    mainImage,
    subImages,
  }))
  const [isCustomPrice, setIsCustomPrice] = useState(
    () => isDefault || (variantValue.price !== '' && variantValue.price != null),
  )
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState('')

  const resetDraft = () => {
    setDraft(buildDraft({
      isDefault,
      variantValue,
      variation,
      productValues,
      mainImage,
      subImages,
    }))
    setIsCustomPrice(isDefault || (variantValue.price !== '' && variantValue.price != null))
    setIsDirty(false)
    setError('')
  }

  useEffect(() => {
    if (!isDefault || isDirty) return
    setDraft(buildDraft({
      isDefault,
      variantValue,
      variation,
      productValues,
      mainImage,
      subImages,
    }))
  }, [
    isDirty,
    isDefault,
    variantValue,
    variation,
    productValues,
    mainImage,
    subImages,
  ])

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleToggleCustomPrice = (next) => {
    setIsCustomPrice(next)
    setIsDirty(true)
  }

  const handleSave = async () => {
    setError('')
    try {
      await onSave(draft, { isCustomPrice: isDefault ? true : isCustomPrice, isDefault })
      setIsDirty(false)
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save this variant.')
    }
  }

  return (
    <VariantAccordionCard
      idPrefix={`variant-${variantValue.id}`}
      attribute={variation.attribute}
      values={draft}
      onFieldChange={handleFieldChange}
      isCustomPrice={isCustomPrice}
      onToggleCustomPrice={handleToggleCustomPrice}
      productValues={productValues}
      mainQty={isDefault ? null : (productValues?.quantity ? Number(productValues.quantity) : null)}
      isOpen={isOpen}
      onToggle={() => {
        if (isOpen) resetDraft()
        onToggle()
      }}
      onRemove={isDefault ? undefined : onRemove}
      removeLabel={`Remove ${variantValue.value}`}
      isRemoving={isRemoving}
      isBusy={isSaving}
      error={error}
      isDefault={isDefault}
      priceAsProduct={isDefault}
      imageHint={isDefault ? getDefaultVariantImageUploadHint() : undefined}
      footer={
        isOpen && (isDirty || error) ? (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isDefault
                  ? 'bg-cyan-700 shadow-[0_12px_30px_rgba(14,116,144,0.22)] hover:bg-cyan-800'
                  : 'bg-brand shadow-[0_12px_30px_rgba(199,59,45,0.22)] hover:bg-brand-hover'
              }`}
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isDefault ? 'Save & sync to product info' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              disabled={isSaving}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        ) : null
      }
    />
  )
}
