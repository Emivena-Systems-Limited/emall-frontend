import { Routes, Route } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'
import HomePage from '../pages/HomePage'
import AccountPage from '../pages/AccountPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import CategoriesPage from '../pages/CategoriesPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
import ProductListingPage from '../pages/ProductListingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyOtpPage from '../pages/auth/VerifyOtpPage'
import GuestOnlyRoute from './GuestOnlyRoute'

const guestOnly = (page) => (
  <GuestOnlyRoute>
    {page}
  </GuestOnlyRoute>
)

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/:mode" element={<CheckoutPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/products" element={<ProductListingPage type="all" />} />
      <Route path="/products/recommended" element={<ProductListingPage type="recommended" />} />
      <Route path="/products/best-sellers" element={<ProductListingPage type="best-sellers" />} />
      <Route path="/products/flash-sales" element={<ProductListingPage type="flash-sales" />} />
      <Route path="/products/explore" element={<ProductListingPage type="explore" />} />
      <Route path="/:slug" element={<ProductDetailsPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/account/*" element={<AccountPage />} />
      <Route path="/login" element={guestOnly(<LoginPage />)} />
      <Route path="/login/verify" element={guestOnly(<VerifyOtpPage />)} />
      <Route path="/register" element={guestOnly(<RegisterPage />)} />
      <Route path="/register/verify" element={guestOnly(<VerifyOtpPage />)} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
