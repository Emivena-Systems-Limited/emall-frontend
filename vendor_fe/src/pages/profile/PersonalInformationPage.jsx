import { useOutletContext } from 'react-router'
import PersonalInformationPanel from '../../components/profile/PersonalInformationPanel'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'

export default function PersonalInformationPage() {
  const {
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
    onUpdateProfile,
    onUploadPicture,
    onRemovePicture,
    isUpdatingProfile,
    isUploadingPicture,
    isRemovingPicture,
  } = useOutletContext()

  if (isProfileLoading) return <ProfilePageLoader label="Loading personal information…" />

  if (profileError) {
    return (
      <ProfileErrorState
        title="Unable to load personal information"
        message={profileError?.message}
        onRetry={refetchProfile}
      />
    )
  }

  return (
    <PersonalInformationPanel
      profile={profile}
      onUpdateProfile={onUpdateProfile}
      onUploadPicture={onUploadPicture}
      onRemovePicture={onRemovePicture}
      isUpdating={isUpdatingProfile}
      isUploadingPicture={isUploadingPicture}
      isRemovingPicture={isRemovingPicture}
    />
  )
}
