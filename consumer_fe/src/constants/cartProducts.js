import { bestSellersCategories } from './bestSellersProducts'
import { recommendedProducts } from './recommendedProducts'

export const initialCartItems = [
  {
    id: 'cart-iphone-17',
    name: 'Iphone 17',
    variant: 'Natural space grey',
    storage: '256GB',
    price: 15,
    compareAt: 18,
    quantity: 4,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=320&h=320&fit=crop&q=80',
  },
  {
    id: 'cart-swatch-watch',
    name: 'Swatch Watch',
    variant: 'Phantom Black',
    storage: '128GB',
    price: 20,
    compareAt: 24,
    quantity: 5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=320&h=320&fit=crop&q=80',
  },
  {
    id: 'cart-polo-shirt',
    name: 'Polo Shirt',
    variant: 'Obsidian',
    storage: '256GB',
    price: 25,
    compareAt: 30,
    quantity: 6,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=320&h=320&fit=crop&q=80',
  },
  {
    id: 'cart-jbl-headset',
    name: 'JBL Headset',
    variant: 'Eternal Green',
    storage: '256GB',
    price: 18,
    compareAt: 22,
    quantity: 4,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=320&h=320&fit=crop&q=80',
  },
]

export const cartRelatedProducts = [
  ...bestSellersCategories.flatMap((category) => category.products),
  ...recommendedProducts,
].slice(0, 10)
