import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EMPTY_FINANCE_SETTINGS } from '../constants/financeLedger'
import notify from '../lib/notify'
import { fetchPayoutSettings, savePayoutSettings } from '../services/payoutSettingsService'
import { parseApiError } from '../utils/parseApiError'

export const PAYOUT_SETTINGS_QUERY_KEY = ['payout-settings']

export function usePayoutSettings() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: PAYOUT_SETTINGS_QUERY_KEY,
    queryFn: fetchPayoutSettings,
  })

  const mutation = useMutation({
    mutationKey: ['payout-settings', 'save'],
    mutationFn: ({ silent, ...payload }) => savePayoutSettings(payload),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(PAYOUT_SETTINGS_QUERY_KEY, {
        settings: result.settings,
        defaultRate: result.defaultRate,
      })
      if (!variables.silent) notify.success(result.message || 'Finance settings saved.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not save finance settings.')
    },
  })

  const loaded = query.data
  return {
    settings: loaded?.settings ?? EMPTY_FINANCE_SETTINGS,
    defaultRate: loaded?.defaultRate ?? 10,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    saveSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  }
}
