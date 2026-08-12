import { Outlet } from 'react-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProfileNavigation from '../../components/profile/ProfileNavigation'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'
import {
  useChangePasswordMutation,
  useRemoveProfilePictureMutation,
  useUpdateBankDetailsMutation,
  useUpdateBusinessInformationMutation,
  useUpdateProfileMutation,
  useUploadDocumentMutation,
  useUploadProfilePictureMutation,
  useVendorProfile,
  useBusinessInformation,
  useBankDetails,
  useVendorDocuments,
} from '../../hooks/useVendorProfile'

export default function ProfileLayout() {
  const profileQuery = useVendorProfile()
  const businessQuery = useBusinessInformation()
  const bankQuery = useBankDetails()
  const documentsQuery = useVendorDocuments()

  const updateProfileMutation = useUpdateProfileMutation()
  const updateBusinessMutation = useUpdateBusinessInformationMutation()
  const updateBankMutation = useUpdateBankDetailsMutation()
  const uploadPictureMutation = useUploadProfilePictureMutation()
  const removePictureMutation = useRemoveProfilePictureMutation()
  const uploadDocumentMutation = useUploadDocumentMutation()
  const changePasswordMutation = useChangePasswordMutation()

  const isInitialLoading = profileQuery.isLoading

  const outletContext = {
    profile: profileQuery.data,
    business: businessQuery.data,
    bankDetails: bankQuery.data,
    documents: documentsQuery.data ?? [],
    isProfileLoading: profileQuery.isLoading,
    isBusinessLoading: businessQuery.isLoading,
    isBankLoading: bankQuery.isLoading,
    isDocumentsLoading: documentsQuery.isLoading,
    profileError: profileQuery.error,
    businessError: businessQuery.error,
    bankError: bankQuery.error,
    documentsError: documentsQuery.error,
    refetchProfile: profileQuery.refetch,
    refetchBusiness: businessQuery.refetch,
    refetchBank: bankQuery.refetch,
    refetchDocuments: documentsQuery.refetch,
    onUpdateProfile: (data) => updateProfileMutation.mutateAsync(data),
    onUpdateBusiness: (data) => updateBusinessMutation.mutateAsync(data),
    onUpdateBankDetails: (data) => updateBankMutation.mutateAsync(data),
    onUploadPicture: (file) => uploadPictureMutation.mutateAsync(file),
    onRemovePicture: () => removePictureMutation.mutateAsync(),
    onUploadDocument: (payload) => uploadDocumentMutation.mutateAsync(payload),
    onChangePassword: (payload) => changePasswordMutation.mutateAsync(payload),
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingBusiness: updateBusinessMutation.isPending,
    isUpdatingBank: updateBankMutation.isPending,
    isUploadingPicture: uploadPictureMutation.isPending,
    isRemovingPicture: removePictureMutation.isPending,
    isUploadingDocument: uploadDocumentMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  }

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and account settings.
          </p>
        </div>

        <ProfileNavigation />

        {isInitialLoading ? (
          <ProfilePageLoader />
        ) : profileQuery.isError ? (
          <ProfileErrorState
            message={profileQuery.error?.message}
            onRetry={() => profileQuery.refetch()}
            isRetrying={profileQuery.isFetching}
          />
        ) : (
          <Outlet context={outletContext} />
        )}
      </div>
    </DashboardLayout>
  )
}
