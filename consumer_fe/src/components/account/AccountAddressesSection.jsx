import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getUserAddresses } from '../../services/addressService'
import AccountAddressesPanel from './AccountAddressesPanel'

export default function AccountAddressesSection() {
  const { user } = useSelector((state) => state.auth)
  const isAuthenticated = Boolean(user?.id ?? user?.email)

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: getUserAddresses,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  })

  return (
    <AccountAddressesPanel
      data={addressesQuery.data}
      isLoading={addressesQuery.isLoading}
    />
  )
}
