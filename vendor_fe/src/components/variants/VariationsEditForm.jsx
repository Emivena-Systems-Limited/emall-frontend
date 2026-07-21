import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateSingleVariantMutation,
} from '../../hooks/useProductMutations'
import { isPersistedVariantId, iterateVariantFormEntries } from '../../utils/productPayload'
import AddVariantFlow from './AddVariantFlow'
import VariantDetailsDrawer from './VariantDetailsDrawer'
import VariantListView from './VariantListView'
import { EMPTY_VARIANT_VALUES, toVariantFormValues } from './variantFormUtils'

/** Mode manager for the Manage Variations section: switches between the variant list, editing one variant, and the add-variant flow. */
export default function VariationsEditForm({ productId, formState, onFinished }) {
  const [mode, setMode] = useState('list') // 'list' | 'add'
  const [drawerEntry, setDrawerEntry] = useState(null)
  const [addPrefillAttribute, setAddPrefillAttribute] = useState('')

  const updateSingleVariantMutation = useUpdateSingleVariantMutation()
  const createVariantMutation = useCreateProductVariantMutation()
  const deleteVariantMutation = useDeleteProductVariantMutation()

  const productValues = formState.formValues
  const entries = iterateVariantFormEntries(productValues.variations)

  const handleAdd = (prefillAttribute = '') => {
    setAddPrefillAttribute(prefillAttribute)
    setMode('add')
  }

  const handleSaveFromDrawer = async (variantFormValues) => {
    if (!drawerEntry) return
    const variantId = drawerEntry.variantValue.id
    if (!isPersistedVariantId(variantId)) return
    await updateSingleVariantMutation.mutateAsync({
      productId,
      variantId,
      variantFormValues,
      productValues,
    })
    setDrawerEntry(null)
  }

  const pageHeader = (title, subtitle) => (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Edit variations</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setMode('list')}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/60 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to variants
        </button>
      </div>
    </section>
  )

  if (mode === 'add') {
    return (
      <div className="page-enter space-y-5">
        {pageHeader(
          'Add new variants',
          'Add one or more option types — Color, Size, Material, and more — each with its own values. Then fill in photo, price, and stock for every value.',
        )}
        <AddVariantFlow
          productId={productId}
          productValues={productValues}
          entries={entries}
          prefillAttribute={addPrefillAttribute}
          createVariantMutation={createVariantMutation}
          updateSingleVariantMutation={updateSingleVariantMutation}
          deleteVariantMutation={deleteVariantMutation}
        />
      </div>
    )
  }

  return (
    <>
      <VariantListView
        productId={productId}
        entries={entries}
        onAdd={handleAdd}
        onEdit={setDrawerEntry}
        onFinished={onFinished}
        deleteVariantMutation={deleteVariantMutation}
      />

      <VariantDetailsDrawer
        open={Boolean(drawerEntry)}
        attribute={drawerEntry?.variation.attribute ?? ''}
        value={drawerEntry?.variantValue.value ?? null}
        initialValues={
          drawerEntry
            ? toVariantFormValues(drawerEntry.variantValue, drawerEntry.variation.attribute)
            : EMPTY_VARIANT_VALUES
        }
        productValues={productValues}
        onClose={() => setDrawerEntry(null)}
        onSave={handleSaveFromDrawer}
        isSaving={updateSingleVariantMutation.isPending}
      />
    </>
  )
}
