import Sidebar from './Sidebar'
import Navbar from './Navbar'
import LogoutOverlay from './LogoutOverlay'
import DashboardFooter from './DashboardFooter'
import { useSidebar } from '../../hooks/useSidebar'

export default function DashboardLayout({ children, pageTitle }) {
  const { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useSidebar()

  return (
    <div className="flex h-screen w-full min-h-0 overflow-hidden bg-slate-50 font-sans">
      <LogoutOverlay />
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        <Navbar onMobileMenuOpen={openMobile} pageTitle={pageTitle} />
        <main data-dashboard-scroll-panel className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
          <div className="flex min-h-full w-full min-w-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">{children}</div>
            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  )
}
