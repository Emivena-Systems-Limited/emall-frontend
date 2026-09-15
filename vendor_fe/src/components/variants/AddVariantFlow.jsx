import { useEffect, useRef, useState } from 'react'
import { Layers3, Plus } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import { useProductMediaUpload } from '../../hooks/useProductMediaUpload'
import { prepareVariantFormValuesForSave } from '../../utils/variantMediaSaveUtils'
import notify from '../../lib/notify'
import AttributeIcon from './AttributeIcon'
import AttributeTypePicker from './AttributeTypePicker'
import CardStepHeader from './CardStepHeader'
import PersistedVariantAccordion from './PersistedVariantAccordion'
import VariantAccordionCard from './VariantAccordionCard'
import VariantGroupActionBar from './VariantGroupActionBar'
import { isPresetAttribute, isColorVariantAttribute, COLOR_VARIANT_IMAGE_REQUIRED_MESSAGE } from './variantConstants'
import { getSingleVariantValuePlaceholder, normalizeVariantOptionalFields, parseMultiValues } from './variantFormUtils'
import { isMainProductOption } from '../../utils/defaultProductVariation'
import { hasUsableProductImages } from '../../utils/productImageUtils'

function createDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createDraftCard(value) {
  return {
    id: createDraftId(),
    value,
    sku: '',
    quantity: '',
    price: '',
    discount_price: '',
    images: [],
    has_compatible_models: false,
    compatible_models: [],
    isCustomPrice: false,
    error: '',
    secondary_variants: [],
  }
}

function createOpenDraft(value = '') {
  const card = createDraftCard(value)
  return { cards: [card], openId: card.id }
}

/**
 * Add-variant flow: pick an option type (Color, Size, …), type a value and it opens
 * as its own accordion card right away — fill in quantity, price & photo inline. Save
 * the batch when done, and the option type picker comes back for the next type.
 */
export default function AddVariantFlow({
  productId,
  productValues,
  entries,
  prefillAttribute,
  createVariantMutation,
  updateSingleVariantMutation,
  deleteVariantMutation,
}) {
  const lockedAttribute = prefillAttribute?.trim() || ''
  const initialDraft = lockedAttribute ? createOpenDraft('') : { cards: [], openId: null }
  const [usePrefillAttribute, setUsePrefillAttribute] = useState(Boolean(lockedAttribute))
  const [buildingAttribute, setBuildingAttribute] = useState(lockedAttribute)
  const [showCustomAttribute, setShowCustomAttribute] = useState(() =>
    Boolean(lockedAttribute && !isPresetAttribute(lockedAttribute)),
  )
  const [attributeError, setAttributeError] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [valuesError, setValuesError] = useState('')
  const [draftCards, setDraftCards] = useState(initialDraft.cards)
  const [openCardId, setOpenCardId] = useState(initialDraft.openId)
  const [addSecondaryRequestId, setAddSecondaryRequestId] = useState(0)
  const [isSavingBatch, setIsSavingBatch] = useState(false)
  const [persistedSavingId, setPersistedSavingId] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const savedValuesRef = useRef(null)
  const addValueInputRef = useRef(null)
  const { uploadPendingMedia, isUploading: isUploadingMedia } = useProductMediaUpload()

  const activeAttribute = usePrefillAttribute && lockedAttribute
    ? lockedAttribute
    : buildingAttribute.trim()

  const showAddValueInput = Boolean(activeAttribute && !showCustomAttribute && draftCards.length === 0)

  useEffect(() => {
    if (!showAddValueInput) return undefined
    const timeoutId = window.setTimeout(() => {
      addValueInputRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(timeoutId)
  }, [showAddValueInput, activeAttribute])

  const scrollToSavedValues = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = savedValuesRef.current
        if (!target) return
        const panel = document.querySelector('[data-dashboard-scroll-panel]')
        if (panel) {
          const panelRect = panel.getBoundingClientRect()
          const targetRect = target.getBoundingClientRect()
          const offset = targetRect.top - panelRect.top + panel.scrollTop - 20
          panel.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
          return
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  const openEmptyDraft = () => {
    const draft = createOpenDraft('')
    setDraftCards(draft.cards)
    setOpenCardId(draft.openId)
    scrollToSavedValues()
  }

  const startAttributeDraft = (attributeName) => {
    const name = String(attributeName ?? '').trim()
    setShowCustomAttribute(false)
    setBuildingAttribute(name)
    setAttributeError('')
    const hasFilledDraft = draftCards.some((card) => String(card.value ?? '').trim())
    if (!hasFilledDraft) openEmptyDraft()
  }

  const resetSession = () => {
    setBuildingAttribute(usePrefillAttribute && lockedAttribute ? lockedAttribute : '')
    setShowCustomAttribute(Boolean(usePrefillAttribute && lockedAttribute && !isPresetAttribute(lockedAttribute)))
    setDraftCards([])
    setOpenCardId(null)
    setValueInput('')
    setAttributeError('')
    setValuesError('')
  }

  const toggleCardOpen = (cardId) => {
    setOpenCardId((current) => (current === cardId ? null : cardId))
  }

  const requestAddSecondary = () => {
    const targetId = openCardId ?? draftCards[0]?.id
    if (!targetId) return
    if (openCardId !== targetId) setOpenCardId(targetId)
    setAddSecondaryRequestId((token) => token + 1)
  }

  const addValue = (rawValue) => {
    const trimmed = rawValue.trim()
    if (!trimmed) return
    if (!activeAttribute) {
      setAttributeError('Choose or enter an option type to continue')
      return
    }

    const key = trimmed.toLowerCase()
    const alreadyDraft = draftCards.some((card) => card.value.toLowerCase() === key)
    const alreadyPersisted = entries.some(
      (entry) =>
        (entry.variation.attribute || '').toLowerCase() === activeAttribute.toLowerCase()
        && (entry.variantValue.value || '').toLowerCase() === key,
    )
    if (alreadyDraft || alreadyPersisted) {
      setValuesError(`"${trimmed}" was already added for ${activeAttribute}`)
      return
    }
    if (isMainProductOption(productValues, activeAttribute, trimmed)) {
      setValuesError(
        `"${trimmed}" is already this product's default ${activeAttribute}. Add a different value, or skip extra options.`,
      )
      return
    }

    setAttributeError('')
    setValuesError('')
    const card = createDraftCard(trimmed)
    setDraftCards((prev) => [...prev, card])
    setOpenCardId(card.id)
    scrollToSavedValues()
  }

  const commitValueInput = () => {
    if (!valueInput.trim()) return
    if (valueInput.includes(',')) {
      parseMultiValues(valueInput).forEach(addValue)
    } else {
      addValue(valueInput)
    }
    setValueInput('')
  }

  const handleValueInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitValueInput()
    }
  }

  const updateDraftField = (cardId, field, value) => {
    setDraftCards((prev) => prev.map((card) => (
      card.id === cardId ? { ...card, [field]: value, error: '' } : card
    )))
  }

  const toggleDraftCustomPrice = (cardId, next) => {
    setDraftCards((prev) => prev.map((card) => (
      card.id === cardId ? { ...card, isCustomPrice: next } : card
    )))
  }

  const removeDraftCard = (cardId) => {
    setDraftCards((prev) => prev.filter((card) => card.id !== cardId))
    setOpenCardId((current) => (current === cardId ? null : current))
  }

  const handleSaveCurrent = async () => {
    const card = draftCards.find((item) => item.id === openCardId) ?? draftCards[0]
    if (!card) return
    setIsSavingBatch(true)

    const fail = (error) => {
      setDraftCards((prev) => prev.map((item) => (
        item.id === card.id ? { ...item, error } : item
      )))
      setOpenCardId(card.id)
    }

    if (!card.value.trim()) {
      fail('Value is required')
      setIsSavingBatch(false)
      return
    }
    if (card.quantity === '' || card.quantity == null) {
      fail('Quantity is required')
      setIsSavingBatch(false)
      return
    }
    if (isColorVariantAttribute(activeAttribute) && !hasUsableProductImages(card.images, card.image_url)) {
      fail(COLOR_VARIANT_IMAGE_REQUIRED_MESSAGE)
      setIsSavingBatch(false)
      return
    }

    try {
      const normalized = normalizeVariantOptionalFields(
        { ...card, attribute: activeAttribute },
        { isCustomPrice: card.isCustomPrice },
      )
      const prepared = await prepareVariantFormValuesForSave({
        variantFormValues: normalized,
        attribute: activeAttribute,
        uploadPendingMedia,
      })

      await createVariantMutation.mutateAsync({
        productId,
        variantFormValues: prepared,
        productValues,
      })

      const remaining = draftCards.filter((item) => item.id !== card.id)
      setDraftCards(remaining)
      setOpenCardId(remaining[0]?.id ?? null)
      notify.success(
        remaining.length === 0
          ? `${activeAttribute} variant saved.`
          : `${activeAttribute} variant saved. Continue with the next one, or add another.`,
      )
      if (remaining.length === 0) resetSession()
    } catch (error) {
      fail(error?.message || 'Failed to save this variant')
    } finally {
      setIsSavingBatch(false)
    }
  }

  const handleSavePersisted = async (entry, draft, {
    isCustomPrice,
    saveMode = 'main',
    targetSecondaryId = null,
  } = {}) => {
    const savingKey = saveMode === 'secondary'
      ? `secondary:${targetSecondaryId}`
      : `main:${entry.variantValue.id}`
    setPersistedSavingId(savingKey)
    try {
      const normalized = normalizeVariantOptionalFields(draft, { isCustomPrice })
      const prepared = await prepareVariantFormValuesForSave({
        variantFormValues: normalized,
        attribute: entry.variation.attribute,
        uploadPendingMedia,
      })
      await updateSingleVariantMutation.mutateAsync({
        productId,
        variantId: entry.variantValue.id,
        variantFormValues: prepared,
        productValues,
        saveMode,
        targetSecondaryId,
      })
    } finally {
      setPersistedSavingId(null)
    }
  }

  const handleConfirmRemove = async () => {
    if (!removeTarget) return
    await deleteVariantMutation.mutateAsync({
      productId,
      productVariantId: removeTarget.variantValue.id,
    })
    setRemoveTarget(null)
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const key = entry.variation.attribute || 'Options'
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
    return groups
  }, {})
  const attributeGroupCount = Object.keys(groupedEntries).length

  return (
    <div className="space-y-6">
      {/* Choose option type + add values */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader
          step={1}
          title="Add option types & values"
          subtitle={
            lockedAttribute
              ? `Add more "${lockedAttribute}" values, or add another option type like Size or Material.`
              : 'Pick an option type (Color, Size, Material…), then type each value — Black, Red, Blue — and fill in its details right on the card.'
          }
          required
        />

        {usePrefillAttribute && lockedAttribute ? (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                <AttributeIcon attribute={lockedAttribute} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Adding values for</p>
                <p className="truncate text-sm font-bold text-slate-900">{lockedAttribute}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsePrefillAttribute(false)
                setBuildingAttribute('')
                setShowCustomAttribute(false)
                setDraftCards([])
                setOpenCardId(null)
              }}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-hover"
            >
              <Plus className="size-3.5" />
              Add Color, Size, or another option
            </button>
          </div>
        ) : (
          <AttributeTypePicker
            value={buildingAttribute}
            showCustom={showCustomAttribute}
            onSelectPreset={(preset) => {
              startAttributeDraft(preset)
            }}
            onToggleCustom={() => {
              setShowCustomAttribute(true)
            }}
            onCloseCustom={() => {
              setShowCustomAttribute(false)
            }}
            onSaveCustom={(name) => {
              startAttributeDraft(name)
            }}
            error={attributeError}
          />
        )}

        {!usePrefillAttribute && attributeError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{attributeError}</p>
        )}

        {showAddValueInput ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              Add a {activeAttribute.toLowerCase()} value
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                ref={addValueInputRef}
                type="text"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                onKeyDown={handleValueInputKeyDown}
                onBlur={commitValueInput}
                placeholder={getSingleVariantValuePlaceholder(activeAttribute)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
              />
              <button
                type="button"
                onClick={commitValueInput}
                disabled={!valueInput.trim()}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                Add value
              </button>
            </div>
            {valuesError && <p className="mt-2 text-xs font-semibold text-red-600">{valuesError}</p>}
            <p className="mt-2 text-[11px] text-slate-400">
              Press Enter or comma after each value, or paste several at once — e.g. Black, Red, Blue.
            </p>
          </div>
        ) : null}
      </div>

      {/* Draft cards for the option type being built right now */}
      <div ref={savedValuesRef} className="scroll-mt-6">
        {draftCards.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-light text-brand">
                <AttributeIcon attribute={activeAttribute} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {activeAttribute} variant
                </p>
                <p className="text-[11px] text-slate-400">
                  Fill in this option and any sub-variants, then save. You can add another {activeAttribute.toLowerCase()} after this one is saved.
                </p>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5">
              {draftCards.map((card) => (
                <VariantAccordionCard
                  key={card.id}
                  idPrefix={`draft-${card.id}`}
                  attribute={activeAttribute}
                  values={card}
                  onFieldChange={(field, value) => updateDraftField(card.id, field, value)}
                  isCustomPrice={card.isCustomPrice}
                  onToggleCustomPrice={(next) => toggleDraftCustomPrice(card.id, next)}
                  productValues={productValues}
                  mainQty={productValues?.quantity ? Number(productValues.quantity) : null}
                  isOpen={openCardId === card.id}
                  onToggle={() => toggleCardOpen(card.id)}
                  onRemove={() => removeDraftCard(card.id)}
                  removeLabel={`Remove ${card.value}`}
                  isBusy={isSavingBatch}
                  error={card.error}
                  addSecondaryRequestId={openCardId === card.id ? addSecondaryRequestId : 0}
                />
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
              <VariantGroupActionBar
                secondaryAttribute={
                  (draftCards.find((card) => card.id === openCardId) ?? draftCards[0])
                    ?.secondary_variants?.[0]?.attribute ?? ''
                }
                onAddSecondary={requestAddSecondary}
                onSave={handleSaveCurrent}
                saveLabel="Save this variant"
                isSaving={isSavingBatch || isUploadingMedia}
                showSave
                addDisabled={draftCards.length === 0}
              />
            </div>
          </div>
        )}
      </div>

      {/* Already-saved options, grouped by option type */}
      {entries.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Layers3 className="size-4" />
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {entries.length} saved option{entries.length !== 1 ? 's' : ''} · {attributeGroupCount} option type{attributeGroupCount !== 1 ? 's' : ''}
            </p>
          </div>

          {Object.entries(groupedEntries).map(([attribute, group]) => (
            <div key={attribute} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <AttributeIcon attribute={attribute} className="size-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{attribute}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                  {group.length} value{group.length !== 1 ? 's' : ''}
                </span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="space-y-3">
                {group.map(({ variation, variantValue }) => (
                  <PersistedVariantAccordion
                    key={variantValue.id}
                    variation={variation}
                    variantValue={variantValue}
                    productValues={productValues}
                    isOpen={openCardId === variantValue.id}
                    onToggle={() => toggleCardOpen(variantValue.id)}
                    onSave={(draft, options) => handleSavePersisted({ variation, variantValue }, draft, options)}
                    onRemove={() => setRemoveTarget({ variation, variantValue })}
                    isSaving={persistedSavingId === `main:${variantValue.id}`}
                    isSavingSecondary={String(persistedSavingId ?? '').startsWith('secondary:')}
                    savingSecondaryId={
                      String(persistedSavingId ?? '').startsWith('secondary:')
                        ? String(persistedSavingId).slice('secondary:'.length)
                        : null
                    }
                    isRemoving={deleteVariantMutation.isPending && removeTarget?.variantValue.id === variantValue.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(removeTarget)}
        tone="danger"
        title="Remove variant?"
        description={
          removeTarget
            ? `Remove "${removeTarget.variantValue.value}" from ${removeTarget.variation.attribute}? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove variant"
        loadingLabel="Removing…"
        isLoading={deleteVariantMutation.isPending}
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  )
}
