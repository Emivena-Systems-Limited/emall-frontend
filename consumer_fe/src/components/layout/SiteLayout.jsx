import Footer from './footer/Footer'
import Navbar from './navbar/Navbar'
import { useSelector } from 'react-redux'
import { selectCartCount } from '../../store/slices/cartSlice'

export default function SiteLayout({ children, cartCount }) {
  const globalCartCount = useSelector(selectCartCount)
  const resolvedCartCount = cartCount ?? globalCartCount

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar cartCount={resolvedCartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
