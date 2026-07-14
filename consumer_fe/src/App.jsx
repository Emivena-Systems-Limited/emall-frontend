import AppRoutes from './routes/AppRoutes'
import MiniCartDrawer from './components/cart/MiniCartDrawer'
import { MiniCartProvider } from './context/MiniCartContext'
import { useCartBootstrap } from './hooks/useCartBootstrap'

export default function App() {
  useCartBootstrap()

  return (
    <MiniCartProvider>
      <AppRoutes />
      <MiniCartDrawer />
    </MiniCartProvider>
  )
}
