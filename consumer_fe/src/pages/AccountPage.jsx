import { Link, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import {
  Heart,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'

const accountLinks = [
  { label: 'My Orders', description: 'Track purchases and delivery status', icon: Package, href: '/account/orders' },
  { label: 'Saved Items', description: 'Products you want to revisit', icon: Heart, href: '/account/saved' },
  { label: 'Addresses', description: 'Manage delivery locations', icon: MapPin, href: '/account/addresses' },
  { label: 'Security', description: 'Login and account protection', icon: ShieldCheck, href: '/account/security' },
  { label: 'Settings', description: 'Personal details and preferences', icon: Settings, href: '/account/settings' },
]

const getDisplayName = (user) => {
  const fullName = [user?.first_name ?? user?.firstName, user?.last_name ?? user?.lastName]
    .filter(Boolean)
    .join(' ')

  return fullName || user?.name || 'My Account'
}

export default function AccountPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const displayName = getDisplayName(user)
  const email = user?.email

  return (
    <SiteLayout>
      <section className="bg-slate-50 py-8 sm:py-10 lg:py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)]">
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-auth-primary text-white">
                  <UserRound className="size-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-slate-500">Welcome</p>
                  <h1 className="truncate text-xl font-bold text-slate-950">{displayName}</h1>
                  {email ? <p className="truncate text-sm text-slate-500">{email}</p> : null}
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Account status</p>
                <p className="mt-1 text-sm text-slate-600">Signed in and ready to shop.</p>
              </div>
            </aside>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-auth-primary">Dashboard</p>
                  <h2 className="text-2xl font-bold text-slate-950">My Account</h2>
                </div>
                <Link
                  to="/"
                  className="text-sm font-semibold text-auth-primary underline-offset-4 hover:underline"
                >
                  Continue shopping
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {accountLinks.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-auth-primary/40 hover:bg-red-50/40"
                    >
                      <span className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-auth-primary transition-colors group-hover:bg-auth-primary group-hover:text-white">
                        <Icon className="size-5" />
                      </span>
                      <span className="mt-3 block text-base font-semibold text-slate-950">{item.label}</span>
                      <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
