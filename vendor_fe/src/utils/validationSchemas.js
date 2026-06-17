import * as Yup from 'yup'
import { stripHtml } from './richText'

const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must include a lowercase letter')
  .matches(/[A-Z]/, 'Password must include an uppercase letter')
  .matches(/[0-9]/, 'Password must include a number')
  .required('Password is required')

const ghanaPhoneSchema = Yup.string()
  .required('Mobile number is required')
  .test(
    'ghana-phone',
    'Enter a valid 10-digit Ghanaian mobile number starting with 0 (e.g. 0241234567)',
    (value) => {
      const digits = String(value ?? '').replace(/\D/g, '')
      return digits.startsWith('0') && digits.length === 10
    },
  )

// Hidden until backend file storage is ready
// const registrationCertificateSchema = Yup.mixed()
//   .nullable()
//   .test('file-size', 'File must be 5MB or less', (value) => {
//     if (!value) return true
//     return value.size <= 5 * 1024 * 1024
//   })
//   .test('file-type', 'Only JPG, PNG, or PDF files are allowed', (value) => {
//     if (!value) return true
//     return ['image/jpeg', 'image/png', 'application/pdf'].includes(value.mime_type)
//   })

export const VENDOR_ADDRESS_MAX_LENGTH = 100

export const vendorSignupSchema = Yup.object({
  business_name: Yup.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .required('Business name is required'),
  trading_name: Yup.string()
    .trim()
    .min(2, 'Trading name must be at least 2 characters')
    .required('Trading name is required'),
  region: Yup.string().required('Region is required'),
  district: Yup.string().trim().required('District is required'),
  city_or_town: Yup.string().trim().required('Town or city is required'),
  gps_address: Yup.string().trim().min(3, 'GPS address is required').required('GPS address is required'),
  address: Yup.string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(VENDOR_ADDRESS_MAX_LENGTH, `Address must not exceed ${VENDOR_ADDRESS_MAX_LENGTH} characters`)
    .required('Address is required'),
  street_name: Yup.string().trim().min(2, 'Street name is required').required('Street name is required'),
  landmark: Yup.string().trim().nullable(),
  business_registration_number: Yup.string().trim().nullable(),
  tin_number: Yup.string().trim().nullable(),
  // registration_certificate: registrationCertificateSchema,
  admin_full_name: Yup.string()
    .trim()
    .min(3, 'Enter the store admin full name')
    .required('Store admin full name is required'),
  phone_number: ghanaPhoneSchema,
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  password: passwordSchema,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  confirm_accurate: Yup.boolean()
    .oneOf([true], 'You must confirm the information is accurate')
    .required('You must confirm the information is accurate'),
  agree_terms: Yup.boolean()
    .oneOf([true], 'You must agree to the Vendor Terms and Conditions')
    .required('You must agree to the Vendor Terms and Conditions'),
})

export const vendorSignupStepSchemas = [
  vendorSignupSchema.pick([
    'business_name',
    'trading_name',
    'region',
    'district',
    'city_or_town',
    'gps_address',
    'address',
    'street_name',
    'landmark',
  ]),
  vendorSignupSchema.pick(['business_registration_number', 'tin_number']),
  // vendorSignupSchema.pick(['business_registration_number', 'tin_number', 'registration_certificate']),
  vendorSignupSchema.pick(['admin_full_name', 'phone_number', 'email']),
  vendorSignupSchema.pick(['password', 'password_confirmation', 'confirm_accurate', 'agree_terms']),
]

export const vendorSignupStepFields = [
  ['business_name', 'trading_name', 'region', 'district', 'city_or_town', 'gps_address', 'address', 'street_name'],
  ['business_registration_number', 'tin_number'],
  // ['business_registration_number', 'tin_number', 'registration_certificate'],
  ['admin_full_name', 'phone_number', 'email'],
  ['password', 'password_confirmation', 'confirm_accurate', 'agree_terms'],
]

export const vendorLoginSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

const metadataItemSchema = Yup.object({
  key: Yup.string().trim().required('Specification name is required'),
  value: Yup.string().trim().required('Specification value is required'),
})

export const productListingSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  sku: Yup.string()
    .trim()
    .matches(/^[A-Z0-9-]+$/i, 'SKU can only include letters, numbers, and hyphens')
    .required('SKU is required'),
  description: Yup.string()
    .required('Description is required')
    .test('min-length', 'Description must be at least 20 characters', (value) => {
      return stripHtml(value).length >= 20
    }),
  category_slug: Yup.string().required('Category is required'),
  subcategory_slug: Yup.string().required('Subcategory is required'),
  brand_slug: Yup.string().required('Brand is required'),
  status: Yup.string().oneOf(['draft', 'active', 'inactive']).required('Status is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .min(1, 'Price must be greater than zero')
    .required('Price is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  image_urls: Yup.array()
    .of(
      Yup.string()
        .trim()
        .url('Enter a valid image URL')
        .required('Image URL is required'),
    )
    .min(1, 'Add at least one product image')
    .required('Add at least one product image'),
  videos: Yup.array().of(
    Yup.object({
      title: Yup.string().trim().when('video_url', {
        is: (value) => Boolean(value?.trim()),
        then: (schema) => schema.required('Video title is required'),
        otherwise: (schema) => schema,
      }),
      video_url: Yup.string().trim().url('Enter a valid video URL'),
    }),
  ),
  metadata: Yup.array()
    .of(metadataItemSchema)
    .min(1, 'Add at least one product-specific detail'),
})
