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
  isSavingSecondary = false,
  savingSecondaryId = null,
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
      await onSave(draft, { isCustomPrice: isDefault ? true : isCustomPrice, isDefault, saveMode: 'main' })
      setIsDirty(false)
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save this variant.')
    }
  }

  const handleSaveSecondary = async (secondary) => {
    setError('')
    try {
      await onSave(draft, {
        isCustomPrice: isDefault ? true : isCustomPrice,
        isDefault: false,
        saveMode: 'secondary',
        targetSecondaryId: secondary?.id,
      })
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
      onToggle={onToggle}
      isDirty={isDirty}
      onRemove={isDefault ? undefined : onRemove}
      removeLabel={`Remove ${variantValue.value}`}
      isRemoving={isRemoving}
      isBusy={isSaving}
      error={error}
      isDefault={isDefault}
      priceAsProduct={isDefault}
      imageHint={isDefault ? getDefaultVariantImageUploadHint() : undefined}
      showSecondarySave
      onSaveSecondary={handleSaveSecondary}
      savingSecondaryId={savingSecondaryId}
      footer={
        isOpen ? (
          <>
            <button
              type="button"
              onClick={resetDraft}
              disabled={isSaving || isSavingSecondary}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isSavingSecondary}
              className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isDefault
                  ? 'bg-cyan-700 hover:bg-cyan-800'
                  : 'bg-brand hover:bg-brand-hover'
              }`}
            >
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              Save primary variant info
            </button>
          </>
        ) : null
      }
    />
  )
}
