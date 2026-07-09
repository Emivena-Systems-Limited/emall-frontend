/**
 * Default subcategories when the API returns a parent without children.
 * Slugs are used for routing and image resolution.
 */
const PARENT_SLUG_ALIASES = {
  'phones-and-tablets': 'phones-tablets',
  'phone-tablets': 'phones-tablets',
  'phone-tablet': 'phones-tablets',
  'construction-and-tools': 'construction-tools',
  'construction-and-tools-equipment': 'construction-tools',
  'computer-laptop': 'computing',
  computers: 'computing',
  'baby-and-maternity': 'baby-and-maternity',
  baby_maternity: 'baby-and-maternity',
  'bags-and-luggage': 'bags-and-luggage',
  bags_luggage: 'bags-and-luggage',
}

export const PARENT_SUBCATEGORY_FALLBACKS = {
  'phones-tablets': [
    { slug: 'featured-phones', name: 'Featured Phones' },
    { slug: 'tablets', name: 'Tablets' },
    { slug: 'smart-watches', name: 'Smart Watches' },
    { slug: 'chargers', name: 'Chargers' },
    { slug: 'phone-cases', name: 'Phone Cases' },
  ],
  'phones-accessories': [
    { slug: 'featured-phones', name: 'Featured Phones' },
    { slug: 'tablets', name: 'Tablets' },
    { slug: 'smart-watches', name: 'Smart Watches' },
    { slug: 'chargers', name: 'Chargers' },
    { slug: 'cases', name: 'Cases & Covers' },
  ],
  computing: [
    { slug: 'laptops', name: 'Laptops' },
    { slug: 'desktops', name: 'Desktops' },
    { slug: 'monitors', name: 'Monitors' },
    { slug: 'keyboards', name: 'Keyboards' },
    { slug: 'storage', name: 'Storage & Drives' },
  ],
  agriculture: [
    { slug: 'seeds', name: 'Seeds & Plants' },
    { slug: 'farm-equipment', name: 'Farm Equipment' },
    { slug: 'irrigation', name: 'Irrigation' },
    { slug: 'livestock', name: 'Livestock Supplies' },
    { slug: 'fertilizers', name: 'Fertilizers' },
  ],
  'construction-tools': [
    { slug: 'power-tools', name: 'Power Tools' },
    { slug: 'hand-tools', name: 'Hand Tools' },
    { slug: 'safety-gear', name: 'Safety Gear' },
    { slug: 'building-materials', name: 'Building Materials' },
    { slug: 'measuring-tools', name: 'Measuring Tools' },
  ],
  construction: [
    { slug: 'power-tools', name: 'Power Tools' },
    { slug: 'hand-tools', name: 'Hand Tools' },
    { slug: 'safety-gear', name: 'Safety Gear' },
    { slug: 'building-materials', name: 'Building Materials' },
  ],
  automotive: [
    { slug: 'parts', name: 'Auto Parts' },
    { slug: 'tires', name: 'Tires & Wheels' },
    { slug: 'car-care', name: 'Car Care' },
    { slug: 'accessories', name: 'Car Accessories' },
  ],
  groceries: [
    { slug: 'fresh-produce', name: 'Fresh Produce' },
    { slug: 'pantry', name: 'Pantry Staples' },
    { slug: 'beverages', name: 'Beverages' },
    { slug: 'snacks', name: 'Snacks' },
  ],
  services: [
    { slug: 'repairs', name: 'Repairs' },
    { slug: 'installation', name: 'Installation' },
    { slug: 'consulting', name: 'Consulting' },
    { slug: 'maintenance', name: 'Maintenance' },
  ],
  'industrial-commercial-equipment': [
    { slug: 'machinery', name: 'Machinery' },
    { slug: 'safety', name: 'Industrial Safety' },
    { slug: 'material-handling', name: 'Material Handling' },
    { slug: 'generators', name: 'Generators' },
  ],
  'baby-and-maternity': [
    { slug: 'baby-clothing', name: 'Baby Clothing' },
    { slug: 'feeding', name: 'Feeding & Nursing' },
    { slug: 'diapering', name: 'Diapering' },
    { slug: 'strollers', name: 'Strollers & Gear' },
    { slug: 'maternity-wear', name: 'Maternity Wear' },
  ],
  'bags-and-luggage': [
    { slug: 'handbags', name: 'Handbags' },
    { slug: 'backpacks', name: 'Backpacks' },
    { slug: 'travel-luggage', name: 'Travel Luggage' },
    { slug: 'laptop-bags', name: 'Laptop Bags' },
    { slug: 'wallets', name: 'Wallets & Purses' },
  ],
}

export function getSubcategoryFallbacksForParent(parentSlug = '') {
  const normalized = parentSlug.toLowerCase().trim()
  const resolved = PARENT_SLUG_ALIASES[normalized] ?? normalized
  return PARENT_SUBCATEGORY_FALLBACKS[resolved] ?? []
}
