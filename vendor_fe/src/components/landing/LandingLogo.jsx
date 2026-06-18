import { Link } from 'react-router'
import { Store } from 'lucide-react'

export default function LandingLogo({ variant = 'dark' }) {
  const isLight = variant === 'light'

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}
    >
      <span
        className={`flex size-10 items-center justify-center rounded-xl shadow-sm ${
          isLight
            ? 'bg-brand text-white shadow-brand/30'
            : 'bg-white text-brand'
        }`}
      >
        <Store className="size-5" strokeWidth={1.75} />
      </span>
      <span className="text-lg font-semibold tracking-tight">EZ-Mall Vendor</span>
    </Link>
  )
}
