import { useRef, useState } from 'react'
import { Layers3, Plus } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import { isPersistedVariantId } from '../../utils/productPayload'
import AttributeIcon from './AttributeIcon'
import AttributeTypePicker from './AttributeTypePicker'
import CardStepHeader from './CardStepHeader'
import VariantDetailsDrawer from './VariantDetailsDrawer'
import VariantValueDraftCard from './VariantValueDraftCard'
import VariantValuesInput from './VariantValuesInput'
import { isPresetAttribute } from './variantConstants'
import {
  EMPTY_VARIANT_VALUES,
  getVariantValuesHint,
  getVariantValuesInputPlaceholder,
  toVariantFormValues,
} from './variantFormUtils'

function createGroupId() {
  return `grp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function mergeUniqueValues(existing = [], additions = []) {
  const seen = new Set(existing.map((item) => item.toLowerCase()))
  const merged = [...existing]
  additions.forEach((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    merged.push(item)
  })
  return merged
}

/** Add-variant flow: add multiple option types (Color, Size, …) each with values, then fill details per value in the drawer. */
export default function AddVariantFlow({
  productId,
  productValues,
  entries,
  prefillAttribute,
  createVariantMutation,
  updateSingleVariantMutation,
  deleteVariantMutation,
}) {
  const lockedAttribute = prefillAttribute?.trim() || ''
  const [groups, setGroups] = useState([])
  const [usePrefillAttribute, setUsePrefillAttribute] = useState(Boolean(lockedAttribute))
  const [buildingAttribute, setBuildingAttribute] = useState(lockedAttribute)
  const [showCustomAttribute, setShowCustomAttribute] = useState(() =>
    Boolean(lockedAttribute && !isPresetAttribute(lockedAttribute)),
  )
  const [attributeError, setAttributeError] = useState('')
  const [pendingValues, setPendingValues] = useState([])
  const [valuesError, setValuesError] = useState('')
  const [editingTarget, setEditingTarget] = useState(null) // { attribute, value }
  const [removeTarget, setRemoveTarget] = useState(null)
  const savedValuesRef = useRef(null)

  const scrollToSavedValues = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = savedValuesRef.current
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

  const findPersistedEntry = (attribute, value) =>
    entries.find(
      (entry) =>
        (entry.variation.attribute || '').toLowerCase() === attribute.toLowerCase()
        && (entry.variantValue.value || '').toLowerCase() === value.toLowerCase(),
    )

  const resetBuildingForm = () => {
    setBuildingAttribute(usePrefillAttribute && lockedAttribute ? lockedAttribute : '')
    setShowCustomAttribute(Boolean(usePrefillAttribute && lockedAttribute && !isPresetAttribute(lockedAttribute)))
    setPendingValues([])
    setAttributeError('')
    setValuesError('')
  }

  const activeAttribute = usePrefillAttribute && lockedAttribute
    ? lockedAttribute
    : buildingAttribute.trim()

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

    setGroups((prev) => {
      const existingIndex = prev.findIndex(
        (group) => group.attribute.toLowerCase() === activeAttribute.toLowerCase(),
      )
      if (existingIndex >= 0) {
        return prev.map((group, index) => (
          index === existingIndex
            ? { ...group, values: mergeUniqueValues(group.values, pendingValues) }
            : group
        ))
      }
      return [
        ...prev,
        { id: createGroupId(), attribute: activeAttribute, values: [...pendingValues] },
      ]
    })

    resetBuildingForm()
    scrollToSavedValues()
  }

  const handleRemoveValue = (attribute, value) => {
    const persisted = findPersistedEntry(attribute, value)
    if (persisted) {
      setRemoveTarget({ attribute, value, persistedEntry: persisted })
      return
    }
    setGroups((prev) =>
      prev
        .map((group) => (
          group.attribute === attribute
            ? { ...group, values: group.values.filter((item) => item !== value) }
            : group
        ))
        .filter((group) => group.values.length > 0),
    )
  }

  const handleConfirmRemove = async () => {
    if (!removeTarget) return
    if (removeTarget.persistedEntry) {
      await deleteVariantMutation.mutateAsync({
        productId,
        productVariantId: removeTarget.persistedEntry.variantValue.id,
      })
    }
    setGroups((prev) =>
      prev
        .map((group) => (
          group.attribute === removeTarget.attribute
            ? { ...group, values: group.values.filter((item) => item !== removeTarget.value) }
            : group
        ))
        .filter((group) => group.values.length > 0),
    )
    setRemoveTarget(null)
  }

  const handleDrawerSave = async (variantFormValues) => {
    if (!editingTarget) return
    const { attribute, value } = editingTarget
    const persisted = findPersistedEntry(attribute, value)
    if (persisted && isPersistedVariantId(persisted.variantValue.id)) {
      await updateSingleVariantMutation.mutateAsync({
        productId,
        variantId: persisted.variantValue.id,
        variantFormValues,
        productValues,
      })
    } else {
      await createVariantMutation.mutateAsync({ productId, variantFormValues, productValues })
    }
    setEditingTarget(null)
  }

  const editingPersisted = editingTarget
    ? findPersistedEntry(editingTarget.attribute, editingTarget.value)
    : null
  const drawerInitialValues = editingTarget
    ? (editingPersisted
      ? toVariantFormValues(editingPersisted.variantValue, editingTarget.attribute)
      : { ...EMPTY_VARIANT_VALUES, attribute: editingTarget.attribute, value: editingTarget.value })
    : EMPTY_VARIANT_VALUES

  const totalValues = groups.reduce((count, group) => count + group.values.length, 0)
  const readyCount = groups.reduce(
    (count, group) => count + group.values.filter((value) => findPersistedEntry(group.attribute, value)).length,
    0,
  )

  return (
    <div className="space-y-6">
      {/* Build a new option type */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader
          step={1}
          title="Add option types & values"
          subtitle={
            lockedAttribute
              ? `Add more "${lockedAttribute}" values, or add another option type like Size or Material — all in one go.`
              : 'Set up one or more option types (Color, Size, Material…). Each type gets its own values before you fill in photos and pricing.'
          }
          required
        />

        {usePrefillAttribute && lockedAttribute ? (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                <AttributeIcon attribute={lockedAttribute} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Adding values for</p>
                <p className="truncate text-sm font-bold text-slate-900">{lockedAttribute}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsePrefillAttribute(false)
                setBuildingAttribute('')
                setShowCustomAttribute(false)
              }}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-bold text-brand transition-colors hover:text-brand-hover"
            >
              <Plus className="size-3.5" />
              Add a different option type
            </button>
          </div>
        ) : (
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
        )}

        {!usePrefillAttribute && attributeError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{attributeError}</p>
        )}

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
              {!usePrefillAttribute && groups.length > 0 && (
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

            {groups.map((group) => {
              const groupReady = group.values.filter((value) => findPersistedEntry(group.attribute, value)).length
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
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.values.map((value) => (
                      <VariantValueDraftCard
                        key={`${group.attribute}::${value}`}
                        attribute={group.attribute}
                        value={value}
                        persistedEntry={findPersistedEntry(group.attribute, value)}
                        onEdit={() => setEditingTarget({ attribute: group.attribute, value })}
                        onRemove={() => handleRemoveValue(group.attribute, value)}
                        isRemoving={
                          deleteVariantMutation.isPending
                          && removeTarget?.attribute === group.attribute
                          && removeTarget?.value === value
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No options added yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Pick a type above, add values, then click <strong>Add Attribute</strong>. Repeat for Color, Size, Material, and more.
            </p>
          </div>
        )}
      </div>

      <VariantDetailsDrawer
        open={Boolean(editingTarget)}
        attribute={editingTarget?.attribute ?? ''}
        value={editingTarget?.value ?? null}
        initialValues={drawerInitialValues}
        productValues={productValues}
        onClose={() => setEditingTarget(null)}
        onSave={handleDrawerSave}
        isSaving={createVariantMutation.isPending || updateSingleVariantMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(removeTarget)}
        tone="danger"
        title="Remove variant?"
        description={
          removeTarget
            ? `Remove "${removeTarget.value}" from ${removeTarget.attribute}? This cannot be undone.`
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
