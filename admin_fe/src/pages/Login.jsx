import { Form, Formik } from 'formik'
import { ArrowRight, Loader2, Lock, Mail, Shield } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'
import AuthLayout from '../components/auth/AuthLayout'
import FormInput from '../components/auth/FormInput'
import PasswordInput from '../components/auth/PasswordInput'
import { ADMIN_DEMO } from '../constants/adminDashboardData'
import notify from '../lib/notify'
import { setCredentials } from '../store/slices/authSlice'
import { isLocalEnvironment } from '../utils/environment'

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

function enterAs(dispatch, navigate, user = ADMIN_DEMO.user) {
  dispatch(setCredentials({
    user,
    accessToken: 'admin-demo-access',
    applicationToken: 'admin-demo-app',
  }))
  notify.success(`Welcome back, ${user.full_name.split(' ')[0]}.`)
  navigate('/dashboard', { replace: true })
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const local = isLocalEnvironment()

  return (
    <AuthLayout
      title="Sign in to the command center"
      subtitle="EZ-Mall operators use this portal to approve vendors, watch GMV, and clear exceptions."
    >
      <Formik
        initialValues={{ email: local ? ADMIN_DEMO.email : '', password: local ? ADMIN_DEMO.password : '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          try {
            const email = values.email.trim().toLowerCase()
            const password = values.password
            if (email !== ADMIN_DEMO.email || password !== ADMIN_DEMO.password) {
              setFieldError('password', 'Those credentials are not recognised.')
              notify.error('Sign-in failed. Use the demo operator account for now.')
              return
            }
            enterAs(dispatch, navigate)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <FormInput
              id="email"
              name="email"
              label="Work email"
              icon={Mail}
              type="email"
              autoComplete="username"
              placeholder="leo.a@example.org"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
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
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Enter admin
            </button>
          </Form>
        )}
      </Formik>

      {local && (
        <button
          type="button"
          onClick={() => enterAs(dispatch, navigate)}
          className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:bg-brand-light/50"
        >
          <Shield className="size-4 text-brand" />
          Enter command center
        </button>
      )}

      <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        Admin APIs are not wired yet. Use <span className="font-semibold text-slate-700">{ADMIN_DEMO.email}</span> /{' '}
        <span className="font-semibold text-slate-700">{ADMIN_DEMO.password}</span> on local environments.
      </p>
    </AuthLayout>
  )
}
