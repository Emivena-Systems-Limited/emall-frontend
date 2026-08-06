import { isBlankVariantField } from './variantFormUtils'
import { normalizeProductDescription } from '../../utils/productDescriptionHtml'

export default function VariantDescriptionContent({ value, className = '' }) {
  if (isBlankVariantField(value) || String(value).trim() === 'N/A') return null

  const { descriptionHtml, description } = normalizeProductDescription(String(value).trim())

  if (descriptionHtml) {
    return (
      <div
        className={`product-description ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    )
  }

  return (
    <p className={className}>{description}</p>
  )
}
