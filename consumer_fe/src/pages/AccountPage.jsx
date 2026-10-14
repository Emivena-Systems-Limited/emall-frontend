import { useLayoutEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import AccountSidebar from '../components/account/AccountSidebar'
import AccountSectionContent from '../components/account/AccountSectionContent'
import {
  accountNavigationItems,
  isAccountSectionEnabled,
  resolveAccountSectionId,
} from '../components/account/accountNavigation'
import { useLogoutMutation } from '../hooks/useAuthMutations'
import { logout } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import { clearAuthOtpSession } from '../utils/authOtpSession'
import { notify } from '../lib/notify'

function AccountBreadcrumb({ pathname }) {
  const linkClass = 'cursor-pointer text-slate-400 transition-colors hover:text-slate-700'
  const sectionId = resolveAccountSectionId(pathname)
  const sectionLabel = accountNavigationItems.find((item) => item.id === sectionId)?.label ?? 'Profile'
  const isOverview = sectionId === 'overview'

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
        <li>
          <Link to="/" className={linkClass}>Home</Link>
        </li>
        <li aria-hidden="true" className="text-slate-300">/</li>
        <li>
          {isOverview ? (
            <span aria-current="page" className="text-slate-500">My Account</span>
          ) : (
            <Link to="/account" className={linkClass}>My Account</Link>
          )}
        </li>
        {!isOverview ? (
          <>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li aria-current="page" className="text-slate-500">{sectionLabel}</li>
          </>
        ) : null}
      </ol>
    </nav>
  )
}

export default function AccountPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const logoutMutation = useLogoutMutation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useLayoutEffect(() => {
    const sectionId = resolveAccountSectionId(location.pathname)
    if (!isAccountSectionEnabled(sectionId)) {
      navigate('/account', { replace: true })
    }
  }, [location.pathname, navigate])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({ email: user?.email })
    } catch {
      /* Always clear the local session. */
    } finally {
      dispatch(logout())
      clearAuthOtpSession()
      persistor.persist()
      navigate('/')
      notify.success('Logged out successfully')
    }
  }

  return (
    <SiteLayout>
      <div className="hidden border-y border-slate-200 bg-white sm:block">
        <Container className="py-2.5">
          <AccountBreadcrumb pathname={location.pathname} />
        </Container>
      </div>

      <section className="min-h-[70vh] bg-white py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-4 sm:hidden">
            <AccountBreadcrumb pathname={location.pathname} />
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-[4.5rem] lg:z-10 lg:h-[calc(100dvh-5.5rem)] lg:self-start">
              <AccountSidebar
                pathname={location.pathname}
                isLoggingOut={logoutMutation.isPending}
                onLogout={handleLogout}
              />
            </div>

            <div className="min-w-0 space-y-5">
              <AccountSectionContent pathname={location.pathname} />
            </div>
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
