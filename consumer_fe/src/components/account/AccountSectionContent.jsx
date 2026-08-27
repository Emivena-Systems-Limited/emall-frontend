import AccountOverviewPanel from './overview/AccountOverviewPanel'
import AccountAddressesSection from './AccountAddressesSection'
import AccountOrdersPanel from './AccountOrdersPanel'
import AccountWishlistPanel from './AccountWishlistPanel'
import AccountCouponsPanel from './AccountCouponsPanel'
import AccountReviewsPanel from './AccountReviewsPanel'
import AccountReturnsPanel from './AccountReturnsPanel'
import AccountFollowedStoresPanel from './AccountFollowedStoresPanel'
import {
  AccountNotificationsPanel,
  AccountSettingsPanel,
  AccountSupportPanel,
} from './AccountPlaceholderPanels'
import { resolveAccountSectionId } from './accountNavigation'

export default function AccountSectionContent({ pathname }) {
  switch (resolveAccountSectionId(pathname)) {
    case 'orders':
      return <AccountOrdersPanel />
    case 'wishlist':
      return <AccountWishlistPanel />
    case 'coupons':
      return <AccountCouponsPanel />
    case 'reviews':
      return <AccountReviewsPanel />
    case 'returns':
      return <AccountReturnsPanel />
    case 'stores':
      return <AccountFollowedStoresPanel />
    case 'addresses':
      return <AccountAddressesSection />
    case 'settings':
      return <AccountSettingsPanel />
    case 'notifications':
      return <AccountNotificationsPanel />
    case 'support':
      return <AccountSupportPanel />
    case 'overview':
    default:
      return <AccountOverviewPanel />
  }
}
