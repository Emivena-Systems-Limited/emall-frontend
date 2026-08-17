import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  changePassword,
  getBusinessInformation,
  getDocuments,
  getProfile,
  removeProfilePicture,
  updateBusinessInformation,
  updateProfile,
  updateVendorAddress,
  uploadDocument,
  uploadProfilePicture,
} from '../services/profileService'
import { logoutVendor } from '../services/authService'
import { logout, updateUser } from '../store/slices/authSlice'
import { persistor, store } from '../store/store'
import { markPasswordChanged } from '../utils/passwordChangeSession'

const STALE_TIME = 60 * 1000

export const profileQueryKeys = {
  all: ['vendor-profile'],
  profile: () => [...profileQueryKeys.all, 'profile'],
  business: () => [...profileQueryKeys.all, 'business'],
  documents: () => [...profileQueryKeys.all, 'documents'],
}

export function useVendorProfile() {
  return useQuery({
    queryKey: profileQueryKeys.profile(),
    queryFn: getProfile,
    staleTime: STALE_TIME,
  })
}

export function useBusinessInformation() {
  return useQuery({
    queryKey: profileQueryKeys.business(),
    queryFn: getBusinessInformation,
    staleTime: STALE_TIME,
  })
}

export function useVendorDocuments() {
  return useQuery({
    queryKey: profileQueryKeys.documents(),
    queryFn: getDocuments,
    staleTime: STALE_TIME,
  })
}

function useInvalidateProfile() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.all })
}

export function useUpdateProfileMutation() {
  const invalidate = useInvalidateProfile()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result?.user) {
        dispatch(updateUser(result.user))
      }
      invalidate()
    },
  })
}

export function useUpdateVendorAddressMutation() {
  const invalidate = useInvalidateProfile()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: updateVendorAddress,
    onSuccess: (result) => {
      if (result?.address) {
        const currentAddresses = store.getState().auth.user?.addresses
        const previousAddresses = currentAddresses && typeof currentAddresses === 'object' && !Array.isArray(currentAddresses)
          ? currentAddresses
          : {}

        dispatch(updateUser({
          address_id: result.address.id,
          addresses: {
            ...previousAddresses,
            ...result.address,
            id: result.address.id,
          },
        }))
      }
      invalidate()
    },
  })
}

export function useUpdateBusinessInformationMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: updateBusinessInformation,
    onSuccess: invalidate,
  })
}

export function useUploadProfilePictureMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: invalidate,
  })
}

export function useRemoveProfilePictureMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: removeProfilePicture,
    onSuccess: invalidate,
  })
}

export function useUploadDocumentMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: invalidate,
  })
}

export function useChangePasswordMutation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      markPasswordChanged()

      try {
        await logoutVendor()
      } catch {
        // Local session is still cleared so the vendor can sign in again.
      }

      dispatch(logout())
      persistor.persist()
      navigate('/login', { replace: true, state: { passwordReset: true } })
    },
  })
}
