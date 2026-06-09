import Footer from './footer/Footer'
import Navbar from './navbar/Navbar'

export default function SiteLayout({ children, cartCount = 0 }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
