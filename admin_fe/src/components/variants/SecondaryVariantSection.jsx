import { useState } from 'react'
import { ChevronDown, GitBranch, Plus, Trash2, X } from 'lucide-react'
import AttributeTypePicker from './AttributeTypePicker'
import AttributeIcon from './AttributeIcon'
import { ProductInput, ProductMoneyInput } from '../products/ProductFormControls'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import { isPresetAttribute } from './variantConstants'
import { getSingleVariantValuePlaceholder } from './variantFormUtils'

function createSecondaryVariant(attribute, value) {
  return {
    id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    attribute,
    value,
    use_primary_quantity: true,
    use_primary_price: true,
    quantity: '',
    price: '',
    discount_price: '',
  }
}

function SecondaryVariantItem({ item, index, primaryValues, productValues, onUpdate, onRemove, startsOpen = false }) {
  const [isOpen, setIsOpen] = useState(startsOpen)

  const resolvedPrimaryQty =
    primaryValues.quantity !== '' && primaryValues.quantity != null
      ? primaryValues.quantity
      : (productValues.quantity || null)

  const primaryPricing = resolveVariantPricing(primaryValues, productValues)
  const primaryPriceLabel = primaryPricing.hasDiscount
    ? `GH₵ ${formatMoney(primaryPricing.salePrice)} sale (reg. GH₵ ${formatMoney(primaryPricing.listPrice)})`
    : primaryPricing.listPrice > 0
      ? `GH₵ ${formatMoney(primaryPricing.listPrice)}`
      : 'Not set'

  const displayQty = item.use_primary_quantity ? (resolvedPrimaryQty ?? '—') : (item.quantity || '0')

  const valuePlaceholder = getSingleVariantValuePlaceholder(item.attribute)
    .replace(/^e\.g\.\s*/, '')
    .split(' —')[0]

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${
        isOpen ? 'border-brand/20' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50/70 sm:px-4 ${
          isOpen ? 'bg-brand-light/15' : ''
        }`}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
          <AttributeIcon attribute={item.attribute} className="size-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">
              {item.attribute}: {item.value || 'New value'}
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-500">
              Qty {displayQty}
            </span>
          </span>
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault(); e.stopPropagation(); onRemove()
            }
          }}
          aria-label="Remove secondary variant"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
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
          <div className="space-y-4 border-t border-slate-100 px-3.5 py-3.5 sm:px-4">
            <ProductInput
              id={`sv-${item.id}-value`}
              name={`sv-value-${index}`}
              label={item.attribute ? `${item.attribute} value` : 'Value'}
              placeholder={`e.g. ${valuePlaceholder}`}
              value={item.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />

            {/* Quantity */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-700">Quantity</p>
              <div className="mb-2.5 inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => onUpdate({ use_primary_quantity: true, quantity: '' })}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    item.use_primary_quantity
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Use primary&apos;s
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ use_primary_quantity: false })}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    !item.use_primary_quantity
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Custom
                </button>
              </div>
              {item.use_primary_quantity ? (
                <p className="text-xs leading-relaxed text-slate-500">
                  Inherits{' '}
                  <strong className="text-slate-800">{resolvedPrimaryQty ?? 'unset'} units</strong>
                  {primaryValues.quantity === '' || primaryValues.quantity == null
                    ? resolvedPrimaryQty
                      ? ' from product stock'
                      : ''
                    : ' from primary variant'}
                  .
                </p>
              ) : (
                <ProductInput
                  id={`sv-${item.id}-quantity`}
                  name={`sv-qty-${index}`}
                  type="number"
                  min={0}
                  label="Units in stock"
                  placeholder="0"
                  value={item.quantity}
                  onChange={(e) => onUpdate({ quantity: e.target.value })}
                />
              )}
            </div>

            {/* Price */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-700">Price</p>
              <div className="mb-2.5 inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => onUpdate({ use_primary_price: true, price: '', discount_price: '' })}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    item.use_primary_price
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Use primary&apos;s
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ use_primary_price: false })}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    !item.use_primary_price
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Custom
                </button>
              </div>
              {item.use_primary_price ? (
                <p className="text-xs leading-relaxed text-slate-500">
                  Inherits <strong className="text-slate-800">{primaryPriceLabel}</strong> from primary variant.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProductMoneyInput
                    id={`sv-${item.id}-price`}
                    name={`sv-price-${index}`}
                    label="Regular price (GH₵)"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) => onUpdate({ price: e.target.value })}
                  />
                  <ProductMoneyInput
                    id={`sv-${item.id}-dp`}
                    name={`sv-dp-${index}`}
                    label="Sale price (GH₵)"
                    optional
                    placeholder="No sale price"
                    value={item.discount_price}
                    onChange={(e) => onUpdate({ discount_price: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Replace the "Compatible models" section inside a variant accordion card with a
 * structured secondary-variant picker. Users opt in via the toggle, pick a secondary
 * attribute type (filtered so it can't duplicate the primary), enter values, and set
 * per-item quantity / price that can inherit from the primary variant or be custom.
 *
 * Props:
 *   primaryAttribute  — string, the parent variant's attribute (e.g. "Color")
 *   secondaryVariants — array of { id, attribute, value, use_primary_quantity, use_primary_price, quantity, price, discount_price }
 *   onChange          — (nextArray) => void
 *   primaryValues     — the parent variant's own form values (for qty/price inheritance display)
 *   productValues     — product-level form values (fallback for qty/price when primary hasn't set its own)
 *   step              — optional number shown as a step badge (admin-style stepper)
 */
export default function SecondaryVariantSection({
  primaryAttribute = '',
  secondaryVariants = [],
  onChange,
  primaryValues = {},
  productValues = {},
  step,
}) {
  const [enabled, setEnabled] = useState(() => (secondaryVariants ?? []).length > 0)
  const [buildingAttribute, setBuildingAttribute] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [valueInput, setValueInput] = useState('')
  const [attributeError, setAttributeError] = useState('')
  const [valueError, setValueError] = useState('')

  const activeAttribute = buildingAttribute.trim()
  const items = secondaryVariants ?? []

  const handleDisable = () => {
    setEnabled(false)
    onChange([])
    setBuildingAttribute('')
    setShowCustom(false)
    setValueInput('')
    setAttributeError('')
    setValueError('')
  }

  const handleAdd = () => {
    const value = valueInput.trim()
    if (!activeAttribute) {
      setAttributeError('Pick a secondary attribute type first')
      return
    }
    if (primaryAttribute && activeAttribute.toLowerCase() === primaryAttribute.toLowerCase()) {
      setAttributeError(`"${activeAttribute}" is the primary attribute — choose a different type`)
      return
    }
    if (!value) {
      setValueError('Enter a value to add')
      return
    }
    const dupeKey = `${activeAttribute.toLowerCase()}::${value.toLowerCase()}`
    if (items.some((sv) => `${sv.attribute.toLowerCase()}::${sv.value.toLowerCase()}` === dupeKey)) {
      setValueError(`"${value}" is already added for ${activeAttribute}`)
      return
    }
    onChange([...items, createSecondaryVariant(activeAttribute, value)])
    setValueInput('')
    setValueError('')
    setAttributeError('')
  }

  const handleUpdate = (id, patch) => {
    onChange(items.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)))
  }

  const handleRemove = (id) => {
    onChange(items.filter((sv) => sv.id !== id))
  }

  return (
    <div>
      {/* Section header */}
      {step != null ? (
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand ring-1 ring-brand/15">
            {step}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Secondary Variants</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Does this variant have sub-options? e.g. a &quot;Black&quot; colour in &quot;128GB&quot; and &quot;256GB&quot;.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-slate-700">
            <GitBranch className="size-3.5 text-brand" />
            Secondary Variants
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Add sub-options under this variant — e.g. &quot;Black 128GB&quot;, &quot;Black 256GB&quot;.
          </p>
        </div>
      )}

      {/* Yes / No toggle */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={handleDisable}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            !enabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <X className="size-3.5" />
          No
        </button>
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            enabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <GitBranch className="size-3.5" />
          Yes, add secondary variants
        </button>
      </div>

      {/* Expanded body */}
      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${
          enabled ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-4">
            {/* Attribute type picker */}
            <div className="rounded-xl border border-brand/15 bg-brand-light/40 p-3.5">
              <p className="mb-2.5 text-xs font-semibold text-slate-700">
                Choose secondary attribute type
                {primaryAttribute ? (
                  <span className="ml-1.5 font-normal text-slate-400">(cannot be {primaryAttribute})</span>
                ) : null}
              </p>
              <AttributeTypePicker
                value={buildingAttribute}
                showCustom={showCustom}
                excludeAttributes={primaryAttribute ? [primaryAttribute] : []}
                onSelectPreset={(preset) => {
                  setShowCustom(false)
                  setBuildingAttribute(preset)
                  setAttributeError('')
                }}
                onToggleCustom={() => {
                  setShowCustom(true)
                  if (isPresetAttribute(buildingAttribute)) setBuildingAttribute('')
                }}
                onCloseCustom={() => {
                  setShowCustom(false)
                  setBuildingAttribute(activeAttribute || '')
                }}
                onCustomChange={(e) => {
                  setBuildingAttribute(e.target.value)
                  setAttributeError('')
                }}
                onCustomBlur={() => {}}
                error={undefined}
              />
              {attributeError && (
                <p className="mt-2 text-xs font-semibold text-red-600">{attributeError}</p>
              )}
            </div>

            {/* Value input — only shown once an attribute is chosen */}
            {activeAttribute && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Add a {activeAttribute} value
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
                    }}
                    placeholder={getSingleVariantValuePlaceholder(activeAttribute)}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!valueInput.trim()}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                    Add
                  </button>
                </div>
                {valueError && <p className="mt-1.5 text-xs font-semibold text-red-600">{valueError}</p>}
                <p className="mt-1 text-[11px] text-slate-400">Press Enter or click Add to confirm.</p>
              </div>
            )}

            {/* Secondary variant items */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {items.length} secondary variant{items.length !== 1 ? 's' : ''}
                </p>
                <div className="grid gap-3 lg:grid-cols-2">
                  {items.map((sv, index) => (
                    <SecondaryVariantItem
                      key={sv.id}
                      item={sv}
                      index={index}
                      startsOpen={index === items.length - 1}
                      primaryValues={primaryValues}
                      productValues={productValues}
                      onUpdate={(patch) => handleUpdate(sv.id, patch)}
                      onRemove={() => handleRemove(sv.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty hint when attribute not yet picked */}
            {items.length === 0 && !activeAttribute && (
              <div className="rounded-xl border border-dashed border-brand/20 bg-brand-light/20 px-4 py-5 text-center">
                <GitBranch className="mx-auto mb-1.5 size-6 text-brand/30" />
                <p className="text-xs font-semibold text-slate-600">Pick an attribute type above to get started</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                  e.g. Select &quot;Capacity&quot; then add &quot;128GB&quot;, &quot;256GB&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
