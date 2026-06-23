import { LOW_STOCK_THRESHOLD } from './lowStockData'
import { MOCK_BRANDS, MOCK_CATEGORIES } from './productData'

export { LOW_STOCK_THRESHOLD }

export const SUMMARY_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  LOW_STOCK: 'low_stock',
}

export const MOCK_PRODUCT_CATALOG = [
  {
    id: 'PRD-001',
    name: 'Wireless Earbuds Pro',
    sku: 'AUD-WEP-001',
    brand: 'Sony',
    brandSlug: 'sony',
    category: 'Electronics',
    categorySlug: 'electronics',
    stock: 42,
    status: 'active',
    price: 245,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf3f7f2b8fd?w=120&h=120&fit=crop',
    createdAt: '2026-01-15T09:20:00Z',
  },
  {
    id: 'PRD-014',
    name: 'Smart Watch Series 4',
    sku: 'ELC-SW4-014',
    brand: 'Apple',
    brandSlug: 'apple',
    category: 'Electronics',
    categorySlug: 'electronics',
    stock: 28,
    status: 'active',
    price: 890,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop',
    createdAt: '2026-02-03T14:10:00Z',
  },
  {
    id: 'PRD-022',
    name: 'Running Sneakers',
    sku: 'FTW-RSN-014',
    brand: 'Nike',
    brandSlug: 'nike',
    category: 'Fashion',
    categorySlug: 'fashion',
    stock: 18,
    status: 'active',
    price: 340,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',
    createdAt: '2026-02-18T11:45:00Z',
  },
  {
    id: 'PRD-009',
    name: 'Portable Blender',
    sku: 'HOM-PBL-009',
    brand: 'Samsung',
    brandSlug: 'samsung',
    category: 'Home & Living',
    categorySlug: 'home-living',
    stock: 3,
    status: 'active',
    price: 120,
    image: 'https://images.unsplash.com/photo-1570222094114-792a308585bc?w=120&h=120&fit=crop',
    createdAt: '2026-03-01T08:30:00Z',
  },
  {
    id: 'PRD-018',
    name: 'Desk LED Lamp',
    sku: 'HOM-DLL-009',
    brand: 'IKEA',
    brandSlug: 'ikea',
    category: 'Home & Living',
    categorySlug: 'home-living',
    stock: 7,
    status: 'draft',
    price: 120,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&h=120&fit=crop',
    createdAt: '2026-03-05T16:00:00Z',
  },
  {
    id: 'PRD-031',
    name: 'USB-C Hub 7-in-1',
    sku: 'ELC-UCH-031',
    brand: 'Sony',
    brandSlug: 'sony',
    category: 'Electronics',
    categorySlug: 'electronics',
    stock: 5,
    status: 'inactive',
    price: 185,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop',
    createdAt: '2026-03-10T10:15:00Z',
  },
  {
    id: 'PRD-042',
    name: 'Ceramic Coffee Mug Set',
    sku: 'HOM-CCM-042',
    brand: 'IKEA',
    brandSlug: 'ikea',
    category: 'Home & Living',
    categorySlug: 'home-living',
    stock: 4,
    status: 'active',
    price: 95,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop',
    createdAt: '2026-03-12T13:20:00Z',
  },
  {
    id: 'PRD-055',
    name: 'Bluetooth Speaker Mini',
    sku: 'ELC-BSM-055',
    brand: 'Sony',
    brandSlug: 'sony',
    category: 'Electronics',
    categorySlug: 'electronics',
    stock: 2,
    status: 'active',
    price: 210,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&h=120&fit=crop',
    createdAt: '2026-03-14T09:50:00Z',
  },
]

export const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All categories' },
  ...MOCK_CATEGORIES.map((category) => ({
    value: category.slug,
    label: category.name,
  })),
]

export const BRAND_FILTER_OPTIONS = [
  { value: '', label: 'All brands' },
  ...MOCK_BRANDS.map((brand) => ({
    value: brand.slug,
    label: brand.label,
  })),
]

export function isLowStockProduct(product) {
  if (product.stock == null || product.stock === '') return false
  return product.stock <= LOW_STOCK_THRESHOLD
}

export function getCatalogSummary(products) {
  return {
    listed: products.length,
    active: products.filter((product) => product.status === 'active').length,
    lowStock: products.filter(isLowStockProduct).length,
  }
}
