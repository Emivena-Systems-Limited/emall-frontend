import { Plus, Trash2 } from 'lucide-react'
import FieldError from '../auth/FieldError'
import { OptionalSection, OptionalSectionHeader, ProductInput } from './ProductFormControls'

function getPairFieldError(errors, touched, submitCount, index, field) {
  const error = errors?.[index]?.[field]
  const isTouched = touched?.[index]?.[field] || submitCount > 0
  return isTouched && typeof error === 'string' ? error : undefined
}

export default function ProductKeyDetailsInput({
  pairs = [],
  onChange,
  errors = [],
  touched = [],
  submitCount = 0,
}) {
  const updatePair = (index, field, value) => {
    onChange(
      pairs.map((pair, pairIndex) => (
        pairIndex === index ? { ...pair, [field]: value } : pair
      )),
    )
  }

  const addPair = () => {
    onChange([
      ...pairs,
      {
        id: `kd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        key: '',
        value: '',
      },
    ])
  }

  const removePair = (index) => {
    onChange(pairs.filter((_, pairIndex) => pairIndex !== index))
  }

  return (
    <OptionalSection dataField="key_details">
      <OptionalSectionHeader
        eyebrow="Key details"
        title="Product properties"
        description="You can skip this section. Add property and value pairs only if they help buyers — e.g. material, warranty, or compatibility."
      />

      {pairs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center">
          <p className="text-sm font-medium text-slate-600">No key details added</p>
          <p className="mt-1 text-xs text-slate-400">This is optional — continue without adding any.</p>
          <button
            type="button"
            onClick={addPair}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand"
          >
            <Plus className="size-3.5" />
            Add key detail
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map((pair, index) => (
            <div
              key={pair.id ?? `key-detail-${index}`}
              className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start"
            >
              <ProductInput
                id={`key_details.${index}.key`}
                name={`key_details.${index}.key`}
                label="Property"
                placeholder="e.g. Material"
                value={pair.key}
                onChange={(event) => updatePair(index, 'key', event.target.value)}
                error={getPairFieldError(errors, touched, submitCount, index, 'key')}
              />
              <ProductInput
                id={`key_details.${index}.value`}
                name={`key_details.${index}.value`}
                label="Property value"
                placeholder="e.g. Stainless steel"
                value={pair.value}
                onChange={(event) => updatePair(index, 'value', event.target.value)}
                error={getPairFieldError(errors, touched, submitCount, index, 'value')}
              />
              <div className="flex items-end sm:pt-7">
                <button
                  type="button"
                  onClick={() => removePair(index)}
                  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                  aria-label={`Remove key detail ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPair}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand"
          >
            <Plus className="size-3.5" />
            Add another key detail
          </button>
        </div>
      )}

      {typeof errors === 'string' && <FieldError message={errors} />}
    </OptionalSection>
  )
}
