import { USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD } from '../constants/productMediaUpload'
import {
  buildProductMediaPresignRequest,
  hasPendingProductMediaUploads,
} from './productMediaUploadUtils'

/**
 * Presign and upload pending variant images before create/update save.
 * Returns form values unchanged when presigned upload is disabled or nothing is pending.
 */
export async function prepareVariantFormValuesForSave({
  variantFormValues,
  attribute,
  uploadPendingMedia,
}) {
  if (!USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD) {
    return variantFormValues
  }

  const mediaState = {
    mainImage: null,
    subImages: [],
    descriptiveImages: [],
    variations: [{
      attribute,
      values: [{
        value: variantFormValues.value,
        images: variantFormValues.images ?? [],
      }],
    }],
  }

  const presignRequest = buildProductMediaPresignRequest(mediaState)

  if (import.meta.env.DEV) {
    console.log('[variant save] media presign request:', presignRequest)
  }

  if (!hasPendingProductMediaUploads(presignRequest)) {
    return variantFormValues
  }

  const nextMediaState = await uploadPendingMedia(mediaState)
  const nextImages = nextMediaState.variations?.[0]?.values?.[0]?.images
    ?? variantFormValues.images

  return {
    ...variantFormValues,
    images: nextImages,
  }
}
