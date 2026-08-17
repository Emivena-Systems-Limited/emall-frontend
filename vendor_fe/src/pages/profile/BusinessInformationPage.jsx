import { useOutletContext } from 'react-router'
import BusinessInformationPanel from '../../components/profile/BusinessInformationPanel'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'

export default function BusinessInformationPage() {
  const {
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
    onUpdateProfile,
    onUpdateAddress,
    isUpdatingProfile,
    isUpdatingAddress,
  } = useOutletContext()

  if (isProfileLoading) return <ProfilePageLoader label="Loading business information…" />

  if (profileError) {
    return (
      <ProfileErrorState
        title="Unable to load business information"
        message={profileError?.message}
        onRetry={refetchProfile}
      />
    )
  }

  return (
    <BusinessInformationPanel
      profile={profile}
      onUpdateBusiness={onUpdateProfile}
      onUpdateAddress={onUpdateAddress}
      isUpdating={isUpdatingProfile}
      isUpdatingAddress={isUpdatingAddress}
    />
  )
}
