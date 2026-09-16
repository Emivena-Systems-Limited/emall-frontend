import { useEffect, useRef, useState } from 'react'
import { ChevronDown, GitBranch, Loader2, Plus, Trash2, X } from 'lucide-react'
import AttributeTypePicker from './AttributeTypePicker'
import AttributeIcon from './AttributeIcon'
import { FieldHintTooltip, ProductInput, ProductMoneyInput } from '../products/ProductFormControls'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import { getSingleVariantValuePlaceholder, getDuplicateSecondaryValueError } from './variantFormUtils'
import { buildVariantSkuCandidates } from '../../utils/variantSkuRegistry'

function suggestSecondarySku(primaryValues = {}, productValues = {}, attribute, value) {
  return buildVariantSkuCandidates({
    productSku: primaryValues.sku || productValues.sku,
    attribute,
    value,
  })[0] ?? ''
}

function firstFilledField(...values) {
  return values.find((value) => value !== '' && value != null) ?? ''
}

function createSecondaryVariant(attribute, value, { primaryValues = {}, productValues = {} } = {}) {
  const primaryPricing = resolveVariantPricing(primaryValues, productValues)
  const lowStockThreshold = firstFilledField(
    primaryValues.low_stock_threshold,
    primaryValues.minimum_threshold,
    productValues.low_stock_threshold,
  )

  return {
    id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    attribute,
    value,
    sku: suggestSecondarySku(primaryValues, productValues, attribute, value),
    quantity: firstFilledField(primaryValues.quantity, productValues.quantity),
    reserved_quantity: firstFilledField(primaryValues.reserved_quantity, productValues.reserved_quantity),
    low_stock_threshold: lowStockThreshold,
    minimum_threshold: lowStockThreshold,
    price: primaryPricing.listPrice > 0 ? String(primaryPricing.listPrice) : (primaryValues.price ?? ''),
    discount_price: primaryPricing.hasDiscount && primaryPricing.salePrice != null
      ? String(primaryPricing.salePrice)
      : (primaryValues.discount_price ?? ''),
  }
}

function SecondaryVariantItem({
  item,
  index,
  onUpdate,
  onRemove,
  onSave,
  isSaving = false,
  isSavingThis = false,
  showSave = false,
  isOpen = false,
  onToggle,
  fieldPath = '',
  fieldError,
  duplicateValueError = '',
}) {
  const valuePlaceholder = getSingleVariantValuePlaceholder(item.attribute)
    .replace(/^e\.g\.\s*/, '')
    .split(' —')[0]
  const dataField = (name) => (fieldPath ? `${fieldPath}.${name}` : undefined)
  const inputError = (name) => fieldError?.(`${index}.${name}`) || undefined
  const valueInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen || String(item.value ?? '').trim()) return undefined
    const timeoutId = window.setTimeout(() => {
      valueInputRef.current?.focus()
    }, 220)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${
        isOpen ? 'border-brand/20' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
            {item.sku ? (
              <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-500">
                {item.sku}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-500">
              Qty {item.quantity || '0'}
            </span>
            {item.price ? (
              <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-500">
                GH₵ {formatMoney(item.price)}
              </span>
            ) : null}
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
              dataField={dataField('value')}
              label={item.attribute ? `${item.attribute} value` : 'Value'}
              placeholder={`e.g. ${valuePlaceholder}`}
              value={item.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              error={inputError('value') || duplicateValueError || undefined}
              ref={valueInputRef}
            />
            <ProductInput
              id={`sv-${item.id}-sku`}
              name={`sv-sku-${index}`}
              dataField={dataField('sku')}
              label="SKU"
              hint="Required. Unique code for this combination."
              placeholder="e.g. LAP-BLK-32"
              value={item.sku}
              onChange={(e) => onUpdate({ sku: e.target.value })}
              error={inputError('sku')}
            />
            <ProductInput
              id={`sv-${item.id}-quantity`}
              name={`sv-qty-${index}`}
              dataField={dataField('quantity')}
              type="number"
              min={0}
              label="Units in stock"
              placeholder="0"
              value={item.quantity}
              onChange={(e) => onUpdate({ quantity: e.target.value })}
              error={inputError('quantity')}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ProductInput
                id={`sv-${item.id}-reserved`}
                name={`sv-reserved-${index}`}
                dataField={dataField('reserved_quantity')}
                type="number"
                min={0}
                label="Reserved quantity"
                optional
                hint="Units held for pending orders."
                placeholder="0"
                value={item.reserved_quantity}
                onChange={(e) => onUpdate({ reserved_quantity: e.target.value })}
                error={inputError('reserved_quantity')}
              />
              <ProductInput
                id={`sv-${item.id}-threshold`}
                name={`sv-threshold-${index}`}
                dataField={dataField('low_stock_threshold')}
                type="number"
                min={1}
                label="Low stock threshold"
                optional
                hint="Alert when stock falls to this level. Defaults to 5."
                placeholder="5"
                value={item.low_stock_threshold ?? item.minimum_threshold ?? ''}
                onChange={(e) => onUpdate({
                  low_stock_threshold: e.target.value,
                  minimum_threshold: e.target.value,
                })}
                error={inputError('low_stock_threshold') || inputError('minimum_threshold')}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProductMoneyInput
                id={`sv-${item.id}-price`}
                name={`sv-price-${index}`}
                dataField={dataField('price')}
                label="Regular price (GH₵)"
                placeholder="0.00"
                value={item.price}
                onChange={(e) => onUpdate({ price: e.target.value })}
                error={inputError('price')}
              />
              <ProductMoneyInput
                id={`sv-${item.id}-dp`}
                name={`sv-dp-${index}`}
                dataField={dataField('discount_price')}
                label="Sale price (GH₵)"
                optional
                placeholder="No sale price"
                value={item.discount_price}
                onChange={(e) => onUpdate({ discount_price: e.target.value })}
                error={inputError('discount_price')}
              />
            </div>
            {showSave && isOpen && onSave ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onSave(item)
                }}
                disabled={isSaving}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(199,59,45,0.18)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingThis && <Loader2 className="size-4 animate-spin" />}
                Save {item.attribute || 'option'}
              </button>
            ) : null}
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
 * a SKU, price, and stock for each combination.
 *
 * Props:
 *   primaryAttribute  — string, the parent variant's attribute (e.g. "Color")
 *   secondaryVariants — array of { id, attribute, value, sku, quantity, reserved_quantity, low_stock_threshold, price, discount_price }
 *   onChange          — (nextArray) => void
 *   primaryValues     — the parent variant's own form values (used to prefill new rows)
 *   productValues     — product-level form values (fallback for sku/qty/price)
 *   step              — optional number shown as a step badge (admin-style stepper)
 */
export default function SecondaryVariantSection({
  primaryAttribute = '',
  secondaryVariants = [],
  onChange,
  primaryValues = {},
  productValues = {},
  step,
  fieldPath = '',
  fieldError,
  showSave = false,
  onSaveItem,
  savingItemId = null,
  addRequestId = 0,
}) {
  const [optedIn, setOptedIn] = useState(() => (secondaryVariants ?? []).length > 0)
  const [buildingAttribute, setBuildingAttribute] = useState(
    () => String(secondaryVariants?.[0]?.attribute ?? '').trim(),
  )
  const [showCustom, setShowCustom] = useState(false)
  const [valueInput, setValueInput] = useState('')
  const [attributeError, setAttributeError] = useState('')
  const [valueError, setValueError] = useState('')
  const [openItemId, setOpenItemId] = useState(null)
  const addValueInputRef = useRef(null)
  const skipInitialValueFocusRef = useRef(true)

  const activeAttribute = buildingAttribute.trim()
  const items = secondaryVariants ?? []
  const enabled = optedIn
  const showAddValueInput = Boolean(enabled && activeAttribute && !showCustom)

  useEffect(() => {
    if (!showAddValueInput) return undefined
    if (skipInitialValueFocusRef.current) {
      skipInitialValueFocusRef.current = false
      return undefined
    }
    const timeoutId = window.setTimeout(() => {
      addValueInputRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(timeoutId)
  }, [showAddValueInput, activeAttribute])

  const handleDisable = () => {
    setOptedIn(false)
    setShowCustom(false)
    setValueInput('')
    setAttributeError('')
    setValueError('')
    setOpenItemId(null)
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
    const dupeError = getDuplicateSecondaryValueError(items, {
      id: `new-${Date.now()}`,
      attribute: activeAttribute,
      value,
    })
    if (dupeError) {
      setValueError(dupeError)
      return
    }
    const nextItem = createSecondaryVariant(activeAttribute, value, { primaryValues, productValues })
    onChange([...items, nextItem])
    setOpenItemId(nextItem.id)
    setValueInput('')
    setValueError('')
    setAttributeError('')
  }

  const handleUpdate = (id, patch) => {
    onChange(items.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)))
  }

  const handleRemove = (id) => {
    onChange(items.filter((sv) => sv.id !== id))
    setOpenItemId((current) => (current === id ? null : current))
  }

  const toggleItem = (id) => {
    setOpenItemId((current) => (current === id ? null : id))
  }

  const startSecondaryForType = (attributeOverride) => {
    const type = String(attributeOverride ?? buildingAttribute ?? items[0]?.attribute ?? '').trim()
    if (!type) {
      setAttributeError('Pick a secondary attribute type first')
      return
    }
    if (primaryAttribute && type.toLowerCase() === primaryAttribute.toLowerCase()) {
      setAttributeError(`"${type}" is the primary attribute — choose a different type`)
      return
    }

    setOptedIn(true)
    setShowCustom(false)
    setBuildingAttribute(type)
    setAttributeError('')
    setValueError('')

    const empty = items.find((item) => !String(item.value ?? '').trim())
    if (empty) {
      setOpenItemId(empty.id)
      return
    }

    const nextItem = createSecondaryVariant(type, '', { primaryValues, productValues })
    onChange([...items, nextItem])
    setOpenItemId(nextItem.id)
  }

  const addBlankSecondary = () => {
    startSecondaryForType()
  }

  useEffect(() => {
    if (!addRequestId) return
    addBlankSecondary()
  }, [addRequestId])

  return (
    <div>
      {/* Section header */}
      {step != null ? (
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand ring-1 ring-brand/15">
            {step}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <span>Secondary Variants</span>
              <FieldHintTooltip
                className="w-72"
                label="About secondary variants"
                hint="Add sub-options under this color — each one is its own SKU with its own price and stock."
              />
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-slate-700">
            <GitBranch className="size-3.5 text-brand" />
            Secondary Variants
            <FieldHintTooltip
              className="w-72"
              label="About secondary variants"
              hint="Add sub-options under this variant. Each value is a separate SKU — e.g. Black 16GB and Black 32GB."
            />
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
          onClick={() => {
            setOptedIn(true)
            if (!buildingAttribute.trim() && items[0]?.attribute) {
              setBuildingAttribute(items[0].attribute)
            }
          }}
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
                  startSecondaryForType(preset)
                }}
                onToggleCustom={() => {
                  setShowCustom(true)
                }}
                onCloseCustom={() => {
                  setShowCustom(false)
                }}
                onSaveCustom={(name) => {
                  startSecondaryForType(name)
                }}
                error={attributeError}
              />
            </div>

            {/* Secondary variant items */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {items.length} secondary variant{items.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {items.map((sv, index) => (
                    <SecondaryVariantItem
                      key={sv.id}
                      item={sv}
                      index={index}
                      isOpen={openItemId === sv.id}
                      onToggle={() => toggleItem(sv.id)}
                      fieldPath={fieldPath ? `${fieldPath}.${index}` : ''}
                      fieldError={fieldError}
                      duplicateValueError={getDuplicateSecondaryValueError(items, sv)}
                      showSave={showSave}
                      onSave={onSaveItem}
                      isSaving={Boolean(savingItemId)}
                      isSavingThis={String(savingItemId) === String(sv.id)}
                      onUpdate={(patch) => handleUpdate(sv.id, patch)}
                      onRemove={() => handleRemove(sv.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Value input — below existing sub-variants, after a type is confirmed */}
            {activeAttribute && !showCustom && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Add a {activeAttribute} value
                </label>
                <div className="flex gap-2">
                  <input
                    ref={addValueInputRef}
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
