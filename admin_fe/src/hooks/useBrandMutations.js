import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAdminBrand } from '../services/brandService'
import { sortBrandsAlphabetically } from '../utils/normalizeBrands'
import notify from '../lib/notify'
import { brandQueryKeys } from './useBrands'

export function useCreateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin-brands', 'create-from-product'],
    mutationFn: async ({ brand_name, name }) => {
      const { brand } = await createAdminBrand({ name: brand_name || name, status: 'approved' })
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug ?? '',
        brand_name: brand.name,
      }
    },
    onSuccess: (brand) => {
      queryClient.setQueryData(brandQueryKeys.approved(), (current = []) => {
        const next = Array.isArray(current) ? [...current] : []
        if (next.some((item) => String(item.id) === String(brand.id))) return next
        return sortBrandsAlphabetically([...next, brand])
      })
      notify.success(`${brand.name} added successfully`)
    },
    onError: (error) => notify.fromError(error, 'Could not add brand'),
  })
}
