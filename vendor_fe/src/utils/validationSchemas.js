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

const nullableNumber = Yup.number()
  .nullable()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) return null
    return value
  })

const productVariationValueSchema = Yup.object({
  id: Yup.string(),
  value: Yup.string().trim().required('Value is required'),
  variant_name: Yup.string().trim().nullable(),
  sku: Yup.string()
    .trim()
    .matches(/^[A-Z0-9-]*$/i, 'SKU format: letters, numbers, hyphens')
    .nullable(),
  price: nullableNumber.min(0.01, 'Price must be at least 0.01'),
  discount_price: nullableNumber
    .min(0.01, 'Sale price must be at least 0.01')
    .test('variant-sale-less-than-list', 'Sale price must be less than the variant list price', function validateSale(value) {
      if (value == null) return true
      const { price } = this.parent
      if (price != null && price !== '' && !Number.isNaN(Number(price))) {
        return value < Number(price)
      }
      return true
    }),
  quantity: nullableNumber.integer('Must be a whole number').min(0, 'Cannot be negative'),
  reserved_quantity: nullableNumber.integer('Must be a whole number').min(0, 'Cannot be negative'),
  low_stock_threshold: nullableNumber.integer('Must be a whole number').min(1, 'Threshold must be at least 1'),
  barcode: Yup.string().trim().nullable(),
  images: Yup.array()
    .of(
      Yup.object({
        id: Yup.string(),
        preview: Yup.string(),
      }),
    )
    .default([]),
  image_url: Yup.string().nullable(),
})

const productVariationSchema = Yup.object({
  id: Yup.string(),
  attribute: Yup.string().trim().required('Variation name is required'),
  values: Yup.array()
    .of(productVariationValueSchema)
    .min(1, 'Add at least one value for this variation'),
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
  category_id: Yup.string().required('Category is required'),
  subcategory_id: Yup.string().required('Subcategory is required'),
  brand_id: Yup.string().required('Brand is required'),
  tags: Yup.array().of(Yup.string().trim().min(1)).default([]),

  price: Yup.number()
    .typeError('Price must be a valid amount')
    .min(0.01, 'Price must be at least 0.01')
    .required('Price is required'),
  discount_mode: Yup.string().oneOf(['amount', 'percent']).default('amount'),
  discount_price: nullableNumber.when('discount_mode', {
    is: 'amount',
    then: (schema) => schema
      .test('greater-than-zero', 'Sale price must be at least 0.01', function (value) {
        if (value == null) return true
        return value >= 0.01
      })
      .test('less-than-price', 'Sale price must be less than regular price', function (value) {
        if (value == null) return true
        const { price } = this.parent
        if (!price || isNaN(Number(price))) return true
        return value < Number(price)
      }),
    otherwise: (schema) => schema,
  }),
  discount_percent: nullableNumber.when('discount_mode', {
    is: 'percent',
    then: (schema) => schema
      .test('percent-range', 'Enter a discount between 0.01 and 99.99%', function (value) {
        if (value == null) return true
        return value >= 0.01 && value < 100
      }),
    otherwise: (schema) => schema,
  }),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  low_stock_threshold: nullableNumber
    .integer('Must be a whole number')
    .min(1, 'Threshold must be at least 1'),
  barcode: Yup.string().trim().nullable(),

  variations: Yup.array().of(productVariationSchema).default([]),

  shipping_weight: nullableNumber.min(0, 'Cannot be negative'),
  shipping_length: nullableNumber.min(0, 'Cannot be negative'),
  shipping_width: nullableNumber.min(0, 'Cannot be negative'),
  shipping_height: nullableNumber.min(0, 'Cannot be negative'),

  status: Yup.string().oneOf(['draft', 'active', 'inactive']).required('Status is required'),
})
