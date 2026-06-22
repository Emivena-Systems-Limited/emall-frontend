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
    tags: ['wireless', 'audio', 'earbuds'],
  },
  2: {
    price: '245.99',
    discount_price: '199.99',
    quantity: '50',
    low_stock_threshold: '10',
    barcode: '1234567890123',
  },
  3: {
    variations: [
      {
        id: 'var-dev-color',
        attribute: 'Color',
        values: [
          {
            id: 'val-dev-black',
            value: 'Black',
            variant_name: 'Midnight Black',
            sku: 'AUD-WEP-001-BLK',
            price: '245.99',
            discount_price: '199.99',
            quantity: '25',
            reserved_quantity: '10',
            low_stock_threshold: '10',
            barcode: '1234567890123',
            images: [],
          },
          {
            id: 'val-dev-white',
            value: 'White',
            variant_name: '',
            sku: 'AUD-WEP-001-WHT',
            price: '269.99',
            discount_price: '229.99',
            quantity: '25',
            reserved_quantity: '',
            low_stock_threshold: '',
            barcode: '',
            images: [],
          },
        ],
      },
    ],
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
  { index: 3, label: 'Variations' },
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
