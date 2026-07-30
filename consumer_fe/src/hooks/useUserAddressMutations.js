import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUserAddress, deleteUserAddress, updateUserAddress } from '../services/addressService'
import { notify } from '../lib/notify'
import { LOCATION_OTHER_VALUE } from '../constants/ghanaLocations'
import { buildAddressPayload } from '../utils/userAddressHelpers'

export function useUserAddressMutations({ onSaved } = {}) {
  const queryClient = useQueryClient()

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['user-addresses'] })

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (
      id ? updateUserAddress({ addressId: id, payload }) : createUserAddress(payload)
    ),
    onSuccess: async (_data, variables) => {
      await refresh()
      notify.success(variables.id ? 'Address updated' : 'Address added')
      onSaved?.()
    },
    onError: (error) => notify.fromError(error, 'Unable to save address'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUserAddress,
    onSuccess: async () => {
      await refresh()
      notify.success('Address deleted')
    },
    onError: (error) => notify.fromError(error, 'Unable to delete address'),
  })

  const submitAddressForm = (form, editingId) => {
    if (!form.region || !form.city_or_town || (form.city_or_town === LOCATION_OTHER_VALUE && !form.town_custom.trim())) {
      notify.error('Please select a region and city or town')
      return
    }

    saveMutation.mutate({
      id: editingId,
      payload: buildAddressPayload(form),
    })
  }

  return {
    saveMutation,
    deleteMutation,
    submitAddressForm,
  }
}
