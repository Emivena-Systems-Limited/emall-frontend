import Images from '../utils/Images'

export const CATEGORIES_PAGE_HEADER = {
  title: 'Browse Categories',
  description:
    'Explore our vast collection of products curated across specialized departments designed for your lifestyle.',
}

export const FEATURED_CATEGORY_SPOTLIGHTS = [
  {
    id: 'electronics',
    slug: 'electronics',
    href: '/categories/electronics',
    featured: true,
    badge: 'Featured Department',
    title: 'Next-Gen Electronics',
    subtitle: 'Upgrade your productivity with our latest arrivals.',
    image:Images.categories.electronicsImage
  },
  {
    id: 'fashion',
    slug: 'fashion',
    href: '/categories/fashion',
    featured: false,
    title: 'Curated Fashion',
    subtitle: "Defining tomorrow's style today.",
    image:
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
]
