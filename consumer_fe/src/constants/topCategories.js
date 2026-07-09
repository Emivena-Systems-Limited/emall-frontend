import Images from '../utils/Images'
import { getTopCategoryIcon } from '../utils/topCategoryIcons'

export const topCategories = [
  {
    id: 'Fashion',
    label: 'Fashion',
    href: '/categories/fashion',
    image: getTopCategoryIcon('fashion') ?? Images.top_categories.fashion,
  },
  {
    id: 'Electronics',
    label: 'Electronics',
    href: '/categories/electronics',
    image: getTopCategoryIcon('electronics') ?? Images.top_categories.electronics,
  },
  {
    id: 'Home & Kitchen',
    label: 'Home & Kitchen',
    href: '/categories/home-kitchen',
    image: getTopCategoryIcon('home-kitchen') ?? Images.top_categories.home_kitchen,
  },
  {
    id: 'Beauty & Personal Care',
    label: 'Beauty & Personal Care',
    href: '/categories/beauty-personal-care',
    image: getTopCategoryIcon('beauty-health') ?? Images.top_categories.beauty_personal_care,
  },
  {
    id: 'Sports & Outdoors',
    label: 'Sports & Outdoors',
    href: '/categories/sports-outdoors',
    image: getTopCategoryIcon('sports-outdoors') ?? Images.top_categories.sports_outdoors,
  },
  {
    id: 'Toys & Games',
    label: 'Toys & Games',
    href: '/categories/toys-games',
    image: getTopCategoryIcon('toys-games') ?? Images.top_categories.toys_games,
  },
  {
    id: 'Computing',
    label: 'Computing',
    href: '/categories/computing',
    image: getTopCategoryIcon('computing') ?? Images.top_categories.computing,
  },
  {
    id: 'Appliances',
    label: 'Appliances',
    href: '/categories/appliances',
    image: getTopCategoryIcon('appliances') ?? Images.top_categories.appliances,
  },
  {
    id: 'Home & Office',
    label: 'Home & Office',
    href: '/categories/home-office',
    image: getTopCategoryIcon('home-office') ?? Images.top_categories.home_office,
  },
  {
    id: 'Phones & Accessories',
    label: 'Phones & Accessories',
    href: '/categories/phones-accessories',
    image: getTopCategoryIcon('mobile-phones-accessories') ?? Images.top_categories.phones_accessories,
  },
]
