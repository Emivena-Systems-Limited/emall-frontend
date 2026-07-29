import { useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import AccountSidebar from '../components/account/AccountSidebar'
import AccountSectionContent from '../components/account/AccountSectionContent'
import { useLogoutMutation } from '../hooks/useAuthMutations'
import { logout } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import { clearAuthOtpSession } from '../utils/authOtpSession'
import { notify } from '../lib/notify'

export default function AccountPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const logoutMutation = useLogoutMutation()

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
      <section className="min-h-[70vh] bg-white py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="grid items-start gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-20 lg:z-10 lg:self-start">
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
