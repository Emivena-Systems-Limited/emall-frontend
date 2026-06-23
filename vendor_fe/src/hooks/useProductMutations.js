import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProducts, replicateProduct, toCatalogProduct, updateProduct } from '../services/productService'
import notify from '../lib/notify'
import { productQueryKeys } from './useProducts'

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

      queryClient.setQueryData(productQueryKeys.list(), (current = []) => {
        const next = Array.isArray(current) ? current : []
        if (next.some((product) => product.id === catalogProduct.id)) {
          return next.map((product) => (
            product.id === catalogProduct.id ? catalogProduct : product
          ))
        }
        return [catalogProduct, ...next]
      })

      queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
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

      queryClient.setQueryData(productQueryKeys.detail(variables.productId), record)
      queryClient.setQueryData(productQueryKeys.list(), (current = []) => {
        const next = Array.isArray(current) ? current : []
        return next.map((product) => (
          product.id === catalogProduct.id ? catalogProduct : product
        ))
      })

      queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
      notify.success(getUpdateSuccessMessage(catalogProduct))
    },
    onError: (error) => notify.fromError(error, 'Failed to update product.'),
  })
}

export function useReplicateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'replicate'],
    mutationFn: (productId) => replicateProduct(productId),
    onSuccess: (record) => {
      const catalogProduct = toCatalogProduct(record)
      if (!catalogProduct) return

      queryClient.setQueryData(productQueryKeys.list(), (current = []) => {
        const next = Array.isArray(current) ? current : []
        if (next.some((product) => product.id === catalogProduct.id)) {
          return next
        }
        return [catalogProduct, ...next]
      })

      queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
      notify.success(`${catalogProduct.name} was duplicated successfully.`)
    },
    onError: (error) => notify.fromError(error, 'Failed to duplicate product.'),
  })
}

export function useDeleteProductsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['products', 'delete'],
    mutationFn: (productIds) => deleteProducts(productIds),
    onSuccess: (deletedIds) => {
      const deletedSet = new Set(deletedIds)

      queryClient.setQueryData(productQueryKeys.list(), (current = []) => (
        current.filter((product) => !deletedSet.has(product.id))
      ))

      deletedIds.forEach((productId) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.detail(productId) })
      })

      queryClient.invalidateQueries({ queryKey: productQueryKeys.all })

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
