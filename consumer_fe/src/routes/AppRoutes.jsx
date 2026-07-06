import { Routes, Route } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'
import HomePage from '../pages/HomePage'
import AccountPage from '../pages/AccountPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import CategoriesPage from '../pages/CategoriesPage'
import CategoryPage from '../pages/CategoryPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
import ProductListingPage from '../pages/ProductListingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyOtpPage from '../pages/auth/VerifyOtpPage'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'
import AuthVerifyRoute from './AuthVerifyRoute'

const guestOnly = (page) => (
  <GuestOnlyRoute>
    {page}
  </GuestOnlyRoute>
)

const authVerify = (page) => (
  <GuestOnlyRoute>
    <AuthVerifyRoute>
      {page}
    </AuthVerifyRoute>
  </GuestOnlyRoute>
)

const authRequired = (page) => (
  <ProtectedRoute>
    {page}
  </ProtectedRoute>
)

const authRequiredViaLogin = (page) => (
  <ProtectedRoute viaLogin>
    {page}
  </ProtectedRoute>
)

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Cart is fully usable as a guest; guest lines are merged into the account on login/signup. */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={authRequiredViaLogin(<CheckoutPage />)} />
      <Route path="/checkout/:mode" element={authRequiredViaLogin(<CheckoutPage />)} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:slug/:subSlug" element={<CategoryPage />} />
      <Route path="/categories/:slug" element={<CategoryPage />} />
      <Route path="/products" element={<ProductListingPage type="all" />} />
      <Route path="/products/recommended" element={<ProductListingPage type="recommended" />} />
      <Route path="/products/best-sellers" element={<ProductListingPage type="best-sellers" />} />
      <Route path="/products/flash-sales" element={<ProductListingPage type="flash-sales" />} />
      <Route path="/products/explore" element={<ProductListingPage type="explore" />} />
      <Route path="/login" element={guestOnly(<LoginPage />)} />
      <Route path="/login/verify" element={authVerify(<VerifyOtpPage />)} />
      <Route path="/register" element={guestOnly(<RegisterPage />)} />
      <Route path="/register/verify" element={authVerify(<VerifyOtpPage />)} />
      <Route path="/account" element={authRequired(<AccountPage />)} />
      <Route path="/account/*" element={authRequired(<AccountPage />)} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
      <Route path="/:slug" element={<ProductDetailsPage />} />
    </Routes>
  )
}
