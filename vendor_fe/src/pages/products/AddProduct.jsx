import { useEffect, useRef, useState } from 'react'
import { Form, Formik, getIn } from 'formik'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Box,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Info,
  Layers3,
  Loader2,
  Package,
  PackageSearch,
  Plus,
  Ruler,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductStepper from '../../components/products/ProductStepper'
import ProductRichTextEditor from '../../components/products/ProductRichTextEditor'
import ProductImageUploader from '../../components/products/ProductImageUploader'
import ProductMainImageUpload from '../../components/products/ProductMainImageUpload'
import VariantImageUpload from '../../components/products/VariantImageUpload'
import DevProductFormTools from '../../components/products/DevProductFormTools'
import ProductTagInput from '../../components/products/ProductTagInput'
import SearchableSelect from '../../components/auth/SearchableSelect'
import FieldError from '../../components/auth/FieldError'
import {
  GuidanceCard,
  ProductInput,
  ProductMoneyInput,
} from '../../components/products/ProductFormControls'
import {
  findCategoryById,
  getSubcategoriesForParentId,
  toSelectOptions,
} from '../../utils/normalizeCategories'
import { findBrandById, getBrandDisplayLabel, toBrandSelectOptions } from '../../utils/normalizeBrands'
import { useApprovedBrands } from '../../hooks/useBrands'
import { useCreateBrandMutation } from '../../hooks/useBrandMutations'
import { useProductCategoryOptions } from '../../hooks/useCategories'
import { productListingSchema } from '../../utils/validationSchemas'
import { buildProductPayload, formatProductPayloadSample } from '../../utils/productPayload'
import { useCreateProductMutation, useUpdateProductMutation } from '../../hooks/useProductMutations'
import {
  convertDiscountAmountToPercent,
  convertDiscountPercentToAmount,
  formatCustomerPriceRange,
  formatMoney,
  getDiscountSummary,
  getParentProductPricing,
  getVariationCustomerPriceRange,
  resolveVariantPricing,
} from '../../utils/productPricing'
import { collectStepErrors, scrollToFirstError } from '../../utils/scrollToFirstError'
import { scrollDashboardPanelToTop } from '../../utils/scrollDashboardPanelToTop'
import notify from '../../lib/notify'
import { isLocalEnvironment } from '../../utils/environment'
import { validateProductImageLimits } from '../../utils/productImageUtils'

const productListingSteps = [
  { id: 'info',       title: 'Product Info',  caption: 'Name, category & details'  },
  { id: 'images',     title: 'Images',        caption: 'Upload product photos'   },
  { id: 'pricing',    title: 'Pricing',       caption: 'Price & inventory'       },
  // Variations are managed after product creation from the products table.
  // { id: 'variations', title: 'Variations',    caption: 'Size, color, weight'     },
  { id: 'shipping',   title: 'Shipping',      caption: 'Weight & dimensions'     },
  { id: 'review',     title: 'Review',        caption: 'Confirm & publish'       },
]

const productListingStepFields = [
  ['name', 'sku', 'description', 'category_id', 'subcategory_id', 'brand_id'],
  [],
  ['price', 'discount_price', 'discount_percent', 'quantity', 'low_stock_threshold'],
  // ['variations'],
  [],
  [],
]

const productListingInitialValues = {
  name:               '',
  sku:                '',
  description:        '',
  category_id:        '',
  subcategory_id:     '',
  brand_id:           '',
  tags:               [],
  price:              '',
  discount_mode:      'amount',
  discount_price:     '',
  discount_percent:   '',
  quantity:           '',
  low_stock_threshold:'',
  barcode:            '',
  variations:         [],
  shipping_weight:    '',
  shipping_length:    '',
  shipping_width:     '',
  shipping_height:    '',
  status:             'draft',
}

function getTouchedForFields(fields, values) {
  return fields.reduce((touched, field) => {
    if (field === 'variations') {
      return {
        ...touched,
        variations: values.variations.map((v) => ({
          attribute: true,
          values: v.values.length > 0
            ? v.values.map(() => ({
              value: true,
              variant_name: true,
              sku: true,
              price: true,
              discount_price: true,
              quantity: true,
              reserved_quantity: true,
              low_stock_threshold: true,
              barcode: true,
            }))
            : true,
        })),
      }
    }
    return { ...touched, [field]: true }
  }, {})
}

function createVariantValue(value) {
  return {
    id: `val-${Date.now()}`,
    value,
    variant_name: '',
    sku: '',
    price: '',
    discount_price: '',
    quantity: '',
    reserved_quantity: '',
    low_stock_threshold: '',
    barcode: '',
    images: [],
  }
}

function getVariantPrimaryPreview(variantValue) {
  if (variantValue?.images?.length > 0) return variantValue.images[0].preview
  return variantValue?.image_url || null
}

function hasVariationStepErrors(variationErrors) {
  if (!variationErrors) return false
  if (typeof variationErrors === 'string') return true
  if (!Array.isArray(variationErrors)) {
    return Object.values(variationErrors).some((value) => {
      if (!value) return false
      if (typeof value === 'string') return true
      if (Array.isArray(value)) return value.some(Boolean)
      return typeof value === 'object' && Object.values(value).some(Boolean)
    })
  }

  return variationErrors.some((item) => {
    if (!item) return false
    if (typeof item === 'string') return true
    return Object.values(item).some((value) => {
      if (!value) return false
      if (typeof value === 'string') return true
      if (Array.isArray(value)) return value.some(Boolean)
      return typeof value === 'object' && Object.values(value).some(Boolean)
    })
  })
}

function hasStepErrors(errors, fields) {
  return fields.some((field) => {
    if (field === 'variations') return hasVariationStepErrors(errors?.variations)
    return Boolean(getIn(errors, field))
  })
}

function getFieldError(formik, name) {
  const touched = getIn(formik.touched, name)
  const error = getIn(formik.errors, name)
  return touched && typeof error === 'string' ? error : undefined
}

function getVariationAttributeError(formik, varIndex) {
  const path = `variations.${varIndex}.attribute`
  const value = formik.values.variations[varIndex]?.attribute
  if (value?.trim()) {
    const error = getIn(formik.errors, path)
    if (error === 'Variation name is required') return undefined
  }
  return getFieldError(formik, path)
}

function getVariationValuesError(formik, varIndex) {
  const values = formik.values.variations[varIndex]?.values ?? []
  const error = getIn(formik.errors, `variations.${varIndex}.values`)
  if (typeof error !== 'string') return undefined

  if (error === 'Add at least one value for this variation' && values.length > 0) {
    return undefined
  }

  const attributeTouched = getIn(formik.touched, `variations.${varIndex}.attribute`)
  const valuesTouched = getIn(formik.touched, `variations.${varIndex}.values`)
  const valuesFieldTouched =
    valuesTouched === true
    || (Array.isArray(valuesTouched) && valuesTouched.length > 0)

  if (!attributeTouched && !valuesFieldTouched) return undefined
  return error
}

function getBrandFieldError(formik) {
  const value = formik.values.brand_id
  if (value?.trim()) {
    const error = getIn(formik.errors, 'brand_id')
    if (error === 'Brand is required') return undefined
  }
  return getFieldError(formik, 'brand_id')
}

// ─── Step 1: Product Info ────────────────────────────────────────────────────

export function InfoStep({
  formik,
  parentCategories,
  categoryTree,
  categoriesLoading,
  categoriesError,
  approvedBrands,
  brandsLoading,
  brandsError,
  createBrandMutation,
}) {
  const categoryOptions = toSelectOptions(parentCategories)
  const brandOptions = toBrandSelectOptions(approvedBrands)
  const selectedCategory =
    findCategoryById(categoryTree, formik.values.category_id)
    ?? parentCategories.find((category) => category.id === formik.values.category_id)
  const subcategories = getSubcategoriesForParentId(categoryTree, formik.values.category_id)
  const subcategoryOptions = toSelectOptions(subcategories)

  const handleCustomBrandSubmit = async (brandName) => {
    const brand = await createBrandMutation.mutateAsync({ brand_name: brandName })
    await formik.setFieldValue('brand_id', brand.id, false)
    formik.setFieldTouched('brand_id', true, false)
    formik.setFieldError('brand_id', undefined)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 md:items-start">
        <div className="md:col-span-3">
          <ProductInput
            id="name"
            name="name"
            label="Product name"
            hint="Use the marketplace-facing name customers search for."
            placeholder="e.g. Wireless Earbuds Pro 2nd Gen"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'name')}
          />
        </div>
        <ProductInput
          id="sku"
          name="sku"
          label="SKU"
          hint="Unique identifier. Letters, numbers, hyphens only."
          reserveHintSpace
          placeholder="AUD-WEP-001"
          value={formik.values.sku}
          onChange={(e) => formik.setFieldValue('sku', e.target.value.toUpperCase())}
          onBlur={formik.handleBlur}
          error={getFieldError(formik, 'sku')}
        />
        <ProductTagInput
          tags={formik.values.tags}
          onChange={(tags) => formik.setFieldValue('tags', tags)}
          label="Tags"
          hint="Press Enter or comma to add. Max 15 tags."
          reserveHintSpace
        />
        <SearchableSelect
          id="brand_id"
          name="brand_id"
          label="Brand"
          icon={Store}
          hint="Search for a brand or add a new one if it is not listed."
          reserveHintSpace
          placeholder={brandsLoading ? 'Loading brands…' : 'Search brands…'}
          options={brandOptions}
          value={formik.values.brand_id}
          disabled={brandsLoading || createBrandMutation.isPending}
          allowCustom
          customPlaceholder="Enter your brand name…"
          customEntryLabel="Add a custom brand…"
          customSubmitLabel="Save brand"
          onCustomSubmit={handleCustomBrandSubmit}
          isCustomSubmitting={createBrandMutation.isPending}
          onChange={(e) => {
            formik.setFieldValue('brand_id', e.target.value, true)
            formik.setFieldTouched('brand_id', true, false)
            if (e.target.value.trim()) {
              formik.setFieldError('brand_id', undefined)
            }
          }}
          onCustomModeStart={() => {
            formik.setFieldTouched('brand_id', false, false)
            formik.setFieldError('brand_id', undefined)
          }}
          onBlur={formik.handleBlur}
          error={getBrandFieldError(formik)}
        />
        {brandsError && (
          <p className="mt-1 text-xs text-red-600">
            Could not load brands from the server. Refresh the page and try again.
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Classification</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">Category</h3>
          <p className="mt-1 text-xs text-slate-500">
            Accurate classification helps customers find your product faster.
          </p>
        </div>
        {categoriesError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Could not load categories from the server. Refresh the page and try again.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="category_id"
            name="category_id"
            label="Category"
            icon={Layers3}
            placeholder={categoriesLoading ? 'Loading categories…' : 'Search categories…'}
            options={categoryOptions}
            value={formik.values.category_id}
            disabled={categoriesLoading || categoriesError}
            onChange={(e) => {
              formik.setFieldValue('category_id', e.target.value, true)
              formik.setFieldValue('subcategory_id', '', false)
              formik.setFieldTouched('category_id', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'category_id')}
          />
          <SearchableSelect
            id="subcategory_id"
            name="subcategory_id"
            label="Sub category"
            icon={PackageSearch}
            placeholder={
              categoriesLoading
                ? 'Loading sub categories…'
                : selectedCategory
                  ? 'Search sub categories…'
                  : 'Choose a category first'
            }
            options={subcategoryOptions}
            value={formik.values.subcategory_id}
            disabled={categoriesLoading || categoriesError || !formik.values.category_id}
            onChange={(e) => {
              formik.setFieldValue('subcategory_id', e.target.value, true)
              formik.setFieldTouched('subcategory_id', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'subcategory_id')}
          />
        </div>
        {selectedCategory && (
          <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
            <p className="text-xs font-bold text-cyan-900">{selectedCategory.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-cyan-800/80">
              {subcategories.length > 0
                ? `${subcategories.length} sub categor${subcategories.length === 1 ? 'y' : 'ies'} available under this category.`
                : 'Choose the sub category that best matches this item.'}
            </p>
          </div>
        )}
      </section>

      <ProductRichTextEditor
        id="description"
        name="description"
        label="Product description"
        hint="Explain what the buyer gets, what problem it solves, and what is included."
        value={formik.values.description}
        onChange={(html) => formik.setFieldValue('description', html)}
        onBlur={formik.handleBlur}
        error={getFieldError(formik, 'description')}
      />

    </div>
  )
}

// ─── Step 2: Images ──────────────────────────────────────────────────────────

export function ImagesStep({ mainImage, onMainImageChange, mainImageError, subImages, onSubImagesChange }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Main photo</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">Primary product image</h3>
          <p className="mt-1 text-xs text-slate-500">
            This is the hero image customers see first in search results and on your product page.
          </p>
        </div>
        <ProductMainImageUpload
          image={mainImage}
          onChange={onMainImageChange}
          error={mainImageError}
          subImages={subImages}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Gallery</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">Additional product images</h3>
          <p className="mt-1 text-xs text-slate-500">
            Optional extra photos — different angles, packaging, or close-ups. Up to 5 images total and 5MB combined across all photos.
          </p>
        </div>
        <ProductImageUploader
          images={subImages}
          onChange={onSubImagesChange}
          mainImage={mainImage}
        />
      </section>
    </div>
  )
}

// ─── Step 3: Pricing & Inventory ─────────────────────────────────────────────

export function PricingStep({ formik }) {
  const discountMode = formik.values.discount_mode ?? 'amount'
  const { salesPrice, savings, percentOff, hasDiscount } = getDiscountSummary(
    formik.values.price,
    discountMode,
    formik.values.discount_price,
    formik.values.discount_percent,
  )

  const handleDiscountModeChange = (mode) => {
    if (mode === discountMode) return

    const price = formik.values.price
    if (mode === 'percent') {
      const percent = convertDiscountAmountToPercent(price, formik.values.discount_price)
      if (percent) formik.setFieldValue('discount_percent', percent, false)
    } else {
      const amount = convertDiscountPercentToAmount(price, formik.values.discount_percent)
      if (amount) formik.setFieldValue('discount_price', amount, false)
    }

    formik.setFieldValue('discount_mode', mode)
    formik.setFieldTouched('discount_price', false, false)
    formik.setFieldTouched('discount_percent', false, false)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Pricing</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">Set your prices</h3>
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-slate-800">Discount · Optional</span>
            <div className="inline-flex w-fit rounded-lg bg-slate-100 p-0.5 ring-1 ring-slate-200">
              {[
                { value: 'amount', label: 'Sale price' },
                { value: 'percent', label: '% Off' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleDiscountModeChange(value)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    discountMode === value
                      ? 'bg-white text-brand shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <ProductMoneyInput
              id="price"
              name="price"
              label="Regular price (GH₵)"
              hint="The standard selling price. Up to 2 decimal places."
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'price')}
            />

            {discountMode === 'amount' ? (
              <ProductMoneyInput
                id="discount_price"
                name="discount_price"
                label="Sale price (GH₵)"
                hint="Enter the discounted selling price. Up to 2 decimal places."
                value={formik.values.discount_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={getFieldError(formik, 'discount_price')}
              />
            ) : (
              <ProductInput
                id="discount_percent"
                name="discount_percent"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                inputMode="decimal"
                label="Discount percentage (%)"
                hint="Enter a value between 0.01 and 99.99."
                placeholder="e.g. 20"
                value={formik.values.discount_percent}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={getFieldError(formik, 'discount_percent')}
              />
            )}
          </div>

          {hasDiscount && salesPrice != null && (
            <div className="mt-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                <BadgePercent className="size-3.5" />
                {percentOff % 1 === 0 ? percentOff : percentOff.toFixed(2)}% off · GH₵ {formatMoney(savings)} savings
              </div>
              <p className="text-xs text-slate-500">
                Computed sale price:{' '}
                <span className="font-bold text-slate-800">GH₵ {formatMoney(salesPrice)}</span>
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Inventory</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">Stock management</h3>
          </div>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProductInput
              id="quantity"
              name="quantity"
              type="number"
              label="Stock quantity"
              reserveHintSpace
              hint="Must be at least the low stock threshold when one is set."
              placeholder="0"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'quantity')}
            />
            <ProductInput
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              label="Low stock threshold · Optional"
              reserveHintSpace
              hint="Optional. Cannot exceed stock quantity."
              placeholder="10"
              value={formik.values.low_stock_threshold}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'low_stock_threshold')}
            />
            <ProductInput
              id="barcode"
              name="barcode"
              label="Barcode · Optional"
              reserveHintSpace
              hint="EAN, UPC, or other barcode."
              placeholder="123456789012"
              value={formik.values.barcode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'barcode')}
            />
          </div>
        </section>
      </div>

      <GuidanceCard icon={Info} title="Pricing tips">
        <p>Set a competitive regular price to attract customers.</p>
        <p>Choose sale price or percentage off — we compute the final sale price either way.</p>
        <p>The low stock threshold triggers an alert so you know when to restock before items sell out.</p>
      </GuidanceCard>
    </div>
  )
}

// ─── Step 4: Variations ──────────────────────────────────────────────────────

const VARIATION_PRESETS = ['Size', 'Color', 'Weight']

function ParentPricingBanner({ values }) {
  const parent = getParentProductPricing(values)

  if (!parent.regularPrice) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
        <p className="text-sm font-semibold text-amber-900">Set base pricing first</p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
          Go back to the Pricing step to set a regular price. Variants will inherit that pricing by default.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cyan-900">Base product pricing</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-slate-700">
          Regular: <strong className="text-slate-900">GH₵ {formatMoney(parent.regularPrice)}</strong>
        </span>
        {parent.hasDiscount ? (
          <span className="text-slate-700">
            Sale: <strong className="text-emerald-700">GH₵ {formatMoney(parent.salePrice)}</strong>
          </span>
        ) : (
          <span className="text-xs text-slate-500">No discount applied</span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-cyan-900/75">
        Variants without a price override inherit this pricing. Overrides keep the same discount rate as the base product.
      </p>
    </div>
  )
}

export function VariantPricingSummary({ variantValue, productValues }) {
  const pricing = resolveVariantPricing(variantValue, productValues)
  const note = pricing.hasSaleOverride
    ? 'Custom sale price'
    : pricing.isInherited
      ? 'Inherits base list price'
      : 'Custom list price'
  const saleNote = !pricing.hasSaleOverride && pricing.isSaleInherited && pricing.hasDiscount
    ? ' · sale from base discount'
    : ''

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Customer pays
        </span>
        {pricing.hasDiscount ? (
          <>
            <span className="text-sm font-bold text-emerald-700">
              GH₵ {formatMoney(pricing.salePrice)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              GH₵ {formatMoney(pricing.listPrice)}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-slate-900">
            GH₵ {formatMoney(pricing.listPrice)}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 sm:text-right">
        {note}{saleNote}
      </p>
    </div>
  )
}

function scrollToElement(id) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

function isVariationPreset(attribute) {
  return VARIATION_PRESETS.includes(attribute)
}

function VariationCard({ formik, varIndex, onRemove }) {
  const [newValueInput, setNewValueInput] = useState('')
  const [expandedValues, setExpandedValues] = useState(new Set())
  const variation = formik.values.variations[varIndex]

  const toggleExpand = (i) => {
    setExpandedValues((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const addValue = () => {
    const val = newValueInput.trim()
    if (!val) return
    const newIndex = variation.values.length
    formik.setFieldValue(`variations.${varIndex}.values`, [
      ...variation.values,
      createVariantValue(val),
    ])
    formik.setFieldError(`variations.${varIndex}.values`, undefined)
    setNewValueInput('')
    setExpandedValues(new Set([newIndex]))
    scrollToElement(`variant-value-form-${varIndex}-${newIndex}`)
  }

  const removeValue = (i) => {
    formik.setFieldValue(
      `variations.${varIndex}.values`,
      variation.values.filter((_, idx) => idx !== i),
    )
  }

  const attrError = getVariationAttributeError(formik, varIndex)
  const valuesArrayError = getVariationValuesError(formik, varIndex)

  const placeholder =
    variation.attribute === 'Color'
      ? 'e.g. Red, Blue, Green'
      : variation.attribute === 'Size'
        ? 'e.g. S, M, L, XL'
        : variation.attribute === 'Weight'
          ? 'e.g. 250g, 500g, 1kg'
          : 'Add a value…'

  return (
    <section id={`variation-card-${variation.id}`} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div data-field={`variations.${varIndex}.attribute`} className="space-y-2">
            <label
              htmlFor={`variation-attribute-${varIndex}`}
              className="block text-xs font-semibold text-slate-700"
            >
              Variation type
            </label>
            <input
              id={`variation-attribute-${varIndex}`}
              type="text"
              placeholder="Type your own (e.g. Material, Capacity, Style)"
              value={variation.attribute}
              onChange={(e) => {
                const nextValue = e.target.value
                formik.setFieldValue(`variations.${varIndex}.attribute`, nextValue)
                if (nextValue.trim()) {
                  formik.setFieldError(`variations.${varIndex}.attribute`, undefined)
                }
              }}
              onBlur={() =>
                formik.setFieldTouched(`variations.${varIndex}.attribute`, true)
              }
              className={`w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
                attrError ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
              }`}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Quick suggestions:</span>
              {VARIATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    formik.setFieldValue(`variations.${varIndex}.attribute`, preset)
                    formik.setFieldError(`variations.${varIndex}.attribute`, undefined)
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    variation.attribute === preset
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
              {variation.attribute && !isVariationPreset(variation.attribute) && (
                <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100">
                  Custom: {variation.attribute}
                </span>
              )}
            </div>
          </div>
          {attrError && <FieldError message={attrError} />}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {variation.values.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {variation.values.map((val, i) => {
            const pricing = resolveVariantPricing(val, formik.values)

            return (
            <div key={val.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div
                className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-slate-50/80"
                onClick={() => toggleExpand(i)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {getVariantPrimaryPreview(val) ? (
                    <img src={getVariantPrimaryPreview(val)} alt="" className="size-full object-cover" />
                  ) : (
                    val.value.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{val.value}</p>
                  {(val.sku || val.quantity || pricing.customerPrice > 0) && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {[
                        val.sku,
                        pricing.customerPrice > 0 && (
                          pricing.hasDiscount
                            ? `GH₵ ${formatMoney(pricing.salePrice)}`
                            : `GH₵ ${formatMoney(pricing.listPrice)}`
                        ),
                        val.quantity && `Qty ${val.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {expandedValues.has(i) ? (
                    <ChevronDown className="size-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="size-4 text-slate-400" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeValue(i) }}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {expandedValues.has(i) && (
                <div
                  id={`variant-value-form-${varIndex}-${i}`}
                  className="scroll-mt-4 border-t border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.sku`}
                      name={`variations.${varIndex}.values.${i}.sku`}
                      label="Variant SKU"
                      reserveHintSpace
                      placeholder="AUD-001-BLK"
                      value={val.sku}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `variations.${varIndex}.values.${i}.sku`,
                          e.target.value.toUpperCase(),
                        )
                      }
                      onBlur={formik.handleBlur}
                    />
                    <ProductMoneyInput
                      id={`variations.${varIndex}.values.${i}.price`}
                      name={`variations.${varIndex}.values.${i}.price`}
                      label="List price (GH₵) · Optional"
                      hint="Leave empty to inherit base product price."
                      reserveHintSpace
                      placeholder={formatMoney(pricing.parent.regularPrice)}
                      value={val.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `variations.${varIndex}.values.${i}.price`)}
                    />
                    <ProductMoneyInput
                      id={`variations.${varIndex}.values.${i}.discount_price`}
                      name={`variations.${varIndex}.values.${i}.discount_price`}
                      label="Sale price (GH₵) · Optional"
                      hint="Leave empty to inherit base sale price."
                      reserveHintSpace
                      placeholder={
                        pricing.parent.salePrice != null
                          ? formatMoney(pricing.parent.salePrice)
                          : 'No base sale price'
                      }
                      value={val.discount_price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `variations.${varIndex}.values.${i}.discount_price`)}
                    />
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.quantity`}
                      name={`variations.${varIndex}.values.${i}.quantity`}
                      type="number"
                      label="Stock quantity"
                      hint={
                        formik.values.quantity !== '' && formik.values.quantity != null
                          ? `Cannot exceed main product stock (${formik.values.quantity}).`
                          : 'Set main stock on the Pricing step first.'
                      }
                      reserveHintSpace
                      placeholder="0"
                      value={val.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `variations.${varIndex}.values.${i}.quantity`)}
                    />
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.variant_name`}
                      name={`variations.${varIndex}.values.${i}.variant_name`}
                      label="Variant display name · Optional"
                      hint={`Defaults to "${val.value}" if empty.`}
                      reserveHintSpace
                      placeholder={val.value}
                      value={val.variant_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.barcode`}
                      name={`variations.${varIndex}.values.${i}.barcode`}
                      label="Barcode · Optional"
                      reserveHintSpace
                      placeholder="1234567890123"
                      value={val.barcode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {/* Reserved quantity and low stock alert hidden for variant add/edit for now. */}
                    {/* <ProductInput
                      id={`variations.${varIndex}.values.${i}.low_stock_threshold`}
                      name={`variations.${varIndex}.values.${i}.low_stock_threshold`}
                      type="number"
                      label="Low stock alert · Optional"
                      reserveHintSpace
                      placeholder="10"
                      value={val.low_stock_threshold}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.reserved_quantity`}
                      name={`variations.${varIndex}.values.${i}.reserved_quantity`}
                      type="number"
                      label="Reserved quantity · Optional"
                      reserveHintSpace
                      placeholder="0"
                      value={val.reserved_quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    /> */}
                  </div>
                  <div className="mt-4 space-y-3">
                    <VariantPricingSummary variantValue={val} productValues={formik.values} />
                    <VariantImageUpload
                      images={val.images ?? []}
                      onChange={(nextImages) =>
                        formik.setFieldValue(`variations.${varIndex}.values.${i}.images`, nextImages)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}

      {valuesArrayError && <FieldError message={valuesArrayError} />}

      <div className="flex gap-2">
        <input
          type="text"
          value={newValueInput}
          onChange={(e) => setNewValueInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue() } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
        <button
          type="button"
          onClick={addValue}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
    </section>
  )
}

export function VariationsStep({ formik }) {
  const priceRange = getVariationCustomerPriceRange(formik.values.variations, formik.values)
  const rangeLabel = formatCustomerPriceRange(priceRange)

  const addVariation = () => {
    const newId = `var-${Date.now()}`
    formik.setFieldValue('variations', [
      ...formik.values.variations,
      { id: newId, attribute: '', values: [] },
    ])
    scrollToElement(`variation-card-${newId}`)
  }

  const removeVariation = (index) => {
    formik.setFieldValue(
      'variations',
      formik.values.variations.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Variants</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Product variations</h3>
          </div>
          <button
            type="button"
            onClick={addVariation}
            className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-hover sm:w-auto"
          >
            <Plus className="size-4" /> Add variation
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Add variation types like Size, Color, or your own (Material, Capacity, etc.). Each option
          can set its own list price, sale price, stock, and photos.
        </p>
        {rangeLabel && formik.values.variations.some((v) => v.values.length > 0) && (
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            Customer price range:{' '}
            <span className="whitespace-nowrap text-brand">{rangeLabel}</span>
          </p>
        )}
        {typeof formik.errors.variations === 'string' && formik.touched.variations && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {formik.errors.variations}
          </p>
        )}
      </div>

      {formik.values.variations.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
          <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
            <Box className="size-7" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold text-slate-700">No variations added</p>
          <p className="mt-1 text-xs text-slate-500">
            Skip this step if your product has no variants, or click{' '}
            <strong>Add variation</strong> to create size, color, or other options.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ParentPricingBanner values={formik.values} />
          {formik.values.variations.map((variation, varIndex) => (
            <VariationCard
              key={variation.id}
              formik={formik}
              varIndex={varIndex}
              onRemove={() => removeVariation(varIndex)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 5: Shipping ─────────────────────────────────────────────────────────

export function ShippingStep({ formik }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Shipping</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Weight & dimensions</h3>
          <p className="mt-1 text-sm text-slate-500">
            All fields are optional. Accurate values improve delivery cost calculations for customers.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProductInput
            id="shipping_weight"
            name="shipping_weight"
            type="number"
            label="Weight (kg) · Optional"
            hint="Product weight in kilograms."
            placeholder="0.00"
            value={formik.values.shipping_weight}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'shipping_weight')}
          />
          <ProductInput
            id="shipping_length"
            name="shipping_length"
            type="number"
            label="Length (cm) · Optional"
            hint="Package length in centimetres."
            placeholder="0.00"
            value={formik.values.shipping_length}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'shipping_length')}
          />
          <ProductInput
            id="shipping_width"
            name="shipping_width"
            type="number"
            label="Width (cm) · Optional"
            hint="Package width in centimetres."
            placeholder="0.00"
            value={formik.values.shipping_width}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'shipping_width')}
          />
          <ProductInput
            id="shipping_height"
            name="shipping_height"
            type="number"
            label="Height (cm) · Optional"
            hint="Package height in centimetres."
            placeholder="0.00"
            value={formik.values.shipping_height}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'shipping_height')}
          />
        </div>
      </section>
      <GuidanceCard icon={Ruler} title="Why fill this in?">
        <p>Weight and dimensions help calculate accurate delivery costs shown to customers at checkout.</p>
        <p>Even approximate values improve shipping rate accuracy.</p>
      </GuidanceCard>
    </div>
  )
}

// ─── Step 6: Review ───────────────────────────────────────────────────────────

export function ReviewStep({
  formik,
  mainImage,
  subImages,
  parentCategories,
  categoryTree,
  approvedBrands,
  includeVariations = true,
}) {
  const selectedCategory =
    findCategoryById(categoryTree, formik.values.category_id)
    ?? parentCategories.find((category) => category.id === formik.values.category_id)
  const selectedBrandLabel = getBrandDisplayLabel(formik.values.brand_id, approvedBrands)
  const subcategories = getSubcategoriesForParentId(categoryTree, formik.values.category_id)
  const selectedSubcategory = findCategoryById(subcategories, formik.values.subcategory_id)

  const price = Number(formik.values.price) || 0
  const { salesPrice, percentOff, hasDiscount } = getDiscountSummary(
    formik.values.price,
    formik.values.discount_mode ?? 'amount',
    formik.values.discount_price,
    formik.values.discount_percent,
  )

  const summaryRows = [
    {
      title: 'Product info',
      icon: Package,
      items: [
        ['Name', formik.values.name],
        ['SKU', formik.values.sku],
        ['Category', selectedCategory?.name],
        ['Sub category', selectedSubcategory?.name],
        ['Brand', selectedBrandLabel],
        ['Tags', formik.values.tags.length ? formik.values.tags.join(', ') : null],
      ],
    },
    {
      title: 'Pricing & inventory',
      icon: BadgePercent,
      items: [
        ['Regular price', price ? `GH₵ ${formatMoney(price)}` : null],
        ['Sale price', hasDiscount && salesPrice != null ? `GH₵ ${formatMoney(salesPrice)}` : null],
        ['Discount', hasDiscount ? `${percentOff % 1 === 0 ? percentOff : percentOff.toFixed(1)}% off` : null],
        ['Stock quantity', formik.values.quantity || null],
        ['Low stock alert', formik.values.low_stock_threshold || null],
        ['Barcode', formik.values.barcode || null],
      ],
    },
    {
      title: 'Shipping',
      icon: Ruler,
      items: [
        ['Weight', formik.values.shipping_weight ? `${formik.values.shipping_weight} kg` : null],
        ['Length', formik.values.shipping_length ? `${formik.values.shipping_length} cm` : null],
        ['Width', formik.values.shipping_width ? `${formik.values.shipping_width} cm` : null],
        ['Height', formik.values.shipping_height ? `${formik.values.shipping_height} cm` : null],
      ],
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Summary</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Review your listing</h3>
        <p className="mt-1 text-sm text-slate-500">
          Check everything before publishing. You can go back to edit any section.
        </p>
      </div>

      {(mainImage || subImages.length > 0) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <ImagePlus className="size-4 text-cyan-700" />
            Product images
          </h3>
          <div className="space-y-4">
            {mainImage && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Main photo</p>
                <div className="relative inline-block">
                  <img
                    src={mainImage.preview}
                    alt="Main product"
                    className="size-24 rounded-xl object-cover ring-1 ring-slate-200 sm:size-28"
                  />
                  <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-px text-[9px] font-bold text-white">
                    Main
                  </span>
                </div>
              </div>
            )}
            {subImages.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Gallery · {subImages.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subImages.slice(0, 4).map((img, index) => (
                    <img
                      key={img.id}
                      src={img.preview}
                      alt={`Gallery image ${index + 1}`}
                      className="size-16 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                  ))}
                  {subImages.length > 4 && (
                    <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      +{subImages.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryRows.map(({ title, icon: Icon, items }) => (
          <section key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Icon className="size-4 text-cyan-700" /> {title}
            </h3>
            <dl className="space-y-2">
              {items.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-xs font-semibold text-slate-400">{label}</dt>
                  <dd className="text-right text-xs font-bold text-slate-900">{value ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {includeVariations && formik.values.variations.some((variation) => variation.values.length > 0) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Box className="size-4 text-cyan-700" />
            Variants
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {formik.values.variations.reduce((count, variation) => count + variation.values.length, 0)}
            </span>
          </h3>
          <div className="space-y-3">
            {formik.values.variations.map((variation) => (
              <div key={variation.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {variation.attribute}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {variation.values.map((val) => {
                    const pricing = resolveVariantPricing(val, formik.values)
                    const label = val.variant_name?.trim() || val.value
                    return (
                      <span
                        key={val.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-2.5 pr-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {getVariantPrimaryPreview(val) && (
                          <img src={getVariantPrimaryPreview(val)} alt="" className="size-5 rounded-full object-cover" />
                        )}
                        <span>{label}</span>
                        {pricing.customerPrice > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700">
                            GH₵ {formatMoney(pricing.customerPrice)}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function buildProductMutationContext(values, { parentCategories, categoryTree, approvedBrands }) {
  const selectedCategory =
    findCategoryById(categoryTree, values.category_id)
    ?? parentCategories.find((category) => category.id === values.category_id)
  const brand = findBrandById(approvedBrands, values.brand_id)
  const { salesPrice } = getDiscountSummary(
    values.price,
    values.discount_mode ?? 'amount',
    values.discount_price,
    values.discount_percent,
  )

  return {
    sku: values.sku,
    quantity: Number(values.quantity),
    price: Number(values.price),
    salePrice: salesPrice,
    categoryName: selectedCategory?.name ?? '',
    categorySlug: selectedCategory?.slug ?? '',
    brandName: brand?.name ?? getBrandDisplayLabel(values.brand_id, approvedBrands) ?? '',
    brandSlug: brand?.slug ?? '',
  }
}

export function ProductListingForm({
  mode = 'create',
  productId = null,
  initialFormValues = null,
  initialMainImage = null,
  initialSubImages = null,
}) {
  const isEditMode = mode === 'edit'
  const [activeStep, setActiveStep] = useState(0)
  const [mainImage, setMainImage] = useState(initialMainImage ?? null)
  const [subImages, setSubImages] = useState(initialSubImages ?? [])
  const [mainImageError, setMainImageError] = useState('')
  const stepDirectionRef = useRef('forward')
  const isInitialStepMount = useRef(true)
  const navigate = useNavigate()
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()
  const createBrandMutation = useCreateBrandMutation()
  const {
    data: approvedBrands = [],
    isLoading: brandsLoading,
    isError: brandsError,
  } = useApprovedBrands()
  const {
    parentCategories,
    categoryTree,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategoryOptions()

  useEffect(() => {
    if (isInitialStepMount.current) {
      isInitialStepMount.current = false
      return
    }
    if (stepDirectionRef.current === 'forward') {
      scrollDashboardPanelToTop()
    }
  }, [activeStep])

  const goToPreviousStep = () => {
    stepDirectionRef.current = 'back'
    setActiveStep((step) => Math.max(step - 1, 0))
  }

  const navigateToStep = (stepIndex) => {
    stepDirectionRef.current = stepIndex < activeStep ? 'back' : 'forward'
    setActiveStep(stepIndex)
  }

  const validateStepBeforeLeave = async (formik, stepIndex) => {
    if (stepIndex === 1) {
      if (!mainImage) {
        setMainImageError('Add a main product image to continue')
        requestAnimationFrame(() => {
          scrollToFirstError({ main_product_image: 'Add a main product image to continue' })
        })
        return false
      }

      const imageLimits = validateProductImageLimits(mainImage, subImages)
      if (!imageLimits.valid) {
        setMainImageError(imageLimits.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ main_product_image: imageLimits.message })
        })
        return false
      }

      setMainImageError('')
      return true
    }

    const errors = await formik.validateForm()
    const fields = productListingStepFields[stepIndex]

    if (fields.length > 0) {
      formik.setTouched(
        { ...formik.touched, ...getTouchedForFields(fields, formik.values) },
        true,
      )
      if (hasStepErrors(errors, fields)) {
        requestAnimationFrame(() => {
          scrollToFirstError(collectStepErrors(errors, fields))
        })
        return false
      }
    }

    return true
  }

  const handleNext = async (formik) => {
    const valid = await validateStepBeforeLeave(formik, activeStep)
    if (!valid) return
    navigateToStep(Math.min(activeStep + 1, productListingSteps.length - 1))
  }

  const handleStepClick = async (formik, stepIndex) => {
    if (stepIndex === activeStep) return

    if (stepIndex < activeStep) {
      navigateToStep(stepIndex)
      return
    }

    for (let step = activeStep; step < stepIndex; step += 1) {
      const valid = await validateStepBeforeLeave(formik, step)
      if (!valid) {
        if (step !== activeStep) navigateToStep(step)
        return
      }
    }

    navigateToStep(stepIndex)
  }

  return (
    <DashboardLayout pageTitle={isEditMode ? 'Edit Product' : 'Add Product'}>
      <div className="page-enter space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
          <Link
            to="/products"
            className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              {isEditMode ? 'Edit listing' : 'New listing'}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {isEditMode ? 'Edit product' : 'Add a product'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {isEditMode
                ? 'Update photos, pricing, and product details. Changes are saved to your live catalogue.'
                : 'Create a complete listing with clear photos and accurate pricing so customers find and trust your product.'}
            </p>
          </div>
        </section>

        <Formik
          initialValues={initialFormValues ?? productListingInitialValues}
          enableReinitialize={isEditMode}
          validationSchema={productListingSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, actions) => {
            try {
              const formValues = isEditMode
                ? { ...values, status: values.status || 'active' }
                : { ...values, status: 'active' }
              const payload = buildProductPayload(
                formValues,
                mainImage,
                subImages,
                {
                  mode: isEditMode ? 'edit' : 'create',
                  includeVariations: false,
                },
              )

              if (import.meta.env.DEV) {
                console.log(
                  `[${isEditMode ? 'update' : 'create'} product] FormData payload:`,
                  formatProductPayloadSample(payload),
                )
              }

              const context = buildProductMutationContext(formValues, {
                parentCategories,
                categoryTree,
                approvedBrands,
              })

              if (isEditMode) {
                await updateProductMutation.mutateAsync({
                  productId,
                  formData: payload,
                  context,
                })
              } else {
                await createProductMutation.mutateAsync({
                  formData: payload,
                  context,
                })
              }
              navigate('/products')
            } catch (error) {
              if (!error?.response) {
                notify.error(error?.message || 'Failed to prepare product images.')
              }
            } finally {
              actions.setSubmitting(false)
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-5">
              {isLocalEnvironment() && (
                <DevProductFormTools
                  activeStep={activeStep}
                  stepTitle={productListingSteps[activeStep].title}
                  onFillStep={(fixture) => {
                    formik.setValues({ ...formik.values, ...fixture })
                    formik.setErrors({})
                  }}
                  onFillAll={(fixture) => {
                    formik.setValues({ ...formik.values, ...fixture })
                    formik.setErrors({})
                  }}
                />
              )}

              <ProductStepper
                steps={productListingSteps}
                activeStep={activeStep}
                onStepClick={(stepIndex) => handleStepClick(formik, stepIndex)}
              />

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
                {activeStep === 0 && (
                  <InfoStep
                    formik={formik}
                    parentCategories={parentCategories}
                    categoryTree={categoryTree}
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                    approvedBrands={approvedBrands}
                    brandsLoading={brandsLoading}
                    brandsError={brandsError}
                    createBrandMutation={createBrandMutation}
                  />
                )}
                {activeStep === 1 && (
                  <ImagesStep
                    mainImage={mainImage}
                    onMainImageChange={(image) => {
                      setMainImage(image)
                      if (image) setMainImageError('')
                    }}
                    mainImageError={mainImageError}
                    subImages={subImages}
                    onSubImagesChange={setSubImages}
                  />
                )}
                {activeStep === 2 && <PricingStep formik={formik} />}
                {/* Variations are added later from Products > Manage variations. */}
                {/* {activeStep === 3 && <VariationsStep formik={formik} />} */}
                {activeStep === 3 && <ShippingStep formik={formik} />}
                {activeStep === 4 && (
                  <ReviewStep
                    formik={formik}
                    mainImage={mainImage}
                    subImages={subImages}
                    parentCategories={parentCategories}
                    categoryTree={categoryTree}
                    approvedBrands={approvedBrands}
                    includeVariations={false}
                  />
                )}
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={activeStep === 0}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>

                {activeStep < productListingSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleNext(formik)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
                  >
                    Continue <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/products"
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={
                        formik.isSubmitting
                        || createProductMutation.isPending
                        || updateProductMutation.isPending
                      }
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formik.isSubmitting || createProductMutation.isPending || updateProductMutation.isPending ? (
                        <><Loader2 className="size-4 animate-spin" /> {isEditMode ? 'Saving…' : 'Publishing…'}</>
                      ) : (
                        <>{isEditMode ? 'Save changes' : 'Publish product'} <ArrowRight className="size-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </DashboardLayout>
  )
}

export default function AddProduct() {
    return <ProductListingForm mode="create" />
}
