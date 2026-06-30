import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct, createProductVariant, deleteProductVariant, deleteProducts, duplicateProduct, getProductById, toCatalogProduct, toggleProductActive, updateProduct, updateProductInfo, updateProductVariant } from '../services/productService'
import { buildSingleVariantCreatePayload, buildSingleVariantUpdatePayload, isPersistedVariantId, iterateVariantFormEntries } from '../utils/productPayload'
import notify from '../lib/notify'
import { productQueryKeys } from './useProducts'

function syncProductDetailCache(queryClient, productId, record) {
  if (productId && record) {
    queryClient.setQueryData(productQueryKeys.detail(productId), record)
  }
}

function patchProductInListCache(queryClient, catalogProduct, { insertIfMissing = false } = {}) {
  if (!catalogProduct) return

  queryClient.setQueryData(productQueryKeys.list(), (current) => {
    if (!Array.isArray(current)) return current

    const exists = current.some((product) => product.id === catalogProduct.id)
    if (!exists) {
      return insertIfMissing ? [catalogProduct, ...current] : current
    }

    return current.map((product) => (
      product.id === catalogProduct.id ? catalogProduct : product
    ))
  })

  queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
}

function removeProductsFromListCache(queryClient, productIds) {
  const deletedSet = new Set(productIds)

  queryClient.setQueryData(productQueryKeys.list(), (current) => {
    if (!Array.isArray(current)) return current
    return current.filter((product) => !deletedSet.has(product.id))
  })

  queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
}

function getCreateSuccessMessage(catalogProduct) {
  if (catalogProduct.apiStatus === 'approved') {
    return `${catalogProduct.name} was created and is now live in your catalogue.`
  }

  return `${catalogProduct.name} was submitted successfully.`
}

function getUpdateSuccessMessage(catalogProduct) {
  return `${catalogProduct.name} was updated successfully.`
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'create'],
    mutationFn: ({ formData }) => createProduct(formData),
    onSuccess: (record, variables) => {
      const catalogProduct = toCatalogProduct(record, variables?.context)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, catalogProduct.id, record)
      patchProductInListCache(queryClient, catalogProduct, { insertIfMissing: true })
      notify.success(getCreateSuccessMessage(catalogProduct))
    },
    onError: (error) => notify.fromError(error, 'Failed to publish product.'),
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update'],
    mutationFn: ({ productId, formData }) => updateProduct(productId, formData),
    onSuccess: (record, variables) => {
      const catalogProduct = toCatalogProduct(record, variables?.context)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, record)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success(getUpdateSuccessMessage(catalogProduct))
    },
    onError: (error) => notify.fromError(error, 'Failed to update product.'),
  })
}

export function useUpdateProductInfoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-info'],
    mutationFn: async ({ productId, formData }) => {
      await updateProductInfo(productId, formData)
      return getProductById(productId)
    },
    onSuccess: (freshRecord, variables) => {
      const catalogProduct = toCatalogProduct(freshRecord, variables?.context)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success(`${catalogProduct.name} product info was updated successfully.`)
    },
    onError: (error) => notify.fromError(error, 'Failed to update product info.'),
  })
}

export function useUpdateProductVariantsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-variants'],
    mutationFn: async ({ productId, formValues }) => {
      const entries = iterateVariantFormEntries(formValues.variations).filter(
        ({ variantValue }) => isPersistedVariantId(variantValue.id),
      )

      if (entries.length === 0) {
        throw new Error('No existing variants to update.')
      }

      for (const { variation, variantValue } of entries) {
        const formData = buildSingleVariantUpdatePayload(
          {
            attribute: variation.attribute,
            value: variantValue.value,
            variant_name: variantValue.variant_name,
            sku: variantValue.sku,
            price: variantValue.price,
            discount_price: variantValue.discount_price,
            quantity: variantValue.quantity,
            reserved_quantity: variantValue.reserved_quantity,
            low_stock_threshold: variantValue.low_stock_threshold,
            barcode: variantValue.barcode,
            images: variantValue.images ?? [],
          },
          variantValue.id,
          formValues,
        )
        await updateProductVariant(variantValue.id, formData)
      }

      return getProductById(productId)
    },
    onSuccess: (freshRecord, variables) => {
      const catalogProduct = toCatalogProduct(freshRecord, variables?.context)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success(`${catalogProduct.name} variations were updated successfully.`)
    },
    onError: (error) => notify.fromError(error, 'Failed to update variations.'),
  })
}

export function useUpdateSingleVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-single-variant'],
    mutationFn: async ({ productId, variantId, variantFormValues, productValues }) => {
      const formData = buildSingleVariantUpdatePayload(variantFormValues, variantId, productValues)
      await updateProductVariant(variantId, formData)
      return getProductById(productId)
    },
    onSuccess: (freshRecord, variables) => {
      const catalogProduct = toCatalogProduct(freshRecord)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success('Variant updated successfully.')
    },
    onError: (error) => notify.fromError(error, 'Failed to update variant.'),
  })
}

export function useCreateProductVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'create-variant'],
    mutationFn: async ({ productId, variantFormValues, productValues }) => {
      const formData = buildSingleVariantCreatePayload(variantFormValues, productId, productValues)
      await createProductVariant(productId, formData)
      return getProductById(productId)
    },
    onSuccess: (freshRecord, variables) => {
      const catalogProduct = toCatalogProduct(freshRecord)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success('New variant added successfully.')
    },
    onError: (error) => notify.fromError(error, 'Failed to add variant.'),
  })
}

export function useDeleteProductVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'delete-variant'],
    mutationFn: async ({ productId, productVariantId }) => {
      await deleteProductVariant(productVariantId)
      return getProductById(productId)
    },
    onSuccess: (freshRecord, variables) => {
      const catalogProduct = toCatalogProduct(freshRecord)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, freshRecord)
      patchProductInListCache(queryClient, catalogProduct)
      notify.success('Variant removed.')
    },
    onError: (error) => notify.fromError(error, 'Failed to remove variant.'),
  })
}

export function useUpdateProductStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-status'],
    mutationFn: ({ productId }) => toggleProductActive(productId),
    onSuccess: (record, variables) => {
      const catalogProduct = toCatalogProduct(record)
      if (!catalogProduct) return

      syncProductDetailCache(queryClient, variables.productId, record)
      patchProductInListCache(queryClient, catalogProduct)

      notify.success(
        catalogProduct.status === 'active'
          ? `${catalogProduct.name} is now active and visible in your catalogue.`
          : `${catalogProduct.name} has been deactivated.`,
      )
    },
    onError: (error, variables) => notify.fromError(
      error,
      variables.status === 'active' ? 'Failed to activate product.' : 'Failed to deactivate product.',
    ),
  })
}

export function useUpdateProductsStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'update-status-bulk'],
    mutationFn: async ({ productIds }) => {
      const records = await Promise.all(
        productIds.map((productId) => toggleProductActive(productId)),
      )
      return { records }
    },
    onSuccess: ({ records }, variables) => {
      const catalogProducts = records
        .map((record) => toCatalogProduct(record))
        .filter(Boolean)
      const updatedById = new Map(catalogProducts.map((product) => [product.id, product]))

      queryClient.setQueryData(productQueryKeys.list(), (current) => {
        if (!Array.isArray(current)) return current
        return current.map((product) => updatedById.get(product.id) ?? product)
      })

      variables.productIds.forEach((productId) => {
        const record = records.find((item) => item.id === productId)
        if (record) {
          queryClient.setQueryData(productQueryKeys.detail(productId), record)
        }
      })

      queryClient.invalidateQueries({ queryKey: productQueryKeys.all })

      const count = variables.productIds.length
      notify.success(
        variables.status === 'active'
          ? `${count} product${count === 1 ? '' : 's'} activated successfully.`
          : `${count} product${count === 1 ? '' : 's'} deactivated successfully.`,
      )
    },
    onError: (error, variables) => notify.fromError(
      error,
      variables.status === 'active' ? 'Failed to activate products.' : 'Failed to deactivate products.',
    ),
  })
}

export function useDuplicateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'duplicate'],
    mutationFn: (sourceProductId) => {
      const currentProducts = queryClient.getQueryData(productQueryKeys.list()) ?? []
      const knownProductIds = currentProducts.map((product) => product.id)
      return duplicateProduct(sourceProductId, knownProductIds)
    },
    onSuccess: ({ record, catalogProducts }) => {
      if (catalogProducts) {
        queryClient.setQueryData(productQueryKeys.list(), catalogProducts)
        return
      }

      const catalogProduct = toCatalogProduct(record)
      if (!catalogProduct) return

      patchProductInListCache(queryClient, catalogProduct, { insertIfMissing: true })
    },
    onError: (error) => notify.fromError(error, 'Failed to duplicate product.'),
  })
}

/** @deprecated Use useDuplicateProductMutation */
export const useReplicateProductMutation = useDuplicateProductMutation

export function useDeleteProductsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'delete'],
    mutationFn: (productIds) => deleteProducts(productIds),
    onSuccess: (deletedIds) => {
      removeProductsFromListCache(queryClient, deletedIds)

      deletedIds.forEach((productId) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.detail(productId) })
      })

      const count = deletedIds.length
      notify.success(
        count === 1
          ? 'Product deleted successfully.'
          : `${count} products deleted successfully.`,
      )
    },
    onError: (error) => notify.fromError(error, 'Failed to delete product.'),
  })
}
