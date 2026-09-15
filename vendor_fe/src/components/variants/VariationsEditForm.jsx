import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Layers3 } from 'lucide-react'
import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateSingleVariantMutation,
} from '../../hooks/useProductMutations'
import { iterateVariantFormEntries } from '../../utils/productPayload'
import {
  filterOptionalVariantEntries,
  inferListingTypeFromValues,
  resolveDefaultVariantEntry,
} from '../../utils/defaultProductVariation'
import { LISTING_TYPES, isSimpleListing } from '../../constants/productListing'
import ListingTypeStep from '../products/ListingTypeStep'
import AddVariantFlow from './AddVariantFlow'
import VariantListView from './VariantListView'

/** Mode manager for the Manage Variations section: switches between the variant list and the add-variant flow. */
export default function VariationsEditForm({ productId, formState, onFinished }) {
  const listingValues = formState.formValues
  const allEntries = iterateVariantFormEntries(listingValues.variations)
  const extraEntries = filterOptionalVariantEntries(allEntries, listingValues)
  const hasExtraVariants = extraEntries.length > 0
  const inferredListingType = hasExtraVariants
    ? LISTING_TYPES.VARIANTS
    : inferListingTypeFromValues(listingValues)

  const [mode, setMode] = useState('list') // 'choose' | 'list' | 'add'
  const [listingChoice, setListingChoice] = useState(inferredListingType)
  const [showTypeChooser, setShowTypeChooser] = useState(() => !hasExtraVariants)
  const [addPrefillAttribute, setAddPrefillAttribute] = useState('')

  const updateSingleVariantMutation = useUpdateSingleVariantMutation()
  const createVariantMutation = useCreateProductVariantMutation()
  const deleteVariantMutation = useDeleteProductVariantMutation()

  const productValues = useMemo(
    () => ({ ...listingValues, barcode: '', listing_type: listingChoice }),
    [listingValues, listingChoice],
  )
  const defaultEntry = resolveDefaultVariantEntry(allEntries, listingValues, {
    mainImage: formState.mainImage,
    subImages: formState.subImages,
  })

  const handleAdd = (prefillAttribute = '') => {
    setAddPrefillAttribute(prefillAttribute)
    setMode('add')
  }

  const handleListingTypeChange = (nextType) => {
    setListingChoice(nextType)
    setShowTypeChooser(false)
    setMode('list')
  }

  const pageHeader = (title, subtitle, { showBackToList = false } = {}) => (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Edit variations</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        {showBackToList ? (
          <button
            type="button"
            onClick={() => setMode('list')}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/60 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Back to variants
          </button>
        ) : (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to products
            </Link>
            <Link
              to={`/products/${productId}/edit`}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/60 px-4 py-2.5 text-sm font-bold text-cyan-800 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50"
            >
              <Layers3 className="size-4 shrink-0" />
              Change section
            </Link>
          </div>
        )}
      </div>
    </section>
  )

  if (showTypeChooser) {
    return (
      <div className="page-enter space-y-5">
        {pageHeader(
          'How is this product sold?',
          'Choose a simple listing to keep one generated option, or add variants if shoppers pick a color, size, or another option.',
        )}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
          <ListingTypeStep
            value={listingChoice}
            onChange={setListingChoice}
          />
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!listingChoice}
              onClick={() => handleListingTypeChange(listingChoice)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (mode === 'add') {
    return (
      <div className="page-enter space-y-5">
        {pageHeader(
          'Add new variants',
          'Add extra colors, sizes, or other options. Color options need at least one photo (up to 3). Other types can skip photos.',
          { showBackToList: true },
        )}
        <AddVariantFlow
          productId={productId}
          productValues={productValues}
          entries={extraEntries}
          prefillAttribute={addPrefillAttribute}
          createVariantMutation={createVariantMutation}
          updateSingleVariantMutation={updateSingleVariantMutation}
          deleteVariantMutation={deleteVariantMutation}
        />
      </div>
    )
  }

  return (
    <VariantListView
      productId={productId}
      defaultEntry={defaultEntry}
      entries={extraEntries}
      productValues={productValues}
      listingValues={listingValues}
      mainImage={formState.mainImage}
      subImages={formState.subImages}
      descriptiveImages={formState.descriptiveImages ?? []}
      allowAddVariants={!isSimpleListing(listingChoice)}
      listingKind={isSimpleListing(listingChoice) ? LISTING_TYPES.SIMPLE : LISTING_TYPES.VARIANTS}
      hasLockedExtras={hasExtraVariants}
      onAdd={handleAdd}
      onSwitchToVariants={() => {
        setListingChoice(LISTING_TYPES.VARIANTS)
        setShowTypeChooser(false)
        setMode('list')
      }}
      onChangeListingType={() => {
        setShowTypeChooser(true)
      }}
      onFinished={onFinished}
      updateSingleVariantMutation={updateSingleVariantMutation}
      deleteVariantMutation={deleteVariantMutation}
    />
  )
}
