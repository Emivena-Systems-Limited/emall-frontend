import { isImageUploadedToStorage } from './productMediaUploadUtils'
import {
  isKeptRemoteProductImage,
  resolveRemoteProductImageId,
} from './productImageUtils'

function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function collectRemoteImageIds(images = []) {
  return (Array.isArray(images) ? images : [])
    .filter(Boolean)
    .filter(isKeptRemoteProductImage)
    .map((image) => resolveRemoteProductImageId(image))
    .filter(Boolean)
}

function countNewProductImages(images = []) {
  return (Array.isArray(images) ? images : [])
    .filter(Boolean)
    .filter((image) => {
      if (isKeptRemoteProductImage(image)) return false
      return isFileValue(image.file) || isImageUploadedToStorage(image)
    })
    .length
}

/**
 * Snapshot of remote image IDs when the edit form loads.
 * Used to compute removals and show a change summary before save.
 */
export function captureProductImageBaseline({
  mainImage = null,
  subImages = [],
  descriptiveImages = [],
} = {}) {
  return {
    mainImageRemoteId: resolveRemoteProductImageId(mainImage),
    productImageIds: collectRemoteImageIds([mainImage, ...subImages]),
    descriptiveImageIds: collectRemoteImageIds(descriptiveImages),
  }
}

export function collectRemovedProductImageIds(baseline, { mainImage = null, subImages = [] } = {}) {
  if (!baseline) return []

  const currentIds = new Set(collectRemoteImageIds([mainImage, ...subImages]))

  return (baseline.productImageIds ?? []).filter((id) => !currentIds.has(id))
}

export function collectRemovedDescriptiveImageIds(baseline, { descriptiveImages = [] } = {}) {
  if (!baseline) return []

  const currentIds = new Set(collectRemoteImageIds(descriptiveImages))

  return (baseline.descriptiveImageIds ?? []).filter((id) => !currentIds.has(id))
}

/**
 * Summarize pending image edits for UI and payload assembly.
 */
export function summarizeProductImageChanges(
  baseline,
  { mainImage = null, subImages = [], descriptiveImages = [] } = {},
) {
  const removedProductImageIds = collectRemovedProductImageIds(baseline, { mainImage, subImages })
  const removedDescriptiveImageIds = collectRemovedDescriptiveImageIds(baseline, { descriptiveImages })

  const keptProductCount = collectRemoteImageIds([mainImage, ...subImages]).length
  const keptDescriptiveCount = collectRemoteImageIds(descriptiveImages).length

  const addedProductCount = countNewProductImages([mainImage, ...subImages])
  const addedDescriptiveCount = countNewProductImages(descriptiveImages)

  const mainReplaced = Boolean(
    baseline?.mainImageRemoteId
    && baseline.mainImageRemoteId !== resolveRemoteProductImageId(mainImage)
    && (isFileValue(mainImage?.file) || isImageUploadedToStorage(mainImage)),
  )

  const replacedProductCount = mainReplaced
    ? Math.min(1, removedProductImageIds.length, addedProductCount)
    : 0

  const removedOnlyProductCount = Math.max(
    0,
    removedProductImageIds.length - replacedProductCount,
  )

  const hasChanges = (
    removedProductImageIds.length > 0
    || removedDescriptiveImageIds.length > 0
    || addedProductCount > 0
    || addedDescriptiveCount > 0
  )

  return {
    hasChanges,
    product: {
      kept: keptProductCount,
      removed: removedProductImageIds.length,
      removedOnly: removedOnlyProductCount,
      added: addedProductCount,
      replaced: replacedProductCount,
    },
    descriptive: {
      kept: keptDescriptiveCount,
      removed: removedDescriptiveImageIds.length,
      added: addedDescriptiveCount,
    },
    removedProductImageIds,
    removedDescriptiveImageIds,
  }
}

/**
 * Snapshot of remote variant image IDs when the edit drawer opens.
 */
export function captureVariantImageBaseline({ images = [] } = {}) {
  return {
    imageRemoteIds: collectRemoteImageIds(images),
  }
}

/**
 * Summarize pending variant image edits for UI and dev logging.
 */
export function summarizeVariantImageChanges(baseline, { images = [] } = {}) {
  const currentIds = collectRemoteImageIds(images)
  const baselineIds = baseline?.imageRemoteIds ?? []
  const removedImageIds = baselineIds.filter((id) => !currentIds.includes(id))

  const kept = currentIds.length
  const added = countNewProductImages(images)

  const replaced = baselineIds.length > 0 && removedImageIds.length > 0 && added > 0 ? 1 : 0
  const removedOnly = Math.max(0, removedImageIds.length - replaced)

  const hasChanges = removedImageIds.length > 0 || added > 0

  return {
    hasChanges,
    kept,
    removed: removedImageIds.length,
    removedOnly,
    added,
    replaced,
    removedImageIds,
  }
}
