import { Routes, Route, Navigate } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyOtpPage from '../pages/auth/VerifyOtpPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/verify" element={<VerifyOtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/verify" element={<VerifyOtpPage />} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
