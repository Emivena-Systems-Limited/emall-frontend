import AppRoutes from './routes/AppRoutes'
import { useCartBootstrap } from './hooks/useCartBootstrap'

export default function App() {
  useCartBootstrap()
  return <AppRoutes />
}
