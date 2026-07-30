import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { getUserAddresses } from '../../../services/addressService'
import { logout } from '../../../store/slices/authSlice'
import { persistor } from '../../../store/store'
import { clearAuthOtpSession } from '../../../utils/authOtpSession'
import { notify } from '../../../lib/notify'
import { useAccountProfile } from '../../../hooks/useAccountProfile'
import { useUserAddressMutations } from '../../../hooks/useUserAddressMutations'
import {
  addressGroups,
  addressId,
  buildAddressPrefill,
  emptyAddressForm,
  toAddressForm,
} from '../../../utils/userAddressHelpers'
import { LOCATION_OTHER_VALUE } from '../../../constants/ghanaLocations'
import AddressFormDrawer from '../AddressFormDrawer'
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
  const [addressForm, setAddressForm] = useState(emptyAddressForm)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

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
  const { user } = useSelector((state) => state.auth)
  const isAuthenticated = Boolean(user?.id ?? user?.email)

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: getUserAddresses,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  })

  const addressLists = useMemo(
    () => addressGroups(addressesQuery.data),
    [addressesQuery.data],
  )

  useEffect(() => {
    if (addressesQuery.isError) {
      notify.fromError(addressesQuery.error, 'Unable to load saved addresses')
    }
  }, [addressesQuery.error, addressesQuery.isError])

  const closeAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm)
  }

  const { saveMutation, submitAddressForm } = useUserAddressMutations({
    onSaved: closeAddressForm,
  })

  const openAddAddress = (type = 'shipping') => {
    setAddressForm(buildAddressPrefill(liveUser, { type, isDefault: true }))
    setEditingAddressId(null)
    setShowAddressForm(true)
  }

  const openEditAddress = (address, type = 'shipping') => {
    const resolvedType = address?.type === 'billing' || type === 'billing' ? 'billing' : 'shipping'
    setAddressForm(toAddressForm(address, resolvedType))
    setEditingAddressId(addressId(address))
    setShowAddressForm(true)
  }

  const handleAddressSubmit = (event) => {
    event.preventDefault()
    submitAddressForm(addressForm, editingAddressId)
  }

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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-stretch xl:gap-6">
        <AccountInformationCard
          className="h-full"
          profile={profile}
          onDeleteProfile={() => setIsDeletingProfile(true)}
        />
        <DefaultAddressCard
          className="h-full"
          shippingAddresses={addressLists.shipping}
          billingAddresses={addressLists.billing}
          isLoading={addressesQuery.isLoading}
          onAddAddress={openAddAddress}
          onEditAddress={openEditAddress}
        />
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

      {showAddressForm ? (
        <AddressFormDrawer
          isOpen={showAddressForm}
          form={addressForm}
          editingId={editingAddressId}
          isSaving={saveMutation.isPending}
          allowTypeChange={false}
          onChange={(event) => {
            const { name, value, type, checked } = event.target
            setAddressForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
          }}
          onRegionChange={(region) => setAddressForm((current) => ({ ...current, region, city_or_town: '', town_custom: '' }))}
          onTownChange={(city_or_town) => setAddressForm((current) => ({
            ...current,
            city_or_town,
            town_custom: city_or_town === LOCATION_OTHER_VALUE ? current.town_custom : '',
          }))}
          onTownCustomChange={(town_custom) => setAddressForm((current) => ({ ...current, town_custom }))}
          onClose={closeAddressForm}
          onSubmit={handleAddressSubmit}
        />
      ) : null}
    </>
  )
}
