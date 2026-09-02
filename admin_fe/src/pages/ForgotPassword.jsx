import { Form, Formik } from 'formik'
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../components/auth/AuthLayout'
import AuthStepBar from '../components/auth/AuthStepBar'
import FormInput from '../components/auth/FormInput'
import { OTP_EXPIRY_MINUTES, OTP_RESEND_SECONDS } from '../constants/auth'
import { useRequestPasswordResetOtpMutation } from '../hooks/useAuthMutations'
import notify from '../lib/notify'
import { forgotPasswordEmailSchema } from '../utils/authValidation'
import {
  markForgotPasswordResendCooldown,
  readForgotPasswordEmail,
  saveForgotPasswordEmail,
} from '../utils/forgotPasswordSession'
import { parseApiError } from '../utils/parseApiError'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const requestMutation = useRequestPasswordResetOtpMutation()
  const storedEmail = readForgotPasswordEmail() ?? ''

  return (
    <AuthLayout
      title="Reset operator password"
      subtitle="Enter the work email on your admin account. We’ll send a one-time code so you can set a new password."
    >
      <AuthStepBar current={1} />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-slate-200">
            <KeyRound className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Secure reset</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              The code expires in {OTP_EXPIRY_MINUTES} minutes and can only be used once.
            </p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={{ email: storedEmail }}
        enableReinitialize
        validationSchema={forgotPasswordEmailSchema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          const email = values.email.trim().toLowerCase()
          try {
            await requestMutation.mutateAsync({ email })
            saveForgotPasswordEmail(email)
            markForgotPasswordResendCooldown(OTP_RESEND_SECONDS)
            notify.success('Reset code sent. Check your email inbox.')
            navigate('/reset-password', { replace: true, state: { email } })
          } catch (error) {
            const { fieldErrors } = parseApiError(error)
            if (fieldErrors.email) setFieldError('email', fieldErrors.email)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => {
          const pending = isSubmitting || requestMutation.isPending

          return (
            <Form className="space-y-4" noValidate>
              <FormInput
                id="email"
                name="email"
                label="Work email"
                icon={Mail}
                type="email"
                autoComplete="username"
                placeholder="you@ezmall.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                disabled={pending}
              />

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
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
