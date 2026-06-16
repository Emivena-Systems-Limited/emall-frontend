import { Link, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { Formik, Form } from 'formik'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormInput from '../../components/auth/FormInput'
import PasswordInput from '../../components/auth/PasswordInput'
import notify from '../../lib/notify'
import { useLoginVendorMutation } from '../../hooks/useAuthMutations'
import { setCredentials, setPendingVerificationEmail, setPendingVendor } from '../../store/slices/authSlice'
import { vendorLoginSchema } from '../../utils/validationSchemas'

const initialValues = { email: '', password: '' }

export default function Login() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const loginMutation = useLoginVendorMutation()

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await loginMutation.mutateAsync(values)

      if (data.needsVerification) {
        if (data.user) {
          dispatch(setPendingVendor(data.user))
        }
        dispatch(setPendingVerificationEmail(data.user?.email ?? values.email))
        notify.info('Please verify your account to continue.')
        navigate('/verify-account', {
          state: { email: data.user?.email ?? values.email },
          replace: true,
        })
        return
      }

      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        applicationToken: data.applicationToken,
      }))
      notify.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch {
      // handled by mutation onError
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      showHero
      title="Welcome back"
      subtitle="Sign in to manage your store, track orders, and grow your sales."
      heroTitle="Your store, your rules"
      heroDescription="Access your vendor dashboard to manage inventory, fulfill orders, and connect with customers nationwide."
    >
      <Formik
        initialValues={initialValues}
        validationSchema={vendorLoginSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form className="page-enter space-y-5">
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
              disabled={isSubmitting}
            />

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              New vendor?{' '}
              <Link
                to="/signup"
                className="font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
              >
                Create an account
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
