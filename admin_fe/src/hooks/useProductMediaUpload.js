import { useCallback, useRef, useState } from 'react'
import { uploadProductMedia } from '../services/productMediaService'
import {
  buildProductMediaUploadManifest,
  markImageUploadStatus,
} from '../utils/productMediaUploadUtils'
import { PRODUCT_MEDIA_UPLOAD_STATUS, PRODUCT_PUBLISH_STAGE } from '../constants/productMediaUpload'

const INITIAL_PROGRESS = {
  phase: PRODUCT_PUBLISH_STAGE.IDLE,
  total: 0,
  completed: 0,
  failed: 0,
  currentContentId: null,
}

/**
 * Orchestrates request-signed-urls → S3 upload → path attachment for product form media.
 *
 * Usage in AddProduct submit (once backend is ready):
 *
 *   const { uploadPendingMedia, isUploading, uploadProgress } = useProductMediaUpload()
 *
 *   const mediaState = { mainImage, subImages, descriptiveImages, variations: values.variations }
 *   const nextMedia = await uploadPendingMedia(mediaState)
 *   setMainImage(nextMedia.mainImage)
 *   setSubImages(nextMedia.subImages)
 *   ...
 */
export function useProductMediaUpload() {
  const abortRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(INITIAL_PROGRESS)
  const [uploadError, setUploadError] = useState(null)

  const resetUploadProgress = useCallback(() => {
    setUploadProgress(INITIAL_PROGRESS)
    setUploadError(null)
  }, [])

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsUploading(false)
    setUploadProgress(INITIAL_PROGRESS)
  }, [])

  /**
   * Request signed URLs and upload any pending local files in mediaState.
   * Returns updated media state with s3Path set on uploaded images.
   * If nothing is pending, returns mediaState unchanged (no network calls).
   */
  const uploadPendingMedia = useCallback(async (mediaState, options = {}) => {
    const pendingCount = buildProductMediaUploadManifest(mediaState).length
    const abortController = new AbortController()
    abortRef.current = abortController

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress({
      phase: pendingCount > 0 ? PRODUCT_PUBLISH_STAGE.REQUESTING_URLS : PRODUCT_PUBLISH_STAGE.IDLE,
      total: pendingCount,
      completed: 0,
      failed: 0,
      currentContentId: null,
    })

    try {
      const result = await uploadProductMedia(mediaState, {
        ...options,
        signal: abortController.signal,
        onItemStart: (job) => {
          setUploadProgress((current) => ({
            ...current,
            phase: PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES,
            currentContentId: job.content_id,
          }))
          options.onItemStart?.(job)
        },
        onItemComplete: (uploadResult) => {
          setUploadProgress((current) => ({
            ...current,
            phase: PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES,
            completed: current.completed + 1,
            currentContentId: null,
          }))
          options.onItemComplete?.(uploadResult)
        },
        onItemError: (job, error) => {
          setUploadProgress((current) => ({
            ...current,
            failed: current.failed + 1,
          }))
          options.onItemError?.(job, error)
        },
      })

      setUploadProgress({
        phase: PRODUCT_PUBLISH_STAGE.SUCCESS,
        total: result.uploadResults.length,
        completed: result.uploadResults.length,
        failed: 0,
        currentContentId: null,
      })

      return result.mediaState
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Image upload was cancelled.', { cause: error })
      }

      setUploadError(error?.message || 'Failed to upload product images.')
      throw error
    } finally {
      abortRef.current = null
      setIsUploading(false)
    }
  }, [])

  /**
   * Mark a single image as uploading — useful for progressive upload on file pick.
   */
  const markImageUploading = useCallback((image) => {
    return markImageUploadStatus(image, PRODUCT_MEDIA_UPLOAD_STATUS.UPLOADING)
  }, [])

  /**
   * Mark a single image upload as failed — e.g. after remove/replace during in-flight upload.
   */
  const markImageUploadFailed = useCallback((image, error) => {
    return markImageUploadStatus(image, PRODUCT_MEDIA_UPLOAD_STATUS.FAILED, error)
  }, [])

  return {
    uploadPendingMedia,
    cancelUpload,
    resetUploadProgress,
    markImageUploading,
    markImageUploadFailed,
    isUploading,
    uploadProgress,
    uploadError,
  }
}

export default useProductMediaUpload
