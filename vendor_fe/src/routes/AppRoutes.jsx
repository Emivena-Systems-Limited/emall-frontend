import { Routes, Route } from 'react-router'
import DeveloperGuide from '../pages/DeveloperGuide'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DeveloperGuide />} />
      <Route path="/dev-guide" element={<DeveloperGuide />} />
    </Routes>
  )
}
