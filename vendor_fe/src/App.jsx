import AppRoutes from './routes/AppRoutes'
import { VendorNotificationsProvider } from './components/notifications/VendorNotificationsProvider'

export default function App() {
  return (
    <VendorNotificationsProvider>
      <AppRoutes />
    </VendorNotificationsProvider>
  )
}
