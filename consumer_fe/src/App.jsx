import AppRoutes from './routes/AppRoutes'
import MiniCartDrawer from './components/cart/MiniCartDrawer'
import SavedItemsDrawer from './components/cart/SavedItemsDrawer'
import { MiniCartProvider } from './context/MiniCartContext'
import { SavedItemsDrawerProvider } from './context/SavedItemsDrawerContext'
import { useCartBootstrap } from './hooks/useCartBootstrap'

export default function App() {
  useCartBootstrap()

  return (
    <MiniCartProvider>
      <SavedItemsDrawerProvider>
        <AppRoutes />
        <MiniCartDrawer />
        <SavedItemsDrawer />
      </SavedItemsDrawerProvider>
    </MiniCartProvider>
  )
}
