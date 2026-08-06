import { getSubcategoriesForParentId } from './normalizeCategories'
import { isGenericBrand } from './normalizeBrands'

const DEV_DESCRIPTION =
  '<p>Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX4 water resistance. Includes charging case and USB-C cable.</p>'

const PREFERRED_PARENT_CATEGORY_PATTERN = /electronic|audio|phone|computer|accessory/i
const PREFERRED_BRAND_PATTERN = /audio|sony|samsung|apple|jbl|anker|bose|beats/i

function pickDevBrandId(approvedBrands = []) {
  const selectable = approvedBrands.filter((brand) => !isGenericBrand(brand))
  if (!selectable.length) return ''
  const preferred = selectable.find((brand) => PREFERRED_BRAND_PATTERN.test(brand.name))
  return (preferred ?? selectable[0])?.id ?? ''
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
  const subcategory = subcategories[0]

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
    images: [],
    ...overrides,
  }
}

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
    discount_mode: 'amount',
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
          createDevVariantValue('Black', {
            sku: 'AUD-WEP-001-BLK',
            quantity: '25',
            reserved_quantity: '2',
            minimum_threshold: '5',
            description: 'Matte black finish with USB-C charging case.',
          }),
          createDevVariantValue('Blue', {
            sku: 'AUD-WEP-001-BLU',
            quantity: '15',
            reserved_quantity: '',
            minimum_threshold: '',
          }),
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

function createDevProductSkuSeed(base = 'AUD-WEP') {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  return `${base}-${suffix}`
}

function withDevVariationSkus(variations = [], productSku) {
  return variations.map((group) => ({
    ...group,
    values: (group.values ?? []).map((value, index) => ({
      ...value,
      sku: `${productSku}-${index === 0 ? 'BLK' : 'BLU'}`,
    })),
  }))
}

function applyCatalogContextToStepFixture(stepIndex, catalogContext, devProductSku = null) {
  const base = DEV_PRODUCT_STEP_FIXTURES[stepIndex] ?? null
  if (!base) return null

  if (stepIndex === 0) {
    const sku = devProductSku ?? createDevProductSkuSeed()
    return {
      ...base,
      sku,
      ...(catalogContext ? resolveDevProductCatalogFields(catalogContext) : {}),
    }
  }

  if (stepIndex === 3 && devProductSku) {
    return {
      ...base,
      variations: withDevVariationSkus(base.variations, devProductSku),
    }
  }

  return base
}

export function getDevProductMergedFixtures(catalogContext) {
  const devProductSku = createDevProductSkuSeed()

  return DEV_PRODUCT_FILLABLE_STEPS.reduce(
    (acc, { index }) => {
      const fixture = applyCatalogContextToStepFixture(index, catalogContext, devProductSku)
      return fixture ? { ...acc, ...fixture } : acc
    },
    {},
  )
}

export function getDevProductStepFixture(stepIndex, catalogContext) {
  const devProductSku = stepIndex === 3 ? createDevProductSkuSeed() : null
  return applyCatalogContextToStepFixture(stepIndex, catalogContext, devProductSku)
}
