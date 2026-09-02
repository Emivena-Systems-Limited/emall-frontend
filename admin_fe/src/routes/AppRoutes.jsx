import { Navigate, Route, Routes } from 'react-router'
import ComingSoon from '../pages/ComingSoon'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import GuestOnlyRoute from './GuestOnlyRoute'
import ProtectedRoute from './ProtectedRoute'

function ComingSoonRoute() {
  return (
    <ProtectedRoute>
      <ComingSoon />
    </ProtectedRoute>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />

      <Route path="/vendors" element={<ComingSoonRoute />} />
      <Route path="/vendors/applications" element={<ComingSoonRoute />} />
      <Route path="/products" element={<ComingSoonRoute />} />
      <Route path="/orders" element={<ComingSoonRoute />} />
      <Route path="/customers" element={<ComingSoonRoute />} />
      <Route path="/finance" element={<ComingSoonRoute />} />
      <Route path="/promotions" element={<ComingSoonRoute />} />
      <Route path="/reviews" element={<ComingSoonRoute />} />
      <Route path="/support" element={<ComingSoonRoute />} />
      <Route path="/staff" element={<ComingSoonRoute />} />
      <Route path="/audit" element={<ComingSoonRoute />} />
      <Route path="/settings" element={<ComingSoonRoute />} />
      <Route path="/profile" element={<ComingSoonRoute />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
