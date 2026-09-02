import { Form, Formik } from 'formik'
import { ArrowLeft, ArrowRight, Loader2, Lock, MailCheck, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import AuthLayout from '../components/auth/AuthLayout'
import AuthStepBar from '../components/auth/AuthStepBar'
import OtpExpiryNotice from '../components/auth/OtpExpiryNotice'
import OtpInput from '../components/auth/OtpInput'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthBar, { PasswordMatchIndicator } from '../components/profile/PasswordStrengthBar'
import ResendTimer from '../components/auth/ResendTimer'
import { OTP_LENGTH, OTP_RESEND_STORAGE_KEYS } from '../constants/auth'
import {
  useRequestPasswordResetOtpMutation,
  useResetPasswordWithOtpMutation,
} from '../hooks/useAuthMutations'
import notify from '../lib/notify'
import { resetPasswordSchema } from '../utils/authValidation'
import {
  clearForgotPasswordSession,
  readForgotPasswordEmail,
} from '../utils/forgotPasswordSession'

const RESET_INITIAL_VALUES = {
  password: '',
  password_confirmation: '',
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = String(location.state?.email || readForgotPasswordEmail() || '').trim().toLowerCase()
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(false)
  const resetMutation = useResetPasswordWithOtpMutation()
  const resendMutation = useRequestPasswordResetOtpMutation()

  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  const handleResend = async () => {
    await resendMutation.mutateAsync({ email })
    notify.success('A new reset code has been sent.')
    setOtp('')
    setOtpError(false)
  }

  return (
    <AuthLayout
      title="Create a new password"
      subtitle="Enter the code from your email, then choose a strong password for this operator account."
    >
      <AuthStepBar current={2} />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
            <MailCheck className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">Check your inbox</p>
            <p className="truncate text-sm text-slate-600">
              Code sent to <span className="font-semibold text-slate-900">{email}</span>
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="shrink-0 cursor-pointer text-xs font-semibold text-brand underline-offset-2 hover:underline"
          >
            Change
          </Link>
        </div>

        <OtpInput
          value={otp}
          onChange={(value) => {
            setOtp(value)
            if (otpError) setOtpError(false)
          }}
          error={otpError}
          disabled={resetMutation.isPending}
        />

        <OtpExpiryNotice className="mt-4" />

        <div className="mt-5">
          <ResendTimer
            onResend={handleResend}
            disabled={resendMutation.isPending || resetMutation.isPending}
            cooldownKey={OTP_RESEND_STORAGE_KEYS.FORGOT_PASSWORD}
          />
        </div>
      </div>

      <Formik
        initialValues={RESET_INITIAL_VALUES}
        validationSchema={resetPasswordSchema}
        onSubmit={async (values, { setSubmitting }) => {
          if (otp.length !== OTP_LENGTH) {
            setOtpError(true)
            notify.error('Enter the full 6-digit verification code.')
            setSubmitting(false)
            return
          }

          try {
            await resetMutation.mutateAsync({
              email,
              password: values.password,
              password_confirmation: values.password_confirmation,
              otp,
            })
            clearForgotPasswordSession()
            notify.success('Password updated. Sign in with your new password.')
            navigate('/login', { replace: true, state: { passwordReset: true } })
          } catch {
            setOtpError(true)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => {
          const pending = isSubmitting || resetMutation.isPending

          return (
            <Form className="space-y-4" noValidate>
              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="New password"
                  icon={Lock}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  disabled={pending}
                />
                <PasswordStrengthBar password={values.password} />
              </div>

              <div>
                <PasswordInput
                  id="password_confirmation"
                  name="password_confirmation"
                  label="Confirm new password"
                  icon={Lock}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password_confirmation && errors.password_confirmation}
                  disabled={pending}
                />
                <PasswordMatchIndicator
                  password={values.password}
                  confirmation={values.password_confirmation}
                />
              </div>

              <button
                type="submit"
                disabled={pending || otp.length !== OTP_LENGTH}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Reset password
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </Form>
          )
        }}
      </Formik>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link
          to="/login"
          className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
