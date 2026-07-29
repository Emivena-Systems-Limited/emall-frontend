import { useQuery } from '@tanstack/react-query'
import { getUserAddresses } from '../../services/addressService'
import AccountAddressesPanel from './AccountAddressesPanel'

export default function AccountAddressesSection() {
  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: getUserAddresses,
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
