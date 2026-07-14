import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import OtpExpiryNotice from '../../components/auth/OtpExpiryNotice'
import OtpVerifyingLoader from '../../components/auth/OtpVerifyingLoader'
import ResendTimer from '../../components/auth/ResendTimer'
import notify from '../../lib/notify'
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../hooks/useAuthMutations'
import { useAuthOtpFlow, useAuthOtpSession } from '../../hooks/useAuthOtpSession'
import { AUTH_FLOW, OTP_EXPIRY_MINUTES, OTP_LENGTH } from '../../constants/auth'
import { setCredentials } from '../../store/slices/authSlice'
import { clearGuestCartId, selectGuestCartId } from '../../store/slices/cartSlice'
import { persistor } from '../../store/store'
import { clearAuthOtpSession } from '../../utils/authOtpSession'
import { isValidGuestCartId } from '../../utils/guestCartId'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const guestCartId = useSelector(selectGuestCartId)
  const session = useAuthOtpSession()
  const flow = useAuthOtpFlow(session)

  const [otp, setOtp] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  if (!session) {
    const fallbackPath = location.pathname.startsWith('/register') ? '/register' : '/login'
    return <Navigate to={fallbackPath} replace />
  }

  const { method, contact, displayContact, profile, redirectTo } = session
  const backPath = flow === AUTH_FLOW.REGISTER ? '/register' : '/login'
  const backLabel = flow === AUTH_FLOW.REGISTER ? 'Back to registration' : 'Back to login'

  const handleExit = () => {
    clearAuthOtpSession()
    navigate(backPath, { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (otp.length !== OTP_LENGTH) {
      setHasError(true)
      notify.error('Please enter the full 6-digit verification code')
      return
    }

    setHasError(false)
    setIsVerifying(true)

    try {
      const data = await verifyOtpMutation.mutateAsync({
        method,
        contact,
        otp,
        profile,
        flow,
        guestCartId: isValidGuestCartId(guestCartId) ? guestCartId : null,
      })
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        applicationToken: data.applicationToken,
      }))
      dispatch(clearGuestCartId())
      clearAuthOtpSession()
      notify.success(
        flow === AUTH_FLOW.REGISTER ? 'Account verified successfully' : 'Login successful',
      )
      await persistor.persist()
      navigate(redirectTo || '/', { replace: true })
    } catch (error) {
      setHasError(true)
      setIsVerifying(false)
      notify.fromError(error, 'Please check and re-enter the 6-digit verification code')
    }
  }

  const handleResend = async () => {
    try {
      const otpResponse = await resendOtpMutation.mutateAsync({
        method,
        contact,
        flow,
        profile,
      })
      notify[otpResponse?.otpAlreadyPending ? 'info' : 'success'](
        otpResponse?.otpAlreadyPending
          ? 'A verification code is already active. Please use the code already sent.'
          : flow === AUTH_FLOW.REGISTER
            ? 'A new verification code has been sent'
            : 'Otp has been resent successfully',
      )
      setOtp('')
      setHasError(false)
    } catch (error) {
      notify.fromError(error, 'Could not resend verification code')
    }
  }

  return (
    <AuthLayout compact>
      <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OtpVerifyingLoader
                title={flow === AUTH_FLOW.REGISTER ? 'Verifying account' : 'Verifying OTP'}
                subtitle={
                  flow === AUTH_FLOW.REGISTER
                    ? 'Verifying your account, this will just take a moment'
                    : 'Verifying your OTP, this will just take a moment'
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center">
                <h1 className="auth-heading font-bold tracking-tight text-slate-900">
                  Verification
                </h1>
                <p className="auth-body mt-3 leading-relaxed text-auth-muted">
                  We have sent a 6-digit verification code to
                </p>
                <p className="auth-subheading mt-1 break-all font-semibold text-auth-accent">
                  {displayContact}
                </p>
                <p className="auth-body mt-2 text-slate-400">
                  Do not share with anyone · Code expires in {OTP_EXPIRY_MINUTES} minutes
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-5">
                <OtpInput
                  value={otp}
                  autoFocus
                  onChange={(value) => {
                    setOtp(value)
                    if (hasError) setHasError(false)
                  }}
                  error={hasError}
                />

                <OtpExpiryNotice className="mt-3" />

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.985 }}
                  className="w-full rounded-xl bg-auth-primary py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(199,59,45,0.7)] transition-colors hover:bg-auth-primary-hover sm:py-3 min-[1800px]:py-4.5 min-[1800px]:text-base"
                >
                  {hasError ? 'Retry' : 'Submit'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      <div className={isVerifying ? 'sr-only' : 'mt-5 sm:mt-6'}>
        <ResendTimer
          onResend={handleResend}
          disabled={resendOtpMutation.isPending || isVerifying}
        />
      </div>

      {!isVerifying && (
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-center">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-auth-accent underline-offset-2 transition-colors hover:text-auth-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
            {backLabel}
          </button>
          <p className="auth-body text-auth-muted">
            or{' '}
            <Link
              to="/"
              onClick={clearAuthOtpSession}
              className="font-semibold text-auth-accent underline-offset-2 transition-colors hover:text-auth-primary hover:underline"
            >
              continue shopping
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
