const DEV_DESCRIPTION =
  '<p>Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX4 water resistance. Includes charging case and USB-C cable.</p>'

export const DEV_PRODUCT_STEP_FIXTURES = {
  0: {
    name: 'Wireless Earbuds Pro',
    sku: 'AUD-WEP-001',
    description: DEV_DESCRIPTION,
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    condition: 'new',
    tags: ['wireless', 'audio', 'earbuds'],
    key_details: [
      { id: 'kd-material', key: 'Material', value: 'ABS plastic' },
    ],
  },
  2: {
    price: '245.99',
    discount_price: '199.99',
    quantity: '50',
    low_stock_threshold: '10',
    barcode: '1234567890123',
  },
  4: {
    shipping_weight: '0.2',
    shipping_length: '10',
    shipping_width: '8',
    shipping_height: '4',
  },
}

export const DEV_PRODUCT_FILLABLE_STEPS = [
  { index: 0, label: 'Product info' },
  { index: 2, label: 'Pricing' },
  { index: 4, label: 'Shipping' },
]

export function getDevProductMergedFixtures() {
  return DEV_PRODUCT_FILLABLE_STEPS.reduce(
    (acc, { index }) => ({ ...acc, ...DEV_PRODUCT_STEP_FIXTURES[index] }),
    {},
  )
}

export function getDevProductStepFixture(stepIndex) {
  return DEV_PRODUCT_STEP_FIXTURES[stepIndex] ?? null
}
