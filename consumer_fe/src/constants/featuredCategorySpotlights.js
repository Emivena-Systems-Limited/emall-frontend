import Images from '../utils/Images'

export const CATEGORIES_PAGE_HEADER = {
  title: 'Browse Categories',
  description:
    'Explore our vast collection of products curated across specialized departments designed for your lifestyle.',
}

export const FEATURED_CATEGORY_SPOTLIGHTS = [
  {
    id: 'phones_and_accessories',
    slug: 'phones_and_accessories',
    href: '/categories/phones_and_accessories',
    featured: true,
    badge: 'New Arrivals',
    title: 'Phones and Accessories',
    subtitle: 'Explore our latest phones and accessories.',
    image:Images.categories.phones_and_accessoriesImage
  },
  {
    id: 'home_and_kitchen',
    slug: 'home_and_kitchen',
    href: '/categories/home_and_kitchen',
    featured: false,
    title: 'Home and Kitchen',
    subtitle: "Explore our latest home and kitchen products.",
    image:Images.categories.home_and_kitchenImage
  },
]
