import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Form, Formik, getIn } from 'formik'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  Layers3,
  Loader2,
  Package,
  Palette,
  Plus,
  Ruler,
  Sparkles,
  Tag,
  Trash2,
  Weight as WeightIcon,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductStepper from '../../components/products/ProductStepper'
import {
  ImagesStep,
  InfoStep,
  PricingStep,
  ReviewStep,
  ShippingStep,
  VariantPricingSummary,
} from './AddProduct'
import { ProductInput, ProductMoneyInput } from '../../components/products/ProductFormControls'
import VariantImageUpload from '../../components/products/VariantImageUpload'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useApprovedBrands } from '../../hooks/useBrands'
import { useCreateBrandMutation } from '../../hooks/useBrandMutations'
import { useProductCategoryOptions } from '../../hooks/useCategories'
import {
  useUpdateProductInfoMutation,
  useUpdateSingleVariantMutation,
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
} from '../../hooks/useProductMutations'
import { useProduct, productQueryKeys } from '../../hooks/useProducts'
import { mapProductRecordToFormState } from '../../utils/mapProductToFormValues'
import { productInfoSchema, singleVariantSchema } from '../../utils/validationSchemas'
import {
  validateProductImageLimits,
  validateDescriptiveImageLimits,
  validateDescriptiveImageDimensions,
  validateFeaturedImageDimensions,
  validateGalleryImagesRequired,
  validatePrimaryImageDimensions,
} from '../../utils/productImageUtils'
import {
  buildProductInfoPayload,
  formatProductPayloadSample,
  isPersistedVariantId,
  iterateVariantFormEntries,
} from '../../utils/productPayload'
import { collectStepErrors, scrollToFirstError } from '../../utils/scrollToFirstError'
import { scrollDashboardPanelToTop } from '../../utils/scrollDashboardPanelToTop'
import { findCategoryById } from '../../utils/normalizeCategories'
import { findBrandById, getBrandDisplayLabel } from '../../utils/normalizeBrands'
import { formatMoney, getDiscountSummary, resolveVariantPricing } from '../../utils/productPricing'
import notify from '../../lib/notify'

const EDIT_SECTIONS = {
  INFO: 'info',
  VARIATIONS: 'variations',
}

const productInfoSteps = [
  { id: 'info', title: 'Product Info', caption: 'Name, category & details' },
  { id: 'images', title: 'Images', caption: 'Product photos' },
  { id: 'pricing', title: 'Pricing', caption: 'Price & inventory' },
  { id: 'shipping', title: 'Shipping', caption: 'Weight & dimensions' },
  { id: 'review', title: 'Review', caption: 'Confirm changes' },
]

const productInfoStepFields = [
  ['name', 'sku', 'description', 'category_id', 'subcategory_id', 'brand_id', 'condition', 'key_details'],
  [],
  ['price', 'discount_price', 'discount_percent', 'quantity', 'low_stock_threshold'],
  ['shipping_weight', 'shipping_length', 'shipping_width', 'shipping_height'],
  [],
]

function findFirstStepWithErrors(errors) {
  const stepIndex = productInfoStepFields.findIndex((fields) => hasStepErrors(errors, fields))
  return stepIndex >= 0 ? stepIndex : null
}

function getTouchedForFields(fields, values = {}) {
  return fields.reduce((touched, field) => {
    if (field === 'key_details') {
      return {
        ...touched,
        key_details: (values.key_details ?? []).map(() => ({ key: true, value: true })),
      }
    }
    return { ...touched, [field]: true }
  }, {})
}

function hasStepErrors(errors, fields) {
  return fields.some((field) => {
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

function EditSectionCard({ icon: Icon, title, description, to, accent = 'brand' }) {
  const iconClass = accent === 'cyan' ? 'bg-cyan-50 text-cyan-700 ring-cyan-100' : 'bg-brand-light text-brand ring-brand/10'

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-colors hover:border-brand/40"
    >
      <span className={`flex size-12 items-center justify-center rounded-2xl ring-1 ${iconClass}`}>
        <Icon className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand transition-colors group-hover:text-brand-hover">
        Continue <ArrowRight className="size-4" />
      </span>
    </Link>
  )
}

function EditModeChooser({ productId }) {
  return (
    <div className="page-enter space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
        <Link
          to="/products"
          className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Choose edit action</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">What would you like to edit?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Product details and variations now save through separate flows, so you only update the section you intend to change.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <EditSectionCard
          icon={Package}
          title="Edit product info"
          description="Update product information, images, pricing, inventory, and shipping details in one focused flow."
          to={`/products/${productId}/edit?section=${EDIT_SECTIONS.INFO}`}
        />
        <EditSectionCard
          icon={Layers3}
          title="Edit variations"
          description="Manage variation types, option values, variant pricing, stock, barcodes, and variant images."
          to={`/products/${productId}/edit?section=${EDIT_SECTIONS.VARIATIONS}`}
          accent="cyan"
        />
      </div>
    </div>
  )
}

function EditSuccessPanel({ productId }) {
  const queryClient = useQueryClient()

  const handleBackToProducts = () => {
    queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
  }

  return (
    <div className="page-enter mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white px-5 py-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <CheckCircle2 className="size-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold text-slate-950">What&apos;s next?</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        View how this product appears in your catalogue, edit product info or variants, or return to your product list.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          to={`/products/${productId}/view`}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
        >
          <Eye className="size-4" />
          View product details
        </Link>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={`/products/${productId}/edit?section=${EDIT_SECTIONS.INFO}`}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300"
          >
            <Package className="size-4" />
            Edit product info
          </Link>
          <Link
            to={`/products/${productId}/edit?section=${EDIT_SECTIONS.VARIATIONS}`}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 text-sm font-bold text-cyan-800 transition-colors hover:border-cyan-300 hover:bg-cyan-50"
          >
            <Layers3 className="size-4" />
            Edit variants
          </Link>
        </div>
        <Link
          to="/products"
          onClick={handleBackToProducts}
          className="inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </div>
    </div>
  )
}

function ProductInfoEditForm({
  productId,
  formState,
  onSaved,
  approvedBrands,
  brandsLoading,
  brandsError,
  parentCategories,
  categoryTree,
  categoriesLoading,
  categoriesError,
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [mainImage, setMainImage] = useState(formState.mainImage)
  const [subImages, setSubImages] = useState(formState.subImages)
  const [descriptiveImages, setDescriptiveImages] = useState(formState.descriptiveImages ?? [])
  const [mainImageError, setMainImageError] = useState('')
  const [galleryImagesError, setGalleryImagesError] = useState('')
  const [descriptiveImagesError, setDescriptiveImagesError] = useState('')
  const updateProductInfoMutation = useUpdateProductInfoMutation()
  const createBrandMutation = useCreateBrandMutation()

  const navigateToStep = (stepIndex) => {
    setActiveStep(stepIndex)
    scrollDashboardPanelToTop()
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

    const fields = productInfoStepFields[stepIndex]
    if (fields.length === 0) return true

    const errors = await formik.validateForm()
    formik.setTouched({ ...formik.touched, ...getTouchedForFields(fields, formik.values) }, true)

    if (hasStepErrors(errors, fields)) {
      requestAnimationFrame(() => {
        scrollToFirstError(collectStepErrors(errors, fields))
      })
      return false
    }

    return true
  }

  const handleNext = async (formik) => {
    const valid = await validateStepBeforeLeave(formik, activeStep)
    if (!valid) return
    navigateToStep(Math.min(activeStep + 1, productInfoSteps.length - 1))
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

  const handleSaveProductInfo = async (formik) => {
    if (!mainImage) {
      setMainImageError('Add a main product image before saving')
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ main_product_image: 'Add a main product image before saving' })
      })
      notify.error('Add a main product image before saving.')
      return
    }

    const galleryResult = validateGalleryImagesRequired(mainImage, subImages)
    if (!galleryResult.valid) {
      setGalleryImagesError(galleryResult.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ sub_product_images: galleryResult.message })
      })
      notify.error(galleryResult.message)
      return
    }

    const imageLimits = validateProductImageLimits(mainImage, subImages)
    if (!imageLimits.valid) {
      setMainImageError(imageLimits.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ main_product_image: imageLimits.message })
      })
      notify.error(imageLimits.message)
      return
    }

    const primaryDimensions = await validatePrimaryImageDimensions(mainImage)
    if (!primaryDimensions.valid) {
      setMainImageError(primaryDimensions.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ main_product_image: primaryDimensions.message })
      })
      notify.error(primaryDimensions.message)
      return
    }

    const featuredDimensions = await validateFeaturedImageDimensions(subImages)
    if (!featuredDimensions.valid) {
      setGalleryImagesError(featuredDimensions.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ sub_product_images: featuredDimensions.message })
      })
      notify.error(featuredDimensions.message)
      return
    }

    const descriptiveLimits = validateDescriptiveImageLimits(descriptiveImages)
    if (!descriptiveLimits.valid) {
      setDescriptiveImagesError(descriptiveLimits.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ descriptive_product_images: descriptiveLimits.message })
      })
      notify.error(descriptiveLimits.message)
      return
    }

    const descriptiveDimensions = await validateDescriptiveImageDimensions(descriptiveImages)
    if (!descriptiveDimensions.valid) {
      setDescriptiveImagesError(descriptiveDimensions.message)
      navigateToStep(1)
      requestAnimationFrame(() => {
        scrollToFirstError({ descriptive_product_images: descriptiveDimensions.message })
      })
      notify.error(descriptiveDimensions.message)
      return
    }

    setMainImageError('')
    setGalleryImagesError('')
    setDescriptiveImagesError('')

    const errors = await formik.validateForm()
    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      formik.setTouched(
        errorKeys.reduce((touched, field) => ({ ...touched, [field]: true }), formik.touched),
        true,
      )

      const stepWithError = findFirstStepWithErrors(errors)
      if (stepWithError != null) navigateToStep(stepWithError)

      requestAnimationFrame(() => {
        scrollToFirstError(errors)
      })

      const firstMessage = errorKeys.map((key) => getIn(errors, key)).find(Boolean)
      notify.error(typeof firstMessage === 'string' ? firstMessage : 'Fix the highlighted fields before saving.')
      return
    }

    formik.handleSubmit()
  }

  return (
    <div className="page-enter space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Edit product info</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Product information</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Update product details, photos, pricing, inventory, and shipping without touching variations.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to products
            </Link>
            <Link
              to={`/products/${productId}/edit`}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/25 bg-brand-light/60 px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light"
            >
              <Layers3 className="size-4 shrink-0" />
              Change section
            </Link>
          </div>
        </div>
      </section>

      <Formik
        initialValues={formState.formValues}
        enableReinitialize
        validationSchema={productInfoSchema}
        validateOnBlur
        validateOnChange={false}
        onSubmit={async (values, actions) => {
          try {
            const formValues = { ...values, status: values.status || 'active' }
            const payload = buildProductInfoPayload(formValues, mainImage, subImages, {
              mode: 'edit',
              descriptiveImages,
            })

            if (import.meta.env.DEV) {
              console.log('[edit product info] FormData payload:', formatProductPayloadSample(payload))
            }

            const context = buildProductMutationContext(formValues, {
              parentCategories,
              categoryTree,
              approvedBrands,
            })

            const refreshedProduct = await updateProductInfoMutation.mutateAsync({
              productId,
              formData: payload,
              context,
            })

            if (import.meta.env.DEV) {
              console.log('[edit product info] Refreshed from GET /api/product/:id:', refreshedProduct)
            }

            onSaved(EDIT_SECTIONS.INFO)
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
            <ProductStepper
              steps={productInfoSteps}
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
              {activeStep === 3 && <ShippingStep formik={formik} />}
              {activeStep === 4 && (
                <ReviewStep
                  formik={formik}
                  mainImage={mainImage}
                  subImages={subImages}
                  descriptiveImages={descriptiveImages}
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
                onClick={() => navigateToStep(Math.max(activeStep - 1, 0))}
                disabled={activeStep === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="size-4" /> Back
              </button>

              {activeStep < productInfoSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleNext(formik)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveProductInfo(formik)}
                  disabled={formik.isSubmitting || updateProductInfoMutation.isPending}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formik.isSubmitting || updateProductInfoMutation.isPending ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving…</>
                  ) : (
                    <>Save product info <ArrowRight className="size-4" /></>
                  )}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

// ─── Variant manager helpers ──────────────────────────────────────────────────

const ATTRIBUTE_PRESETS = ['Color', 'Size', 'Material', 'Weight', 'Style', 'Capacity', 'Flavor']

function AttributeIcon({ attribute, className }) {
  switch (attribute) {
    case 'Color':
      return <Palette className={className} />
    case 'Size':
      return <Ruler className={className} />
    case 'Material':
      return <Layers3 className={className} />
    case 'Weight':
      return <WeightIcon className={className} />
    case 'Style':
      return <Sparkles className={className} />
    case 'Capacity':
      return <Boxes className={className} />
    default:
      return <Tag className={className} />
  }
}

const EMPTY_VARIANT_VALUES = {
  attribute: '',
  value: '',
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

function toVariantFormValues(variantValue, attributeType) {
  return {
    attribute: attributeType ?? '',
    value: variantValue.value ?? '',
    variant_name: variantValue.variant_name ?? '',
    sku: variantValue.sku ?? '',
    price: variantValue.price ?? '',
    discount_price: variantValue.discount_price ?? '',
    quantity: variantValue.quantity ?? '',
    reserved_quantity: variantValue.reserved_quantity ?? '',
    low_stock_threshold: variantValue.low_stock_threshold ?? '',
    barcode: variantValue.barcode ?? '',
    images: variantValue.images ?? [],
  }
}

function resolveStockStatus(quantity, threshold) {
  const qty = parseInt(quantity, 10)
  const thresh = parseInt(threshold, 10)
  if (!Number.isFinite(qty) || qty === 0) {
    return { label: 'Out of stock', dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 ring-red-100' }
  }
  if (Number.isFinite(thresh) && thresh > 0 && qty <= thresh) {
    return { label: `Low: ${qty}`, dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100' }
  }
  return { label: `${qty} in stock`, dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100' }
}

function svFieldError(formik, name) {
  const touched = formik.touched[name] || formik.submitCount > 0
  return touched && formik.errors[name] ? formik.errors[name] : ''
}

function getVariantValuePlaceholder(attribute = '') {
  switch (attribute) {
    case 'Color':
      return 'e.g. Red, Blue, Green'
    case 'Size':
      return 'e.g. S, M, L, XL'
    case 'Weight':
      return 'e.g. 250g, 500g, 1kg'
    case 'Material':
      return 'e.g. Cotton, Leather, Nylon'
    case 'Style':
      return 'e.g. Classic, Slim, Relaxed'
    case 'Capacity':
      return 'e.g. 64GB, 128GB, 256GB'
    case 'Flavor':
      return 'e.g. Vanilla, Chocolate, Strawberry'
    default:
      return attribute ? `e.g. value for ${attribute}` : 'e.g. Black, Large, Cotton…'
  }
}

// ─── Single Variant Form ──────────────────────────────────────────────────────

function CardStepHeader({ step, title, subtitle, required = false }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
        {step}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-slate-900">
          {title}
          {required && (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-100">
              Required
            </span>
          )}
        </p>
        {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function VariantPreviewChip({ attribute, value, isEdit }) {
  const hasContent = Boolean(attribute || value)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
        <AttributeIcon attribute={attribute} className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {isEdit ? 'Editing variant' : 'New variant'}
        </p>
        <p className="truncate text-sm font-bold text-slate-900">
          {hasContent
            ? `${attribute || 'Type'} · ${value || 'Value'}`
            : 'Choose a type and value below'}
        </p>
      </div>
    </div>
  )
}

function SingleVariantForm({ mode, initialValues, productValues, onSave, onSaveAndAddAnother, onCancel, isSaving }) {
  const isEdit = mode === 'edit'
  const mainQty = productValues?.quantity ? Number(productValues.quantity) : null
  const [showAdvanced, setShowAdvanced] = useState(() =>
    Boolean(initialValues.variant_name || initialValues.sku || initialValues.barcode),
  )
  const [isCustomPrice, setIsCustomPrice] = useState(() =>
    initialValues.price !== '' && initialValues.price != null,
  )
  const [justAddedAnother, setJustAddedAnother] = useState(false)

  useEffect(() => {
    if (!justAddedAnother) return undefined
    const timer = setTimeout(() => setJustAddedAnother(false), 4000)
    return () => clearTimeout(timer)
  }, [justAddedAnother])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={singleVariantSchema}
      validationContext={mainQty != null ? { mainProductQuantity: mainQty } : undefined}
      validateOnBlur
      validateOnChange={false}
      onSubmit={async (values, actions) => {
        try {
          await onSave(values)
        } finally {
          actions.setSubmitting(false)
        }
      }}
    >
      {(formik) => {
        const attributeType = formik.values.attribute || initialValues.attribute || ''
        const valuePlaceholder = getVariantValuePlaceholder(attributeType)
        const pricing = resolveVariantPricing(formik.values, productValues)

        const handleSaveAndAddAnother = async () => {
          formik.setStatus('add-another')
          formik.setSubmitting(true)
          try {
            const errors = await formik.validateForm()
            if (Object.keys(errors).length > 0) {
              formik.setTouched(
                Object.keys(errors).reduce((touched, key) => ({ ...touched, [key]: true }), {}),
                false,
              )
              return
            }
            await onSaveAndAddAnother(formik.values)
            formik.resetForm({ values: { ...EMPTY_VARIANT_VALUES, attribute: formik.values.attribute } })
            setShowAdvanced(false)
            setIsCustomPrice(false)
            setJustAddedAnother(true)
          } finally {
            formik.setSubmitting(false)
            formik.setStatus(undefined)
          }
        }

        return (
          <Form className="space-y-6">
          <VariantPreviewChip attribute={attributeType} value={formik.values.value} isEdit={isEdit} />

          {justAddedAnother && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0" />
              Value added. Keep adding more {attributeType || 'option'} values below, or head back when you're done.
            </div>
          )}

          {/* Step 1: Variation type */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={1}
              title="What are you offering options for?"
              subtitle="Pick a common type, or type your own custom attribute."
              required
            />
            <div className="mb-4 flex flex-wrap gap-2">
              {ATTRIBUTE_PRESETS.map((preset) => {
                const active = formik.values.attribute === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => formik.setFieldValue('attribute', preset)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand/50 hover:text-brand'
                    }`}
                  >
                    <AttributeIcon attribute={preset} className="size-3.5" />
                    {preset}
                  </button>
                )
              })}
            </div>
            <ProductInput
              id="attribute"
              name="attribute"
              label="Or enter your own type"
              hint="e.g. Voltage, Finish, Fragrance"
              placeholder="e.g. Material"
              value={formik.values.attribute}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={svFieldError(formik, 'attribute')}
            />
          </div>

          {/* Step 2: Value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={2}
              title="Set the value for this option"
              subtitle="This is what customers will pick, e.g. a specific colour or size."
              required
            />
            <ProductInput
              id="value"
              name="value"
              label={attributeType ? `${attributeType} value` : 'Variation value'}
              hint={valuePlaceholder}
              placeholder={valuePlaceholder.replace(/^e\.g\.\s*/, '')}
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={svFieldError(formik, 'value')}
            />

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-brand"
            >
              {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {showAdvanced ? 'Hide extra details' : 'Add display name, SKU or barcode (optional)'}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <ProductInput
                  id="variant_name"
                  name="variant_name"
                  label="Variant display name"
                  hint={`Defaults to "${formik.values.value || 'value'}" if empty.`}
                  optional
                  placeholder={formik.values.value || 'e.g. Midnight Black'}
                  value={formik.values.variant_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'variant_name')}
                />
                <ProductInput
                  id="sku"
                  name="sku"
                  label="Variant SKU"
                  hint="Leave blank to use the product SKU"
                  optional
                  placeholder="AUD-001-BLK"
                  value={formik.values.sku}
                  onChange={(e) => formik.setFieldValue('sku', e.target.value.toUpperCase())}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'sku')}
                />
                <ProductInput
                  id="barcode"
                  name="barcode"
                  label="Barcode"
                  hint="UPC, EAN, or ISBN"
                  optional
                  placeholder="1234567890123"
                  value={formik.values.barcode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'barcode')}
                />
              </div>
            )}
          </div>

          {/* Step 3: Images */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={3}
              title="Add a photo for this value"
              subtitle="Shown to customers when they select this option. First photo is the primary image."
              required
            />
            <VariantImageUpload
              label="Variant images"
              images={formik.values.images}
              onChange={(images) => {
                formik.setFieldValue('images', images)
                formik.setFieldTouched('images', true, false)
              }}
              error={svFieldError(formik, 'images')}
            />
          </div>

          {/* Step 4: Pricing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader
              step={4}
              title="Pricing"
              subtitle="Use the base product's price, or set a custom price just for this value."
            />
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsCustomPrice(false)
                  formik.setFieldValue('price', '')
                  formik.setFieldValue('discount_price', '')
                }}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  !isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Use base price
              </button>
              <button
                type="button"
                onClick={() => setIsCustomPrice(true)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Custom price
              </button>
            </div>

            {isCustomPrice && (
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <ProductMoneyInput
                  id="price"
                  name="price"
                  label="List price (GH₵)"
                  placeholder={formatMoney(pricing.parent.regularPrice)}
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'price')}
                />
                <ProductMoneyInput
                  id="discount_price"
                  name="discount_price"
                  label="Sale price (GH₵)"
                  hint="Leave empty to inherit base sale price."
                  optional
                  placeholder={
                    pricing.parent.salePrice != null
                      ? formatMoney(pricing.parent.salePrice)
                      : 'No base sale price'
                  }
                  value={formik.values.discount_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={svFieldError(formik, 'discount_price')}
                />
              </div>
            )}

            <VariantPricingSummary variantValue={formik.values} productValues={productValues} />
          </div>

          {/* Step 5: Stock */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
            <CardStepHeader step={5} title="Stock quantity" required />
            <div className="grid items-stretch gap-4 sm:grid-cols-1 lg:max-w-xs">
              <ProductInput
                id="quantity"
                name="quantity"
                type="number"
                label="Units in stock"
                hint={
                  mainQty != null
                    ? `Max ${mainQty} units (main product stock).`
                    : 'Set main stock on the product first.'
                }
                placeholder="0"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={svFieldError(formik, 'quantity')}
              />
              {/* Reserved quantity and low stock alert hidden for variant add/edit for now. */}
              {/* <ProductInput
                id="reserved_quantity"
                name="reserved_quantity"
                type="number"
                label="Reserved quantity · Optional"
                reserveHintSpace
                hint="Held for pending orders"
                placeholder="0"
                value={formik.values.reserved_quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={svFieldError(formik, 'reserved_quantity')}
              />
              <ProductInput
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                label="Low stock alert · Optional"
                reserveHintSpace
                hint="Optional. Cannot exceed stock quantity."
                placeholder="10"
                value={formik.values.low_stock_threshold}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={svFieldError(formik, 'low_stock_threshold')}
              /> */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              disabled={formik.isSubmitting || isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft className="size-4" />
              Back to variants
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {!isEdit && onSaveAndAddAnother && (
                <button
                  type="button"
                  onClick={handleSaveAndAddAnother}
                  disabled={formik.isSubmitting || isSaving}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand-light/50 px-5 py-3 text-sm font-bold text-brand transition-colors hover:border-brand/50 hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formik.isSubmitting && formik.status === 'add-another' ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Plus className="size-4" /> Save & add another value</>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={formik.isSubmitting || isSaving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formik.isSubmitting && formik.status !== 'add-another' ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving…</>
                ) : isEdit ? (
                  <>Save changes <ArrowRight className="size-4" /></>
                ) : (
                  <>Add variant & finish <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          </div>
          </Form>
        )
      }}
    </Formik>
  )
}

// ─── Variant card (list row) ──────────────────────────────────────────────────

function VariantCard({ variation, variantValue, onEdit, onRemove }) {
  const stock = resolveStockStatus(variantValue.quantity, variantValue.low_stock_threshold)
  const thumbnail = variantValue.images?.[0]?.preview
  const hasPrice = variantValue.price !== '' && variantValue.price != null
  const hasSale = variantValue.discount_price !== '' && variantValue.discount_price != null
  const displayName = variantValue.variant_name || variantValue.value || '—'

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md sm:flex sm:items-center sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 sm:size-16">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-slate-50">
              <Package className="size-5 text-slate-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1.5">
            <p className="text-sm font-bold leading-snug text-slate-900 sm:text-base">
              {displayName}
            </p>
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-100">
              <Tag className="size-2.5 shrink-0" />
              <span className="truncate">
                {variation.attribute}: {variantValue.value}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            {variantValue.sku ? (
              <span className="text-xs text-slate-400">SKU: {variantValue.sku}</span>
            ) : null}
            {hasPrice && (
              <span className="text-xs font-semibold text-slate-700">
                {hasSale ? (
                  <>
                    <span className="whitespace-nowrap text-brand">
                      GH₵ {Number(variantValue.discount_price).toFixed(2)}
                    </span>
                    {' '}
                    <span className="whitespace-nowrap text-slate-400 line-through">
                      GH₵ {Number(variantValue.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">
                    GH₵ {Number(variantValue.price).toFixed(2)}
                  </span>
                )}
              </span>
            )}
            <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${stock.badgeClass}`}>
              <span className={`size-1.5 rounded-full ${stock.dotClass}`} />
              {stock.label}
            </span>
          </div>
        </div>
      </div>

      {/* Actions — full width on mobile, inline on sm+ */}
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 sm:mt-0 sm:w-auto sm:shrink-0 sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand sm:flex-none sm:rounded-lg sm:py-1.5"
          aria-label={`Edit ${displayName} variant`}
        >
          <Edit2 className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 sm:flex-none sm:rounded-lg sm:py-1.5"
          aria-label={`Remove ${displayName} variant`}
        >
          <Trash2 className="size-3.5" />
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Variants list view ───────────────────────────────────────────────────────

function VariantListView({ productId, entries, onAdd, onEdit, onFinished, deleteVariantMutation }) {
  const [removeTarget, setRemoveTarget] = useState(null)

  const handleConfirmRemove = async () => {
    if (!removeTarget) return
    await deleteVariantMutation.mutateAsync({
      productId,
      productVariantId: removeTarget.variantValue.id,
    })
    setRemoveTarget(null)
  }

  const groupedByAttribute = entries.reduce((groups, entry) => {
    const key = entry.variation.attribute || 'Options'
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
    return groups
  }, {})
  const attributeCount = Object.keys(groupedByAttribute).length

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Manage variations</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Product variants</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Edit or remove existing variants, or add new values to expand your product options.
            </p>
            {entries.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {entries.length} variant{entries.length !== 1 ? 's' : ''}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {attributeCount} attribute{attributeCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to products
            </Link>
            <Link
              to={`/products/${productId}/edit`}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand/25 bg-brand-light/60 px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light"
            >
              <Layers3 className="size-4 shrink-0" />
              Change section
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onAdd()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="size-4" />
            Add variant
          </button>
          <button
            type="button"
            onClick={onFinished}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(199,59,45,0.2)] transition-colors hover:bg-brand-hover"
          >
            <CheckCircle2 className="size-4" />
            Done
          </button>
        </div>
      </section>

      {/* Variant groups */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-14 text-center">
          <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
            <Layers3 className="size-6" />
          </span>
          <p className="text-sm font-bold text-slate-900">No variants yet</p>
          <p className="mt-1 text-sm text-slate-500">Add your first variant to offer product options.</p>
          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left text-xs text-slate-500 sm:flex-row sm:items-start sm:gap-4 sm:text-center">
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">1. Choose a type</strong>
              Color, Size, Weight or your own
            </span>
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">2. Add values</strong>
              Red, Blue, Large, etc.
            </span>
            <span className="flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <strong className="block text-slate-700">3. Set price & photo</strong>
              For each value
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAdd()}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Add first variant
          </button>
        </div>
      ) : (
        Object.entries(groupedByAttribute).map(([attribute, group]) => {
          return (
            <div key={attribute} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <AttributeIcon attribute={attribute} className="size-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{attribute}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {group.length} option{group.length !== 1 ? 's' : ''}
                </span>
                <span className="h-px flex-1 bg-slate-100" />
                <button
                  type="button"
                  onClick={() => onAdd(attribute)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand transition-colors hover:bg-brand-light/60"
                >
                  <Plus className="size-3.5" />
                  Add value
                </button>
              </div>
              {group.map(({ variation, variantValue }) => (
                <VariantCard
                  key={variantValue.id}
                  variation={variation}
                  variantValue={variantValue}
                  onEdit={() => onEdit({ variation, variantValue })}
                  onRemove={() => setRemoveTarget({ variation, variantValue })}
                />
              ))}
            </div>
          )
        })
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={Boolean(removeTarget)}
        tone="danger"
        title="Remove variant?"
        description={
          removeTarget
            ? `Remove the "${removeTarget.variantValue.variant_name || removeTarget.variantValue.value}" variant? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove variant"
        loadingLabel="Removing…"
        isLoading={deleteVariantMutation.isPending}
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  )
}

// ─── Variations edit form (mode manager) ─────────────────────────────────────

function VariationsEditForm({ productId, formState, onFinished }) {
  const [mode, setMode] = useState('list') // 'list' | 'edit' | 'add'
  const [editingEntry, setEditingEntry] = useState(null)
  const [addPrefillAttribute, setAddPrefillAttribute] = useState('')

  const updateSingleVariantMutation = useUpdateSingleVariantMutation()
  const createVariantMutation = useCreateProductVariantMutation()
  const deleteVariantMutation = useDeleteProductVariantMutation()

  const productValues = formState.formValues
  const entries = iterateVariantFormEntries(productValues.variations)

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setMode('edit')
  }

  const handleAdd = (prefillAttribute = '') => {
    setAddPrefillAttribute(prefillAttribute)
    setMode('add')
  }

  const handleSaveEdit = async (variantFormValues) => {
    const variantId = editingEntry.variantValue.id
    if (!isPersistedVariantId(variantId)) return
    await updateSingleVariantMutation.mutateAsync({
      productId,
      variantId,
      variantFormValues,
      productValues,
    })
    setMode('list')
    setEditingEntry(null)
  }

  const handleSaveAdd = async (variantFormValues) => {
    await createVariantMutation.mutateAsync({ productId, variantFormValues, productValues })
    setMode('list')
  }

  const handleSaveAddAnother = async (variantFormValues) => {
    await createVariantMutation.mutateAsync({ productId, variantFormValues, productValues })
  }

  const pageHeader = (title, subtitle) => (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
      <button
        type="button"
        onClick={() => { setMode('list'); setEditingEntry(null) }}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Back to variants
      </button>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Edit variations</p>
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
    </section>
  )

  if (mode === 'edit' && editingEntry) {
    return (
      <div className="page-enter space-y-5">
        {pageHeader(
          `Edit: ${editingEntry.variantValue.variant_name || editingEntry.variantValue.value || 'Variant'}`,
          "Update this variant's details, pricing, inventory, and images.",
        )}
        <SingleVariantForm
          mode="edit"
          initialValues={toVariantFormValues(editingEntry.variantValue, editingEntry.variation.attribute)}
          productValues={productValues}
          onSave={handleSaveEdit}
          onCancel={() => { setMode('list'); setEditingEntry(null) }}
          isSaving={updateSingleVariantMutation.isPending}
        />
      </div>
    )
  }

  if (mode === 'add') {
    return (
      <div className="page-enter space-y-5">
        {pageHeader('Add new variant', 'Define a new product option with its own price, photo, and stock. Keep adding values without leaving this page.')}
        <SingleVariantForm
          mode="add"
          initialValues={{ ...EMPTY_VARIANT_VALUES, attribute: addPrefillAttribute }}
          productValues={productValues}
          onSave={handleSaveAdd}
          onSaveAndAddAnother={handleSaveAddAnother}
          onCancel={() => setMode('list')}
          isSaving={createVariantMutation.isPending}
        />
      </div>
    )
  }

  return (
    <VariantListView
      productId={productId}
      entries={entries}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onFinished={onFinished}
      deleteVariantMutation={deleteVariantMutation}
    />
  )
}

export default function EditProduct() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: product, isLoading, isError, refetch } = useProduct(productId)
  const formState = product ? mapProductRecordToFormState(product) : null
  const section = searchParams.get('section')
  const finished = searchParams.get('finished') === '1'
  const needsEditorOptions = section === EDIT_SECTIONS.INFO
  const canLoadEditorOptions = needsEditorOptions && !isLoading && Boolean(product)
  const {
    data: approvedBrands = [],
    isLoading: brandsLoading,
    isError: brandsError,
  } = useApprovedBrands({ enabled: canLoadEditorOptions })
  const {
    parentCategories,
    categoryTree,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategoryOptions({ enabled: canLoadEditorOptions })

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Product">
        <div className="flex items-center justify-center gap-2 px-5 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading product details…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !formState) {
    return (
      <DashboardLayout pageTitle="Edit Product">
        <div className="page-enter mx-auto max-w-xl space-y-4 px-5 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-600">
              We could not load this product. It may have been removed or you may not have access.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300"
            >
              Try again
            </button>
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" />
              Back to products
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (
    finished
    && (section === EDIT_SECTIONS.INFO || section === EDIT_SECTIONS.VARIATIONS)
  ) {
    return (
      <DashboardLayout pageTitle="Edit Product">
        <EditSuccessPanel productId={productId} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Edit Product">
      {section === EDIT_SECTIONS.INFO && (
        <ProductInfoEditForm
          productId={productId}
          formState={formState}
          onSaved={() => navigate(`/products/${productId}/edit?section=${EDIT_SECTIONS.INFO}&finished=1`)}
          approvedBrands={approvedBrands}
          brandsLoading={brandsLoading}
          brandsError={brandsError}
          parentCategories={parentCategories}
          categoryTree={categoryTree}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
        />
      )}
      {section === EDIT_SECTIONS.VARIATIONS && (
        <VariationsEditForm
          productId={productId}
          formState={formState}
          onFinished={() => navigate(`/products/${productId}/edit?section=${EDIT_SECTIONS.VARIATIONS}&finished=1`)}
        />
      )}
      {section !== EDIT_SECTIONS.INFO && section !== EDIT_SECTIONS.VARIATIONS && (
        <EditModeChooser productId={productId} />
      )}
    </DashboardLayout>
  )
}
