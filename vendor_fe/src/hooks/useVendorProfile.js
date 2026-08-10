import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  getBankDetails,
  getBusinessInformation,
  getDocuments,
  getProfile,
  removeProfilePicture,
  updateBankDetails,
  updateBusinessInformation,
  updateProfile,
  uploadDocument,
  uploadProfilePicture,
} from '../services/profileService'

const STALE_TIME = 60 * 1000

export const profileQueryKeys = {
  all: ['vendor-profile'],
  profile: () => [...profileQueryKeys.all, 'profile'],
  business: () => [...profileQueryKeys.all, 'business'],
  bank: () => [...profileQueryKeys.all, 'bank'],
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

export function useBankDetails() {
  return useQuery({
    queryKey: profileQueryKeys.bank(),
    queryFn: getBankDetails,
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
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: invalidate,
  })
}

export function useUpdateBusinessInformationMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: updateBusinessInformation,
    onSuccess: invalidate,
  })
}

export function useUpdateBankDetailsMutation() {
  const invalidate = useInvalidateProfile()
  return useMutation({
    mutationFn: updateBankDetails,
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
  return useMutation({
    mutationFn: changePassword,
  })
}
