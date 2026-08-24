import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Trash2 } from 'lucide-react'
import { ProductInput, ProductMoneyInput } from '../products/ProductFormControls'
import VariantImageUpload from '../products/VariantImageUpload'
import VariantValuesInput from './VariantValuesInput'
import AttributeIcon from './AttributeIcon'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import { hasUsableProductImages } from '../../utils/productImageUtils'
import { MAX_VARIANT_IMAGE_COUNT, getVariantImageUploadHint, isColorVariantAttribute } from './variantConstants'

/**
 * One variant = one self-contained accordion card. Collapsed shows a quick summary
 * (value, quantity, price, status); expanded shows every field inline — no nested
 * per-field accordions/steps.
 */
export default function VariantAccordionCard({
  idPrefix,
  attribute,
  values,
  onFieldChange,
  isCustomPrice,
  onToggleCustomPrice,
  productValues = {},
  mainQty,
  isOpen,
  onToggle,
  onRemove,
  removeLabel = 'Remove option',
  isRemoving = false,
  isBusy = false,
  error,
  footer,
}) {
  const [showCompatible, setShowCompatible] = useState(Boolean(values.has_compatible_models))
  const pricing = resolveVariantPricing(values, productValues)
  const quantityValue = values.quantity !== '' && values.quantity != null ? values.quantity : null
  const displayValue = values.value?.trim() || 'New option'
  const photosRequired = isColorVariantAttribute(attribute)
  const hasPhotos = hasUsableProductImages(values.images, values.image_url)
  const isReady = Boolean(values.value?.trim()) && quantityValue != null && (!photosRequired || hasPhotos)
  const fieldId = (name) => `${idPrefix}-${name}`

  return (
    <article
      data-variant-card
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
        error ? 'border-red-300 ring-1 ring-red-100' : isOpen ? 'border-brand/30' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/70 sm:px-5 ${
          isOpen ? 'bg-brand-light/15' : ''
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
          <AttributeIcon attribute={attribute} className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900">
              {attribute ? `${attribute}: ${displayValue}` : displayValue}
            </span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              Quantity ({quantityValue ?? 0})
            </span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
            {pricing.listPrice > 0 && (
              <span className="font-semibold text-slate-600">
                GH₵ {formatMoney(pricing.hasDiscount ? pricing.salePrice : pricing.listPrice)}
              </span>
            )}
            {error ? (
              <span className="inline-flex items-center gap-1 font-bold text-red-600">
                <AlertTriangle className="size-3" /> {error}
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="size-3" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <AlertTriangle className="size-3" /> Needs details
              </span>
            )}
          </span>
        </span>

        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation()
              if (!isRemoving) onRemove()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                if (!isRemoving) onRemove()
              }
            }}
            aria-label={removeLabel}
            aria-disabled={isRemoving}
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 ${
              isRemoving ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isRemoving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </span>
        )}

        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`border-t border-slate-100 px-4 py-4 sm:px-5 ${isBusy ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="grid gap-5 lg:grid-cols-5">
              {/* Photo — 2/5 */}
              <div className="lg:col-span-2">
                <VariantImageUpload
                  label="Photos"
                  hint={getVariantImageUploadHint(attribute)}
                  required={photosRequired}
                  images={values.images}
                  maxImages={MAX_VARIANT_IMAGE_COUNT}
                  dropzoneMinHeightClass="min-h-28"
                  onChange={(images) => onFieldChange('images', images)}
                  error={/photo/i.test(String(error ?? '')) ? error : undefined}
                />
              </div>

              {/* Fields — 3/5 */}
              <div className="space-y-4 lg:col-span-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProductInput
                    id={fieldId('value')}
                    name="value"
                    label={attribute ? `${attribute} value` : 'Option value'}
                    placeholder="e.g. Black"
                    value={values.value}
                    onChange={(event) => onFieldChange('value', event.target.value)}
                  />
                  <ProductInput
                    id={fieldId('sku')}
                    name="sku"
                    label="Seller SKU"
                    optional
                    placeholder="e.g. AUD-001-BLK"
                    value={values.sku}
                    onChange={(event) => onFieldChange('sku', event.target.value.toUpperCase())}
                  />
                  <div className="sm:col-span-2">
                    <ProductInput
                      id={fieldId('quantity')}
                      name="quantity"
                      type="number"
                      min={0}
                      max={mainQty ?? undefined}
                      label="Quantity"
                      hint={mainQty != null ? `Up to ${mainQty} units` : 'Set main stock first'}
                      placeholder="0"
                      value={values.quantity}
                      onChange={(event) => onFieldChange('quantity', event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleCustomPrice(false)
                        onFieldChange('price', '')
                        onFieldChange('discount_price', '')
                      }}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        !isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Use base price
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleCustomPrice(true)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Custom price
                    </button>
                  </div>

                  {isCustomPrice ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ProductMoneyInput
                        id={fieldId('price')}
                        name="price"
                        label="Regular price (GH₵)"
                        placeholder={formatMoney(pricing.parent.regularPrice)}
                        value={values.price}
                        onChange={(event) => onFieldChange('price', event.target.value)}
                      />
                      <ProductMoneyInput
                        id={fieldId('discount_price')}
                        name="discount_price"
                        label="Sale price (GH₵)"
                        optional
                        placeholder={
                          pricing.parent.salePrice != null ? formatMoney(pricing.parent.salePrice) : 'No base sale price'
                        }
                        value={values.discount_price}
                        onChange={(event) => onFieldChange('discount_price', event.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-500">
                      Customer pays GH₵ {formatMoney(pricing.hasDiscount ? pricing.salePrice : pricing.listPrice)}
                      {pricing.hasDiscount ? ' (base sale price applied)' : ' (base product price)'}
                    </p>
                  )}
                </div>

                <div>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCompatible(false)
                        onFieldChange('compatible_models', [])
                        onFieldChange('has_compatible_models', false)
                      }}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        !showCompatible ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      No compatible models
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompatible(true)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        showCompatible ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Fits multiple models
                    </button>
                  </div>
                  {showCompatible && (
                    <div className="mt-3 rounded-xl border border-brand/15 bg-brand-light/20 p-3">
                      <VariantValuesInput
                        values={values.compatible_models ?? []}
                        onChange={(next) => {
                          onFieldChange('compatible_models', next)
                          onFieldChange('has_compatible_models', next.length > 0)
                        }}
                        label="Compatible models"
                        hint="Press Enter or comma after each model name."
                        placeholder="iPhone 13, iPhone 13 Pro"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {footer && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
