import { Routes, Route } from 'react-router'
import LandingPage from '../pages/LandingPage'
import DeveloperGuide from '../pages/DeveloperGuide'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/products/Products'
import AddProduct from '../pages/products/AddProduct'
import EditProduct from '../pages/products/EditProduct'
import ViewProduct from '../pages/products/ViewProduct'
import Orders from '../pages/orders/Orders'
import OrderDetails from '../pages/orders/OrderDetails'
import Inventory from '../pages/inventory/Inventory'
import Notifications from '../pages/notifications/Notifications'
import Login from '../pages/auth_pages/Login'
import Signup from '../pages/auth_pages/Signup'
import VerifyAccount from '../pages/auth_pages/VerifyAccount'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'

const guestOnly = (page) => <GuestOnlyRoute>{page}</GuestOnlyRoute>
const protectedPage = (page) => <ProtectedRoute>{page}</ProtectedRoute>

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={guestOnly(<Login />)} />
      <Route path="/signup" element={guestOnly(<Signup />)} />
      <Route path="/verify-account" element={guestOnly(<VerifyAccount />)} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/products" element={protectedPage(<Products />)} />
      <Route path="/products/new" element={protectedPage(<AddProduct />)} />
      <Route path="/products/:productId/edit" element={protectedPage(<EditProduct />)} />
      <Route path="/products/:productId/view" element={protectedPage(<ViewProduct />)} />
      <Route path="/orders" element={protectedPage(<Orders />)} />
      <Route path="/orders/:orderId" element={protectedPage(<OrderDetails />)} />
      <Route path="/inventory" element={protectedPage(<Inventory />)} />
      <Route path="/notifications" element={protectedPage(<Notifications />)} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
