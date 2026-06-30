import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrand } from '../services/brandsService'
import { sortBrandsAlphabetically } from '../utils/normalizeBrands'
import notify from '../lib/notify'
import { brandQueryKeys } from './useBrands'

export function useCreateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['brands', 'create'],
    mutationFn: createBrand,
    onSuccess: (brand) => {
      queryClient.setQueryData(brandQueryKeys.approved(), (current = []) => {
        const next = Array.isArray(current) ? [...current] : []
        if (next.some((item) => item.id === brand.id)) {
          return next
        }
        return sortBrandsAlphabetically([...next, brand])
      })
      notify.success(`${brand.name} added successfully`)
    },
    onError: (error) => notify.fromError(error, 'Could not add brand'),
  })
}
