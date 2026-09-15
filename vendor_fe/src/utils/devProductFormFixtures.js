import { getSubcategoriesForParentId } from './normalizeCategories'
import { isGenericBrand } from './normalizeBrands'

const DEV_DESCRIPTION = [
  '<p>A 16-inch gaming laptop built for high-refresh play and everyday creation.',
  ' Shadow Black and Storm Silver each ship as their own SKU, with 16GB or 32GB RAM as a secondary option.</p>',
  '<p>AMD Ryzen 7 8845HS, NVIDIA RTX 4060 8GB, 165Hz QHD display, 1TB NVMe SSD,',
  ' and a 90Wh battery. MUX switch, Wi-Fi 6E, and a 240W charger in the box.</p>',
].join('')

const PREFERRED_PARENT_CATEGORY_PATTERN = /electronic|computer|gaming|laptop/i
const PREFERRED_SUBCATEGORY_PATTERN = /gaming|laptop|computer peripheral/i
const PREFERRED_BRAND_PATTERN = /asus|msi|lenovo|hp|dell|razer|acer|alienware|gigabyte/i

function pickDevBrandId(approvedBrands = []) {
  const selectable = approvedBrands.filter((brand) => !isGenericBrand(brand))
  if (!selectable.length) return ''
  const preferred = selectable.find((brand) => PREFERRED_BRAND_PATTERN.test(brand.name))
  return (preferred ?? selectable[0])?.id ?? ''
}

function pickPreferredSubcategory(subcategories = []) {
  return subcategories.find((category) => PREFERRED_SUBCATEGORY_PATTERN.test(category.name))
    ?? subcategories[0]
}

function pickDevCategoryIds(categoryTree = [], parentCategories = []) {
  const parents = parentCategories.length ? parentCategories : categoryTree
  if (!parents.length) return { category_id: '', subcategory_id: '' }

  const preferredParent = parents.find((category) => {
    const subcategories = getSubcategoriesForParentId(categoryTree, category.id)
    return subcategories.length > 0 && PREFERRED_PARENT_CATEGORY_PATTERN.test(category.name)
  })
    ?? parents.find((category) => getSubcategoriesForParentId(categoryTree, category.id).length > 0)
    ?? parents[0]

  const subcategories = getSubcategoriesForParentId(categoryTree, preferredParent.id)
  const subcategory = pickPreferredSubcategory(subcategories)

  return {
    category_id: preferredParent.id,
    subcategory_id: subcategory?.id ?? '',
  }
}

export function resolveDevProductCatalogFields({
  parentCategories = [],
  categoryTree = [],
  approvedBrands = [],
} = {}) {
  const { category_id, subcategory_id } = pickDevCategoryIds(categoryTree, parentCategories)
  const brand_id = pickDevBrandId(approvedBrands)

  return { category_id, subcategory_id, brand_id }
}

export function getDevProductCatalogFillWarnings({
  parentCategories = [],
  categoryTree = [],
  approvedBrands = [],
} = {}) {
  const warnings = []

  if (!parentCategories.length && !categoryTree.length) {
    warnings.push('Categories are still loading — re-run fill once they appear.')
  } else {
    const { category_id, subcategory_id } = pickDevCategoryIds(categoryTree, parentCategories)
    if (!category_id) warnings.push('No parent category found to auto-select.')
    if (category_id && !subcategory_id) warnings.push('No subcategory found for the selected parent.')
  }

  if (!approvedBrands.length) {
    warnings.push('Approved brands are still loading — re-run fill once they appear.')
  }

  return warnings
}

function skuCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)
}

function createDevSecondary(attribute, value, overrides = {}) {
  return {
    id: `sv-dev-${skuCode(value).toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`,
    attribute,
    value,
    sku: '',
    quantity: '',
    reserved_quantity: '1',
    low_stock_threshold: '3',
    minimum_threshold: '3',
    price: '',
    discount_price: '',
    ...overrides,
  }
}

function createDevVariantValue(value, overrides = {}) {
  return {
    id: `val-dev-${value.toLowerCase().replace(/\s+/g, '-')}`,
    value,
    variant_name: '',
    sku: '',
    price: '',
    discount_price: '',
    quantity: '',
    reserved_quantity: '',
    low_stock_threshold: '',
    minimum_threshold: '',
    barcode: '',
    barcode_type: 'UPC',
    weight: '',
    length: '',
    width: '',
    height: '',
    description: '',
    has_compatible_models: false,
    compatible_models: [],
    secondary_variants: [],
    images: [],
    ...overrides,
  }
}

function createLaptopRamOptions(colorCode, { qty16, qty32, reserved16 = '1', reserved32 = '1' }) {
  return [
    createDevSecondary('RAM', '16GB', {
      id: `sv-dev-${colorCode}-16gb`,
      sku: '',
      quantity: String(qty16),
      reserved_quantity: reserved16,
      low_stock_threshold: '3',
      minimum_threshold: '3',
      price: '9199.99',
      discount_price: '8499.99',
    }),
    createDevSecondary('RAM', '32GB', {
      id: `sv-dev-${colorCode}-32gb`,
      sku: '',
      quantity: String(qty32),
      reserved_quantity: reserved32,
      low_stock_threshold: '2',
      minimum_threshold: '2',
      price: '10499.99',
      discount_price: '9799.99',
    }),
  ]
}

export const DEV_PRODUCT_STEP_FIXTURES = {
  type: {
    listing_type: 'variants',
  },
  info: {
    name: 'ApexForge 16 Gaming Laptop',
    sku: 'LAP-AF16-001',
    description: DEV_DESCRIPTION,
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    condition: 'new',
    tags: ['gaming', 'laptop', 'rtx', '165hz'],
    key_details: [
      { id: 'kd-processor', key: 'Processor', value: 'AMD Ryzen 7 8845HS' },
      { id: 'kd-gpu', key: 'Graphics', value: 'NVIDIA RTX 4060 8GB' },
      { id: 'kd-display', key: 'Display', value: '16" QHD 165Hz' },
      { id: 'kd-storage', key: 'Storage', value: '1TB NVMe SSD' },
    ],
    main_attribute: 'Color',
    main_attribute_value: 'Shadow Black',
    has_compatible_models: false,
    compatible_models: [],
  },
  pricing: {
    price: '9199.99',
    discount_mode: 'amount',
    discount_price: '8499.99',
    quantity: '30',
    reserved_quantity: '2',
    low_stock_threshold: '5',
    barcode: '1942538870012',
  },
  variations: {
    listing_type: 'variants',
    secondary_variants: createLaptopRamOptions('blk', { qty16: 12, qty32: 8 }),
    variations: [
      {
        id: 'var-dev-color',
        attribute: 'Color',
        values: [
          createDevVariantValue('Storm Silver', {
            sku: '',
            quantity: '',
            reserved_quantity: '',
            low_stock_threshold: '',
            minimum_threshold: '',
            description: 'Storm silver chassis with the same 240W charger and MUX switch.',
            secondary_variants: createLaptopRamOptions('slv', {
              qty16: 6,
              qty32: 4,
              reserved16: '1',
              reserved32: '0',
            }),
          }),
        ],
      },
    ],
  },
  shipping: {
    shipping_weight: '2.3',
    shipping_length: '36',
    shipping_width: '26',
    shipping_height: '3',
  },
}

export const DEV_PRODUCT_FILLABLE_STEPS = [
  { id: 'type', label: 'Listing type' },
  { id: 'info', label: 'Product info' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'variations', label: 'Variations' },
  { id: 'shipping', label: 'Shipping' },
]

function createDevProductSkuSeed(base = 'LAP-AF16') {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  return `${base}-${suffix}`
}

function withDevSecondarySkus(secondaries = [], productSku, colorCode) {
  return secondaries.map((secondary) => ({
    ...secondary,
    sku: `${productSku}-${colorCode}-${skuCode(secondary.value) || 'SV'}`,
  }))
}

function withDevVariationSkus(variations = [], productSku, defaultSecondaries = []) {
  return {
    secondary_variants: withDevSecondarySkus(defaultSecondaries, productSku, 'BLK'),
    variations: variations.map((group) => ({
      ...group,
      values: (group.values ?? []).map((value) => {
        const primaryCode = skuCode(value.value) || 'OPT'
        const secondaries = withDevSecondarySkus(
          value.secondary_variants ?? [],
          productSku,
          primaryCode,
        )

        return {
          ...value,
          sku: secondaries.length > 0 ? '' : `${productSku}-${primaryCode}`,
          secondary_variants: secondaries,
        }
      }),
    })),
  }
}

function applyCatalogContextToStepFixture(stepId, catalogContext, devProductSku = null) {
  const base = DEV_PRODUCT_STEP_FIXTURES[stepId] ?? null
  if (!base) return null

  if (stepId === 'info') {
    const sku = devProductSku ?? createDevProductSkuSeed()
    return {
      ...base,
      sku,
      ...(catalogContext ? resolveDevProductCatalogFields(catalogContext) : {}),
    }
  }

  if (stepId === 'variations' && devProductSku) {
    return {
      ...base,
      ...withDevVariationSkus(base.variations, devProductSku, base.secondary_variants),
    }
  }

  return base
}

export function getDevProductMergedFixtures(catalogContext) {
  const devProductSku = createDevProductSkuSeed()

  return DEV_PRODUCT_FILLABLE_STEPS.reduce(
    (acc, { id }) => {
      const fixture = applyCatalogContextToStepFixture(id, catalogContext, devProductSku)
      return fixture ? { ...acc, ...fixture } : acc
    },
    {},
  )
}

export function getDevProductStepFixture(stepId, catalogContext) {
  const devProductSku = stepId === 'variations' ? createDevProductSkuSeed() : null
  return applyCatalogContextToStepFixture(stepId, catalogContext, devProductSku)
}
