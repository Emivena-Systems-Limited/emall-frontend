import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { Formik } from 'formik'
import AuthLayout from '../../components/auth/AuthLayout'
import SignupFormFields from '../../components/auth/SignupFormFields'
import notify from '../../lib/notify'
import { useRegisterVendorMutation } from '../../hooks/useAuthMutations'
import { setPendingVerificationEmail, setPendingVendor } from '../../store/slices/authSlice'
import { GHANA_COUNTRY } from '../../constants/ghanaRegions'
import { vendorSignupSchema } from '../../utils/validationSchemas'

const initialValues = {
  business_name: '',
  store_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
  country: GHANA_COUNTRY,
  region: '',
  city_or_town: '',
  address: '',
  gps_address: '',
}

export default function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const registerMutation = useRegisterVendorMutation()

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await registerMutation.mutateAsync(values)
      dispatch(setPendingVerificationEmail(values.email))
      if (result.user) {
        dispatch(setPendingVendor(result.user))
      }
      notify.success(result.message || 'Account created! Check your email for the verification code.')

      if (result.needsVerification) {
        navigate('/verify-account', { state: { email: values.email }, replace: true })
        return
      }

      notify.info('Your account is already verified. Please sign in.')
      navigate('/login', { replace: true })
    } catch {
      // Error handled by mutation onError
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      showHero
      wideForm
      title="Create vendor account"
      subtitle="Join E-Mall and start selling to customers across Ghana."
    >
      <Formik initialValues={initialValues} validationSchema={vendorSignupSchema} onSubmit={handleSubmit}>
        {(formikProps) => (
          <SignupFormFields
            {...formikProps}
            registerPending={registerMutation.isPending}
          />
        )}
      </Formik>
    </AuthLayout>
  )
}
