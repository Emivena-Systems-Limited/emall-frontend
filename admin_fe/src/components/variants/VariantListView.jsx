import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Layers3, Link2, Pin, Plus } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import SmartBackLink from '../navigation/SmartBackLink'
import { useProductMediaUpload } from '../../hooks/useProductMediaUpload'
import { useSyncDefaultVariantMutation } from '../../hooks/useProductMutations'
import { prepareVariantFormValuesForSave } from '../../utils/variantMediaSaveUtils'
import {
  applyDefaultVariationDraftToProduct,
  cloneImagesForDefaultVariant,
  collectProductImagesForDefaultVariant,
  mergeDefaultVariantImagesIntoProduct,
  sameDefaultVariantImageSet,
} from '../../utils/defaultProductVariation'
import {
  buildProductMediaPresignRequest,
  hasPendingProductMediaUploads,
  rehydrateKeptImagesMissingIds,
} from '../../utils/productMediaUploadUtils'
import { USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD } from '../../constants/productMediaUpload'
import AttributeIcon from './AttributeIcon'
import PersistedVariantAccordion from './PersistedVariantAccordion'
import { normalizeVariantOptionalFields } from './variantFormUtils'

export default function VariantListView({
  productId,
  defaultEntry,
  entries,
  productValues = {},
  listingValues = {},
  mainImage = null,
  subImages = [],
  descriptiveImages = [],
  onAdd,
  onFinished,
  updateSingleVariantMutation,
  deleteVariantMutation,
}) {
  const [removeTarget, setRemoveTarget] = useState(null)
  const [openIds, setOpenIds] = useState(() => new Set(
    defaultEntry?.variantValue?.id ? [defaultEntry.variantValue.id] : [],
  ))
  const [savingId, setSavingId] = useState(null)
  const { uploadPendingMedia, isUploading: isUploadingMedia } = useProductMediaUpload()
  const syncDefaultVariantMutation = useSyncDefaultVariantMutation()

  const toggleOpen = (variantId) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) next.delete(variantId)
      else next.add(variantId)
      return next
    })
  }

  const handleSaveDefault = async (entry, draft) => {
    const variantId = entry.variantValue.id
    setSavingId(variantId)
    try {
      const { productPatch } = applyDefaultVariationDraftToProduct(draft)
      const merged = mergeDefaultVariantImagesIntoProduct(draft.images, mainImage, subImages)

      const overlayImages = collectProductImagesForDefaultVariant(mainImage, subImages)
      const imagesChanged = !sameDefaultVariantImageSet(draft.images ?? [], overlayImages)

      let mediaState = {
        mainImage: merged.mainImage,
        subImages: merged.subImages,
        descriptiveImages: descriptiveImages ?? [],
        variations: [],
      }

      if (USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD) {
        mediaState = await rehydrateKeptImagesMissingIds(mediaState)
        const presignRequest = buildProductMediaPresignRequest(mediaState)
        if (hasPendingProductMediaUploads(presignRequest)) {
          mediaState = await uploadPendingMedia(mediaState)
        }
      }

      const nextListingValues = {
        ...listingValues,
        ...productPatch,
      }

      const variantImages = imagesChanged
        ? cloneImagesForDefaultVariant(
          collectProductImagesForDefaultVariant(mediaState.mainImage, mediaState.subImages),
        )
        : (entry.variantValue.images ?? collectProductImagesForDefaultVariant(
          mediaState.mainImage,
          mediaState.subImages,
        ))

      const variantFormValues = {
        ...normalizeVariantOptionalFields(
          {
            ...draft,
            attribute: entry.variation.attribute,
            images: variantImages,
          },
          { isCustomPrice: true },
        ),
        attribute: entry.variation.attribute,
      }

      const prepared = await prepareVariantFormValuesForSave({
        variantFormValues,
        attribute: entry.variation.attribute,
        uploadPendingMedia,
      })

      await syncDefaultVariantMutation.mutateAsync({
        productId,
        variantId: entry.synthetic ? null : variantId,
        variantFormValues: prepared,
        listingValues: nextListingValues,
        productValues: { ...nextListingValues, barcode: '' },
        mainImage: mediaState.mainImage,
        subImages: mediaState.subImages,
        descriptiveImages: mediaState.descriptiveImages ?? [],
      })
    } finally {
      setSavingId(null)
    }
  }

  const handleSave = async (entry, draft, { isCustomPrice, isDefault } = {}) => {
    if (isDefault) {
      await handleSaveDefault(entry, draft)
      return
    }

    const variantId = entry.variantValue.id
    setSavingId(variantId)
    try {
      const normalized = normalizeVariantOptionalFields(draft, { isCustomPrice })
      const prepared = await prepareVariantFormValuesForSave({
        variantFormValues: normalized,
        attribute: entry.variation.attribute,
        uploadPendingMedia,
      })
      await updateSingleVariantMutation.mutateAsync({
        productId,
        variantId,
        variantFormValues: prepared,
        productValues,
      })
    } finally {
      setSavingId(null)
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

  const groupedByAttribute = entries.reduce((groups, entry) => {
    const key = entry.variation.attribute || 'Options'
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
    return groups
  }, {})
  const attributeCount = Object.keys(groupedByAttribute).length
  const defaultLabel = defaultEntry
    ? `${defaultEntry.variation.attribute}: ${defaultEntry.variantValue.value || listingValues.main_attribute_value || 'Default'}`
    : ''

  return (
    <div className="page-enter space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Manage variations</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Product variants</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              The default option is locked here and stays in sync with product info. Extra options can still be added, edited, or removed.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-800">
                1 default
              </span>
              {entries.length > 0 && (
                <>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {entries.length} extra variant{entries.length !== 1 ? 's' : ''}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {attributeCount} option type{attributeCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <SmartBackLink
              fallback="/products"
              fallbackLabel="Back to products"
              variant="button-outline"
            />
            <Link
              to={`/products/${productId}/edit`}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/25 bg-brand-light/60 px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light"
            >
              <Layers3 className="size-4 shrink-0" />
              Change section
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onAdd()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="size-4" />
            Add variant
          </button>
          <button
            type="button"
            onClick={onFinished}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(199,59,45,0.2)] transition-colors hover:bg-brand-hover"
          >
            <CheckCircle2 className="size-4" />
            Done
          </button>
        </div>
      </section>

      {defaultEntry ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
              <Pin className="size-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-800">Default option</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800 ring-1 ring-cyan-100">
              <Link2 className="size-3" />
              Cannot be deleted
            </span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <PersistedVariantAccordion
            variation={defaultEntry.variation}
            variantValue={defaultEntry.variantValue}
            productValues={listingValues}
            mainImage={mainImage}
            subImages={subImages}
            isOpen={openIds.has(defaultEntry.variantValue.id)}
            onToggle={() => toggleOpen(defaultEntry.variantValue.id)}
            onSave={(draft, options) => handleSave(defaultEntry, draft, options)}
            isSaving={
              savingId === defaultEntry.variantValue.id
              || isUploadingMedia
              || syncDefaultVariantMutation.isPending
            }
            isDefault
          />
        </section>
      ) : null}

      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
          <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
            <Layers3 className="size-6" />
          </span>
          <p className="text-sm font-bold text-slate-900">No extra variants yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {defaultLabel
              ? `${defaultLabel} is already listed first. Add optional colors, sizes, or other values if you sell more than one option.`
              : 'Add optional colors, sizes, or other values if you sell more than one option.'}
          </p>
          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left text-xs text-slate-500 sm:flex-row sm:items-start sm:gap-4 sm:text-center">
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">1. Choose a type</strong>
              Color, Size, Weight or your own
            </span>
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">2. Add values</strong>
              Red, Blue, Large, etc.
            </span>
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">3. Fill in the card</strong>
              Price, stock & optional photos
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAdd()}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Add extra variant
          </button>
        </div>
      ) : (
        Object.entries(groupedByAttribute).map(([attribute, group]) => (
          <div key={attribute} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <AttributeIcon attribute={attribute} className="size-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{attribute}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {group.length} option{group.length !== 1 ? 's' : ''}
              </span>
              <span className="h-px flex-1 bg-slate-100" />
              <button
                type="button"
                onClick={() => onAdd(attribute)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand transition-colors hover:bg-brand-light/60"
              >
                <Plus className="size-3.5" />
                Add value
              </button>
            </div>
            <div className="space-y-3">
              {group.map(({ variation, variantValue }) => (
                <PersistedVariantAccordion
                  key={variantValue.id}
                  variation={variation}
                  variantValue={variantValue}
                  productValues={productValues}
                  isOpen={openIds.has(variantValue.id)}
                  onToggle={() => toggleOpen(variantValue.id)}
                  onSave={(draft, options) => handleSave({ variation, variantValue }, draft, options)}
                  onRemove={() => setRemoveTarget({ variation, variantValue })}
                  isSaving={savingId === variantValue.id || isUploadingMedia}
                  isRemoving={
                    deleteVariantMutation.isPending
                    && removeTarget?.variantValue.id === variantValue.id
                  }
                />
              ))}
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        open={Boolean(removeTarget)}
        tone="danger"
        title="Remove variant?"
        description={
          removeTarget
            ? `Remove the "${removeTarget.variantValue.variant_name || removeTarget.variantValue.value}" variant? This cannot be undone.`
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
