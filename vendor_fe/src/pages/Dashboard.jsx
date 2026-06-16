import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { BookOpen, LayoutDashboard, Loader2, LogOut, Package, Store } from 'lucide-react'
import { useLogoutVendorMutation } from '../hooks/useAuthMutations'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const logoutMutation = useLogoutVendorMutation()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Redux cleared in onSettled; error toast shown by mutation
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Store className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-sky-700 uppercase">Vendor Portal</p>
              <h1 className="text-sm font-semibold text-slate-900">
                {user?.store_name ?? user?.business_name ?? 'Dashboard'}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome{user?.business_name ? `, ${user.business_name}` : ''}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your vendor account is active. This dashboard will host your products, orders, and analytics.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Package, title: 'Products', desc: 'Manage your catalog and inventory' },
            { icon: LayoutDashboard, title: 'Orders', desc: 'Track and fulfill customer orders' },
            { icon: BookOpen, title: 'Developer Guide', desc: 'Stack docs and conventions', link: '/dev-guide' },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sky-200"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <card.icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{card.desc}</p>
              {card.link && (
                <Link
                  to={card.link}
                  className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800"
                >
                  Open guide →
                </Link>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
