import { Routes, Route } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/auth_pages/Login'
import Signup from '../pages/auth_pages/Signup'
import VerifyAccount from '../pages/auth_pages/VerifyAccount'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'
import RootRedirect from './RootRedirect'

const guestOnly = (page) => <GuestOnlyRoute>{page}</GuestOnlyRoute>
const protectedPage = (page) => <ProtectedRoute>{page}</ProtectedRoute>

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={guestOnly(<Login />)} />
      <Route path="/signup" element={guestOnly(<Signup />)} />
      <Route path="/verify-account" element={guestOnly(<VerifyAccount />)} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
