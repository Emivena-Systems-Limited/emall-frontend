import { useState } from 'react'
import { Formik } from 'formik'
import AuthLayout from '../../components/auth/AuthLayout'
import SignupFormFields from '../../components/auth/SignupFormFields'
import SignupSuccessState from '../../components/auth/SignupSuccessState'
import { useRegisterVendorMutation } from '../../hooks/useAuthMutations'
import { setPendingVerificationEmail, setPendingVendor } from '../../store/slices/authSlice'
import { useDispatch } from 'react-redux'
import { GHANA_COUNTRY } from '../../constants/ghanaRegions'
import { parseApiError } from '../../utils/parseApiError'
import { vendorSignupSchema } from '../../utils/validationSchemas'

const initialValues = {
  business_name: '',
  trading_name: '',
  region: '',
  district: '',
  city_or_town: '',
  gps_address: '',
  address: '',
  street_name: '',
  landmark: '',
  business_registration_number: '',
  tin_number: '',
  // registration_certificate: null, // Hidden until backend file storage is ready
  admin_full_name: '',
  phone_number: '',
  email: '',
  password: '',
  password_confirmation: '',
  country: GHANA_COUNTRY,
  confirm_accurate: false,
  agree_terms: false,
}

export default function Signup() {
  const dispatch = useDispatch()
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const registerMutation = useRegisterVendorMutation({ suppressErrorToast: true })

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError(null)

    try {
      const result = await registerMutation.mutateAsync(values)
      dispatch(setPendingVerificationEmail(values.email))
      if (result.user) {
        dispatch(setPendingVendor(result.user))
      }
      setSubmittedEmail(values.email)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Could not create vendor account'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      wideForm
      compactLayout
      title="Become a Vendor"
      subtitle="Join us and grow your business with us."
    >
      {submitted ? (
        <SignupSuccessState email={submittedEmail} />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={vendorSignupSchema}
          validateOnMount
          validateOnChange
          validateOnBlur
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <SignupFormFields
              {...formikProps}
              registerPending={registerMutation.isPending}
              submitError={submitError}
              onDismissError={() => setSubmitError(null)}
            />
          )}
        </Formik>
      )}
    </AuthLayout>
  )
}
