import { useOutletContext } from 'react-router'
import BusinessInformationPanel from '../../components/profile/BusinessInformationPanel'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'

export default function BusinessInformationPage() {
  const {
    business,
    isBusinessLoading,
    businessError,
    refetchBusiness,
    onUpdateBusiness,
    isUpdatingBusiness,
  } = useOutletContext()

  if (isBusinessLoading) return <ProfilePageLoader label="Loading business information…" />

  if (businessError) {
    return (
      <ProfileErrorState
        title="Unable to load business information"
        message={businessError?.message}
        onRetry={refetchBusiness}
      />
    )
  }

  return (
    <BusinessInformationPanel
      business={business}
      onUpdateBusiness={onUpdateBusiness}
      isUpdating={isUpdatingBusiness}
    />
  )
}
