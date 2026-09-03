import { Navigate, Route, Routes, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import BrandDetail from '../pages/BrandDetail'
import Brands from '../pages/Brands'
import Categories from '../pages/Categories'
import ComingSoon from '../pages/ComingSoon'
import Dashboard from '../pages/Dashboard'
import ForgotPassword from '../pages/ForgotPassword'
import Login from '../pages/Login'
import NotificationDetail from '../pages/NotificationDetail'
import Notifications from '../pages/Notifications'
import ProductDetail from '../pages/ProductDetail'
import ProductPending from '../pages/ProductPending'
import Products from '../pages/Products'
import EditProduct from '../pages/products/EditProduct'
import Orders from '../pages/Orders'
import OrderDetail from '../pages/OrderDetail'
import Profile from '../pages/Profile'
import Users from '../pages/Users'
import UserDetail from '../pages/UserDetail'
import Coupons from '../pages/Coupons'
import CouponDetail from '../pages/CouponDetail'
import CouponUsage from '../pages/CouponUsage'
import Reviews from '../pages/Reviews'
import ReviewDetail from '../pages/ReviewDetail'
import Inventory from '../pages/Inventory'
import InventoryDetail from '../pages/InventoryDetail'
import Payments from '../pages/Payments'
import PaymentDetail from '../pages/PaymentDetail'
import Carts from '../pages/Carts'
import Wishlists from '../pages/Wishlists'
import Searches from '../pages/Searches'
import ResetPassword from '../pages/ResetPassword'
import VendorDetail from '../pages/VendorDetail'
import VendorProducts from '../pages/VendorProducts'
import VendorSales from '../pages/VendorSales'
import Vendors from '../pages/Vendors'
import { DEFAULT_POST_LOGIN_PATH } from '../constants/auth'
import { getLastAppPath } from '../utils/authRedirect'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'

function ComingSoonRoute() {
  return (
    <ProtectedRoute>
      <ComingSoon />
    </ProtectedRoute>
  )
}

function RedirectVendorDetail() {
  const { vendorId } = useParams()
  return <Navigate to={`/vendors/${vendorId}`} replace />
}

function RedirectCustomerDetail() {
  const { userId } = useParams()
  return <Navigate to={`/users/${userId}`} replace />
}

function RootRedirect() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return (
    <Navigate
      to={isAuthenticated ? getLastAppPath(DEFAULT_POST_LOGIN_PATH) : '/login'}
      replace
    />
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/notifications"
        element={(
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/notifications/:notificationId"
        element={(
          <ProtectedRoute>
            <NotificationDetail />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/vendors"
        element={(
          <ProtectedRoute>
            <Vendors />
          </ProtectedRoute>
        )}
      />
      <Route path="/vendors/applications" element={<Navigate to="/vendors" replace />} />
      <Route path="/vendors/:vendorId/edit" element={<RedirectVendorDetail />} />
      <Route
        path="/vendors/:vendorId/products"
        element={(
          <ProtectedRoute>
            <VendorProducts />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/vendors/:vendorId/sales"
        element={(
          <ProtectedRoute>
            <VendorSales />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/vendors/:vendorId"
        element={(
          <ProtectedRoute>
            <VendorDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/categories"
        element={(
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/brands"
        element={(
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/brands/:brandId"
        element={(
          <ProtectedRoute>
            <BrandDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/products"
        element={(
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/products/pending"
        element={(
          <ProtectedRoute>
            <ProductPending />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/products/:productId/edit"
        element={(
          <ProtectedRoute>
            <EditProduct />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/products/:productId"
        element={(
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/inventory"
        element={(
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/inventory/:inventoryId"
        element={(
          <ProtectedRoute>
            <InventoryDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/orders"
        element={(
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/orders/:orderId"
        element={(
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/carts"
        element={(
          <ProtectedRoute>
            <Carts />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/wishlists"
        element={(
          <ProtectedRoute>
            <Wishlists />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/searches"
        element={(
          <ProtectedRoute>
            <Searches />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/payments"
        element={(
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/payments/:paymentId"
        element={(
          <ProtectedRoute>
            <PaymentDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users"
        element={(
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users/:userId"
        element={(
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        )}
      />
      <Route path="/customers" element={<Navigate to="/users" replace />} />
      <Route path="/customers/:userId" element={<RedirectCustomerDetail />} />
      <Route
        path="/coupons"
        element={(
          <ProtectedRoute>
            <Coupons />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/coupons/usage"
        element={(
          <ProtectedRoute>
            <CouponUsage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/coupons/:couponId"
        element={(
          <ProtectedRoute>
            <CouponDetail />
          </ProtectedRoute>
        )}
      />
      <Route path="/promotions" element={<Navigate to="/coupons" replace />} />
      <Route
        path="/reviews"
        element={(
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/reviews/:reviewId"
        element={(
          <ProtectedRoute>
            <ReviewDetail />
          </ProtectedRoute>
        )}
      />
      <Route path="/finance" element={<ComingSoonRoute />} />
      <Route path="/support" element={<ComingSoonRoute />} />
      <Route path="/staff" element={<ComingSoonRoute />} />
      <Route path="/audit" element={<ComingSoonRoute />} />
      <Route path="/settings" element={<ComingSoonRoute />} />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />

      <Route path="/" element={<RootRedirect />} />
      <Route
        path="*"
        element={(
          <ProtectedRoute>
            <ComingSoon />
          </ProtectedRoute>
        )}
      />
    </Routes>
  )
}
