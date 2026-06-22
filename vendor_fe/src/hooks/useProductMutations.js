import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct, toCatalogProduct } from '../services/productService'
import notify from '../lib/notify'
import { productQueryKeys } from './useProducts'

function getCreateSuccessMessage(catalogProduct) {
  if (catalogProduct.apiStatus === 'approved') {
    return `${catalogProduct.name} was created and is now live in your catalogue.`
  }

  return `${catalogProduct.name} was submitted successfully.`
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
