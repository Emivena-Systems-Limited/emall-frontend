import { Routes, Route } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'
import HomePage from '../pages/HomePage'
import AccountPage from '../pages/AccountPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
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
      <Route path="/products/:slug" element={<ProductDetailsPage />} />
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
