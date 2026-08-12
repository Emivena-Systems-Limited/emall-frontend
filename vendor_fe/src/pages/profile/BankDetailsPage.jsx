import { useOutletContext } from 'react-router'
import BankDetailsPanel from '../../components/profile/BankDetailsPanel'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'

export default function BankDetailsPage() {
  const {
    bankDetails,
    isBankLoading,
    bankError,
    refetchBank,
    onUpdateBankDetails,
    isUpdatingBank,
  } = useOutletContext()

  if (isBankLoading) return <ProfilePageLoader label="Loading bank details…" />

  if (bankError) {
    return (
      <ProfileErrorState
        title="Unable to load bank details"
        message={bankError?.message}
        onRetry={refetchBank}
      />
    )
  }

  return (
    <BankDetailsPanel
      bankDetails={bankDetails}
      onUpdateBankDetails={onUpdateBankDetails}
      isUpdating={isUpdatingBank}
    />
  )
}
