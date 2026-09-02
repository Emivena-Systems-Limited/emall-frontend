import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminProductById,
  updateAdminProduct,
} from '../services/adminProductService'
import { toAdminCatalogProduct } from '../utils/normalizeAdminProducts'
import { buildProductInfoJsonPayload, buildProductInfoPayload } from '../utils/productPayload'
import { USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD } from '../constants/productMediaUpload'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { productQueryKeys } from './useProducts'
import { productDetailQueryKey } from './useAdminProducts'
import {
  useDeleteProductMutation as useAdminDeleteProductMutation,
  useToggleProductActiveMutation,
  useUpdateProductStatusMutation as useAdminUpdateProductStatusMutation,
} from './useAdminProducts'

function syncProductDetailCache(queryClient, productId, record) {
  if (productId && record) {
    queryClient.setQueryData(productQueryKeys.detail(productId), record)
    queryClient.setQueryData(productDetailQueryKey(productId), record)
  }
}

function refreshProductLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productQueryKeys.all,
    predicate: (query) => query.queryKey.includes('list') || query.queryKey.includes('pending'),
    refetchType: 'active',
  })
}

function variantUnavailable() {
  const error = new Error('Variant structure is managed by the vendor. Update listing details instead.')
  return Promise.reject(error)
}

export function useCreateProductMutation() {
  return useMutation({
    mutationKey: ['products', 'create'],
    mutationFn: async () => {
      throw new Error('Operators review listings here. Vendors create new products.')
    },
    onError: (error) => notify.fromError(error, error.message),
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update'],
    mutationFn: ({ productId, formData, payload }) => updateAdminProduct(productId, payload ?? formData),
    onSuccess: async (record, variables) => {
      syncProductDetailCache(queryClient, variables.productId, record)
      await refreshProductLists(queryClient)
      const catalog = toAdminCatalogProduct(record)
      notify.success(catalog?.name ? `${catalog.name} was updated.` : 'Product updated.')
    },
    onError: (error) => notify.fromError(error, parseApiError(error).message || 'Failed to update product.'),
  })
}

export function useUpdateProductInfoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-info'],
    mutationFn: async ({ productId, formData, payload }) => {
      await updateAdminProduct(productId, payload ?? formData)
      return fetchAdminProductById(productId)
    },
    onSuccess: async (freshRecord, variables) => {
      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      await refreshProductLists(queryClient)
      const catalog = toAdminCatalogProduct(freshRecord)
      notify.success(catalog?.name ? `${catalog.name} product info was updated successfully.` : 'Product info updated.')
    },
    onError: (error) => notify.fromError(error, parseApiError(error).message || 'Failed to update product info.'),
  })
}

export function useUpdateProductVariantsMutation() {
  return useMutation({
    mutationFn: variantUnavailable,
    onError: (error) => notify.fromError(error, error.message),
  })
}

export function useUpdateSingleVariantMutation() {
  return useMutation({
    mutationFn: variantUnavailable,
    onError: (error) => notify.fromError(error, error.message),
  })
}

export function useCreateProductVariantMutation() {
  return useMutation({
    mutationFn: variantUnavailable,
    onError: (error) => notify.fromError(error, error.message),
  })
}

export function useDeleteProductVariantMutation() {
  return useMutation({
    mutationFn: variantUnavailable,
    onError: (error) => notify.fromError(error, error.message),
  })
}

export function useSyncDefaultVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'sync-default-variant'],
    mutationFn: async ({ productId, listingValues, mainImage, subImages, descriptiveImages = [] }) => {
      if (USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD) {
        const payload = buildProductInfoJsonPayload(listingValues, mainImage, subImages, { descriptiveImages })
        await updateAdminProduct(productId, payload)
      } else {
        const formData = buildProductInfoPayload(listingValues, mainImage, subImages, {
          mode: 'edit',
          descriptiveImages,
        })
        await updateAdminProduct(productId, formData)
      }

      return fetchAdminProductById(productId)
    },
    onSuccess: async (record, variables) => {
      syncProductDetailCache(queryClient, variables.productId, record)
      await refreshProductLists(queryClient)
      notify.success('Listing details were updated.')
    },
    onError: (error) => notify.fromError(error, parseApiError(error).message || 'Could not update listing details.'),
  })
}

export function useUpdateProductStatusMutation() {
  return useAdminUpdateProductStatusMutation()
}

export function useToggleProductActive() {
  return useToggleProductActiveMutation()
}

export function useDeleteProductsMutation() {
  const mutation = useAdminDeleteProductMutation()

  return {
    ...mutation,
    mutateAsync: (idsOrPayload) => {
      if (idsOrPayload && typeof idsOrPayload === 'object' && !Array.isArray(idsOrPayload) && idsOrPayload.id) {
        return mutation.mutateAsync(idsOrPayload)
      }
      const list = Array.isArray(idsOrPayload) ? idsOrPayload : [idsOrPayload]
      return mutation.mutateAsync({ id: list[0] })
    },
  }
}
