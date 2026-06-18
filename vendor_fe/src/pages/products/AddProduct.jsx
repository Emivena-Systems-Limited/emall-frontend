import { useEffect, useRef, useState } from 'react'
import { FieldArray, Form, Formik, getIn } from 'formik'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Box,
  CheckCircle2,
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
  Save,
  Sparkles,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductStepper from '../../components/products/ProductStepper'
import ProductRichTextEditor from '../../components/products/ProductRichTextEditor'
import ProductImageUploader from '../../components/products/ProductImageUploader'
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
  METADATA_TEMPLATES,
  MOCK_BRANDS,
} from '../../constants/productData'
import { useProductCategoryOptions } from '../../hooks/useCategories'
import {
  findCategoryBySlug,
  getSubcategoriesForParent,
  inferMetadataTemplateType,
  toSelectOptions,
} from '../../utils/normalizeCategories'
import { productListingSchema } from '../../utils/validationSchemas'
import {
  buildProductImagesPayload,
  buildProductPayload,
  formatProductPayloadSample,
} from '../../utils/productPayload'
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

const steps = [
  { id: 'info',       title: 'Product Info',  caption: 'Name, details & specs'  },
  { id: 'images',     title: 'Images',        caption: 'Upload product photos'   },
  { id: 'pricing',    title: 'Pricing',       caption: 'Price & inventory'       },
  { id: 'variations', title: 'Variations',    caption: 'Size, color, weight'     },
  { id: 'shipping',   title: 'Shipping',      caption: 'Weight & dimensions'     },
  { id: 'review',     title: 'Review',        caption: 'Confirm & publish'       },
]

const stepFields = [
  ['name', 'sku', 'description', 'category_slug', 'subcategory_slug', 'brand_slug', 'metadata'],
  [],
  ['price', 'discount_price', 'discount_percent', 'quantity'],
  ['variations'],
  [],
  [],
]

const initialValues = {
  name:               '',
  sku:                '',
  description:        '',
  category_slug:      '',
  subcategory_slug:   '',
  brand_slug:         '',
  tags:               [],
  metadata:           [{ key: 'color', value: '' }, { key: 'weight', value: '' }],
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
    if (field === 'metadata') {
      return { ...touched, metadata: values.metadata.map(() => ({ key: true, value: true })) }
    }
    if (field === 'variations') {
      return {
        ...touched,
        variations: values.variations.map((v) => ({
          attribute: true,
          values: v.values.map(() => ({ value: true })),
        })),
      }
    }
    return { ...touched, [field]: true }
  }, {})
}

function hasStepErrors(errors, fields) {
  return fields.some((field) => Boolean(getIn(errors, field)))
}

function getFieldError(formik, name) {
  const touched = getIn(formik.touched, name)
  const error = getIn(formik.errors, name)
  return touched && typeof error === 'string' ? error : undefined
}

function templateRows(type) {
  return (METADATA_TEMPLATES[type] ?? METADATA_TEMPLATES.default).map((field) => ({
    key: field.key,
    value: '',
  }))
}

const brandOptions = MOCK_BRANDS.map((b) => ({ value: b.slug, label: b.label }))

// ─── Step 1: Product Info ────────────────────────────────────────────────────

function InfoStep({
  formik,
  parentCategories,
  categoryTree,
  categoriesLoading,
  categoriesError,
}) {
  const categoryOptions = toSelectOptions(parentCategories)
  const selectedCategory =
    findCategoryBySlug(categoryTree, formik.values.category_slug)
    ?? parentCategories.find((category) => category.slug === formik.values.category_slug)
  const subcategories = getSubcategoriesForParent(categoryTree, formik.values.category_slug)
  const subcategoryOptions = toSelectOptions(subcategories)
  const selectedSubcategory = findCategoryBySlug(subcategories, formik.values.subcategory_slug)
  const metadataTemplateType = inferMetadataTemplateType(formik.values.category_slug)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
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
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Classification</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">Category & brand</h3>
          <p className="mt-1 text-xs text-slate-500">
            Accurate classification helps customers find your product faster.
          </p>
        </div>
        {categoriesError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Could not load categories from the server. Refresh the page and try again.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SearchableSelect
            id="category_slug"
            name="category_slug"
            label="Category"
            icon={Layers3}
            placeholder={categoriesLoading ? 'Loading categories…' : 'Search categories…'}
            options={categoryOptions}
            value={formik.values.category_slug}
            disabled={categoriesLoading || categoriesError}
            onChange={(e) => {
              formik.setFieldValue('category_slug', e.target.value, true)
              formik.setFieldValue('subcategory_slug', '', false)
              formik.setFieldTouched('category_slug', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'category_slug')}
          />
          <SearchableSelect
            id="subcategory_slug"
            name="subcategory_slug"
            label="Product type"
            icon={PackageSearch}
            placeholder={
              categoriesLoading
                ? 'Loading product types…'
                : selectedCategory
                  ? 'Search product types…'
                  : 'Choose a category first'
            }
            options={subcategoryOptions}
            value={formik.values.subcategory_slug}
            disabled={categoriesLoading || categoriesError || !formik.values.category_slug}
            onChange={(e) => {
              formik.setFieldValue('subcategory_slug', e.target.value, true)
              formik.setFieldValue(
                'metadata',
                templateRows(inferMetadataTemplateType(formik.values.category_slug)),
                false,
              )
              formik.setFieldTouched('subcategory_slug', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'subcategory_slug')}
          />
          <SearchableSelect
            id="brand_slug"
            name="brand_slug"
            label="Brand"
            icon={Store}
            placeholder="Search brands…"
            options={brandOptions}
            value={formik.values.brand_slug}
            onChange={(e) => {
              formik.setFieldValue('brand_slug', e.target.value, true)
              formik.setFieldTouched('brand_slug', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'brand_slug')}
          />
        </div>
        {selectedCategory && (
          <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
            <p className="text-xs font-bold text-cyan-900">{selectedCategory.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-cyan-800/80">
              {subcategories.length > 0
                ? `${subcategories.length} product type${subcategories.length === 1 ? '' : 's'} available under this category.`
                : 'Choose the product type that best matches this item.'}
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

      <FieldArray name="metadata">
        {({ push, remove }) => (
          <section data-field="metadata" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Specs</p>
                <h3 className="mt-1 text-sm font-bold text-slate-900">Product details</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add specs shoppers compare — color, size, material, warranty, etc.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSubcategory && (
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue('metadata', templateRows(metadataTemplateType))}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
                  >
                    <Sparkles className="size-3.5" /> Use suggestions
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => push({ key: '', value: '' })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Plus className="size-3.5" /> Add detail
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {formik.values.metadata.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
                >
                  <ProductInput
                    id={`metadata.${index}.key`}
                    name={`metadata.${index}.key`}
                    label="Detail name"
                    placeholder="e.g. Color"
                    value={row.key}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError(formik, `metadata.${index}.key`)}
                  />
                  <ProductInput
                    id={`metadata.${index}.value`}
                    name={`metadata.${index}.value`}
                    label="Value"
                    placeholder="e.g. Midnight Black"
                    value={row.value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError(formik, `metadata.${index}.value`)}
                  />
                  {formik.values.metadata.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-7 flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </FieldArray>
    </div>
  )
}

// ─── Step 2: Images ──────────────────────────────────────────────────────────

function ImagesStep({ images, onChange, error }) {
  return (
    <div className="space-y-5">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Media</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Product images</h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload clear, high-quality photos. The first image will be your main product photo shown to customers.
        </p>
      </div>
      <ProductImageUploader images={images} onChange={onChange} error={error} />
    </div>
  )
}

// ─── Step 3: Pricing & Inventory ─────────────────────────────────────────────

function PricingStep({ formik }) {
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProductInput
              id="quantity"
              name="quantity"
              type="number"
              label="Stock quantity"
              hint="Current stock level."
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
              hint="Alert when stock falls below this."
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

function VariantPricingSummary({ variantValue, productValues }) {
  const pricing = resolveVariantPricing(variantValue, productValues)

  return (
    <div className="flex h-full min-h-[8.75rem] flex-col rounded-xl border border-slate-200 bg-white p-3">
      <p className="min-h-[3.25rem] text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {pricing.isInherited ? 'Inherited pricing' : 'Custom pricing'}
      </p>
      <div className="flex flex-wrap items-baseline gap-2">
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
      <p className="mt-auto pt-2 text-[11px] leading-relaxed text-slate-500">
        {pricing.isInherited
          ? 'Uses base product price from the Pricing step'
          : pricing.parent.hasDiscount
            ? `Same ${roundDiscountPercent(pricing.parent)}% discount rate as base product`
            : 'Custom list price for this variant'}
      </p>
    </div>
  )
}

function roundDiscountPercent(parent) {
  const pct = (1 - parent.discountRatio) * 100
  return pct % 1 === 0 ? pct : pct.toFixed(1)
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
      { id: `val-${Date.now()}`, value: val, sku: '', price: '', quantity: '', image_url: '' },
    ])
    setNewValueInput('')
    setExpandedValues(new Set([newIndex]))
  }

  const removeValue = (i) => {
    formik.setFieldValue(
      `variations.${varIndex}.values`,
      variation.values.filter((_, idx) => idx !== i),
    )
  }

  const attrError = getFieldError(formik, `variations.${varIndex}.attribute`)
  const valuesArrayError =
    getIn(formik.touched, `variations.${varIndex}.attribute`) &&
    typeof getIn(formik.errors, `variations.${varIndex}.values`) === 'string'
      ? getIn(formik.errors, `variations.${varIndex}.values`)
      : null

  const placeholder =
    variation.attribute === 'Color'
      ? 'e.g. Red, Blue, Green'
      : variation.attribute === 'Size'
        ? 'e.g. S, M, L, XL'
        : variation.attribute === 'Weight'
          ? 'e.g. 250g, 500g, 1kg'
          : 'Add a value…'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div
            data-field={`variations.${varIndex}.attribute`}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="text"
              placeholder="Variation type (e.g. Size)"
              value={variation.attribute}
              onChange={(e) =>
                formik.setFieldValue(`variations.${varIndex}.attribute`, e.target.value)
              }
              onBlur={() =>
                formik.setFieldTouched(`variations.${varIndex}.attribute`, true)
              }
              className={`rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
                attrError ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
              }`}
            />
            <div className="flex gap-1.5">
              {VARIATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    formik.setFieldValue(`variations.${varIndex}.attribute`, preset)
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    variation.attribute === preset
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
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
                  {val.image_url ? (
                    <img src={val.image_url} alt="" className="size-full object-cover" />
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
                <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                  <div className="grid gap-3 sm:grid-cols-3 sm:items-start">
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.sku`}
                      name={`variations.${varIndex}.values.${i}.sku`}
                      label="Variant SKU"
                      reserveHintSpace
                      placeholder="AUD-001-S"
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
                      label="Price override (GH₵) · Optional"
                      hint="Leave empty to inherit base product pricing."
                      reserveHintSpace
                      placeholder={formatMoney(pricing.parent.regularPrice)}
                      value={val.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `variations.${varIndex}.values.${i}.price`)}
                    />
                    <ProductInput
                      id={`variations.${varIndex}.values.${i}.quantity`}
                      name={`variations.${varIndex}.values.${i}.quantity`}
                      type="number"
                      label="Variant quantity"
                      reserveHintSpace
                      placeholder="0"
                      value={val.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:items-stretch">
                    <VariantPricingSummary variantValue={val} productValues={formik.values} />
                    <VariantImageUpload
                      compact
                      value={val.image_url}
                      onChange={(dataUri) =>
                        formik.setFieldValue(`variations.${varIndex}.values.${i}.image_url`, dataUri)
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

function VariationsStep({ formik }) {
  const priceRange = getVariationCustomerPriceRange(formik.values.variations, formik.values)
  const rangeLabel = formatCustomerPriceRange(priceRange)

  const addVariation = () => {
    formik.setFieldValue('variations', [
      ...formik.values.variations,
      { id: `var-${Date.now()}`, attribute: '', values: [] },
    ])
  }

  const removeVariation = (index) => {
    formik.setFieldValue(
      'variations',
      formik.values.variations.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Variants</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Product variations</h3>
          <p className="mt-1 text-sm text-slate-500">
            Each variant inherits your base pricing by default. Override a variant price only when that option should cost more or less — the same discount rate still applies.
          </p>
          {rangeLabel && formik.values.variations.some((v) => v.values.length > 0) && (
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Customer price range: <span className="text-brand">{rangeLabel}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addVariation}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-hover"
        >
          <Plus className="size-4" /> Add variation
        </button>
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

function ShippingStep({ formik }) {
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

function ReviewStep({ formik, images, parentCategories, categoryTree }) {
  const selectedCategory =
    findCategoryBySlug(categoryTree, formik.values.category_slug)
    ?? parentCategories.find((category) => category.slug === formik.values.category_slug)
  const selectedBrand = MOCK_BRANDS.find((b) => b.slug === formik.values.brand_slug)
  const subcategories = getSubcategoriesForParent(categoryTree, formik.values.category_slug)
  const selectedSubcategory = findCategoryBySlug(subcategories, formik.values.subcategory_slug)

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
        ['Product type', selectedSubcategory?.name],
        ['Brand', selectedBrand?.label],
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

  const filledDetails = formik.values.metadata.filter((r) => r.key?.trim() && r.value?.trim())

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Summary</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Review your listing</h3>
        <p className="mt-1 text-sm text-slate-500">
          Check everything before publishing. You can go back to edit any section.
        </p>
      </div>

      {images.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <ImagePlus className="size-4 text-cyan-700" />
            Product images
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {images.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {images.slice(0, 6).map((img, i) => (
              <div key={img.id} className="relative">
                <img
                  src={img.preview}
                  alt={`Product image ${i + 1}`}
                  className="size-16 rounded-xl object-cover ring-1 ring-slate-200"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
            {images.length > 6 && (
              <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                +{images.length - 6}
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

      {formik.values.variations.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Box className="size-4 text-cyan-700" />
            Variations
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {formik.values.variations.length}
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
                    return (
                      <span
                        key={val.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-2.5 pr-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {val.image_url && (
                          <img src={val.image_url} alt="" className="size-5 rounded-full object-cover" />
                        )}
                        <span>{val.value}</span>
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

      {filledDetails.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle2 className="size-4 text-emerald-600" /> Product details
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filledDetails.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {row.key}
                </span>
                <span className="text-xs font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddProduct() {
  const [activeStep, setActiveStep] = useState(0)
  const [images, setImages] = useState([])
  const [imagesError, setImagesError] = useState('')
  const submitActionRef = useRef('draft')
  const stepDirectionRef = useRef('forward')
  const isInitialStepMount = useRef(true)
  const navigate = useNavigate()
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

  const goToStep = (updater) => {
    stepDirectionRef.current = 'forward'
    setActiveStep(updater)
  }

  const goToPreviousStep = () => {
    stepDirectionRef.current = 'back'
    setActiveStep((step) => Math.max(step - 1, 0))
  }

  const handleNext = async (formik) => {
    if (activeStep === 1) {
      if (images.length === 0) {
        setImagesError('Add at least one product image to continue')
        requestAnimationFrame(() => {
          scrollToFirstError({ product_images: 'Add at least one product image to continue' })
        })
        return
      }
      setImagesError('')
      goToStep((step) => step + 1)
      return
    }

    const errors = await formik.validateForm()
    const fields = stepFields[activeStep]

    if (fields.length > 0) {
      formik.setTouched(
        { ...formik.touched, ...getTouchedForFields(fields, formik.values) },
        true,
      )
      if (hasStepErrors(errors, fields)) {
        requestAnimationFrame(() => {
          scrollToFirstError(collectStepErrors(errors, fields))
        })
        return
      }
    }

    goToStep((step) => Math.min(step + 1, steps.length - 1))
  }

  return (
    <DashboardLayout pageTitle="Add Product">
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">New listing</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Add a product
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Create a complete listing with clear photos, accurate pricing, and detailed specifications so customers find and trust your product.
            </p>
          </div>
        </section>

        <Formik
          initialValues={initialValues}
          validationSchema={productListingSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, actions) => {
            try {
              const productImages = await buildProductImagesPayload(images)
              const payload = buildProductPayload(
                { ...values, status: submitActionRef.current },
                productImages,
              )

              console.log('Product payload (sample)', formatProductPayloadSample(payload))
              // TODO: POST full `payload` to backend — product_images and variant image_url use full base64

              notify.success(
                submitActionRef.current === 'active'
                  ? 'Product published successfully!'
                  : 'Product saved as draft.',
              )
              navigate('/products')
            } catch (error) {
              notify.error(error?.message || 'Failed to prepare product images.')
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
                  stepTitle={steps[activeStep].title}
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

              <ProductStepper steps={steps} activeStep={activeStep} />

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
                {activeStep === 0 && (
                  <InfoStep
                    formik={formik}
                    parentCategories={parentCategories}
                    categoryTree={categoryTree}
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                  />
                )}
                {activeStep === 1 && (
                  <ImagesStep
                    images={images}
                    onChange={(imgs) => { setImages(imgs); if (imgs.length > 0) setImagesError('') }}
                    error={imagesError}
                  />
                )}
                {activeStep === 2 && <PricingStep formik={formik} />}
                {activeStep === 3 && <VariationsStep formik={formik} />}
                {activeStep === 4 && <ShippingStep formik={formik} />}
                {activeStep === 5 && (
                  <ReviewStep
                    formik={formik}
                    images={images}
                    parentCategories={parentCategories}
                    categoryTree={categoryTree}
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

                {activeStep < steps.length - 1 ? (
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
                      type="button"
                      disabled={formik.isSubmitting}
                      onClick={() => { submitActionRef.current = 'draft'; formik.submitForm() }}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="size-4" /> Save as draft
                    </button>
                    <button
                      type="button"
                      disabled={formik.isSubmitting}
                      onClick={() => { submitActionRef.current = 'active'; formik.submitForm() }}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formik.isSubmitting ? (
                        <><Loader2 className="size-4 animate-spin" /> Publishing…</>
                      ) : (
                        <>Publish product <ArrowRight className="size-4" /></>
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
