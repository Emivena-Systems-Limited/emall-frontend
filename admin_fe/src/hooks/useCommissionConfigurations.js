import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import notify from '../lib/notify'
import { fetchCommissionConfigurations, updateCategoryCommissionRate, updateCommissionRate, updateVendorCommissionRate } from '../services/commissionConfigurationService'
import { parseApiError } from '../utils/parseApiError'

export const COMMISSION_CONFIG_QUERY_KEY = ['commission-configurations']

export function useCommissionConfigurations() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: COMMISSION_CONFIG_QUERY_KEY,
    queryFn: fetchCommissionConfigurations,
  })

  const patch = (updater) => {
    queryClient.setQueryData(COMMISSION_CONFIG_QUERY_KEY, (current) => {
      if (!current) return current
      return updater(current)
    })
  }

  const mutation = useMutation({
    mutationKey: ['commission-configurations', 'update-rate'],
    mutationFn: updateCommissionRate,
    onSuccess: (result, defaultRate) => {
      if (result.configuration) {
        queryClient.setQueryData(COMMISSION_CONFIG_QUERY_KEY, result.configuration)
      } else {
        patch((current) => ({ ...current, defaultRate }))
      }
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error, 'Could not update the commission rate.').message)
    },
  })

  const vendorMutation = useMutation({
    mutationKey: ['commission-configurations', 'update-vendor-rate'],
    mutationFn: updateVendorCommissionRate,
    onSuccess: (result, variables) => {
      if (result.configuration) {
        queryClient.setQueryData(COMMISSION_CONFIG_QUERY_KEY, result.configuration)
        return
      }
      patch((current) => ({
        ...current,
        vendors: current.vendors.map((item) => (
          String(item.vendorId) === String(variables.vendorId) ? { ...item, rate: variables.rate } : item
        )),
      }))
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error, 'Could not update the vendor commission rate.').message)
    },
  })

  const categoryMutation = useMutation({
    mutationKey: ['commission-configurations', 'update-category-rate'],
    mutationFn: updateCategoryCommissionRate,
    onSuccess: (result, variables) => {
      if (result.configuration) {
        queryClient.setQueryData(COMMISSION_CONFIG_QUERY_KEY, result.configuration)
        return
      }
      patch((current) => ({
        ...current,
        categories: current.categories.map((item) => (
          String(item.id) === String(variables.categoryId) ? { ...item, rate: variables.rate } : item
        )),
      }))
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error, 'Could not update the category commission rate.').message)
    },
  })

  return {
    defaultRate: query.data?.defaultRate ?? null,
    vendors: query.data?.vendors ?? [],
    categories: query.data?.categories ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    patch,
    updateRate: mutation.mutateAsync,
    updateVendorRate: vendorMutation.mutateAsync,
    updateCategoryRate: categoryMutation.mutateAsync,
    isUpdating: mutation.isPending || vendorMutation.isPending || categoryMutation.isPending,
  }
}
