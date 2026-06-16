export const LOW_STOCK_THRESHOLD = 10

export const LOW_STOCK_PRODUCTS = [
  {
    id: 'PRD-009',
    name: 'Portable Blender',
    thumbnail: 'https://images.unsplash.com/photo-1570222094114-792a308585bc?w=120&h=120&fit=crop',
    stock: 3,
  },
  {
    id: 'PRD-031',
    name: 'USB-C Hub 7-in-1',
    thumbnail: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop',
    stock: 5,
  },
  {
    id: 'PRD-018',
    name: 'Desk LED Lamp',
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&h=120&fit=crop',
    stock: 7,
  },
  {
    id: 'PRD-042',
    name: 'Ceramic Coffee Mug Set',
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop',
    stock: 4,
  },
  {
    id: 'PRD-055',
    name: 'Bluetooth Speaker Mini',
    thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&h=120&fit=crop',
    stock: 2,
  },
  {
    id: 'PRD-061',
    name: 'Yoga Mat Pro',
    thumbnail: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=120&h=120&fit=crop',
    stock: 6,
  },
  {
    id: 'PRD-073',
    name: 'Stainless Water Bottle',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop',
    stock: 8,
  },
]

export const DASHBOARD_LOW_STOCK_LIMIT = 5

export function isLowStock(stock) {
  return stock <= LOW_STOCK_THRESHOLD
}
