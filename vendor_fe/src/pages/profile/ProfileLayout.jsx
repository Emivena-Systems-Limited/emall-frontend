import { Outlet } from 'react-router'
import { shallowEqual, useSelector } from 'react-redux'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProfileNavigation from '../../components/profile/ProfileNavigation'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'
import {
  useChangePasswordMutation,
  useRemoveProfilePictureMutation,
  useUpdateProfileMutation,
  useUpdateVendorAddressMutation,
  useUploadDocumentMutation,
  useUploadProfilePictureMutation,
  useVendorProfile,
  useVendorDocuments,
} from '../../hooks/useVendorProfile'
import { useVendorMetricsBootstrap } from '../../hooks/useVendorMetricsBootstrap'
import { mergeProfileWithAuthUser } from '../../utils/profileFormUtils'

export default function ProfileLayout() {
  const { user } = useSelector((state) => state.auth)
  const accountSummary = useSelector((state) => ({
    productsListed: state.vendorMetrics.productsListed,
    totalOrders: state.vendorMetrics.totalOrders,
    averageRating: state.vendorMetrics.averageRating,
  }), shallowEqual)
  useVendorMetricsBootstrap()
  const profileQuery = useVendorProfile()
  const documentsQuery = useVendorDocuments()

  const updateProfileMutation = useUpdateProfileMutation()
  const updateAddressMutation = useUpdateVendorAddressMutation()
  const uploadPictureMutation = useUploadProfilePictureMutation()
  const removePictureMutation = useRemoveProfilePictureMutation()
  const uploadDocumentMutation = useUploadDocumentMutation()
  const changePasswordMutation = useChangePasswordMutation()

  const profile = mergeProfileWithAuthUser(profileQuery.data, user)
  const hasAuthProfile = Boolean(user)
  const isInitialLoading = profileQuery.isLoading && !hasAuthProfile

  const outletContext = {
    profile,
    accountSummary,
    documents: documentsQuery.data ?? [],
    isProfileLoading: profileQuery.isLoading && !hasAuthProfile,
    isDocumentsLoading: documentsQuery.isLoading,
    profileError: hasAuthProfile ? null : profileQuery.error,
    documentsError: documentsQuery.error,
    refetchProfile: profileQuery.refetch,
    refetchDocuments: documentsQuery.refetch,
    onUpdateProfile: (data) => updateProfileMutation.mutateAsync(data),
    onUpdateAddress: (data) => updateAddressMutation.mutateAsync(data),
    onUploadPicture: (file) => uploadPictureMutation.mutateAsync(file),
    onRemovePicture: () => removePictureMutation.mutateAsync(),
    onUploadDocument: (payload) => uploadDocumentMutation.mutateAsync(payload),
    onChangePassword: (payload) => changePasswordMutation.mutateAsync(payload),
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
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
        ) : !hasAuthProfile && profileQuery.isError ? (
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
