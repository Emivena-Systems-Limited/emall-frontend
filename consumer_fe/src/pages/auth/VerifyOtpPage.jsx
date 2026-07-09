import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import OtpVerifyingLoader from '../../components/auth/OtpVerifyingLoader'
import ResendTimer from '../../components/auth/ResendTimer'
import notify from '../../lib/notify'
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../hooks/useAuthMutations'
import { useAuthOtpFlow, useAuthOtpSession } from '../../hooks/useAuthOtpSession'
import { AUTH_FLOW, OTP_LENGTH } from '../../constants/auth'
import { setCredentials } from '../../store/slices/authSlice'
import { clearGuestCartId, selectGuestCartId } from '../../store/slices/cartSlice'
import { persistor } from '../../store/store'
import { clearAuthOtpSession } from '../../utils/authOtpSession'
import { isValidGuestCartId } from '../../utils/guestCartId'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const guestCartId = useSelector(selectGuestCartId)
  const session = useAuthOtpSession()
  const flow = useAuthOtpFlow(session)

  const [otp, setOtp] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  const { method, contact, displayContact, profile, redirectTo } = session

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
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Verification
                </h1>
                <p className="mt-3 text-xs leading-relaxed text-auth-muted sm:text-sm">
                  We have sent a 6-digit verification code to
                </p>
                <p className="mt-1 break-all text-sm font-medium text-auth-accent sm:text-base">
                  {displayContact}
                </p>
                <p className="mt-2 text-xs text-slate-400">Do not share with anyone</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-[740px]:mt-4 max-[740px]:space-y-3.5 sm:mt-6 sm:space-y-5">
                <OtpInput
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    if (hasError) setHasError(false)
                  }}
                  error={hasError}
                />

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.985 }}
                  className="w-full rounded-xl bg-auth-primary py-3.5 text-base font-semibold text-white transition-colors hover:bg-auth-primary-hover sm:text-sm"
                >
                  {hasError ? 'Retry' : 'Submit'}
                </motion.button>
              </form>

              <div className="mt-4 max-[740px]:mt-3 sm:mt-5">
                <ResendTimer
                  onResend={handleResend}
                  disabled={resendOtpMutation.isPending}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </AuthLayout>
  )
}
