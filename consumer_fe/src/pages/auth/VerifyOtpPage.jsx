import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
import {
  getBuyNowAuthLocationState,
  readBuyNowItem,
  shouldResumeBuyNowAfterAuth,
} from '../../utils/buyNowItem'
import {
  continueBuyNowAfterAuthWithHold,
  getBuyNowResumePath,
} from '../../utils/continueBuyNow'
import Images from '../../utils/Images'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const guestCartId = useSelector(selectGuestCartId)
  const session = useAuthOtpSession()
  const sessionRef = useRef(session)
  if (session) sessionRef.current = session
  const activeSession = session ?? sessionRef.current
  const flow = useAuthOtpFlow(activeSession)

  const [otp, setOtp] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyStage, setVerifyStage] = useState('otp')
  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  if (!activeSession && !isVerifying) {
    const fallbackPath = location.pathname.startsWith('/register') ? '/register' : '/login'
    return <Navigate to={fallbackPath} replace />
  }

  const { method, contact, displayContact, profile, redirectTo, buyNow } = activeSession ?? {}
  const buyNowItem = shouldResumeBuyNowAfterAuth({ buyNow, from: redirectTo }, redirectTo)
    ? readBuyNowItem()
    : null
  const backPath = flow === AUTH_FLOW.REGISTER ? '/register' : '/login'
  const backLabel = flow === AUTH_FLOW.REGISTER ? 'Back to registration' : 'Back to login'
  const isRegister = flow === AUTH_FLOW.REGISTER

  const handleExit = () => {
    clearAuthOtpSession()
    navigate(backPath, {
      replace: true,
      state: buyNowItem ? getBuyNowAuthLocationState() : undefined,
    })
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
      await persistor.persist()

      const resumeBuyNow = Boolean(buyNowItem)
      if (resumeBuyNow) {
        setVerifyStage('order')
        try {
          await continueBuyNowAfterAuthWithHold()
        } catch (error) {
          notify.fromError(error, 'Signed in. We’ll retry starting Buy Now at checkout.')
        }
        setVerifyStage('checkout')
      }

      const nextPath = resumeBuyNow ? getBuyNowResumePath() : (redirectTo || '/')
      if (resumeBuyNow) {
        await new Promise((resolve) => window.setTimeout(resolve, 350))
      }
      navigate(nextPath, { replace: true })
      clearAuthOtpSession()
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
    <AuthLayout
      split
      panelImage={Images.auth.verify_img}
      panelHeadline="Almost there."
      panelAccentLine="Verify and you’re in."
      panelDescription="Enter the one-time code we sent you to finish signing in securely — and get back to shopping."
    >
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
              title={
                verifyStage === 'checkout'
                  ? 'Taking you to checkout'
                  : verifyStage === 'order'
                    ? 'Preparing your order'
                    : isRegister
                      ? 'Verifying account'
                      : 'Verifying OTP'
              }
              subtitle={
                verifyStage === 'checkout'
                  ? 'Buy Now is ready. This will just take a moment.'
                  : verifyStage === 'order'
                    ? (buyNowItem?.name
                      ? `Starting Buy Now for ${buyNowItem.name}`
                      : 'Starting your Buy Now checkout')
                    : isRegister
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
            <div className="text-left">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                {isRegister ? 'Verify your account' : 'Enter verification code'}
              </h1>
              <p className="mt-2 text-base font-medium text-slate-600">
                We sent a 6-digit code to
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-auth-primary">
                {displayContact}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {buyNowItem
                  ? 'After this code, we’ll start Buy Now and take you to checkout.'
                  : `Do not share with anyone · Code expires in ${OTP_EXPIRY_MINUTES} minutes`}
              </p>
              {buyNowItem ? (
                <p className="mt-1 text-sm text-slate-400">
                  Do not share with anyone · Code expires in {OTP_EXPIRY_MINUTES} minutes
                </p>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-7">
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
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(199,59,45,0.65)] transition-colors hover:bg-auth-primary-hover sm:py-3.5"
              >
                {hasError ? 'Retry' : 'Verify code'}
                {!hasError && (
                  <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden="true" />
                )}
              </motion.button>
            </form>

            <div className="mt-5 sm:mt-6">
              <ResendTimer
                onResend={handleResend}
                disabled={resendOtpMutation.isPending}
              />
            </div>

            <div className="mt-7 sm:mt-8">
              <div className="relative flex items-center">
                <div aria-hidden="true" className="h-px flex-1 bg-slate-200" />
                <span className="px-3 text-xs font-medium text-slate-400">Need to go back?</span>
                <div aria-hidden="true" className="h-px flex-1 bg-slate-200" />
              </div>
              <button
                type="button"
                onClick={handleExit}
                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:py-3.5"
              >
                <ArrowLeft className="size-4" strokeWidth={2.25} aria-hidden="true" />
                {backLabel}
              </button>
              <p className="mt-4 text-center text-sm text-slate-400">
                or{' '}
                <Link
                  to="/"
                  onClick={clearAuthOtpSession}
                  className="font-semibold text-slate-700 underline-offset-2 transition-colors hover:text-auth-primary hover:underline"
                >
                  continue shopping
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
