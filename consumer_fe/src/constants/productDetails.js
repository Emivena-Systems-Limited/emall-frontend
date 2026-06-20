import { bestSellersCategories } from './bestSellersProducts'
import { exploreInterestsProducts } from './exploreInterestsProducts'
import { flashSaleProducts } from './flashSalesProducts'
import { recommendedProducts } from './recommendedProducts'

const sourceProducts = [
  ...recommendedProducts,
  ...bestSellersCategories.flatMap((category) => category.products),
  ...flashSaleProducts,
  ...exploreInterestsProducts,
]

const uniqueProducts = Array.from(
  new Map(sourceProducts.map((product) => [product.href, product])).values(),
)

const caseImages = [
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&h=900&fit=crop&q=90',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=900&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&h=900&fit=crop&q=85',
]

const reviewCards = [
  {
    id: 'review-1',
    name: 'Isaac Morgan',
    rating: 5,
    date: 'Jan 09, 2026',
    text: 'This item is exactly as described. The finishing feels solid and delivery was quick.',
  },
  {
    id: 'review-2',
    name: 'Akua Mensah',
    rating: 5,
    date: 'Jan 06, 2026',
    text: 'Good quality and comfortable to use every day. I would buy from this seller again.',
  },
  {
    id: 'review-3',
    name: 'Isaac Morgan',
    rating: 4,
    date: 'Jan 04, 2026',
    text: 'Looks nice and fits well. Packaging was clean and the product arrived safely.',
  },
  {
    id: 'review-4',
    name: 'Ama Boatemaa',
    rating: 5,
    date: 'Dec 29, 2025',
    text: 'The color and texture matched the photos. Great value for the price.',
  },
]

function getSlug(product) {
  return product.href.replace('/products/', '')
}

function buildGallery(product) {
  if (getSlug(product) === 'retro-phone-case') return caseImages
  return [
    product.image.replace('w=400&h=400', 'w=1200&h=900'),
    product.image,
    product.image.replace('q=80', 'q=70'),
    product.image.replace('fit=crop', 'fit=fill'),
  ]
}

function buildDetails(product, index) {
  const hasDiscount = product.compareAt && product.compareAt > product.price
  const discountPercent = product.discountPercent ?? (hasDiscount
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : null)
  const slug = getSlug(product)
  const isCase = slug === 'retro-phone-case'
  const inStock = index % 9 !== 7

  return {
    ...product,
    slug,
    title: isCase ? '17 Series Orange Retro Phone Case' : product.name,
    storeName: isCase ? 'Spintex Store' : index % 2 === 0 ? 'EZ Stores' : 'Noble Retail',
    salesCount: isCase ? 761 : 120 + index * 18,
    soldIndicator: isCase ? '10k+ bought in past month' : `${120 + index * 18}+ bought in past month`,
    discountPercent,
    inStock,
    stockCount: inStock ? Math.max(3, 12 - (index % 8)) : 0,
    gallery: buildGallery(product),
    colors: isCase ? ['Black', 'Orange', 'Grey', 'Brown'] : index % 3 === 0 ? ['Black', 'Grey'] : [],
    sizes: isCase
      ? ['iphone 14', 'iphone 14 Pro', 'iphone 14 Pro Max', 'iphone 15', 'iphone 15 Plus', 'iphone 15 Pro', 'iphone 15 Pro Max', 'iphone 17']
      : index % 4 === 0
        ? ['Small', 'Medium', 'Large', 'XL']
        : [],
    about: [
      'Ensure the perfect fit by referring to the size guide on the product page.',
      'Features a comfortable everyday build with smooth edges and dependable protection.',
      'Lightweight and resistant to scratches, drops, and everyday impacts.',
      'Crafted from supportive material for long-lasting appearance and easy handling.',
      'Note: Actual color may vary slightly because of lighting and screen settings.',
    ],
    keyDetails: {
      'Package Dimensions': isCase ? '187 x 304 x 35 inches; 705 ounces' : 'Standard retail package',
      'Item model number': slug,
      Department: 'General accessories',
      'Date First Available': 'September 5, 2025',
      Manufacturer: product.storeName ?? 'EZ-Stores Marketplace',
      ASIN: `EZ-${slug.toUpperCase().slice(0, 10)}`,
    },
    description:
      'This product combines dependable everyday protection with a clean modern finish. It is made for regular use, simple handling, and a polished look that works well across different styles and settings.',
    details: {
      SKU: `SKU-${slug.toUpperCase().slice(0, 8)}`,
      Condition: 'Brand New',
      Texture: isCase ? 'Cotton Feel' : 'Premium Finish',
      'Other Spec': 'Lorem Ipsum sit d',
    },
    ratingDistribution: [
      { label: 'Small', value: 7 },
      { label: 'True to size', value: 88 },
      { label: 'Large', value: 4 },
    ],
    reviews: reviewCards,
  }
}

export const productDetails = uniqueProducts.map(buildDetails)

export function getProductBySlug(slug) {
  return productDetails.find((product) => product.slug === slug) ?? productDetails[0]
}

export function getRelatedProducts(currentSlug, limit = 10) {
  return productDetails.filter((product) => product.slug !== currentSlug).slice(0, limit)
}
