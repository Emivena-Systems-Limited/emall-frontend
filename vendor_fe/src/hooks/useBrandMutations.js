import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrand, getApprovedBrands } from '../services/brandsService'
import notify from '../lib/notify'
import { brandQueryKeys } from './useBrands'

export function useCreateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['brands', 'create'],
    mutationFn: createBrand,
    onSuccess: async (brand) => {
      await queryClient.fetchQuery({
        queryKey: brandQueryKeys.approved(),
        queryFn: getApprovedBrands,
      })
      notify.success(`${brand.name} added successfully`)
    },
    onError: (error) => notify.fromError(error, 'Could not add brand'),
  })
}
