import AppRoutes from './routes/AppRoutes'
import NavigationTracker from './components/navigation/NavigationTracker'

export default function App() {
  return (
    <>
      <NavigationTracker />
      <AppRoutes />
    </>
  )
}
