import {
  CircleAlert,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
} from 'lucide-react'

export const PRODUCT_CONDITION_FILTERS = [
  { id: 'new', label: 'New', icon: Sparkles },
  { id: 'like_new', label: 'Like new', icon: Star },
  { id: 'good', label: 'Good', icon: ThumbsUp },
  { id: 'fair', label: 'Fair', icon: CircleAlert },
  { id: 'refurbished', label: 'Refurbished', icon: Wrench },
]

const CONDITION_LABELS = Object.fromEntries(
  PRODUCT_CONDITION_FILTERS.map(({ id, label }) => [id, label]),
)

export function formatProductCondition(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return null
  return CONDITION_LABELS[normalized] ?? String(value).trim()
}
