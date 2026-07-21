import apiClient from '../lib/apiClient'
import { PRODUCT_MEDIA_ENDPOINTS } from '../constants/productMediaUpload'
import { assertApiSuccess } from './authService'
import {
  applyUploadedPathsToProductMedia,
  buildProductMediaPresignRequest,
  buildProductMediaUploadManifest,
  flattenPresignResponse,
  hasPendingProductMediaUploads,
  mergePresignTargetsWithManifest,
  runProductMediaUploads,
} from '../utils/productMediaUploadUtils'

/**
 * Request presigned S3 upload URLs for pending product media.
 * Backend expects JSON: { product_images, description_images, variations }
 * with each image as { name, mime_type, size } only.
 *
 * @param {import('../utils/productMediaUploadUtils').ProductMediaPresignRequest} presignRequest
 * @returns {Promise<import('../utils/productMediaUploadUtils').ProductMediaPresignTarget[]>}
 */
export async function requestProductMediaPresignUrls(presignRequest) {
  const { data } = await apiClient.post(PRODUCT_MEDIA_ENDPOINTS.GET_SIGNED_URLS, presignRequest)
  const envelope = assertApiSuccess(data)

  const payload = envelope?.data ?? data?.data ?? data
  return flattenPresignResponse(payload)
}

/**
 * Full presign → S3 upload pipeline for product form media.
 * Returns updated media state with storage paths attached.
 *
 * @param {Object} mediaState
 * @param {Object} [options] — forwarded to runProductMediaUploads
 * @returns {Promise<{ mediaState: Object, uploadResults: import('../utils/productMediaUploadUtils').ProductMediaUploadResult[], presignRequest: import('../utils/productMediaUploadUtils').ProductMediaPresignRequest }>}
 */
export async function uploadProductMedia(mediaState, options = {}) {
  const presignRequest = buildProductMediaPresignRequest(mediaState)

  if (!hasPendingProductMediaUploads(presignRequest)) {
    return {
      mediaState,
      uploadResults: [],
      presignRequest,
    }
  }

  const manifest = buildProductMediaUploadManifest(mediaState)
  const presignTargets = await requestProductMediaPresignUrls(presignRequest)
  const uploadJobs = mergePresignTargetsWithManifest(manifest, presignTargets)
  const uploadResults = await runProductMediaUploads(uploadJobs, options)

  return {
    mediaState: applyUploadedPathsToProductMedia(mediaState, uploadResults),
    uploadResults,
    presignRequest,
  }
}
