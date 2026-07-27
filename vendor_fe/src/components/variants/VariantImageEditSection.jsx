import VariantImageUpload from '../products/VariantImageUpload'
import { summarizeVariantImageChanges } from '../../utils/productImageEditUtils'

function VariantImageEditChangeSummary({ summary }) {
  if (!summary?.hasChanges) return null

  let message = 'You have unsaved photo changes. Save to update what customers see.'

  if (summary.replaced) {
    message = 'You chose a new photo. Save to update what customers see.'
  } else if (summary.added && !summary.removedOnly) {
    message = 'You added a new photo. Save to update what customers see.'
  }

  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3">
      <p className="text-sm leading-relaxed text-amber-950">{message}</p>
    </section>
  )
}

export default function VariantImageEditSection({
  imageBaseline,
  images,
  onChange,
  error = '',
  maxImages,
  label = 'Variant image',
  hint = 'JPG or PNG · Max 5MB',
  thumbnailSizeClass = 'size-20 sm:size-24',
}) {
  const changeSummary = summarizeVariantImageChanges(imageBaseline, { images })

  return (
    <div className="space-y-4">
      <VariantImageEditChangeSummary summary={changeSummary} />

      <VariantImageUpload
        label={label}
        hint={hint}
        images={images}
        maxImages={maxImages}
        thumbnailSizeClass={thumbnailSizeClass}
        onChange={onChange}
        error={error}
      />
    </div>
  )
}
