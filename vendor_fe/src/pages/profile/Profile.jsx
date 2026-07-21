import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProfilePageHeader, {
  ProfilePanel,
  isProfileComplete,
  useProfileForm,
  useProfileUser,
} from '../../components/profile/ProfilePanel'
import { DEV_PROFILE_FIELDS } from '../../constants/profileData'
import notify from '../../lib/notify'
import { updateUser } from '../../store/slices/authSlice'

export default function Profile() {
  const dispatch = useDispatch()
  const authUser = useSelector((state) => state.auth.user)
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const user = useProfileUser(authUser, devDataEnabled, DEV_PROFILE_FIELDS)
  const { form, errors, validate, handleFieldChange } = useProfileForm(user)
  const complete = isProfileComplete(user)

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      dispatch(updateUser({
        admin_full_name: form.admin_full_name.trim(),
        phone_number: form.phone_number.trim(),
      }))
      notify.success('Profile updated.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    notify.info(enabled ? 'Loaded dummy profile data.' : 'Using live account data.')
  }

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="page-enter space-y-6">
        <ProfilePageHeader
          complete={complete}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
        />

        <ProfilePanel
          user={user}
          form={form}
          errors={errors}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </DashboardLayout>
  )
}
