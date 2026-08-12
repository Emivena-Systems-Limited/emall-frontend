import { useOutletContext } from 'react-router'
import ChangePasswordPanel from '../../components/profile/ChangePasswordPanel'

export default function ChangePasswordPage() {
  const { onChangePassword, isChangingPassword } = useOutletContext()

  return (
    <ChangePasswordPanel
      onChangePassword={onChangePassword}
      isSubmitting={isChangingPassword}
    />
  )
}
