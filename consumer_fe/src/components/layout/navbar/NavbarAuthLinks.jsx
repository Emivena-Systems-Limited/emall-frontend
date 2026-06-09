import { Link } from 'react-router'

export default function NavbarAuthLinks({ stacked = false, onNavigate }) {
  const linkClass = stacked
    ? 'block rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10'
    : 'text-sm font-medium text-white transition-opacity hover:opacity-85 lg:text-[0.9375rem]'

  const registerClass = stacked
    ? 'block rounded-full bg-white px-4 py-3 text-center text-base font-semibold text-auth-primary transition-colors hover:bg-white/90'
    : 'rounded-full bg-white px-5 py-2 text-sm font-semibold text-auth-primary transition-colors hover:bg-white/90 lg:px-6 lg:py-2.5'

  return (
    <div className={stacked ? 'flex flex-col gap-2' : 'flex items-center gap-4 lg:gap-5'}>
      <Link to="/login" className={linkClass} onClick={onNavigate}>
        Sign In
      </Link>
      <Link to="/register" className={registerClass} onClick={onNavigate}>
        Register
      </Link>
    </div>
  )
}
