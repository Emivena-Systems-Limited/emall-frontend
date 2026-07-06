/**
 * Anticipatory knowledge base for variant filters.
 *
 * Real variant attribute filters only ever render when products actually carry
 * that attribute's data — this file does not invent filters. What it does is
 * predict, from the category/subcategory the shopper is browsing, which of the
 * attributes that DO exist should be surfaced first. e.g. a shopper browsing
 * "Smartphones" almost certainly wants Storage/RAM before Screen Size, while a
 * shopper browsing "Dresses" wants Size/Color before Material.
 *
 * Keywords are matched (case-insensitive substring) against the current
 * category label + subcategory label. The first matching group's attribute
 * order wins; multiple matching groups are merged in declaration order.
 */
const CATEGORY_FACET_PRIORITY_GROUPS = [
  {
    keywords: ['smartphone', 'iphone', 'samsung', 'phone', 'tablet', 'realme', 'xiaomi', 'oppo', 'vivo', 'oneplus', 'huawei', 'infinix', 'tecno'],
    attributes: ['storage', 'ram', 'screen size', 'color', 'connectivity', 'network', 'battery capacity'],
  },
  {
    keywords: ['laptop', 'macbook', 'desktop', 'gaming pc', 'computing', 'computer'],
    attributes: ['processor', 'ram', 'storage', 'screen size', 'graphics', 'color'],
  },
  {
    keywords: ['computer accessories', 'keyboard', 'mouse', 'monitor', 'docking'],
    attributes: ['connectivity', 'color', 'compatibility', 'size'],
  },
  {
    keywords: ['headphone', 'earbud', 'earphone', 'speaker', 'audio'],
    attributes: ['connectivity', 'color', 'battery life', 'noise cancellation'],
  },
  {
    keywords: ['mobile accessories', 'case', 'charger', 'power bank', 'cable'],
    attributes: ['compatibility', 'color', 'connectivity', 'capacity'],
  },
  {
    keywords: ['gaming console', 'playstation', 'xbox', 'nintendo'],
    attributes: ['storage', 'color', 'edition'],
  },
  {
    keywords: ['camera', 'dslr', 'mirrorless', 'photo'],
    attributes: ['resolution', 'sensor type', 'lens mount', 'color'],
  },
  {
    keywords: ['tv', 'refrigerator', 'washer', 'appliance'],
    attributes: ['screen size', 'capacity', 'energy rating', 'color', 'power'],
  },
  {
    keywords: ['home & kitchen', 'kitchen', 'cookware'],
    attributes: ['material', 'capacity', 'color', 'power'],
  },
  {
    keywords: ['home & office', 'furniture', 'office'],
    attributes: ['material', 'color', 'dimensions', 'capacity'],
  },
  {
    keywords: ['fashion', 'clothing', 'apparel', 'shirt', 'dress', 'jean', 'jacket', 'shoe', 'sneaker'],
    attributes: ['size', 'color', 'material', 'fit', 'pattern', 'sleeve length'],
  },
  {
    keywords: ['beauty', 'personal care', 'skincare', 'makeup', 'fragrance', 'cosmetic'],
    attributes: ['shade', 'volume', 'skin type', 'scent', 'color'],
  },
  {
    keywords: ['sports', 'outdoor', 'fitness'],
    attributes: ['size', 'color', 'material', 'weight capacity'],
  },
  {
    keywords: ['toys', 'game', 'kids'],
    attributes: ['age range', 'material', 'number of players', 'color'],
  },
]

const DEFAULT_ATTRIBUTE_PRIORITY = ['size', 'color', 'material']

const ANTICIPATORY_FACET_TEMPLATES = [
  {
    keywords: [
      'electronics', 'computing', 'computer', 'accessories', 'phone', 'smartphone',
      'headphone', 'audio', 'gaming', 'laptop', 'tablet', 'monitor', 'keyboard', 'mouse',
    ],
    facets: [
      {
        id: 'color',
        label: 'Color',
        values: ['Black', 'White', 'Blue', 'Pink', 'Green', 'Purple', 'Red', 'Grey', 'Beige', 'Yellow', 'Orange', 'Brown', 'Multicolor'],
      },
      {
        id: 'power mode',
        label: 'Power Mode',
        values: ['USB Charging', 'USB', 'Battery Powered/USB Dual Use', 'Without electricity', 'Battery Powered', 'Room electrical/hard wiring'],
      },
      {
        id: 'operating voltage',
        label: 'Operating Voltage',
        values: ['5V', '12V', '110V', '220V', '100-240V'],
      },
      {
        id: 'battery properties',
        label: 'Battery Properties',
        values: ['Rechargeable', 'Replaceable', 'Built-in', 'No battery'],
      },
      {
        id: 'material',
        label: 'Material',
        values: ['Plastic', 'Metal', 'Silicone', 'Leather', 'Fabric', 'Wood'],
      },
      {
        id: 'wireless property',
        label: 'Wireless Property',
        values: ['Bluetooth', 'Wi-Fi', 'Infrared', 'Wired only'],
      },
      {
        id: 'theme',
        label: 'Theme',
        values: ['Modern', 'Classic', 'Minimalist', 'Gaming'],
      },
      {
        id: 'rechargeable',
        label: 'Rechargeable',
        values: ['Yes', 'No'],
      },
    ],
  },
  {
    keywords: ['fashion', 'clothing', 'apparel', 'dress', 'shirt', 'shoe', 'sneaker'],
    facets: [
      { id: 'size', label: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'color', label: 'Color', values: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Brown'] },
      { id: 'material', label: 'Material', values: ['Cotton', 'Polyester', 'Denim', 'Leather', 'Wool', 'Linen'] },
      { id: 'fit', label: 'Fit', values: ['Slim', 'Regular', 'Relaxed', 'Oversized'] },
      { id: 'pattern', label: 'Pattern', values: ['Solid', 'Striped', 'Plaid', 'Floral', 'Graphic'] },
    ],
  },
  {
    keywords: ['beauty', 'personal care', 'skincare', 'makeup', 'cosmetic', 'fragrance'],
    facets: [
      { id: 'shade', label: 'Shade', values: ['Light', 'Medium', 'Dark', 'Fair', 'Deep'] },
      { id: 'volume', label: 'Volume', values: ['30ml', '50ml', '100ml', '250ml'] },
      { id: 'skin type', label: 'Skin Type', values: ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'] },
      { id: 'scent', label: 'Scent', values: ['Floral', 'Fresh', 'Woody', 'Citrus', 'Unscented'] },
    ],
  },
]

/**
 * Returns anticipatory facet definitions (with suggested values) for the
 * current category context. These surface in the filter bar even before
 * products carry variant data, and merge with real product values when present.
 */
export function getAnticipatedFacetDefinitions(categoryLabel = '', subcategoryLabel = '') {
  const haystack = `${categoryLabel} ${subcategoryLabel}`.toLowerCase()
  const facets = []
  const seen = new Set()

  ANTICIPATORY_FACET_TEMPLATES.forEach((group) => {
    if (!group.keywords.some((keyword) => haystack.includes(keyword))) return

    group.facets.forEach((facet) => {
      if (seen.has(facet.id)) return
      seen.add(facet.id)
      facets.push(facet)
    })
  })

  return facets
}

/**
 * Returns an ordered, deduplicated list of normalized attribute keys
 * (lowercase, space-separated — matching `normalizeFacetKey` output)
 * predicted to matter most for the given category/subcategory context.
 */
export function getAnticipatedFacetPriority(categoryLabel = '', subcategoryLabel = '') {
  const haystack = `${categoryLabel} ${subcategoryLabel}`.toLowerCase()
  const priority = []

  const addAll = (attributes) => {
    attributes.forEach((attribute) => {
      if (!priority.includes(attribute)) priority.push(attribute)
    })
  }

  CATEGORY_FACET_PRIORITY_GROUPS.forEach((group) => {
    if (group.keywords.some((keyword) => haystack.includes(keyword))) {
      addAll(group.attributes)
    }
  })

  addAll(DEFAULT_ATTRIBUTE_PRIORITY)

  return priority
}
