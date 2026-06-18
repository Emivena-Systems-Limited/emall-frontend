import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight, Loader2, MailCheck, ShieldCheck } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import ResendTimer from '../../components/auth/ResendTimer'
import notify from '../../lib/notify'
import { OTP_LENGTH } from '../../constants/auth'
import {
  useResendVendorOtpMutation,
  useVerifyVendorOtpMutation,
} from '../../hooks/useAuthMutations'
import {
  setCredentials,
} from '../../store/slices/authSlice'

export default function VerifyAccount() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const pendingEmail = useSelector((state) => state.auth.pendingVerificationEmail)
  const email = location.state?.email ?? pendingEmail

  const [otp, setOtp] = useState('')
  const [hasError, setHasError] = useState(false)

  const verifyMutation = useVerifyVendorOtpMutation()
  const resendMutation = useResendVendorOtpMutation()

  if (!email) {
    return <Navigate to="/signup" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (otp.length !== OTP_LENGTH) {
      setHasError(true)
      notify.error('Please enter the full 6-digit verification code')
      return
    }

    setHasError(false)

    try {
      const data = await verifyMutation.mutateAsync({ email, otp_token: otp })
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        applicationToken: data.applicationToken,
      }))
      notify.success('Account verified successfully!')
      navigate('/dashboard', { replace: true })
    } catch {
      setHasError(true)
    }
  }

  const handleResend = async () => {
    await resendMutation.mutateAsync({ email })
    notify.success('Verification code resent')
    setOtp('')
    setHasError(false)
  }

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="We sent a 6-digit code to your email. Enter it below to verify your email address."
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <MailCheck className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">Check your inbox</p>
              <p className="text-sm text-slate-600">
                Code sent to <span className="font-medium text-slate-900">{email}</span>
              </p>
            </div>
          </div>

          <OtpInput
            value={otp}
            onChange={setOtp}
            error={hasError}
            disabled={verifyMutation.isPending}
          />

          <div className="mt-6">
            <ResendTimer
              onResend={handleResend}
              disabled={resendMutation.isPending || verifyMutation.isPending}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={verifyMutation.isPending || otp.length !== OTP_LENGTH}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Verify account
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Wrong email?{' '}
          <Link
            to="/signup"
            className="font-semibold text-sky-700 underline-offset-2 transition-colors hover:text-sky-800 hover:underline"
          >
            Go back to signup
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
