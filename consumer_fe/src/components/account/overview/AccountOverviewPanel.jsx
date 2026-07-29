import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { getUserAddresses } from '../../../services/addressService'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'
import { notify } from '../../../lib/notify'
import { getDefaultShippingAddress } from '../../../utils/accountProfile'
import { useAccountProfile } from '../../../hooks/useAccountProfile'
import ProfileSummaryCard from './ProfileSummaryCard'
import AccountStatisticCards from './AccountStatisticCards'
import AccountInformationCard from './AccountInformationCard'
import DefaultAddressCard from './DefaultAddressCard'
import EditProfileModal from './EditProfileModal'
import DeleteProfileModal from './DeleteProfileModal'

export default function AccountOverviewPanel() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isDeletingProfile, setIsDeletingProfile] = useState(false)

  const {
    liveUser,
    profile,
    displayedProfile,
    updateProfileMutation,
    uploadAvatarMutation,
    deleteAvatarMutation,
    deleteProfileMutation,
    uploadAvatar,
    removeAvatar,
    saveProfile,
    deleteProfile,
  } = useAccountProfile()

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: getUserAddresses,
    staleTime: 60_000,
    retry: 1,
  })

  const defaultAddress = getDefaultShippingAddress(addressesQuery.data)

  const handleProfileSave = async (payload) => {
    try {
      await saveProfile(payload)
      setIsEditingProfile(false)
    } catch {
      /* Error toast is handled by the profile hook mutation. */
    }
  }

  const handleDeleteProfile = async () => {
    await deleteProfile()
    dispatch(logout())
    clearAuthOtpSession()
    await persistor.persist()
    notify.success('Account deleted successfully')
    navigate('/')
  }

  return (
    <>
      <ProfileSummaryCard
        profile={displayedProfile}
        isUploading={uploadAvatarMutation.isPending}
        onEdit={() => setIsEditingProfile(true)}
        onUpload={uploadAvatar}
        onDeleteAvatar={removeAvatar}
      />
      <AccountStatisticCards />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <AccountInformationCard
          profile={profile}
          user={liveUser}
          onDeleteProfile={() => setIsDeletingProfile(true)}
        />
        <DefaultAddressCard address={defaultAddress} isLoading={addressesQuery.isLoading} />
      </div>

      {isEditingProfile ? (
        <EditProfileModal
          initialProfile={liveUser}
          isSaving={updateProfileMutation.isPending}
          onClose={() => setIsEditingProfile(false)}
          onSave={handleProfileSave}
        />
      ) : null}

      {isDeletingProfile ? (
        <DeleteProfileModal
          isDeleting={deleteProfileMutation.isPending}
          onClose={() => setIsDeletingProfile(false)}
          onConfirm={handleDeleteProfile}
        />
      ) : null}
    </>
  )
}
