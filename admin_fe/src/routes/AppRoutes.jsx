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
      <Route path="/customers" element={<ComingSoonRoute />} />
      <Route path="/finance" element={<ComingSoonRoute />} />
      <Route path="/promotions" element={<ComingSoonRoute />} />
      <Route path="/reviews" element={<ComingSoonRoute />} />
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
