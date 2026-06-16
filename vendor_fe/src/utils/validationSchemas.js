import * as Yup from 'yup'
import { stripHtml } from './richText'

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
