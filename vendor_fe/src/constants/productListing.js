export const LISTING_TYPES = {
  SIMPLE: 'simple',
  VARIANTS: 'variants',
}

const INFO_FIELDS_BASE = [
  'name',
  'sku',
  'description',
  'category_id',
  'subcategory_id',
  'condition',
  'key_details',
  'has_compatible_models',
  'compatible_models',
]

const INFO_FIELDS_VARIANTS = [
  ...INFO_FIELDS_BASE,
  'main_attribute',
  'main_attribute_value',
]

const PRICING_FIELDS = ['price', 'discount_price', 'discount_percent', 'quantity', 'low_stock_threshold']

const TYPE_STEP = { id: 'type', title: 'Listing type', caption: 'Simple or with options' }
const INFO_STEP = { id: 'info', title: 'Product Info', caption: 'Name, category & details' }
const IMAGES_STEP = { id: 'images', title: 'Images', caption: 'Upload product photos' }
const PRICING_STEP = { id: 'pricing', title: 'Pricing', caption: 'Price & inventory' }
const VARIATIONS_STEP = { id: 'variations', title: 'Variations', caption: 'Colors, sizes & more' }
const SHIPPING_STEP = { id: 'shipping', title: 'Shipping', caption: 'Weight & dimensions' }
const REVIEW_STEP = { id: 'review', title: 'Review', caption: 'Confirm & publish' }

export function isSimpleListing(listingType) {
  return listingType === LISTING_TYPES.SIMPLE
}

export function isVariantsListing(listingType) {
  return listingType === LISTING_TYPES.VARIANTS
}

export function getProductListingSteps(listingType) {
  const steps = [TYPE_STEP, INFO_STEP, IMAGES_STEP, PRICING_STEP]
  if (isVariantsListing(listingType)) steps.push(VARIATIONS_STEP)
  steps.push(SHIPPING_STEP, REVIEW_STEP)
  return steps
}

export function getProductListingStepFields(listingType) {
  const infoFields = isVariantsListing(listingType) ? INFO_FIELDS_VARIANTS : INFO_FIELDS_BASE
  const fields = [
    ['listing_type'],
    infoFields,
    [],
    PRICING_FIELDS,
  ]
  if (isVariantsListing(listingType)) fields.push(['variations'])
  fields.push([], [])
  return fields
}

export function getProductListingWizard(listingType) {
  const steps = getProductListingSteps(listingType)
  return {
    steps,
    fields: getProductListingStepFields(listingType),
    typeIndex: steps.findIndex((step) => step.id === 'type'),
    infoIndex: steps.findIndex((step) => step.id === 'info'),
    imagesIndex: steps.findIndex((step) => step.id === 'images'),
    pricingIndex: steps.findIndex((step) => step.id === 'pricing'),
    variationsIndex: steps.findIndex((step) => step.id === 'variations'),
    shippingIndex: steps.findIndex((step) => step.id === 'shipping'),
    reviewIndex: steps.findIndex((step) => step.id === 'review'),
  }
}

export function applySimpleListingIdentity(values = {}) {
  const name = String(values.name ?? '').trim()
  if (!name) return values

  return {
    ...values,
    listing_type: LISTING_TYPES.SIMPLE,
    main_attribute: name,
    main_attribute_value: name,
    variations: [],
  }
}
