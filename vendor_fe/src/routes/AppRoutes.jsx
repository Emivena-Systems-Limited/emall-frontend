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
import OrderProducts from '../pages/orders/OrderProducts'
import Customers from '../pages/customers/Customers'
import CustomerDetails from '../pages/customers/CustomerDetails'
import Promotions from '../pages/promotions/Promotions'
import CreatePromotion from '../pages/promotions/CreatePromotion'
import EditPromotion from '../pages/promotions/EditPromotion'
import ViewPromotion from '../pages/promotions/ViewPromotion'
import Inventory from '../pages/inventory/Inventory'
import Notifications from '../pages/notifications/Notifications'
import Login from '../pages/auth_pages/Login'
import Signup from '../pages/auth_pages/Signup'
import VerifyAccount from '../pages/auth_pages/VerifyAccount'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'

const protectedPage = (page) => <ProtectedRoute>{page}</ProtectedRoute>

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
      </Route>

      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/products" element={protectedPage(<Products />)} />
      <Route path="/products/new" element={protectedPage(<AddProduct />)} />
      <Route path="/products/:productId/edit" element={protectedPage(<EditProduct />)} />
      <Route path="/products/:productId/view" element={protectedPage(<ViewProduct />)} />
      <Route path="/orders" element={protectedPage(<Orders />)} />
      <Route path="/orders/:orderId/products" element={protectedPage(<OrderProducts />)} />
      <Route path="/orders/:orderId" element={protectedPage(<OrderDetails />)} />
      <Route path="/customers" element={protectedPage(<Customers />)} />
      <Route path="/customers/:customerId" element={protectedPage(<CustomerDetails />)} />
      <Route path="/promotions" element={protectedPage(<Promotions />)} />
      <Route path="/promotions/new" element={protectedPage(<CreatePromotion />)} />
      <Route path="/promotions/:promotionId/edit" element={protectedPage(<EditPromotion />)} />
      <Route path="/promotions/:promotionId" element={protectedPage(<ViewPromotion />)} />
      <Route path="/inventory" element={protectedPage(<Inventory />)} />
      <Route path="/notifications" element={protectedPage(<Notifications />)} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
