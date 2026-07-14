import { useState } from 'react'
import { Form, Formik } from 'formik'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import ForgotPasswordProgress from '../../components/auth/ForgotPasswordProgress'
import FormInput from '../../components/auth/FormInput'
import OtpInput from '../../components/auth/OtpInput'
import OtpExpiryNotice from '../../components/auth/OtpExpiryNotice'
import PasswordInput from '../../components/auth/PasswordInput'
import PasswordStrengthBar from '../../components/auth/PasswordStrengthBar'
import ResendTimer from '../../components/auth/ResendTimer'
import notify from '../../lib/notify'
import { OTP_LENGTH, OTP_EXPIRY_MINUTES, OTP_RESEND_SECONDS } from '../../constants/auth'
import {
  useRequestPasswordResetOtpMutation,
  useResendPasswordResetOtpMutation,
  useResetPasswordWithOtpMutation,
} from '../../hooks/useAuthMutations'
import {
  vendorForgotPasswordEmailSchema,
  vendorResetPasswordSchema,
} from '../../utils/validationSchemas'
import {
  clearForgotPasswordSession,
  markForgotPasswordResendCooldown,
  readForgotPasswordEmail,
  saveForgotPasswordEmail,
} from '../../utils/forgotPasswordSession'

const RESET_INITIAL_VALUES = {
  password: '',
  password_confirmation: '',
}

function StepPanel({ stepKey, children }) {
  return (
    <div
      key={stepKey}
      className="page-enter space-y-6"
    >
      {children}
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const storedEmail = readForgotPasswordEmail()
  const [step, setStep] = useState(storedEmail ? 1 : 0)
  const [email, setEmail] = useState(storedEmail ?? '')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(false)

  const requestMutation = useRequestPasswordResetOtpMutation()
  const resetMutation = useResetPasswordWithOtpMutation()
  const resendMutation = useResendPasswordResetOtpMutation()

  const handleRequestCode = async (values, { setSubmitting }) => {
    try {
      await requestMutation.mutateAsync({ email: values.email.trim() })
      const normalizedEmail = values.email.trim()
      setEmail(normalizedEmail)
      saveForgotPasswordEmail(normalizedEmail)
      markForgotPasswordResendCooldown(OTP_RESEND_SECONDS)
      setStep(1)
      setOtp('')
      setOtpError(false)
      notify.success('Reset code sent. Check your email inbox.')
    } catch {
      // handled by mutation onError
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (values, { setSubmitting }) => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(true)
      notify.error('Please enter the full 6-digit verification code')
      setSubmitting(false)
      return
    }

    setOtpError(false)

    try {
      await resetMutation.mutateAsync({
        email,
        otp,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      clearForgotPasswordSession()
      navigate('/login', { replace: true, state: { passwordReset: true } })
    } catch {
      setOtpError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    await resendMutation.mutateAsync({ email })
    notify.success('A new reset code has been sent')
    setOtp('')
    setOtpError(false)
  }

  const handleChangeEmail = () => {
    setStep(0)
    setOtp('')
    setOtpError(false)
  }

  return (
    <AuthLayout
      title={step === 0 ? 'Forgot password?' : 'Create a new password'}
      subtitle={
        step === 0
          ? 'Enter the email linked to your vendor account and we will send you a 6-digit reset code.'
          : `Enter the code from your email, then choose a strong new password. The code expires in ${OTP_EXPIRY_MINUTES} minutes.`
      }
    >
      <ForgotPasswordProgress activeStep={step} />

      {step === 0 ? (
        <StepPanel stepKey="request">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-slate-200">
                <KeyRound className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Secure password reset</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  We will email a one-time code that expires in {OTP_EXPIRY_MINUTES} minutes for your security.
                </p>
              </div>
            </div>
          </div>

          <Formik
            initialValues={{ email: email || '' }}
            enableReinitialize
            validationSchema={vendorForgotPasswordEmailSchema}
            onSubmit={handleRequestCode}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-5">
                <FormInput
                  id="email"
                  name="email"
                  label="Email address"
                  icon={Mail}
                  type="email"
                  placeholder="you@business.com"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                  disabled={isSubmitting || requestMutation.isPending}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || requestMutation.isPending}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || requestMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      Send reset code
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </StepPanel>
      ) : (
        <StepPanel stepKey="reset">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <MailCheck className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">Check your inbox</p>
                <p className="truncate text-sm text-slate-600">
                  Code sent to <span className="font-medium text-slate-900">{email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="shrink-0 cursor-pointer text-xs font-semibold text-sky-700 underline-offset-2 hover:underline"
              >
                Change
              </button>
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

            <div className="mt-6">
              <ResendTimer
                onResend={handleResend}
                disabled={resendMutation.isPending || resetMutation.isPending}
                persistCooldown
              />
            </div>
          </div>

          <Formik
            initialValues={RESET_INITIAL_VALUES}
            validationSchema={vendorResetPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <PasswordInput
                    id="password"
                    name="password"
                    label="New password"
                    icon={Lock}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && errors.password}
                    disabled={isSubmitting || resetMutation.isPending}
                  />
                  <PasswordStrengthBar password={values.password} />
                </div>

                <PasswordInput
                  id="password_confirmation"
                  name="password_confirmation"
                  label="Confirm new password"
                  icon={Lock}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password_confirmation && errors.password_confirmation}
                  disabled={isSubmitting || resetMutation.isPending}
                />

                <ul className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
                  {[
                    'At least 8 characters',
                    'One uppercase letter',
                    'One lowercase letter',
                    'One number',
                  ].map((rule) => {
                    const met =
                      (rule.includes('8') && values.password.length >= 8)
                      || (rule.includes('uppercase') && /[A-Z]/.test(values.password))
                      || (rule.includes('lowercase') && /[a-z]/.test(values.password))
                      || (rule.includes('number') && /[0-9]/.test(values.password))

                    return (
                      <li key={rule} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`size-3.5 shrink-0 ${met ? 'text-emerald-600' : 'text-slate-300'}`}
                          strokeWidth={2}
                        />
                        <span className={met ? 'text-slate-700' : undefined}>{rule}</span>
                      </li>
                    )
                  })}
                </ul>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                    || resetMutation.isPending
                    || otp.length !== OTP_LENGTH
                  }
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || resetMutation.isPending ? (
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
            )}
          </Formik>
        </StepPanel>
      )}

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
