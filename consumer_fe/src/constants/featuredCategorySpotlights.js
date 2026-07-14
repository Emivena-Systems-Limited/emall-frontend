import Images from '../utils/Images'

export const CATEGORIES_PAGE_HEADER = {
  title: 'Browse Categories',
  description:
    'Explore our vast collection of products curated across specialized departments designed for your lifestyle.',
}

export const FEATURED_CATEGORY_SPOTLIGHTS = [
  {
    id: 'phones_and_accessories',
    slug: 'mobile-phones-accessories',
    href: '/categories/mobile-phones-accessories',
    featured: true,
    badge: 'New Arrivals',
    title: 'Phones and Accessories',
    subtitle: 'Explore our latest phones and accessories.',
    image:Images.categories.phones_and_accessoriesImage
  },
  {
    id: 'home_and_kitchen',
    slug: 'home-kitchen',
    href: '/categories/home-kitchen',
    featured: false,
    title: 'Home and Kitchen',
    subtitle: "Explore our latest home and kitchen products.",
    image:Images.categories.home_and_kitchenImage
  },
]
