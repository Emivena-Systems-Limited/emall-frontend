import * as Yup from 'yup'

const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must include a lowercase letter')
  .matches(/[A-Z]/, 'Password must include an uppercase letter')
  .matches(/[0-9]/, 'Password must include a number')
  .required('Password is required')

const ghanaPhoneSchema = Yup.string()
  .required('Phone number is required')
  .test(
    'ghana-phone',
    'Enter a valid 10-digit Ghana number starting with 0 (e.g. 0574622234)',
    (value) => {
      const digits = String(value ?? '').replace(/\D/g, '')
      return digits.startsWith('0') && digits.length === 10
    },
  )

export const vendorSignupSchema = Yup.object({
  business_name: Yup.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .required('Business name is required'),
  store_name: Yup.string()
    .trim()
    .min(2, 'Store name must be at least 2 characters')
    .required('Store name is required'),
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  phone_number: ghanaPhoneSchema,
  password: passwordSchema,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  region: Yup.string().required('Region is required'),
  city_or_town: Yup.string().trim().required('City or town is required'),
  address: Yup.string().trim().min(5, 'Address must be at least 5 characters').required('Address is required'),
  gps_address: Yup.string().trim().required('GPS address is required'),
})

export const vendorLoginSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
})
