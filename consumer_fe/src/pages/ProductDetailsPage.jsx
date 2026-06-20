import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import ProductCard from '../components/shared/ProductCard'
import { getProductBySlug, getRelatedProducts } from '../constants/productDetails'
import { formatCedi } from '../utils/formatCurrency'

function Stars({ rating, size = 'size-4' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < full
        const halfFilled = !filled && index === full && half
        return (
          <span key={index} className={`relative inline-flex ${size}`}>
            <Star className="size-full text-slate-200" fill="currentColor" strokeWidth={0} />
            {(filled || halfFilled) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: halfFilled ? '50%' : '100%' }}>
                <Star className="size-full text-auth-primary" fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function ProductGallery({ product }) {
  const [activeImage, setActiveImage] = useState(product.gallery[0])

  return (
    <div className="space-y-4">
      <div className="group overflow-hidden rounded-xl bg-white">
        <img
          src={activeImage}
          alt={product.title}
          className="aspect-[1.45] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-110"
        />
      </div>
      <div className="flex justify-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {product.gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`size-16 shrink-0 overflow-hidden rounded-md border bg-white p-1 transition-colors sm:size-18 ${
              activeImage === image ? 'border-auth-primary' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src={image} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantGroup({ label, values, selected, onSelect }) {
  if (!values.length) return null

  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="text-sm font-semibold text-slate-900">
        {label}: <span className="font-bold">{selected}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              selected === value
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-auth-primary hover:text-auth-primary'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuantitySelector({ value, onChange, disabled }) {
  return (
    <div className="inline-flex h-12 min-w-34 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-base font-bold text-auth-primary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex size-8 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function ProductInfoPanel({ product }) {
  const [color, setColor] = useState(product.colors[0] ?? '')
  const [size, setSize] = useState(product.sizes[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const outOfStock = !product.inStock

  return (
    <aside className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold leading-snug text-slate-950 sm:text-2xl">{product.title}</h1>
        <p className="mt-1 text-sm text-slate-500">Visit {product.storeName}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-slate-950">{product.rating.toFixed(1)}</span>
          <Stars rating={product.rating} />
          <Link to="#reviews" className="font-semibold text-blue-600 hover:underline">
            ({product.reviewCount.toLocaleString()})
          </Link>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-600">{product.salesCount.toLocaleString()} sold</span>
        </div>
        <p className="mt-2 text-xs font-semibold text-auth-primary">{product.soldIndicator}</p>
      </div>

      <div className="space-y-4 py-4">
        <div className="flex flex-wrap items-end gap-3">
          {product.discountPercent && (
            <span className="text-2xl font-bold text-auth-primary">-{product.discountPercent}%</span>
          )}
          <span className="text-3xl font-extrabold text-slate-950">{formatCedi(product.price)}</span>
          {product.compareAt && (
            <span className="pb-1 text-sm text-slate-400 line-through">{formatCedi(product.compareAt)}</span>
          )}
        </div>
        <p className="text-sm text-slate-500">List Price: {product.compareAt ? formatCedi(product.compareAt) : formatCedi(product.price)}</p>
      </div>

      <VariantGroup label="Color" values={product.colors} selected={color} onSelect={setColor} />
      <VariantGroup label="Compatible Model" values={product.sizes} selected={size} onSelect={setSize} />

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className={`text-sm font-bold ${outOfStock ? 'text-red-600' : 'text-emerald-600'}`}>
            {outOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
          {!outOfStock && (
            <span className="text-xs font-semibold text-auth-primary">Only {product.stockCount} Items Left</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-slate-900">Quantity</span>
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={outOfStock}
          className="rounded-full bg-auth-primary px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock}
          className="rounded-full border border-auth-primary px-6 py-3.5 text-sm font-bold text-auth-primary transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Cart
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-slate-500">
        <span>Returns <b className="text-blue-600">30-day refund/replacement</b></span>
        <span>Payment <b className="text-blue-600">Secure transaction</b></span>
      </div>
    </aside>
  )
}

function KeyDetails({ product }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-bold text-slate-950">Key Details</h2>
      <dl className="mt-3 grid gap-1 text-xs leading-5 text-slate-700">
        {Object.entries(product.keyDetails).map(([key, value]) => (
          <div key={key} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
            <dt className="font-bold">{key}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-5 text-base font-bold text-slate-950">About this item</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {product.about.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function ReviewSummary({ product }) {
  return (
    <section id="reviews" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-bold text-slate-950">Review this product</h2>
      <p className="mt-1 text-sm text-slate-600">Share your thoughts with other customers</p>
      <button className="mt-4 w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800" type="button">
        Write a customer review
      </button>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-2xl font-extrabold text-slate-950">{product.reviewCount.toLocaleString()} reviews</span>
        <Stars rating={product.rating} />
      </div>

      <div className="mt-5 space-y-2">
        {product.ratingDistribution.map((row) => (
          <div key={row.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-xs text-slate-600">
            <span>{row.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full rounded-full bg-slate-950" style={{ width: `${row.value}%` }} />
            </span>
            <span className="text-right">{row.value}%</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['Nice', 'Perfect Fit', 'Comfy'].map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {product.reviews.map((review) => (
          <article key={review.id} className="border-t border-slate-200 pt-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-auth-primary text-sm font-bold text-white">
                {review.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950">{review.name}</h3>
                  <span className="text-xs text-slate-500">on {review.date}</span>
                </div>
                <Stars rating={review.rating} size="size-3.5" />
                <p className="mt-2 text-sm leading-6 text-slate-700">{review.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-800">
          See All Reviews
        </button>
      </div>
    </section>
  )
}

function SellerShowcase({ product }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-red-50">
            <ShoppingCart className="size-6 text-auth-primary" />
          </span>
          <div>
            <h2 className="text-base font-bold text-blue-600">Visit the {product.storeName}</h2>
            <p className="text-xs text-slate-500">110 Followers | 50k+ Followers | {product.rating.toFixed(1)} ★</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Follow</button>
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Shop all items</button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {product.gallery.slice(1, 5).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-square w-full rounded-md bg-slate-100 object-cover" />
        ))}
      </div>
      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-8 py-2.5 text-sm font-semibold text-slate-800">See All</button>
      </div>
    </section>
  )
}

function HorizontalProductRail({ title, products, visibleCount }) {
  const visibleProducts = visibleCount ? products.slice(0, visibleCount) : products

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <span className="text-xs font-semibold text-slate-600">Page 1 Of 50</span>
      </div>
      <div className="relative">
        <button type="button" className="absolute left-0 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <ChevronLeft className="size-4" />
        </button>
        <div className="grid auto-cols-[10rem] grid-flow-col gap-3 overflow-x-auto px-8 pb-1 [-ms-overflow-style:none] sm:auto-cols-[11rem] lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {visibleProducts.map((item) => (
            <div key={`${item.slug}-${title}`} className="min-w-0">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
        <button type="button" className="absolute right-0 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

function ProductDescription({ product }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-bold text-slate-950">Product description</h2>
      <div className="mt-5 divide-y divide-slate-300 border-y border-slate-300">
        {Object.entries(product.details).map(([key, value]) => (
          <div key={key} className="grid gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="font-bold text-slate-950">{key}</dt>
            <dd className="text-slate-700">{value}</dd>
          </div>
        ))}
        <div className="grid gap-3 py-4 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="font-bold text-slate-950">Description</dt>
          <dd className="space-y-4 text-slate-700">
            <p>{product.description}</p>
            <div>
              <h3 className="font-bold text-slate-950">Key Features:</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Stylish design with a bold finish</li>
                <li>Durable construction for everyday protection</li>
                <li>Smooth feel and reliable grip</li>
                <li>Precise openings and comfortable handling</li>
              </ul>
            </div>
          </dd>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[12rem_1fr]">
        <h3 className="font-bold text-slate-950">Product Images</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {product.gallery.slice(1).concat(product.gallery.slice(1, 3)).slice(0, 6).map((image, index) => (
            <img key={`${image}-description-${index}`} src={image} alt="" className="aspect-square w-full rounded-sm bg-slate-100 object-cover" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)
  const relatedProducts = useMemo(() => getRelatedProducts(product.slug, 8), [product.slug])

  return (
    <SiteLayout cartCount={4}>
      <main className="bg-slate-100 py-4 sm:py-5 lg:py-6">
        <Container className="space-y-5">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.34fr)_minmax(360px,0.66fr)]">
            <div className="space-y-5">
              <ProductGallery product={product} />
              <KeyDetails product={product} />
              <SellerShowcase product={product} />
            </div>
            <div className="space-y-5">
              <ProductInfoPanel product={product} />
              <ReviewSummary product={product} />
            </div>
          </section>

          <HorizontalProductRail title="Other Items From Seller" products={relatedProducts} visibleCount={5} />
          <ProductDescription product={product} />
          <HorizontalProductRail title="Explore Other Related Items" products={relatedProducts} visibleCount={5} />
        </Container>
      </main>
    </SiteLayout>
  )
}
