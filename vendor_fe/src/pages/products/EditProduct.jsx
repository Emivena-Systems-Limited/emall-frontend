import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Form, Formik, getIn } from 'formik'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Layers3,
  Loader2,
  Package,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EditProductImagesStep from '../../components/products/EditProductImagesStep'
import ProductStepper from '../../components/products/ProductStepper'
import { InfoStep, PricingStep, ReviewStep, ShippingStep } from './AddProduct'
import VariationsEditForm from '../../components/variants/VariationsEditForm'
import { useApprovedBrands } from '../../hooks/useBrands'
import { useCreateBrandMutation } from '../../hooks/useBrandMutations'
import { useProductCategoryOptions } from '../../hooks/useCategories'
import { useUpdateProductInfoMutation } from '../../hooks/useProductMutations'
import { useProductMediaUpload } from '../../hooks/useProductMediaUpload'
import { useProduct, productQueryKeys } from '../../hooks/useProducts'
import { USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD } from '../../constants/productMediaUpload'
import { mapProductRecordToFormState } from '../../utils/mapProductToFormValues'
import { captureProductImageBaseline, summarizeProductImageChanges } from '../../utils/productImageEditUtils'
import {
  buildProductMediaPresignRequest,
  buildProductMediaSaveImagesPayload,
  hasPendingProductMediaUploads,
} from '../../utils/productMediaUploadUtils'
import { productInfoSchema } from '../../utils/validationSchemas'
import {
  validateProductImageLimits,
  validateDescriptiveImageLimits,
  validateDescriptiveImageDimensions,
  validateFeaturedImageDimensions,
  validateGalleryImagesRequired,
  validatePrimaryImageDimensions,
} from '../../utils/productImageUtils'
import { buildProductInfoPayload, formatProductPayloadSample } from '../../utils/productPayload'
import { collectStepErrors, scrollToFirstError } from '../../utils/scrollToFirstError'
import { scrollDashboardPanelToTop } from '../../utils/scrollDashboardPanelToTop'
import { findCategoryById } from '../../utils/normalizeCategories'
import { findBrandById, getBrandDisplayLabel } from '../../utils/normalizeBrands'
import { getDiscountSummary } from '../../utils/productPricing'
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
  const [imageBaseline] = useState(() => captureProductImageBaseline(formState))
  const updateProductInfoMutation = useUpdateProductInfoMutation()
  const createBrandMutation = useCreateBrandMutation()
  const { uploadPendingMedia, isUploading: isUploadingMedia } = useProductMediaUpload()

  const imageChangeSummary = useMemo(
    () => summarizeProductImageChanges(imageBaseline, {
      mainImage,
      subImages,
      descriptiveImages,
    }),
    [imageBaseline, mainImage, subImages, descriptiveImages],
  )

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
            const usePresignedUpload = USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD

            const mediaState = {
              mainImage,
              subImages,
              descriptiveImages,
              variations: [],
            }

            if (import.meta.env.DEV) {
              console.log('[edit product info] media presign request:', buildProductMediaPresignRequest(mediaState))
            }

            let nextMediaState = mediaState

            if (usePresignedUpload && hasPendingProductMediaUploads(buildProductMediaPresignRequest(mediaState))) {
              nextMediaState = await uploadPendingMedia(mediaState)
              setMainImage(nextMediaState.mainImage)
              setSubImages(nextMediaState.subImages)
              setDescriptiveImages(nextMediaState.descriptiveImages ?? [])

              if (import.meta.env.DEV) {
                console.log(
                  '[edit product info] media save payload:',
                  buildProductMediaSaveImagesPayload(nextMediaState),
                )
              }
            }

            const nextImageChanges = summarizeProductImageChanges(imageBaseline, nextMediaState)

            const payload = buildProductInfoPayload(formValues, nextMediaState.mainImage, nextMediaState.subImages, {
              mode: 'edit',
              descriptiveImages: nextMediaState.descriptiveImages,
              removedProductImageIds: nextImageChanges.removedProductImageIds,
              removedDescriptiveImageIds: nextImageChanges.removedDescriptiveImageIds,
            })

            if (import.meta.env.DEV) {
              console.log('[edit product info] image changes:', nextImageChanges)
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
                <EditProductImagesStep
                  imageBaseline={imageBaseline}
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
                  imageChangeSummary={imageChangeSummary}
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
                  disabled={formik.isSubmitting || updateProductInfoMutation.isPending || isUploadingMedia}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formik.isSubmitting || updateProductInfoMutation.isPending || isUploadingMedia ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {isUploadingMedia ? 'Uploading photos…' : 'Saving…'}
                    </>
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
          key={productId}
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
