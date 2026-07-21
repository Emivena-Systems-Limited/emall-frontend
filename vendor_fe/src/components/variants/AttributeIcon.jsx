import { Boxes, Layers3, Palette, Ruler, Sparkles, Tag, Weight as WeightIcon } from 'lucide-react'

export default function AttributeIcon({ attribute, className }) {
  switch (attribute) {
    case 'Color':
      return <Palette className={className} />
    case 'Size':
      return <Ruler className={className} />
    case 'Material':
      return <Layers3 className={className} />
    case 'Weight':
      return <WeightIcon className={className} />
    case 'Style':
      return <Sparkles className={className} />
    case 'Capacity':
      return <Boxes className={className} />
    default:
      return <Tag className={className} />
  }
}
