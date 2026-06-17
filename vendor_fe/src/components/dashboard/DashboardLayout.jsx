import Sidebar from './Sidebar'
import Navbar from './Navbar'
import LogoutOverlay from './LogoutOverlay'
import { useSidebar } from '../../hooks/useSidebar'

export default function DashboardLayout({ children, pageTitle }) {
  const { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <LogoutOverlay />
      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMobileMenuOpen={openMobile} pageTitle={pageTitle} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
