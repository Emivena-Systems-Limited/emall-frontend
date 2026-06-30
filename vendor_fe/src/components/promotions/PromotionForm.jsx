import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Flame, PackagePlus, Percent, Search, Trash2 } from 'lucide-react'
import {
  APPLICATION_TYPES,
  APPLICATION_TYPE_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  DISCOUNT_TYPES,
  PROMOTION_PRODUCT_PICKER_PAGE_SIZE,
  PROMOTION_TYPE_CONFIG,
  PROMOTION_TYPES,
} from '../../constants/promotions'
import PromotionScheduleSection, { handlePromotionTypeChange } from './PromotionScheduleSection'
import ProductThumbnail from '../dashboard/ProductThumbnail'
import OrderPagination from '../orders/OrderPagination'
import EmptyState from '../dashboard/EmptyState'
import {
  filterProductSelectOptions,
  paginateSelectOptions,
} from '../../utils/promotionFormOptions'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

const TYPE_CARDS = [
  {
    key: PROMOTION_TYPES.TODAYS_DEALS,
    icon: Percent,
    tone: 'border-violet-200 bg-violet-50 text-violet-700 ring-violet-100',
  },
  {
    key: PROMOTION_TYPES.FLASH_SALES,
    icon: Flame,
    tone: 'border-orange-200 bg-orange-50 text-orange-700 ring-orange-100',
  },
  {
    key: PROMOTION_TYPES.CLEARANCE,
    icon: Trash2,
    tone: 'border-rose-200 bg-rose-50 text-rose-700 ring-rose-100',
  },
]

function ProductCheckboxOption({ option, isChecked, readOnly, onToggle }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
        isChecked
          ? 'border-brand/30 bg-brand-light/30 text-slate-800'
          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      } ${readOnly ? 'cursor-default opacity-80' : ''}`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        disabled={readOnly}
        onChange={onToggle}
        className="size-4 shrink-0 cursor-pointer accent-brand rounded"
      />
      <ProductThumbnail src={option.image} alt={option.label} />
      <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
    </label>
  )
}

function CheckboxOption({ option, isChecked, readOnly, onToggle }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
        isChecked
          ? 'border-brand/30 bg-brand-light/30 text-slate-800'
          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      } ${readOnly ? 'cursor-default opacity-80' : ''}`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        disabled={readOnly}
        onChange={onToggle}
        className="size-4 shrink-0 cursor-pointer accent-brand rounded"
      />
      <span className="truncate">{option.label}</span>
    </label>
  )
}

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="text-brand"> *</span>}
    </span>
  )
}

export default function PromotionForm({
  form,
  onChange,
  showTypeSelection = true,
  readOnly = false,
  categoryOptions = [],
  productOptions = [],
}) {
  const showDiscountValue = form.discountType !== DISCOUNT_TYPES.FREE_SHIPPING
  const showMaximumDiscount =
    form.discountType === DISCOUNT_TYPES.PERCENTAGE
    || form.discountType === DISCOUNT_TYPES.FIXED

  const [categorySearch, setCategorySearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)

  const filteredCategoryOptions = useMemo(() => {
    const query = categorySearch.trim().toLowerCase()
    if (!query) return categoryOptions
    return categoryOptions.filter((option) => option.label.toLowerCase().includes(query))
  }, [categoryOptions, categorySearch])

  const filteredProductOptions = useMemo(
    () => filterProductSelectOptions(productOptions, productSearch),
    [productOptions, productSearch],
  )

  const productPagination = useMemo(
    () => paginateSelectOptions(filteredProductOptions, {
      page: productPage,
      pageSize: PROMOTION_PRODUCT_PICKER_PAGE_SIZE,
    }),
    [filteredProductOptions, productPage],
  )

  const updateField = (field, value) => {
    onChange({ ...form, [field]: value })
  }

  const toggleArrayValue = (field, value) => {
    const current = form[field] ?? []
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    updateField(field, next)
  }

  return (
    <div className="space-y-6">
      {showTypeSelection && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <h2 className="text-sm font-bold text-slate-950">Promotion Type</h2>
          <p className="mt-1 text-sm text-slate-500">Choose the promotion format that fits your campaign.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TYPE_CARDS.map(({ key, icon: Icon, tone }) => {
              const config = PROMOTION_TYPE_CONFIG[key]
              const isSelected = form.type === key

              return (
                <button
                  key={key}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange(handlePromotionTypeChange(form, key))}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand/40 bg-brand-light/15 ring-2 ring-brand/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  <span className={`inline-flex size-10 items-center justify-center rounded-xl ring-1 ${tone}`}>
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-900">{config.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{config.description}</p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-bold text-slate-950">Promotion Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <FieldLabel required>Promotion Name</FieldLabel>
            <input
              type="text"
              value={form.name}
              disabled={readOnly}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="e.g. Weekend Flash Sale"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
            />
          </label>

          <label className="block md:col-span-2">
            <FieldLabel>Short Description</FieldLabel>
            <textarea
              value={form.shortDescription}
              disabled={readOnly}
              onChange={(event) => updateField('shortDescription', event.target.value)}
              rows={3}
              placeholder="Briefly describe what this promotion offers."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
            />
          </label>

          <label className="block">
            <FieldLabel required>Discount Type</FieldLabel>
            <select
              value={form.discountType}
              disabled={readOnly}
              onChange={(event) => updateField('discountType', event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {DISCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {showDiscountValue && (
            <label className="block">
              <FieldLabel required>Discount Value</FieldLabel>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                disabled={readOnly}
                onChange={(event) => updateField('discountValue', event.target.value)}
                placeholder={form.discountType === DISCOUNT_TYPES.PERCENTAGE ? 'e.g. 20' : 'e.g. 25'}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
              />
            </label>
          )}

          {showMaximumDiscount && (
            <label className="block">
              <FieldLabel>Maximum Discount</FieldLabel>
              <input
                type="number"
                min="0"
                value={form.maximumDiscount}
                disabled={readOnly}
                onChange={(event) => updateField('maximumDiscount', event.target.value)}
                placeholder="Optional cap in GH₵"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
              />
            </label>
          )}
        </div>
      </section>

      <PromotionScheduleSection form={form} readOnly={readOnly} onChange={onChange} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-bold text-slate-950">Applies To</h2>
        <p className="mt-1 text-sm text-slate-500">Choose where this promotion should be available.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {APPLICATION_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition-colors ${
                form.applicationType === option.value
                  ? 'bg-brand text-white ring-brand'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              } ${readOnly ? 'cursor-default opacity-80' : ''}`}
            >
              <input
                type="radio"
                name="applicationType"
                value={option.value}
                checked={form.applicationType === option.value}
                disabled={readOnly}
                onChange={() => {
                  setCategorySearch('')
                  setProductSearch('')
                  setProductPage(1)
                  onChange({
                    ...form,
                    applicationType: option.value,
                    categoryIds: [],
                    productIds: [],
                  })
                }}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>

        {form.applicationType === APPLICATION_TYPES.CATEGORIES && (
          <div className="mt-4 space-y-3">
            {categoryOptions.length === 0 ? (
              <p className="text-sm text-slate-500">No categories available.</p>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Search Categories
                  </span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={categorySearch}
                      disabled={readOnly}
                      onChange={(event) => setCategorySearch(event.target.value)}
                      placeholder="Search categories…"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
                    />
                  </div>
                </label>

                {filteredCategoryOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">No categories match your search.</p>
                ) : (
                  <div className="grid max-h-72 gap-2 overflow-y-auto md:grid-cols-3">
                    {filteredCategoryOptions.map((option) => (
                      <CheckboxOption
                        key={option.value}
                        option={option}
                        isChecked={form.categoryIds?.includes(option.value)}
                        readOnly={readOnly}
                        onToggle={() => toggleArrayValue('categoryIds', option.value)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {form.applicationType === APPLICATION_TYPES.SPECIFIC_PRODUCTS && (
          <div className="mt-4 space-y-3">
            {productOptions.length === 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <EmptyState
                  compact
                  icon={EMPTY_STATE_PRESETS.products.icon}
                  title="No products available"
                  description="Add a product to your catalogue before assigning this promotion to specific items."
                  action={
                    readOnly ? null : (
                      <Link
                        to="/products/new"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
                      >
                        <PackagePlus className="size-4" />
                        Add Product
                      </Link>
                    )
                  }
                />
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Search Products
                  </span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={productSearch}
                      disabled={readOnly}
                      onChange={(event) => {
                        setProductSearch(event.target.value)
                        setProductPage(1)
                      }}
                      placeholder="Search by product name or SKU…"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
                    />
                  </div>
                </label>

                {filteredProductOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">No products match your search.</p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                      {productPagination.items.map((option) => (
                        <ProductCheckboxOption
                          key={option.value}
                          option={option}
                          isChecked={form.productIds?.includes(option.value)}
                          readOnly={readOnly}
                          onToggle={() => toggleArrayValue('productIds', option.value)}
                        />
                      ))}
                    </div>
                    <OrderPagination
                      page={productPagination.page}
                      pageCount={productPagination.pageCount}
                      totalItems={productPagination.totalItems}
                      startIndex={productPagination.startIndex}
                      endIndex={productPagination.endIndex}
                      onPageChange={setProductPage}
                      itemLabel="products"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
