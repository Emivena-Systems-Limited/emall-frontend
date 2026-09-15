import AccountOverviewPanel from './overview/AccountOverviewPanel'
import AccountAddressesSection from './AccountAddressesSection'
import AccountOrdersPanel from './AccountOrdersPanel'
import AccountWishlistPanel from './AccountWishlistPanel'
import AccountCouponsPanel from './AccountCouponsPanel'
import AccountReviewsPanel from './AccountReviewsPanel'
import AccountReturnsPanel from './AccountReturnsPanel'
import AccountFollowedStoresPanel from './AccountFollowedStoresPanel'
import AccountSupportPortal from './AccountSupportPortal'
import AccountNotificationsPanel from './AccountNotificationsPanel'
import AccountNotificationSettingsPanel from './AccountNotificationSettingsPanel'
import { AccountSettingsPanel } from './AccountPlaceholderPanels'
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
      return pathname.startsWith('/account/notifications/settings')
        ? <AccountNotificationSettingsPanel />
        : <AccountNotificationsPanel />
    case 'support':
      return <AccountSupportPortal pathname={pathname} />
    case 'overview':
    default:
      return <AccountOverviewPanel />
  }
}
