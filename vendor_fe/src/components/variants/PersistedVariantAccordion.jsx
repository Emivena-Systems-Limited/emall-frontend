import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import VariantAccordionCard from './VariantAccordionCard'
import { toVariantFormValues } from './variantFormUtils'

/** Accordion card for an already-saved variant — expand to edit fields inline, then Save or Cancel. */
export default function PersistedVariantAccordion({
  variation,
  variantValue,
  productValues,
  isOpen,
  onToggle,
  onSave,
  onRemove,
  isSaving = false,
  isRemoving = false,
}) {
  const [draft, setDraft] = useState(() => toVariantFormValues(variantValue, variation.attribute))
  const [isCustomPrice, setIsCustomPrice] = useState(
    () => variantValue.price !== '' && variantValue.price != null,
  )
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState('')

  const resetDraft = () => {
    setDraft(toVariantFormValues(variantValue, variation.attribute))
    setIsCustomPrice(variantValue.price !== '' && variantValue.price != null)
    setIsDirty(false)
    setError('')
  }

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
      await onSave(draft, { isCustomPrice })
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
      mainQty={productValues?.quantity ? Number(productValues.quantity) : null}
      isOpen={isOpen}
      onToggle={() => {
        if (isOpen) resetDraft()
        onToggle()
      }}
      onRemove={onRemove}
      removeLabel={`Remove ${variantValue.value}`}
      isRemoving={isRemoving}
      isBusy={isSaving}
      error={error}
      footer={
        isOpen && (isDirty || error) ? (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              Save changes
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
