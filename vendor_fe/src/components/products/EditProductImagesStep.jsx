import { Info } from 'lucide-react'
import { ImagesStep } from '../../pages/products/AddProduct'
import ProductImageEditChangeSummary from './ProductImageEditChangeSummary'
import { summarizeProductImageChanges } from '../../utils/productImageEditUtils'

export default function EditProductImagesStep({
  imageBaseline,
  mainImage,
  onMainImageChange,
  mainImageError,
  subImages,
  onSubImagesChange,
  subImagesError = '',
  descriptiveImages = [],
  onDescriptiveImagesChange,
  descriptiveImagesError = '',
}) {
  const changeSummary = summarizeProductImageChanges(imageBaseline, {
    mainImage,
    subImages,
    descriptiveImages,
  })

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-cyan-800" />
          <div>
            <p className="text-sm font-semibold text-cyan-950">Editing product photos</p>
            <p className="mt-0.5 text-xs leading-relaxed text-cyan-900/80">
              Remove photos you no longer need, replace any image by uploading a new file, or add new gallery and detail shots. Kept photos keep their backend id; new files upload first and save with upload_id.
            </p>
          </div>
        </div>
      </div>

      <ProductImageEditChangeSummary summary={changeSummary} />

      <ImagesStep
        mainImage={mainImage}
        onMainImageChange={onMainImageChange}
        mainImageError={mainImageError}
        subImages={subImages}
        onSubImagesChange={onSubImagesChange}
        subImagesError={subImagesError}
        descriptiveImages={descriptiveImages}
        onDescriptiveImagesChange={onDescriptiveImagesChange}
        descriptiveImagesError={descriptiveImagesError}
      />
    </div>
  )
}
