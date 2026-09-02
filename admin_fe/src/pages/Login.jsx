import { Form, Formik } from 'formik'
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'
import AuthLayout from '../components/auth/AuthLayout'
import FormInput from '../components/auth/FormInput'
import PasswordInput from '../components/auth/PasswordInput'
import { useLoginAdminMutation } from '../hooks/useAuthMutations'
import notify from '../lib/notify'
import { persistor } from '../store/store'
import { setCredentials } from '../store/slices/authSlice'
import { getPostAuthRedirect } from '../utils/authRedirect'
import { parseApiError } from '../utils/parseApiError'
import {
  clearPasswordChangedFlag,
  hasPasswordChangedFlag,
} from '../utils/passwordChangeSession'

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginAdminMutation()
  const nextPath = getPostAuthRedirect(location.state?.from)
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] = useState(
    () => location.state?.passwordReset === true || hasPasswordChangedFlag(),
  )

  useEffect(() => {
    if (hasPasswordChangedFlag()) {
      setShowPasswordResetSuccess(true)
      clearPasswordChangedFlag()
    }

    if (!location.state?.passwordReset) return

    setShowPasswordResetSuccess(true)
    navigate(location.pathname, { replace: true, state: { from: location.state?.from } })
  }, [location.pathname, location.state, navigate])

  return (
    <AuthLayout
      title="Sign in to the command center"
      subtitle="EZ-Mall operators use this portal to approve vendors, watch sales, and clear exceptions."
    >
      {showPasswordResetSuccess ? (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2} />
          <div>
            <p className="font-semibold">Password updated</p>
            <p className="mt-0.5 leading-relaxed text-emerald-800/90">
              Sign in with your new password to return to the command center.
            </p>
          </div>
        </div>
      ) : null}

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
          try {
            const data = await loginMutation.mutateAsync({
              email: values.email,
              password: values.password,
            })

            dispatch(setCredentials({
              user: data.user,
              accessToken: data.accessToken,
              applicationToken: data.applicationToken,
            }))
            await persistor.flush()

            const name = data.user?.first_name || data.user?.full_name || 'Operator'
            notify.success(`Welcome back, ${name}.`)
            navigate(nextPath, { replace: true })
          } catch (error) {
            const { fieldErrors } = parseApiError(error)
            if (fieldErrors.email) setFieldError('email', fieldErrors.email)
            if (fieldErrors.password) setFieldError('password', fieldErrors.password)
            if (!fieldErrors.email && !fieldErrors.password && Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors)
            }
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => {
          const pending = isSubmitting || loginMutation.isPending

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
              <PasswordInput
                id="password"
                name="password"
                label="Password"
                icon={Lock}
                autoComplete="current-password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                disabled={pending}
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <ArrowRight className="size-4" />
                    Enter admin
                  </>
                )}
              </button>
            </Form>
          )
        }}
      </Formik>
    </AuthLayout>
  )
}
