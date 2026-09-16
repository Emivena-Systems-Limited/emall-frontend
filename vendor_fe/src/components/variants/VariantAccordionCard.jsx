import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Layers3, Loader2, Pin, Trash2 } from 'lucide-react'
import { ProductInput, ProductMoneyInput, FieldHintTooltip } from '../products/ProductFormControls'
import VariantImageUpload from '../products/VariantImageUpload'
import AttributeIcon from './AttributeIcon'
import SecondaryVariantSection from './SecondaryVariantSection'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import { hasUsableProductImages } from '../../utils/productImageUtils'
import { MAX_VARIANT_IMAGE_COUNT, getVariantImageUploadHint, isColorVariantAttribute } from './variantConstants'

function PrimaryVariantPanel({
  idPrefix,
  attribute,
  values,
  onFieldChange,
  isCustomPrice,
  onToggleCustomPrice,
  productValues,
  mainQty,
  isBusy,
  isDefault,
  hideSku,
  imageHint,
  photosRequired,
  fieldId,
  dataField,
  inputError,
  showProductPrices,
  pricing,
  footer,
  error,
  parentOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(parentOpen)
  const valueInputRef = useRef(null)
  const displayValue = values.value?.trim() || 'New option'
  const accentOpen = isDefault
    ? 'border-cyan-300 bg-cyan-50/40 ring-1 ring-cyan-100'
    : 'border-brand/35 bg-brand-light/25 ring-1 ring-brand/10'
  const accentClosed = isDefault
    ? 'border-cyan-200 bg-white'
    : 'border-brand/25 bg-white'

  useEffect(() => {
    if (parentOpen) setIsOpen(true)
  }, [parentOpen])

  useEffect(() => {
    if (!isOpen || String(values.value ?? '').trim()) return undefined
    const timeoutId = window.setTimeout(() => {
      valueInputRef.current?.focus()
    }, 220)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

  return (
    <div>
      <div className="mb-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-slate-700">
          <Layers3 className="size-3.5 text-brand" />
          Primary Variant
          <FieldHintTooltip
            className="w-72"
            label="About primary variant"
            hint="This is the main option for this value. Photos, SKU, stock, and price save on their own — separately from any sub-options below."
          />
        </p>
      </div>
      <article
      className={`overflow-hidden rounded-2xl border-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-colors ${
        isOpen ? accentOpen : accentClosed
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left transition-colors sm:px-5 sm:py-4 ${
          isOpen
            ? (isDefault ? 'bg-cyan-50/90' : 'bg-brand-light/40')
            : 'hover:bg-slate-50/80'
        }`}
      >
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${
          isDefault ? 'text-cyan-700 ring-cyan-200' : 'text-brand ring-brand/20'
        }`}>
          {isDefault ? <Pin className="size-4" /> : <AttributeIcon attribute={attribute} className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
              isDefault ? 'bg-cyan-100 text-cyan-800' : 'bg-brand-light text-brand'
            }`}>
              Start here
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-950">
              Primary variant
            </span>
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
              {attribute}: {displayValue}
            </span>
            {values.sku ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {values.sku}
              </span>
            ) : null}
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
              {String(values.quantity ?? '').trim() ? `Qty ${values.quantity}` : 'No stock set'}
            </span>
            {values.price ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                GH₵ {formatMoney(values.price)}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 transition-transform duration-200 ${
            isOpen ? (isDefault ? 'rotate-180 text-cyan-700' : 'rotate-180 text-brand') : 'text-slate-400'
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`space-y-5 border-t px-4 py-5 sm:px-5 ${
            isDefault ? 'border-cyan-100' : 'border-brand/10'
          } ${isBusy ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="grid items-start gap-5 lg:grid-cols-5">
              <div className="lg:col-span-2" data-field={dataField('images')}>
                <VariantImageUpload
                  label="Photos"
                  hint={imageHint ?? getVariantImageUploadHint(attribute)}
                  required={photosRequired || isDefault}
                  images={values.images}
                  maxImages={MAX_VARIANT_IMAGE_COUNT}
                  dropzoneMinHeightClass="min-h-36"
                  onChange={(images) => onFieldChange('images', images)}
                  error={inputError('images') || (/photo/i.test(String(error ?? '')) ? error : undefined)}
                />
              </div>

              <div className="space-y-4 lg:col-span-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={hideSku ? 'sm:col-span-2' : ''}>
                    <ProductInput
                      id={fieldId('value')}
                      name="value"
                      dataField={dataField('value')}
                      label={attribute ? `${attribute} value` : 'Option value'}
                      placeholder="e.g. Black"
                      value={values.value}
                      onChange={(event) => onFieldChange('value', event.target.value)}
                      error={inputError('value')}
                      ref={valueInputRef}
                    />
                  </div>
                  {hideSku ? null : (
                    <ProductInput
                      id={fieldId('sku')}
                      name="sku"
                      dataField={dataField('sku')}
                      label="Seller SKU"
                      optional
                      placeholder="e.g. AUD-001-BLK"
                      value={values.sku}
                      onChange={(event) => onFieldChange('sku', event.target.value.toUpperCase())}
                      error={inputError('sku')}
                    />
                  )}
                  <div className="sm:col-span-2">
                    <ProductInput
                      id={fieldId('quantity')}
                      name="quantity"
                      dataField={dataField('quantity')}
                      type="number"
                      min={0}
                      max={showProductPrices ? undefined : (mainQty ?? undefined)}
                      label="Quantity"
                      hint={
                        showProductPrices
                          ? 'This is the listing stock shoppers see first.'
                          : mainQty != null ? `Up to ${mainQty} units` : 'Set main stock first'
                      }
                      placeholder="0"
                      value={values.quantity}
                      onChange={(event) => onFieldChange('quantity', event.target.value)}
                      error={inputError('quantity')}
                    />
                  </div>
                  <ProductInput
                    id={fieldId('reserved_quantity')}
                    name="reserved_quantity"
                    dataField={dataField('reserved_quantity')}
                    type="number"
                    min={0}
                    label="Reserved quantity"
                    optional
                    hint="Units held for pending orders."
                    placeholder="0"
                    value={values.reserved_quantity}
                    onChange={(event) => onFieldChange('reserved_quantity', event.target.value)}
                    error={inputError('reserved_quantity')}
                  />
                  <ProductInput
                    id={fieldId('low_stock_threshold')}
                    name="low_stock_threshold"
                    dataField={dataField('low_stock_threshold')}
                    type="number"
                    min={1}
                    label="Low stock threshold"
                    optional
                    hint="Alert when stock falls to this level. Defaults to 5."
                    placeholder="5"
                    value={values.low_stock_threshold ?? values.minimum_threshold ?? ''}
                    onChange={(event) => {
                      onFieldChange('low_stock_threshold', event.target.value)
                      onFieldChange('minimum_threshold', event.target.value)
                    }}
                    error={inputError('low_stock_threshold') || inputError('minimum_threshold')}
                  />
                </div>

                <div>
                  {showProductPrices ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ProductMoneyInput
                        id={fieldId('price')}
                        name="price"
                        dataField={dataField('price')}
                        label="Regular price (GH₵)"
                        placeholder="0.00"
                        value={values.price}
                        onChange={(event) => onFieldChange('price', event.target.value)}
                        error={inputError('price')}
                      />
                      <ProductMoneyInput
                        id={fieldId('discount_price')}
                        name="discount_price"
                        dataField={dataField('discount_price')}
                        label="Sale price (GH₵)"
                        optional
                        placeholder="No sale price"
                        value={values.discount_price}
                        onChange={(event) => onFieldChange('discount_price', event.target.value)}
                        error={inputError('discount_price')}
                      />
                    </div>
                  ) : (
                    <>
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
                            dataField={dataField('price')}
                            label="Regular price (GH₵)"
                            placeholder={formatMoney(pricing.parent.regularPrice)}
                            value={values.price}
                            onChange={(event) => onFieldChange('price', event.target.value)}
                            error={inputError('price')}
                          />
                          <ProductMoneyInput
                            id={fieldId('discount_price')}
                            name="discount_price"
                            dataField={dataField('discount_price')}
                            label="Sale price (GH₵)"
                            optional
                            placeholder={
                              pricing.parent.salePrice != null ? formatMoney(pricing.parent.salePrice) : 'No base sale price'
                            }
                            value={values.discount_price}
                            onChange={(event) => onFieldChange('discount_price', event.target.value)}
                            error={inputError('discount_price')}
                          />
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-slate-500">
                          Customer pays GH₵ {formatMoney(pricing.hasDiscount ? pricing.salePrice : pricing.listPrice)}
                          {pricing.hasDiscount ? ' (base sale price applied)' : ' (base product price)'}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {footer ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
    </div>
  )
}

/**
 * One variant = one self-contained accordion card. Collapsed shows a quick summary
 * (value, quantity, price, status); expanded shows nested primary and secondary cards.
 */
export default function VariantAccordionCard({
  idPrefix,
  fieldPath,
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
  fieldError,
  footer,
  cardFooter,
  isDefault = false,
  priceAsProduct = false,
  hideSku = false,
  imageHint,
  onSaveSecondary,
  savingSecondaryId = null,
  showSecondarySave = false,
  addSecondaryRequestId = 0,
  isDirty = false,
}) {
  const showProductPrices = isDefault || priceAsProduct
  const pricing = resolveVariantPricing(values, productValues)
  const quantityValue = values.quantity !== '' && values.quantity != null ? values.quantity : null
  const displayValue = values.value?.trim() || 'New option'
  const photosRequired = isColorVariantAttribute(attribute)
  const hasPhotos = hasUsableProductImages(values.images, values.image_url)
  const isReady = Boolean(values.value?.trim())
    && quantityValue != null
    && (!(photosRequired || isDefault) || hasPhotos)
  const fieldId = (name) => `${idPrefix}-${name}`
  const dataField = (name) => (fieldPath ? `${fieldPath}.${name}` : name)
  const inputError = (name) => fieldError?.(name) || undefined

  return (
    <article
      data-variant-card
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
        error
          ? 'border-red-300 ring-1 ring-red-100'
          : isOpen
            ? isDefault ? 'border-cyan-300 ring-1 ring-cyan-100' : 'border-brand/30'
            : isDefault ? 'border-cyan-200' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/70 sm:px-5 ${
          isOpen ? (isDefault ? 'bg-cyan-50/80' : 'bg-brand-light/15') : ''
        }`}
      >
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ${
          isDefault ? 'text-cyan-700 ring-cyan-200' : 'text-slate-500 ring-slate-200'
        }`}>
          {isDefault ? <Pin className="size-4" /> : <AttributeIcon attribute={attribute} className="size-4" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900">
              {attribute ? `${attribute}: ${displayValue}` : displayValue}
            </span>
            {isDefault ? (
              <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cyan-800">
                Default
              </span>
            ) : null}
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              {quantityValue != null ? `Qty ${quantityValue}` : 'No stock set'}
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
                <AlertTriangle className="size-3" />
                {!values.value?.trim()
                  ? 'Enter a value'
                  : quantityValue == null
                    ? 'Set stock quantity'
                    : photosRequired && !hasPhotos
                      ? 'Add at least one photo'
                      : 'Needs details'}
              </span>
            )}
            {isDirty && !isOpen && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Unsaved
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
          <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
            <div className="space-y-5">
              <PrimaryVariantPanel
                idPrefix={idPrefix}
                attribute={attribute}
                values={values}
                onFieldChange={onFieldChange}
                isCustomPrice={isCustomPrice}
                onToggleCustomPrice={onToggleCustomPrice}
                productValues={productValues}
                mainQty={mainQty}
                isBusy={isBusy}
                isDefault={isDefault}
                priceAsProduct={priceAsProduct}
                hideSku={hideSku}
                imageHint={imageHint}
                photosRequired={photosRequired}
                fieldId={fieldId}
                dataField={dataField}
                inputError={inputError}
                showProductPrices={showProductPrices}
                pricing={pricing}
                footer={footer}
                error={error}
                parentOpen={isOpen}
              />

              <SecondaryVariantSection
                primaryAttribute={attribute}
                secondaryVariants={values.secondary_variants ?? []}
                onChange={(next) => onFieldChange('secondary_variants', next)}
                primaryValues={values}
                productValues={productValues}
                fieldPath={fieldPath ? `${fieldPath}.secondary_variants` : ''}
                fieldError={(relative) => fieldError?.(`secondary_variants.${relative}`)}
                showSave={showSecondarySave}
                onSaveItem={onSaveSecondary}
                savingItemId={savingSecondaryId}
                addRequestId={addSecondaryRequestId}
              />

              {cardFooter ? (
                <div>{cardFooter}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
