export const PRODUCT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const MOCK_BRANDS = [
  { value: 'samsung', label: 'Samsung', slug: 'samsung' },
  { value: 'apple', label: 'Apple', slug: 'apple' },
  { value: 'sony', label: 'Sony', slug: 'sony' },
  { value: 'nike', label: 'Nike', slug: 'nike' },
  { value: 'ikea', label: 'IKEA', slug: 'ikea' },
]

export const MOCK_CATEGORIES = [
  {
    slug: 'electronics',
    name: 'Electronics',
    guide: 'Best for phones, laptops, accessories, audio devices, and home gadgets.',
    subcategories: [
      { slug: 'phones-tablets', name: 'Phones & Tablets', type: 'electronics' },
      { slug: 'computing', name: 'Computing', type: 'electronics' },
      { slug: 'audio', name: 'Audio', type: 'electronics' },
    ],
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    guide: 'Best for clothing, shoes, bags, watches, and wearable accessories.',
    subcategories: [
      { slug: 'menswear', name: 'Menswear', type: 'fashion' },
      { slug: 'womenswear', name: 'Womenswear', type: 'fashion' },
      { slug: 'footwear', name: 'Footwear', type: 'fashion' },
    ],
  },
  {
    slug: 'home-living',
    name: 'Home & Living',
    guide: 'Best for furniture, lighting, kitchenware, decor, and home appliances.',
    subcategories: [
      { slug: 'furniture', name: 'Furniture', type: 'home' },
      { slug: 'kitchen', name: 'Kitchen', type: 'home' },
      { slug: 'decor', name: 'Decor', type: 'home' },
    ],
  },
]

export const METADATA_TEMPLATES = {
  electronics: [
    { key: 'color', label: 'Color', placeholder: 'Black' },
    { key: 'storage', label: 'Storage', placeholder: '256GB' },
    { key: 'warranty', label: 'Warranty', placeholder: '12 months' },
    { key: 'weight', label: 'Weight', placeholder: '200g' },
  ],
  fashion: [
    { key: 'color', label: 'Color', placeholder: 'Navy Blue' },
    { key: 'size', label: 'Size', placeholder: 'M / 42 / UK 9' },
    { key: 'material', label: 'Material', placeholder: 'Cotton' },
    { key: 'fit', label: 'Fit', placeholder: 'Slim fit' },
  ],
  home: [
    { key: 'color', label: 'Color', placeholder: 'Oak Brown' },
    { key: 'dimensions', label: 'Dimensions', placeholder: '120 x 60 x 75cm' },
    { key: 'material', label: 'Material', placeholder: 'Wood' },
    { key: 'weight', label: 'Weight', placeholder: '8kg' },
  ],
  default: [
    { key: 'color', label: 'Color', placeholder: 'Black' },
    { key: 'weight', label: 'Weight', placeholder: '200g' },
    { key: 'material', label: 'Material', placeholder: 'Cotton' },
  ],
}

export const PRODUCT_TABLE_ROWS = [
  {
    id: 1,
    name: 'Wireless Earbuds Pro',
    sku: 'AUD-WEP-001',
    brand: 'Sony',
    category: 'Electronics',
    stock: 42,
    status: 'active',
    price: 245,
    updatedAt: 'Today',
  },
  {
    id: 2,
    name: 'Running Sneakers',
    sku: 'FTW-RSN-014',
    brand: 'Nike',
    category: 'Fashion',
    stock: 18,
    status: 'active',
    price: 340,
    updatedAt: 'Yesterday',
  },
  {
    id: 3,
    name: 'Desk LED Lamp',
    sku: 'HOM-DLL-009',
    brand: 'IKEA',
    category: 'Home & Living',
    stock: 7,
    status: 'draft',
    price: 120,
    updatedAt: '2 days ago',
  },
]
