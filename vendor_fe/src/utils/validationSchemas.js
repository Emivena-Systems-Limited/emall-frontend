import * as Yup from 'yup'
import { PRODUCT_CONDITION_OPTIONS } from '../constants/products'
import { hasUsableProductImages } from './productImageUtils'
import { stripHtml } from './richText'

const productConditionValues = PRODUCT_CONDITION_OPTIONS.map((option) => option.value)

const productKeyDetailPairSchema = Yup.object({
  id: Yup.string(),
  key: Yup.string().trim(),
  value: Yup.string().trim(),
}).test('pair-complete', 'Complete both property and value', function validatePair(pair) {
  const key = pair?.key?.trim()
  const value = pair?.value?.trim()
  if (!key && !value) return true
  if (key && value) return true
  if (!key) {
    return this.createError({
      path: `${this.path}.key`,
      message: 'Property is required when a value is entered',
    })
  }
  return this.createError({
    path: `${this.path}.value`,
    message: 'Property value is required when a property is entered',
  })
})

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

export const vendorForgotPasswordEmailSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
})

export const vendorResetPasswordSchema = Yup.object({
  password: passwordSchema,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

const nullableNumber = Yup.number()
  .nullable()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) return null
    return value
  })

function getRootFormValues(from = []) {
  return from[from.length - 1]?.value ?? {}
}

function parseVariantQuantity(value) {
  if (value === '' || value == null) return null
  const quantity = Number(value)
  return Number.isFinite(quantity) ? quantity : null
}

function parseOptionalStockThreshold(value) {
  if (value === '' || value == null) return null
  const threshold = Number(value)
  return Number.isFinite(threshold) ? threshold : null
}

function stockQuantityNotBelowThresholdTest(message = 'Stock quantity cannot be less than the low stock threshold') {
  return function validateQuantity(value) {
    const threshold = parseOptionalStockThreshold(this.parent.low_stock_threshold)
    if (threshold == null) return true

    const quantity = parseVariantQuantity(value)
    if (quantity == null) return true

    if (quantity < threshold) {
      return this.createError({ message })
    }

    return true
  }
}

function lowStockThresholdNotAboveQuantityTest(
  message = 'Low stock threshold cannot exceed stock quantity',
) {
  return function validateThreshold(value) {
    if (value == null) return true

    const threshold = parseOptionalStockThreshold(value)
    if (threshold == null) return true

    const quantity = parseVariantQuantity(this.parent.quantity)
    if (quantity == null) return true

    if (threshold > quantity) {
      return this.createError({ message })
    }

    return true
  }
}

function getMainProductStockQuantity(values = {}) {
  const quantity = Number(values.quantity)
  return Number.isFinite(quantity) ? quantity : null
}

function sumVariantStockQuantities(variations = []) {
  return (variations ?? []).reduce((total, variation) => {
    const variationTotal = (variation.values ?? []).reduce((sum, value) => {
      const quantity = parseVariantQuantity(value.quantity)
      return quantity == null ? sum : sum + quantity
    }, 0)
    return total + variationTotal
  }, 0)
}

function withVariantStockCapValidation(schema) {
  return schema.test(
    'variant-stock-total-within-main',
    'Total variant stock cannot exceed main product stock',
    function validateTotalVariantStock(values) {
      const mainQty = getMainProductStockQuantity(values)
      if (mainQty == null) return true

      const total = sumVariantStockQuantities(values?.variations)
      if (total <= mainQty) return true

      return this.createError({
        path: 'variations',
        message: `Total variant stock (${total}) cannot exceed main product stock (${mainQty}).`,
      })
    },
  )
}

// Keep in sync with VARIANT_DESCRIPTION_MAX_LENGTH in components/variants/variantConstants.js
const VARIANT_DESCRIPTION_MAX_LENGTH = 300

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
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .required('Stock quantity is required')
    .test(
      'variant-qty-not-exceed-main',
      'Variant stock cannot exceed main product stock',
      function validateVariantQuantity(value) {
        const mainQty = getMainProductStockQuantity(getRootFormValues(this.from))
        if (mainQty == null) return true

        if (value > mainQty) {
          return this.createError({
            message: `Variant stock cannot exceed main product stock (${mainQty}).`,
          })
        }

        return true
      },
    )
    .test('variant-qty-not-below-threshold', stockQuantityNotBelowThresholdTest()),
  reserved_quantity: nullableNumber.integer('Must be a whole number').min(0, 'Cannot be negative'),
  low_stock_threshold: nullableNumber
    .integer('Must be a whole number')
    .min(1, 'Threshold must be at least 1')
    .test('variant-threshold-not-above-qty', lowStockThresholdNotAboveQuantityTest()),
  barcode: Yup.string().trim().nullable(),
  barcode_type: Yup.string().oneOf(['UPC', 'EAN', 'ISBN', 'GTIN']).nullable(),
  weight: nullableNumber.min(0, 'Cannot be negative'),
  length: nullableNumber.min(0, 'Cannot be negative'),
  width: nullableNumber.min(0, 'Cannot be negative'),
  height: nullableNumber.min(0, 'Cannot be negative'),
  description: Yup.string()
    .trim()
    .max(VARIANT_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${VARIANT_DESCRIPTION_MAX_LENGTH} characters`)
    .nullable(),
  has_compatible_models: Yup.boolean().default(false),
  compatible_models: Yup.array().of(Yup.string().trim()).default([]).when('has_compatible_models', {
    is: true,
    then: (schema) => schema.min(1, 'Add at least one compatible model, or turn this off'),
    otherwise: (schema) => schema,
  }),
  images: Yup.array()
    .of(
      Yup.object({
        id: Yup.string(),
        preview: Yup.string(),
      }),
    )
    .default([])
    .test(
      'variant-images-required',
      'At least one variant image is required',
      function validateVariantImages(images) {
        const { image_url: imageUrl } = this.parent ?? {}
        return hasUsableProductImages(images, imageUrl)
      },
    ),
  image_url: Yup.string().nullable(),
})

const productVariationSchema = Yup.object({
  id: Yup.string(),
  attribute: Yup.string().trim().required('Variation name is required'),
  values: Yup.array()
    .of(productVariationValueSchema)
    .min(1, 'Add at least one value for this variation'),
})

export const productListingSchemaBase = Yup.object({
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
  condition: Yup.string()
    .oneOf(productConditionValues, 'Select a valid product condition')
    .required('Product condition is required'),
  tags: Yup.array().of(Yup.string().trim().min(1)).default([]),
  key_details: Yup.array().of(productKeyDetailPairSchema).default([]),

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
    .required('Quantity is required')
    .test('qty-not-below-threshold', stockQuantityNotBelowThresholdTest()),
  low_stock_threshold: nullableNumber
    .integer('Must be a whole number')
    .min(1, 'Threshold must be at least 1')
    .test('threshold-not-above-qty', lowStockThresholdNotAboveQuantityTest()),
  barcode: Yup.string().trim().nullable(),

  variations: Yup.array().of(productVariationSchema).default([]),

  shipping_weight: nullableNumber.min(0, 'Cannot be negative'),
  shipping_length: nullableNumber.min(0, 'Cannot be negative'),
  shipping_width: nullableNumber.min(0, 'Cannot be negative'),
  shipping_height: nullableNumber.min(0, 'Cannot be negative'),

  status: Yup.string().oneOf(['draft', 'active', 'inactive']).required('Status is required'),
})

export const productListingSchema = withVariantStockCapValidation(productListingSchemaBase)

export const singleVariantSchema = Yup.object({
  attribute: Yup.string().trim().required('Variation type is required (e.g. Color, Size)'),
  value: Yup.string().trim().required('Variation value is required (e.g. Black, Large)'),
  variant_name: Yup.string().trim().nullable(),
  sku: Yup.string()
    .trim()
    .matches(/^[A-Z0-9-]*$/i, 'SKU: letters, numbers, and hyphens only')
    .nullable(),
  price: nullableNumber.min(0.01, 'Price must be at least 0.01'),
  discount_price: nullableNumber
    .min(0.01, 'Sale price must be at least 0.01')
    .test('less-than-price', 'Sale price must be less than the list price', function validateSale(value) {
      if (value == null) return true
      const { price } = this.parent
      if (price != null && price !== '' && !Number.isNaN(Number(price))) return value < Number(price)
      return true
    }),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .required('Stock quantity is required')
    .test('not-exceed-main', 'Cannot exceed main product stock', function validateQty(value) {
      const mainQty = this.options.context?.mainProductQuantity
      if (mainQty == null) return true
      if (value > mainQty) {
        return this.createError({ message: `Cannot exceed main product stock (${mainQty}).` })
      }
      return true
    })
    .test('qty-not-below-threshold', stockQuantityNotBelowThresholdTest()),
  reserved_quantity: nullableNumber.integer('Must be a whole number').min(0, 'Cannot be negative'),
  low_stock_threshold: nullableNumber
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .test('threshold-not-above-qty', lowStockThresholdNotAboveQuantityTest()),
  barcode: Yup.string().trim().nullable(),
  barcode_type: Yup.string().oneOf(['UPC', 'EAN', 'ISBN', 'GTIN']).nullable(),
  weight: nullableNumber.min(0, 'Cannot be negative'),
  length: nullableNumber.min(0, 'Cannot be negative'),
  width: nullableNumber.min(0, 'Cannot be negative'),
  height: nullableNumber.min(0, 'Cannot be negative'),
  description: Yup.string()
    .trim()
    .max(VARIANT_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${VARIANT_DESCRIPTION_MAX_LENGTH} characters`)
    .nullable(),
  has_compatible_models: Yup.boolean().default(false),
  compatible_models: Yup.array().of(Yup.string().trim()).default([]).when('has_compatible_models', {
    is: true,
    then: (schema) => schema.min(1, 'Add at least one compatible model, or turn this off'),
    otherwise: (schema) => schema,
  }),
  images: Yup.array()
    .default([])
    .test(
      'variant-images-required',
      'At least one variant image is required',
      (images) => hasUsableProductImages(images),
    ),
})

export const productInfoSchema = productListingSchemaBase.pick([
  'name',
  'sku',
  'description',
  'category_id',
  'subcategory_id',
  'brand_id',
  'condition',
  'tags',
  'key_details',
  'price',
  'discount_mode',
  'discount_price',
  'discount_percent',
  'quantity',
  'low_stock_threshold',
  'barcode',
  'shipping_weight',
  'shipping_length',
  'shipping_width',
  'shipping_height',
  'status',
])

export const productVariationsSchema = withVariantStockCapValidation(
  productListingSchemaBase.pick([
    'price',
    'discount_mode',
    'discount_price',
    'discount_percent',
    'quantity',
    'variations',
  ]),
)
