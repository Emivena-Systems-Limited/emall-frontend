import { useState } from 'react'
import { FieldArray, Form, Formik, getIn } from 'formik'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Info,
  Layers3,
  ListChecks,
  PackageSearch,
  Plus,
  Save,
  Sparkles,
  Store,
  Trash2,
  Video,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductStepper from '../../components/products/ProductStepper'
import ProductRichTextEditor from '../../components/products/ProductRichTextEditor'
import SearchableSelect from '../../components/auth/SearchableSelect'
import {
  GuidanceCard,
  ProductInput,
  ProductSelect,
} from '../../components/products/ProductFormControls'
import {
  METADATA_TEMPLATES,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  PRODUCT_STATUSES,
} from '../../constants/productData'
import { productListingSchema } from '../../utils/validationSchemas'
import { buildProductPayload } from '../../utils/productPayload'
import notify from '../../lib/notify'

const steps = [
  { id: 'basics', title: 'Basics', caption: 'Name, SKU, story' },
  { id: 'classification', title: 'Classify', caption: 'Category, brand' },
  { id: 'stock', title: 'Stock', caption: 'Price, quantity' },
  { id: 'specifics', title: 'Details', caption: 'Specs and attributes' },
  { id: 'review', title: 'Review', caption: 'Check everything' },
]

const stepFields = [
  ['name', 'sku', 'description'],
  ['category_slug', 'subcategory_slug', 'brand_slug'],
  ['status', 'price', 'quantity', 'image_urls', 'videos'],
  ['metadata'],
  [],
]

const initialValues = {
  name: '',
  sku: '',
  description: '',
  category_slug: '',
  subcategory_slug: '',
  brand_slug: '',
  status: 'draft',
  price: '',
  quantity: '',
  image_urls: [''],
  videos: [{ title: '', video_url: '' }],
  metadata: [{ key: 'color', value: '' }, { key: 'weight', value: '' }],
}

function getTouchedForFields(fields, values) {
  return fields.reduce((touched, field) => {
    if (field === 'image_urls') {
      return { ...touched, image_urls: values.image_urls.map(() => true) }
    }
    if (field === 'videos') {
      return {
        ...touched,
        videos: values.videos.map(() => ({ title: true, video_url: true })),
      }
    }
    if (field === 'metadata') {
      return {
        ...touched,
        metadata: values.metadata.map(() => ({ key: true, value: true })),
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

function PageHeader() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
      <Link
        to="/products"
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">New listing</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Add a product customers will trust
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Create a clear, complete listing with the right category, brand, media, pricing, and product details so shoppers can find it quickly and buy with confidence.
          </p>
        </div>
      </div>
    </section>
  )
}

function BasicsStep({ formik }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <ProductInput
          id="name"
          name="name"
          label="Product name"
          hint="Use the marketplace-facing name customers will search for."
          placeholder="Wireless Earbuds Pro"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={getFieldError(formik, 'name')}
        />
        <ProductInput
          id="sku"
          name="sku"
          label="SKU"
          hint="Keep it unique and readable. Letters, numbers, and hyphens work best."
          placeholder="AUD-WEP-001"
          value={formik.values.sku}
          onChange={(e) => formik.setFieldValue('sku', e.target.value.toUpperCase())}
          onBlur={formik.handleBlur}
          error={getFieldError(formik, 'sku')}
        />
        <ProductRichTextEditor
          id="description"
          name="description"
          label="Description"
          hint="Explain what the buyer gets, what problem it solves, and what is included. You can add images via the toolbar, paste, or drag and drop."
          value={formik.values.description}
          onChange={(html) => formik.setFieldValue('description', html)}
          onBlur={formik.handleBlur}
          error={getFieldError(formik, 'description')}
        />
      </div>
      <GuidanceCard icon={Info} title="Write for buyers">
        <p>Good product data reduces support questions and improves search matching.</p>
        <p>Use a precise SKU because it links stock, fulfilment, media, and future variants.</p>
      </GuidanceCard>
    </div>
  )
}

const categoryOptions = MOCK_CATEGORIES.map((category) => ({
  value: category.slug,
  label: category.name,
}))

const brandOptions = MOCK_BRANDS.map((brand) => ({
  value: brand.slug,
  label: brand.label,
}))

function ClassificationStep({ formik, selectedCategory }) {
  const selectedSubcategory = selectedCategory?.subcategories.find(
    (item) => item.slug === formik.values.subcategory_slug,
  )
  const selectedBrand = MOCK_BRANDS.find((item) => item.slug === formik.values.brand_slug)
  const subcategoryOptions = selectedCategory?.subcategories.map((item) => ({
    value: item.slug,
    label: item.name,
  })) ?? []

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Where it belongs</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
              Category and product type
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Search and pick the department and product type that best match this item. This helps customers find it when browsing or filtering the store.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              id="category_slug"
              name="category_slug"
              label="Category"
              icon={Layers3}
              placeholder="Search categories…"
              options={categoryOptions}
              value={formik.values.category_slug}
              onChange={(event) => {
                formik.setFieldValue('category_slug', event.target.value, true)
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
              placeholder={selectedCategory ? 'Search product types…' : 'Choose a category first'}
              options={subcategoryOptions}
              value={formik.values.subcategory_slug}
              disabled={!selectedCategory}
              onChange={(event) => {
                const subcategory = selectedCategory?.subcategories.find(
                  (item) => item.slug === event.target.value,
                )
                formik.setFieldValue('subcategory_slug', event.target.value, true)
                formik.setFieldValue('metadata', templateRows(subcategory?.type), false)
                formik.setFieldTouched('subcategory_slug', true, false)
              }}
              onBlur={formik.handleBlur}
              error={getFieldError(formik, 'subcategory_slug')}
            />
          </div>

          {selectedCategory && (
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
              <p className="text-xs font-bold text-cyan-900">{selectedCategory.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-cyan-900/75">{selectedCategory.guide}</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-950">Brand</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Search for the brand on this product so shoppers can filter by brand and recognize it on the listing page.
            </p>
          </div>
          <SearchableSelect
            id="brand_slug"
            name="brand_slug"
            label="Brand name"
            icon={Store}
            placeholder="Search brands…"
            options={brandOptions}
            value={formik.values.brand_slug}
            onChange={(event) => {
              formik.setFieldValue('brand_slug', event.target.value, true)
              formik.setFieldTouched('brand_slug', true, false)
            }}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'brand_slug')}
          />
        </section>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
            <Layers3 className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold">Product placement preview</h3>
            <p className="text-xs text-white/45">This is how customers will browse and filter the product.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ['Category', selectedCategory?.name, 'Where the product appears in the marketplace'],
            ['Product type', selectedSubcategory?.name, 'Helps customers narrow their search'],
            ['Brand', selectedBrand?.label, 'Shown on the product page and in brand filters'],
          ].map(([label, value, helper]) => (
            <div key={label} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</p>
              <p className="mt-1 text-sm font-bold text-white">{value || 'Not selected'}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-cyan-100/65">{helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-cyan-400/10 p-4 ring-1 ring-cyan-300/20">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-100">
            <Sparkles className="size-4" />
            Suggested product details
          </div>
          <p className="text-xs leading-relaxed text-cyan-50/70">
            {selectedSubcategory
              ? `${selectedSubcategory.name} will suggest ${templateRows(selectedSubcategory.type).length} helpful product details in the next step.`
              : 'Choose a product type to get tailored detail suggestions in the next step.'}
          </p>
        </div>
      </aside>
    </div>
  )
}

function StockAndMediaStep({ formik }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <ProductSelect
            id="status"
            name="status"
            label="Listing status"
            hint="Use Draft until the listing is ready."
            options={PRODUCT_STATUSES}
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'status')}
          />
          <ProductInput
            id="price"
            name="price"
            type="number"
            label="Unit price"
            hint="Ghana cedi value."
            placeholder="245"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'price')}
          />
          <ProductInput
            id="quantity"
            name="quantity"
            type="number"
            label="Opening quantity"
            hint="Current stock count."
            placeholder="42"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getFieldError(formik, 'quantity')}
          />
        </div>

        <MediaFields formik={formik} />
      </div>
      <GuidanceCard icon={ImagePlus} title="Media requirements">
        <p>Add at least one image URL so shoppers can see what they are buying.</p>
        <p>Videos are optional, but each video URL should have a clear title when provided.</p>
      </GuidanceCard>
    </div>
  )
}

function MediaFields({ formik }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <FieldArray name="image_urls">
        {({ push, remove }) => (
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ImagePlus className="size-4 text-cyan-700" /> Product images
              </h3>
              <button type="button" onClick={() => push('')} className="cursor-pointer text-xs font-bold text-brand hover:text-brand-hover">
                Add image
              </button>
            </div>
            <div className="space-y-3">
              {formik.values.image_urls.map((url, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ProductInput
                    id={`image_urls.${index}`}
                    name={`image_urls.${index}`}
                    label={`Image URL ${index + 1}`}
                    placeholder="https://cdn.example.com/product.jpg"
                    value={url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError(formik, `image_urls.${index}`)}
                  />
                  {formik.values.image_urls.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="mt-8 flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </FieldArray>

      <FieldArray name="videos">
        {({ push, remove }) => (
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Video className="size-4 text-cyan-700" /> Product videos
              </h3>
              <button type="button" onClick={() => push({ title: '', video_url: '' })} className="cursor-pointer text-xs font-bold text-brand hover:text-brand-hover">
                Add video
              </button>
            </div>
            <div className="space-y-3">
              {formik.values.videos.map((video, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-start">
                    <ProductInput
                      id={`videos.${index}.title`}
                      name={`videos.${index}.title`}
                      label="Title"
                      placeholder="Unboxing"
                      value={video.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `videos.${index}.title`)}
                    />
                    <ProductInput
                      id={`videos.${index}.video_url`}
                      name={`videos.${index}.video_url`}
                      label="Video URL"
                      placeholder="https://video.example.com/watch"
                      value={video.video_url}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={getFieldError(formik, `videos.${index}.video_url`)}
                    />
                    {formik.values.videos.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="mt-8 flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </FieldArray>
    </div>
  )
}

function SpecificsStep({ formik, selectedSubcategory }) {
  const suggestedDetails = METADATA_TEMPLATES[selectedSubcategory?.type] ?? METADATA_TEMPLATES.default

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <FieldArray name="metadata">
        {({ push, remove }) => (
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product details</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add the specs shoppers compare — color, size, storage, material, and more. Use our suggestions or enter your own.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('metadata', templateRows(selectedSubcategory?.type))}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-200 hover:text-cyan-700"
                >
                  <Sparkles className="size-3.5" /> Use suggestions
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('metadata', [{ key: '', value: '' }])}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-brand-muted hover:text-brand"
                >
                  Start from scratch
                </button>
                <button
                  type="button"
                  onClick={() => push({ key: '', value: '' })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Plus className="size-3.5" /> Add detail
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {formik.values.metadata.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                  <ProductInput
                    id={`metadata.${index}.key`}
                    name={`metadata.${index}.key`}
                    label="Detail name"
                    placeholder={suggestedDetails[index]?.label ?? 'Color'}
                    value={row.key}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError(formik, `metadata.${index}.key`)}
                  />
                  <ProductInput
                    id={`metadata.${index}.value`}
                    name={`metadata.${index}.value`}
                    label="Value"
                    placeholder={suggestedDetails[index]?.placeholder ?? 'Black'}
                    value={row.value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError(formik, `metadata.${index}.value`)}
                  />
                  {formik.values.metadata.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="mt-8 flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </FieldArray>

      <GuidanceCard icon={Sparkles} title="Suggested details">
        <p>Suggestions update based on the product type you chose, but you can edit or replace any of them.</p>
        <p>Add anything else buyers might ask about, such as warranty, dimensions, or what is included in the box.</p>
        <div className="flex flex-wrap gap-2">
          {suggestedDetails.map((field) => (
            <span key={field.key} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {field.label}
            </span>
          ))}
        </div>
      </GuidanceCard>
    </div>
  )
}

function ReviewStep({ values, selectedCategory, selectedSubcategory, selectedBrand }) {
  const filledDetails = values.metadata.filter((row) => row.key?.trim() && row.value?.trim())
  const imageCount = values.image_urls.filter((url) => url?.trim()).length
  const videoCount = values.videos.filter((video) => video.video_url?.trim()).length

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <ListChecks className="size-4 text-cyan-700" /> Listing summary
        </h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ['Product', values.name],
            ['SKU', values.sku],
            ['Category', selectedCategory?.name],
            ['Product type', selectedSubcategory?.name],
            ['Brand', selectedBrand?.label],
            ['Status', values.status],
            ['Price', values.price ? `GH₵ ${Number(values.price).toLocaleString()}` : '—'],
            ['Quantity', values.quantity || '—'],
            ['Images', imageCount ? `${imageCount} added` : '—'],
            ['Videos', videoCount ? `${videoCount} added` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <CheckCircle2 className="size-4 text-emerald-600" /> Product details
        </h3>
        {filledDetails.length > 0 ? (
          <dl className="space-y-2">
            {filledDetails.map((row, index) => (
              <div key={`${row.key}-${index}`} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{row.key}</dt>
                <dd className="text-right text-sm font-semibold text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
            No extra product details were added.
          </p>
        )}
      </section>
    </div>
  )
}

export default function AddProduct() {
  const [activeStep, setActiveStep] = useState(0)
  const navigate = useNavigate()

  const handleNext = async (formik) => {
    const errors = await formik.validateForm()
    const fields = stepFields[activeStep]
    formik.setTouched({ ...formik.touched, ...getTouchedForFields(fields, formik.values) }, true)
    if (hasStepErrors(errors, fields)) return
    setActiveStep((step) => Math.min(step + 1, steps.length - 1))
  }

  return (
    <DashboardLayout pageTitle="Add Product">
      <div className="page-enter space-y-5">
        <PageHeader />
        <Formik
          initialValues={initialValues}
          validationSchema={productListingSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={(values, actions) => {
            const payload = buildProductPayload(values)
            console.log('Product payload', payload)
            notify.success('Product saved successfully.')
            actions.setSubmitting(false)
            navigate('/products')
          }}
        >
          {(formik) => {
            const selectedCategory = MOCK_CATEGORIES.find((item) => item.slug === formik.values.category_slug)
            const selectedSubcategory = selectedCategory?.subcategories.find(
              (item) => item.slug === formik.values.subcategory_slug,
            )
            const selectedBrand = MOCK_BRANDS.find((item) => item.slug === formik.values.brand_slug)

            return (
              <Form className="space-y-5">
                <ProductStepper steps={steps} activeStep={activeStep} />

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
                  {activeStep === 0 && <BasicsStep formik={formik} />}
                  {activeStep === 1 && (
                    <ClassificationStep
                      formik={formik}
                      selectedCategory={selectedCategory}
                    />
                  )}
                  {activeStep === 2 && <StockAndMediaStep formik={formik} />}
                  {activeStep === 3 && (
                    <SpecificsStep formik={formik} selectedSubcategory={selectedSubcategory} />
                  )}
                  {activeStep === 4 && (
                    <ReviewStep
                      values={formik.values}
                      selectedCategory={selectedCategory}
                      selectedSubcategory={selectedSubcategory}
                      selectedBrand={selectedBrand}
                    />
                  )}
                </section>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
                    disabled={activeStep === 0}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="size-4" /> Previous
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
                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="size-4" /> Save product
                    </button>
                  )}
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
    </DashboardLayout>
  )
}
