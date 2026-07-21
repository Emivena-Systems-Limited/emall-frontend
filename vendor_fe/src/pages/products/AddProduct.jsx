import { useEffect, useRef, useState } from 'react'
import { Form, Formik, getIn } from 'formik'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Box,
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
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductStepper from '../../components/products/ProductStepper'
import ProductRichTextEditor from '../../components/products/ProductRichTextEditor'
import ProductImageUploader from '../../components/products/ProductImageUploader'
import DescriptiveImageUploader from '../../components/products/DescriptiveImageUploader'
import ProductKeyDetailsInput from '../../components/products/ProductKeyDetailsInput'
import ProductMainImageUpload from '../../components/products/ProductMainImageUpload'
import AttributeIcon from '../../components/variants/AttributeIcon'
import AttributeTypePicker from '../../components/variants/AttributeTypePicker'
import CardStepHeader from '../../components/variants/CardStepHeader'
import VariantDetailsDrawer from '../../components/variants/VariantDetailsDrawer'
import VariantValueDraftCard from '../../components/variants/VariantValueDraftCard'
import VariantValuesInput from '../../components/variants/VariantValuesInput'
import { isPresetAttribute } from '../../components/variants/variantConstants'
import {
  EMPTY_VARIANT_VALUES,
  getVariantValuesHint,
  getVariantValuesInputPlaceholder,
  toVariantFormValues,
} from '../../components/variants/variantFormUtils'
import DevProductFormTools from '../../components/products/DevProductFormTools'
import ProductTagInput from '../../components/products/ProductTagInput'
import SearchableSelect from '../../components/auth/SearchableSelect'
import {
  GuidanceCard,
  // OptionalBadge,
  OptionalSection,
  OptionalSectionHeader,
  ProductInput,
  ProductMoneyInput,
  ProductSelect,
} from '../../components/products/ProductFormControls'
import {
  DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL,
  FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL,
  PRIMARY_PRODUCT_IMAGE_LANDSCAPE_EXAMPLE_LABEL,
  PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL,
  PRODUCT_CONDITION_OPTIONS,
} from '../../constants/products'
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
import { buildProductPayload, buildProductCreateJsonPayload, formatProductPayloadSample } from '../../utils/productPayload'
import {
  buildProductMediaPresignRequest,
  buildProductMediaSaveImagesPayload,
} from '../../utils/productMediaUploadUtils'
import { PRODUCT_PUBLISH_STAGE, USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD } from '../../constants/productMediaUpload'
import useProductMediaUpload from '../../hooks/useProductMediaUpload'
import ProductPublishProgressModal from '../../components/products/ProductPublishProgressModal'
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
import { getProductConditionLabel } from '../../utils/productMetadata'
import {
  validateProductImageLimits,
  validateDescriptiveImageLimits,
  validateDescriptiveImageDimensions,
  validateFeaturedImageDimensions,
  validateGalleryImagesRequired,
  validatePrimaryImageDimensions,
} from '../../utils/productImageUtils'

const productListingSteps = [
  { id: 'info',       title: 'Product Info',  caption: 'Name, category & details'  },
  { id: 'images',     title: 'Images',        caption: 'Upload product photos'   },
  { id: 'pricing',    title: 'Pricing',       caption: 'Price & inventory'       },
  { id: 'variations', title: 'Variations',    caption: 'Size, color, weight'     },
  { id: 'shipping',   title: 'Shipping',      caption: 'Weight & dimensions'     },
  { id: 'review',     title: 'Review',        caption: 'Confirm & publish'       },
]

const productListingStepFields = [
  ['name', 'sku', 'description', 'category_id', 'subcategory_id', 'brand_id', 'condition', 'key_details'],
  [],
  ['price', 'discount_price', 'discount_percent', 'quantity', 'low_stock_threshold'],
  ['variations'],
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
  condition:          '',
  tags:               [],
  key_details:        [],
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
    if (field === 'key_details') {
      return {
        ...touched,
        key_details: (values.key_details ?? []).map(() => ({ key: true, value: true })),
      }
    }
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
    id: `val-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    value,
    variant_name: '',
    sku: '',
    price: '',
    discount_price: '',
    quantity: '',
    reserved_quantity: '',
    low_stock_threshold: '',
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
  }
}

/** A value is "ready" once it has the two things every variant needs before checkout: stock and a photo. */
function isVariantValueReady(value) {
  const hasQuantity = value.quantity !== '' && value.quantity != null
  const hasImage = (value.images ?? []).length > 0
  return hasQuantity && hasImage
}

function createVariantGroupId() {
  return `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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
    if (field === 'key_details') {
      const keyDetailErrors = errors?.key_details
      if (!keyDetailErrors) return false
      if (typeof keyDetailErrors === 'string') return true
      if (Array.isArray(keyDetailErrors)) {
        return keyDetailErrors.some((item) => item && (item.key || item.value))
      }
    }
    return Boolean(getIn(errors, field))
  })
}

function getFieldError(formik, name) {
  const touched = getIn(formik.touched, name) || formik.submitCount > 0
  const error = getIn(formik.errors, name)
  return touched && typeof error === 'string' ? error : undefined
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
      <div className="grid items-stretch gap-4 md:grid-cols-3">
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
          optional
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
          <ProductSelect
            id="condition"
            name="condition"
            label="Product condition"
            hint="Required. Describe the physical state of the item."
            placeholder="Select condition"
            options={PRODUCT_CONDITION_OPTIONS}
            value={formik.values.condition}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'condition')}
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

      <ProductKeyDetailsInput
        pairs={formik.values.key_details ?? []}
        onChange={(pairs) => formik.setFieldValue('key_details', pairs)}
        errors={formik.errors.key_details}
        touched={formik.touched.key_details}
        submitCount={formik.submitCount}
      />

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

export function ImagesStep({
  mainImage,
  onMainImageChange,
  mainImageError,
  subImages,
  onSubImagesChange,
  subImagesError = '',
  descriptiveImages = [],
  onDescriptiveImagesChange,
  descriptiveImagesError = '',
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Main photo</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">Primary product image</h3>
          <p className="mt-1 text-xs text-slate-500">
            This is the hero image customers see first in search results and category cards. Use a square photo near {PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL} or a wide landscape near {PRIMARY_PRODUCT_IMAGE_LANDSCAPE_EXAMPLE_LABEL}.
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
            Required. Add at least one extra photo for the product page gallery — different angles, packaging, or close-ups. Use wide landscape photos near {FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL}. Up to 5 images total and 5MB combined across all photos (including the main photo).
          </p>
        </div>
        <ProductImageUploader
          images={subImages}
          onChange={onSubImagesChange}
          mainImage={mainImage}
          error={subImagesError}
        />
      </section>

      <OptionalSection dataField="descriptive_product_images">
        <OptionalSectionHeader
          eyebrow="Descriptive photos"
          title="Detail images"
          description={`Optional lifestyle or detail shots shown in a 2×2 grid on your product page. Upload wide images near ${DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL} for the best fit.`}
        />
        <DescriptiveImageUploader
          images={descriptiveImages}
          onChange={onDescriptiveImagesChange}
          error={descriptiveImagesError}
        />
      </OptionalSection>
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
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
              {/* Discount type
              <OptionalBadge /> */}
            </span>
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

          <div className="grid items-stretch gap-4 sm:grid-cols-2">
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
                hint="Optional discounted price. Up to 2 decimal places."
                optional
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
                hint="Optional. Enter a value between 0.01 and 99.99."
                optional
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
              label="Low stock threshold"
              reserveHintSpace
              optional
              hint="Cannot exceed stock quantity."
              placeholder="10"
              value={formik.values.low_stock_threshold}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'low_stock_threshold')}
            />
            <ProductInput
              id="barcode"
              name="barcode"
              label="Barcode"
              reserveHintSpace
              optional
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

function scrollToSavedVariationValues(target) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!target) return
      const panel = document.querySelector('[data-dashboard-scroll-panel]')
      if (panel) {
        const panelRect = panel.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()
        const offset = targetRect.top - panelRect.top + panel.scrollTop - 20
        panel.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
        return
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

/** Add-variations step for the create/edit product wizard: build option types (Color, Size…) with values,
 *  then fill in photo, price & stock for each value via the same drawer used on the product's variants page.
 *  Nothing is saved to the server here — everything lives in the product form until the whole listing is submitted. */
export function VariationsStep({ formik }) {
  const groups = formik.values.variations
  const [buildingAttribute, setBuildingAttribute] = useState('')
  const [showCustomAttribute, setShowCustomAttribute] = useState(false)
  const [attributeError, setAttributeError] = useState('')
  const [pendingValues, setPendingValues] = useState([])
  const [valuesError, setValuesError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const savedValuesRef = useRef(null)

  const activeAttribute = buildingAttribute.trim()

  const findValueLocation = (id) => {
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const valueIndex = groups[groupIndex].values.findIndex((item) => item.id === id)
      if (valueIndex >= 0) return { groupIndex, valueIndex }
    }
    return null
  }

  const resetBuildingForm = () => {
    setBuildingAttribute('')
    setShowCustomAttribute(false)
    setPendingValues([])
    setAttributeError('')
    setValuesError('')
  }

  const handleAddOptionGroup = () => {
    if (!activeAttribute) {
      setAttributeError('Choose or enter an option type to continue')
      return
    }
    if (pendingValues.length === 0) {
      setValuesError('Add at least one value, then click Add Attribute')
      return
    }

    setAttributeError('')
    setValuesError('')

    const existingIndex = groups.findIndex(
      (group) => group.attribute.toLowerCase() === activeAttribute.toLowerCase(),
    )
    const existingValuesLower = existingIndex >= 0
      ? new Set(groups[existingIndex].values.map((item) => item.value.toLowerCase()))
      : new Set()
    const newValueObjects = pendingValues
      .filter((text) => !existingValuesLower.has(text.toLowerCase()))
      .map((text) => createVariantValue(text))

    if (existingIndex >= 0) {
      formik.setFieldValue(`variations.${existingIndex}.values`, [
        ...groups[existingIndex].values,
        ...newValueObjects,
      ])
    } else {
      formik.setFieldValue('variations', [
        ...groups,
        { id: createVariantGroupId(), attribute: activeAttribute, values: newValueObjects },
      ])
    }
    formik.setFieldError('variations', undefined)

    resetBuildingForm()
    scrollToSavedVariationValues(savedValuesRef.current)
  }

  const handleRemoveValue = (id) => {
    const location = findValueLocation(id)
    if (!location) return
    const { groupIndex } = location
    const nextValues = groups[groupIndex].values.filter((item) => item.id !== id)

    if (nextValues.length === 0) {
      formik.setFieldValue('variations', groups.filter((_, index) => index !== groupIndex))
    } else {
      formik.setFieldValue(`variations.${groupIndex}.values`, nextValues)
    }
    if (editingId === id) setEditingId(null)
  }

  const handleRemoveGroup = (groupIndex) => {
    formik.setFieldValue('variations', groups.filter((_, index) => index !== groupIndex))
  }

  const handleDrawerSave = async (variantFormValues) => {
    const location = findValueLocation(editingId)
    if (!location) return
    const { groupIndex, valueIndex } = location
    const current = groups[groupIndex].values[valueIndex]
    formik.setFieldValue(`variations.${groupIndex}.values.${valueIndex}`, {
      ...current,
      ...variantFormValues,
      id: current.id,
    })
    setEditingId(null)
  }

  const editingLocation = editingId ? findValueLocation(editingId) : null
  const editingGroup = editingLocation ? groups[editingLocation.groupIndex] : null
  const editingValue = editingLocation ? editingGroup.values[editingLocation.valueIndex] : null
  const drawerInitialValues = editingValue
    ? toVariantFormValues(editingValue, editingGroup.attribute)
    : EMPTY_VARIANT_VALUES

  const totalValues = groups.reduce((count, group) => count + group.values.length, 0)
  const readyCount = groups.reduce(
    (count, group) => count + group.values.filter(isVariantValueReady).length,
    0,
  )
  const priceRange = getVariationCustomerPriceRange(groups, formik.values)
  const rangeLabel = formatCustomerPriceRange(priceRange)
  const stepError = typeof formik.errors.variations === 'string' && formik.touched.variations
    ? formik.errors.variations
    : ''

  return (
    <div className="space-y-6" data-field="variations">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Optional</p>
        <h3 className="text-lg font-bold text-slate-900">Product variations</h3>
        <p className="text-sm text-slate-500">
          Add option types like Color, Size, or your own (Material, Capacity, etc.), each with its own values.
          Skip this step entirely if this product has no variants.
        </p>
        {rangeLabel && totalValues > 0 && (
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            Customer price range: <span className="whitespace-nowrap text-brand">{rangeLabel}</span>
          </p>
        )}
        {stepError && (
          <p className="text-sm font-medium text-red-600" role="alert">{stepError}</p>
        )}
      </div>

      {totalValues > 0 && <ParentPricingBanner values={formik.values} />}

      {/* Build a new option type */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader
          step={1}
          title="Add option types & values"
          subtitle="Set up one or more option types (Color, Size, Material…). Each type gets its own values before you fill in photos, price & stock."
        />

        <AttributeTypePicker
          value={buildingAttribute}
          showCustom={showCustomAttribute}
          onSelectPreset={(preset) => {
            setShowCustomAttribute(false)
            setBuildingAttribute(preset)
            setAttributeError('')
          }}
          onToggleCustom={() => {
            setShowCustomAttribute(true)
            if (isPresetAttribute(buildingAttribute)) setBuildingAttribute('')
          }}
          onCloseCustom={() => {
            setShowCustomAttribute(false)
            setBuildingAttribute('')
          }}
          onCustomChange={(event) => {
            setBuildingAttribute(event.target.value)
            setAttributeError('')
          }}
          onCustomBlur={() => {}}
          error={attributeError}
        />
        {attributeError && <p className="mt-2 text-xs font-semibold text-red-600">{attributeError}</p>}

        {activeAttribute ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <VariantValuesInput
              values={pendingValues}
              onChange={(next) => {
                setPendingValues(next)
                setValuesError('')
              }}
              label={`${activeAttribute} value(s)`}
              hint={getVariantValuesHint(activeAttribute)}
              placeholder={getVariantValuesInputPlaceholder(activeAttribute)}
              error={valuesError}
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {groups.length > 0 && (
                <button
                  type="button"
                  onClick={resetBuildingForm}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300"
                >
                  Clear form
                </button>
              )}
              <button
                type="button"
                onClick={handleAddOptionGroup}
                disabled={pendingValues.length === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                Add Attribute
                {pendingValues.length > 0 ? ` (${pendingValues.length} value${pendingValues.length === 1 ? '' : 's'})` : ''}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* All added option groups */}
      <div ref={savedValuesRef} className="scroll-mt-6">
        {groups.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Layers3 className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {groups.length} option type{groups.length !== 1 ? 's' : ''} · {totalValues} value{totalValues !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-slate-400">Fill in photo, price & stock for each value below</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                {readyCount}/{totalValues} ready
              </span>
            </div>

            {groups.map((group, groupIndex) => {
              const groupReady = group.values.filter(isVariantValueReady).length
              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <AttributeIcon attribute={group.attribute} className="size-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {group.attribute}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                      {groupReady}/{group.values.length} ready
                    </span>
                    <span className="h-px flex-1 bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(groupIndex)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${group.attribute} option type`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.values.map((value) => (
                      <VariantValueDraftCard
                        key={value.id}
                        attribute={group.attribute}
                        value={value.value}
                        persistedEntry={isVariantValueReady(value) ? { variantValue: value } : null}
                        onEdit={() => setEditingId(value.id)}
                        onRemove={() => handleRemoveValue(value.id)}
                        isRemoving={false}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
              <Box className="size-7" strokeWidth={1.5} />
            </span>
            <p className="text-sm font-semibold text-slate-700">No options added yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Pick a type above, add values, then click <strong>Add Attribute</strong>. Repeat for Color, Size,
              Material, and more — or skip this step if this product has no variants.
            </p>
          </div>
        )}
      </div>

      <VariantDetailsDrawer
        open={Boolean(editingId)}
        attribute={editingGroup?.attribute ?? ''}
        value={editingValue?.value ?? null}
        initialValues={drawerInitialValues}
        productValues={formik.values}
        onClose={() => setEditingId(null)}
        onSave={handleDrawerSave}
        isSaving={false}
      />
    </div>
  )
}

// ─── Step 5: Shipping ─────────────────────────────────────────────────────────

export function ShippingStep({ formik }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <OptionalSection className="p-5">
        <OptionalSectionHeader
          eyebrow="Shipping"
          title="Weight & dimensions"
          description="Accurate values improve delivery cost calculations for customers at checkout."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ProductInput
            id="shipping_weight"
            name="shipping_weight"
            type="number"
            label="Weight (kg)"
            optional
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
            label="Length (cm)"
            optional
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
            label="Width (cm)"
            optional
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
            label="Height (cm)"
            optional
            hint="Package height in centimetres."
            placeholder="0.00"
            value={formik.values.shipping_height}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'shipping_height')}
          />
        </div>
      </OptionalSection>
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
  descriptiveImages = [],
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

  const filledKeyDetails = (formik.values.key_details ?? []).filter(
    (item) => item?.key?.trim() && item?.value?.trim(),
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
        ['Condition', getProductConditionLabel(formik.values.condition)],
        ['Tags', formik.values.tags.length ? formik.values.tags.join(', ') : null],
      ],
    },
    {
      title: 'Pricing & inventory',
      icon: BadgePercent,
      items: [
        [
          'Price',
          price
            ? (
              hasDiscount && salesPrice != null
                ? `GH₵ ${formatMoney(price)} → GH₵ ${formatMoney(salesPrice)}`
                : `GH₵ ${formatMoney(price)}`
            )
            : null,
        ],
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

      {(mainImage || subImages.length > 0 || descriptiveImages.length > 0) && (
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
            {descriptiveImages.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Descriptive · {descriptiveImages.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {descriptiveImages.slice(0, 4).map((img, index) => (
                    <img
                      key={img.id}
                      src={img.preview}
                      alt={`Descriptive image ${index + 1}`}
                      className="size-16 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                  ))}
                  {descriptiveImages.length > 4 && (
                    <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      +{descriptiveImages.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {filledKeyDetails.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Key details</h3>
          <dl className="space-y-2">
            {filledKeyDetails.map((item) => (
              <div key={item.id ?? item.key} className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-xs font-semibold text-slate-400">{item.key}</dt>
                <dd className="text-right text-xs font-bold text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
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
  initialDescriptiveImages = null,
}) {
  const isEditMode = mode === 'edit'
  const [activeStep, setActiveStep] = useState(0)
  const [mainImage, setMainImage] = useState(initialMainImage ?? null)
  const [subImages, setSubImages] = useState(initialSubImages ?? [])
  const [descriptiveImages, setDescriptiveImages] = useState(initialDescriptiveImages ?? [])
  const [mainImageError, setMainImageError] = useState('')
  const [galleryImagesError, setGalleryImagesError] = useState('')
  const [descriptiveImagesError, setDescriptiveImagesError] = useState('')
  const stepDirectionRef = useRef('forward')
  const isInitialStepMount = useRef(true)
  const navigate = useNavigate()
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()
  const { uploadPendingMedia, uploadProgress } = useProductMediaUpload()
  const [publishStage, setPublishStage] = useState(PRODUCT_PUBLISH_STAGE.IDLE)
  const [publishErrorMessage, setPublishErrorMessage] = useState(null)
  const [erroredPublishStage, setErroredPublishStage] = useState(null)
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

      const galleryResult = validateGalleryImagesRequired(mainImage, subImages)
      if (!galleryResult.valid) {
        setGalleryImagesError(galleryResult.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ sub_product_images: galleryResult.message })
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

      const primaryDimensions = await validatePrimaryImageDimensions(mainImage)
      if (!primaryDimensions.valid) {
        setMainImageError(primaryDimensions.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ main_product_image: primaryDimensions.message })
        })
        return false
      }

      const featuredDimensions = await validateFeaturedImageDimensions(subImages)
      if (!featuredDimensions.valid) {
        setGalleryImagesError(featuredDimensions.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ sub_product_images: featuredDimensions.message })
        })
        return false
      }

      const descriptiveLimits = validateDescriptiveImageLimits(descriptiveImages)
      if (!descriptiveLimits.valid) {
        setDescriptiveImagesError(descriptiveLimits.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ descriptive_product_images: descriptiveLimits.message })
        })
        return false
      }

      const descriptiveDimensions = await validateDescriptiveImageDimensions(descriptiveImages)
      if (!descriptiveDimensions.valid) {
        setDescriptiveImagesError(descriptiveDimensions.message)
        requestAnimationFrame(() => {
          scrollToFirstError({ descriptive_product_images: descriptiveDimensions.message })
        })
        return false
      }

      setMainImageError('')
      setGalleryImagesError('')
      setDescriptiveImagesError('')
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
            const usePresignedUpload = USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD && !isEditMode
            let currentStage = PRODUCT_PUBLISH_STAGE.REQUESTING_URLS

            try {
              const formValues = isEditMode
                ? { ...values, status: values.status || 'active' }
                : { ...values, status: 'active' }

              const mediaState = {
                mainImage,
                subImages,
                descriptiveImages,
                variations: formValues.variations,
              }

              if (import.meta.env.DEV) {
                console.log('[product media presign request]', buildProductMediaPresignRequest(mediaState))
              }

              let nextMediaState = mediaState

              if (usePresignedUpload) {
                setPublishErrorMessage(null)
                setErroredPublishStage(null)
                setPublishStage(PRODUCT_PUBLISH_STAGE.REQUESTING_URLS)

                nextMediaState = await uploadPendingMedia(mediaState)
                setMainImage(nextMediaState.mainImage)
                setSubImages(nextMediaState.subImages)
                setDescriptiveImages(nextMediaState.descriptiveImages)

                if (import.meta.env.DEV) {
                  console.log(
                    '[product media save images]',
                    buildProductMediaSaveImagesPayload(nextMediaState),
                  )
                }

                currentStage = PRODUCT_PUBLISH_STAGE.CREATING_PRODUCT
                setPublishStage(PRODUCT_PUBLISH_STAGE.CREATING_PRODUCT)
              }

              const context = buildProductMutationContext(formValues, {
                parentCategories,
                categoryTree,
                approvedBrands,
              })

              if (isEditMode) {
                const payload = buildProductPayload(
                  formValues,
                  nextMediaState.mainImage,
                  nextMediaState.subImages,
                  {
                    mode: 'edit',
                    includeVariations: true,
                    descriptiveImages: nextMediaState.descriptiveImages,
                  },
                )

                if (import.meta.env.DEV) {
                  console.log('[update product] FormData payload:', formatProductPayloadSample(payload))
                }

                await updateProductMutation.mutateAsync({
                  productId,
                  formData: payload,
                  context,
                })
              } else if (usePresignedUpload) {
                const payload = buildProductCreateJsonPayload(
                  formValues,
                  nextMediaState.mainImage,
                  nextMediaState.subImages,
                  {
                    includeVariations: true,
                    descriptiveImages: nextMediaState.descriptiveImages,
                  },
                )

                if (import.meta.env.DEV) {
                  console.log('[create product] JSON payload:', payload)
                }

                await createProductMutation.mutateAsync({
                  payload,
                  context,
                })
              } else {
                const payload = buildProductPayload(
                  formValues,
                  nextMediaState.mainImage,
                  nextMediaState.subImages,
                  {
                    mode: 'create',
                    includeVariations: true,
                    descriptiveImages: nextMediaState.descriptiveImages,
                  },
                )

                if (import.meta.env.DEV) {
                  console.log('[create product] FormData payload:', formatProductPayloadSample(payload))
                }

                await createProductMutation.mutateAsync({
                  formData: payload,
                  context,
                })
              }

              if (usePresignedUpload) {
                setPublishStage(PRODUCT_PUBLISH_STAGE.SUCCESS)
              }

              navigate('/products')
            } catch (error) {
              if (usePresignedUpload) {
                const failedDuringUpload = (
                  currentStage === PRODUCT_PUBLISH_STAGE.REQUESTING_URLS
                  && uploadProgress.phase === PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES
                )

                setErroredPublishStage(
                  failedDuringUpload ? PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES : currentStage,
                )
                setPublishErrorMessage(error?.message || 'Failed to publish product.')
                setPublishStage(PRODUCT_PUBLISH_STAGE.ERROR)
              }

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
                    onSubImagesChange={(images) => {
                      setSubImages(images)
                      if (images.length >= 1 && validateGalleryImagesRequired(mainImage, images).valid) {
                        setGalleryImagesError('')
                      }
                    }}
                    subImagesError={galleryImagesError}
                    descriptiveImages={descriptiveImages}
                    onDescriptiveImagesChange={(images) => {
                      setDescriptiveImages(images)
                      if (images.length === 0 || validateDescriptiveImageLimits(images).valid) {
                        setDescriptiveImagesError('')
                      }
                    }}
                    descriptiveImagesError={descriptiveImagesError}
                  />
                )}
                {activeStep === 2 && <PricingStep formik={formik} />}
                {activeStep === 3 && <VariationsStep formik={formik} />}
                {activeStep === 4 && <ShippingStep formik={formik} />}
                {activeStep === 5 && (
                  <ReviewStep
                    formik={formik}
                    mainImage={mainImage}
                    subImages={subImages}
                    descriptiveImages={descriptiveImages}
                    parentCategories={parentCategories}
                    categoryTree={categoryTree}
                    approvedBrands={approvedBrands}
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

      <ProductPublishProgressModal
        open={publishStage !== PRODUCT_PUBLISH_STAGE.IDLE}
        stage={
          publishStage === PRODUCT_PUBLISH_STAGE.REQUESTING_URLS
          && uploadProgress.phase === PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES
            ? PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES
            : publishStage
        }
        uploadProgress={uploadProgress}
        errorMessage={publishErrorMessage}
        erroredAtStage={erroredPublishStage}
        onDismissError={() => {
          setPublishStage(PRODUCT_PUBLISH_STAGE.IDLE)
          setPublishErrorMessage(null)
          setErroredPublishStage(null)
        }}
      />
    </DashboardLayout>
  )
}

export default function AddProduct() {
    return <ProductListingForm mode="create" />
}
