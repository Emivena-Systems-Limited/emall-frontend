import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
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
    <div className="space-y-3">
      <div className="group overflow-hidden bg-white">
        <img
          src={activeImage}
          alt={product.title}
          className="aspect-[1.45] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-110"
        />
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {product.gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`size-13 shrink-0 overflow-hidden border bg-white p-0.5 transition-colors sm:size-15 ${
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

function ColorSwatches({ product, selected, onSelect }) {
  if (!product.colors.length) return null

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-slate-950">Color: {selected}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
        {product.colors.map((color, index) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`border bg-white p-1 text-center transition-colors ${
              selected === color ? 'border-auth-primary' : 'border-slate-200'
            }`}
          >
            <img
              src={product.gallery[(index + 1) % product.gallery.length]}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <span className="mt-1 block text-[0.625rem] font-semibold text-slate-600">{color}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantGroup({ label, values, selected, onSelect }) {
  if (!values.length) return null

  return (
    <div className="pt-3">
      <p className="text-xs font-semibold text-slate-950">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`rounded-full border px-3 py-1.5 text-[0.625rem] font-semibold transition-colors ${
              selected === value
                ? 'border-slate-950 bg-white text-slate-950'
                : 'border-slate-200 bg-white text-slate-500 hover:border-auth-primary hover:text-auth-primary'
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
    <div className="inline-flex h-10 min-w-30 items-center justify-between rounded-full bg-slate-50 px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-auth-primary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex size-7 items-center justify-center rounded-full text-auth-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
    <aside className="bg-white p-3 sm:p-4">
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold leading-snug text-slate-950">{product.title}</h1>
          <button type="button" aria-label="Share product" className="flex size-5 shrink-0 items-center justify-center bg-auth-primary text-white">
            <Share2 className="size-3" strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Visit {product.storeName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-950">{product.rating.toFixed(1)}</span>
          <Stars rating={product.rating} size="size-3" />
          <Link to="#reviews" className="font-semibold text-blue-600 hover:underline">
            ({product.reviewCount.toLocaleString()})
          </Link>
          <span className="font-semibold text-slate-600">{product.salesCount.toLocaleString()} sold</span>
        </div>
        <p className="mt-1 text-[0.6875rem] font-semibold text-slate-600">{product.soldIndicator}</p>
      </div>

      <div className="space-y-2 py-3">
        <p className="w-fit rounded-sm bg-auth-primary px-2 py-1 text-[0.625rem] font-bold text-white">
          Limited time deal
        </p>
        <div className="flex flex-wrap items-end gap-2">
          {product.discountPercent && (
            <span className="text-xl font-bold text-auth-primary">-{product.discountPercent}%</span>
          )}
          <span className="text-2xl font-extrabold text-slate-950">{formatCedi(product.price)}</span>
          {product.compareAt && (
            <span className="pb-0.5 text-xs text-slate-400 line-through">{formatCedi(product.compareAt)}</span>
          )}
        </div>
        <p className="text-xs text-slate-500">List Price: {product.compareAt ? formatCedi(product.compareAt) : formatCedi(product.price)}</p>
      </div>

      <ColorSwatches product={product} selected={color} onSelect={setColor} />
      <VariantGroup label="Compatible Model" values={product.sizes} selected={size} onSelect={setSize} />

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-950">Quantity</p>
        <div className="mt-2 flex items-center gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
          <p className="text-[0.625rem] leading-4">
            <span className={outOfStock ? 'font-bold text-red-600' : 'font-bold text-auth-primary'}>
              {outOfStock ? 'Out of Stock' : `Only ${product.stockCount} Items Left`}
            </span>
            <span className="block text-slate-500">Don't miss it</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2 sm:gap-3">
        <button
          type="button"
          disabled={outOfStock}
          className="rounded-full bg-auth-primary px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock}
          className="rounded-full border border-auth-primary px-6 py-3 text-xs font-bold text-auth-primary transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Cart
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[0.625rem] text-slate-500">
        <span>Returns <b className="text-blue-600">30-day refund/replacement</b></span>
        <span>Payment <b className="text-blue-600">Secure transaction</b></span>
      </div>
    </aside>
  )
}

function KeyDetails({ product }) {
  return (
    <section className="bg-white p-3 sm:p-4">
      <h2 className="text-sm font-bold text-slate-950">Key Details</h2>
      <dl className="mt-2 grid gap-0.5 text-[0.6875rem] leading-4 text-slate-700">
        {Object.entries(product.keyDetails).map(([key, value]) => (
          <div key={key} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
            <dt className="font-bold">{key}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-4 text-sm font-bold text-slate-950">About this item</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-700">
        {product.about.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function ReviewSummary({ product }) {
  return (
    <section id="reviews" className="bg-white p-3 sm:p-4">
      <h2 className="text-base font-bold text-slate-950">Review this product</h2>
      <p className="mt-1 text-xs text-slate-600">Share your thoughts with other customers</p>
      <button className="mt-3 w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800" type="button">
        Write a customer review
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-extrabold text-slate-950">{product.reviewCount.toLocaleString()} reviews | {product.rating.toFixed(1)}</span>
        <Stars rating={product.rating} size="size-3" />
        <span className="rounded-sm bg-emerald-50 px-2 py-1 text-[0.5rem] font-bold text-emerald-700 sm:ml-auto">
          All ratings are by verified purchases
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {product.ratingDistribution.map((row) => (
          <div key={row.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-[0.625rem] text-slate-600">
            <span className="truncate">{row.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full rounded-full bg-slate-950" style={{ width: `${row.value}%` }} />
            </span>
            <span className="text-right">{row.value}%</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['Nice', 'Perfect Fitting', 'Comfy'].map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[0.625rem] font-semibold text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {product.reviews.map((review) => (
          <article key={review.id} className="border-t border-slate-200 pt-3">
            <div className="flex items-start gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                {review.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-950">{review.name}</h3>
                  <span className="text-[0.5625rem] text-slate-500">on {review.date}</span>
                </div>
                <Stars rating={review.rating} size="size-3" />
                <p className="mt-1 text-[0.6875rem] leading-4 text-slate-700">{review.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-6 py-2 text-xs font-semibold text-slate-800">
          See All Reviews
        </button>
      </div>
    </section>
  )
}

function SellerShowcase({ product }) {
  return (
    <section className="bg-white p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-13 items-center justify-center rounded-full bg-red-50">
            <ShoppingCart className="size-6 text-auth-primary" />
          </span>
          <div>
            <h2 className="text-base font-bold text-blue-600">Visit the {product.storeName}</h2>
            <p className="text-xs text-slate-500">110 Followers | 150k+ Followers | {product.rating.toFixed(1)} ★</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Follow</button>
          <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800">Shop all items</button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        {product.gallery.slice(1, 5).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-square w-full bg-slate-100 object-cover" />
        ))}
      </div>
      <div className="mt-5 text-center">
        <button type="button" className="rounded-full border border-slate-300 px-7 py-2 text-xs font-semibold text-slate-800 sm:px-8 sm:py-2.5 sm:text-sm">See All</button>
      </div>
    </section>
  )
}

function RailProductCard({ product }) {
  const fullStars = Math.floor(product.rating)

  return (
    <article className="min-w-0">
      <Link to={product.href} className="block">
        <span className="relative block aspect-square overflow-hidden bg-slate-100">
          <img src={product.image} alt={product.name} className="size-full object-cover" loading="lazy" />
          {product.discountPercent != null && (
            <span className="absolute left-1 top-1 bg-yellow-300 px-1.5 py-0.5 text-[0.5rem] font-bold text-slate-900">
              {product.discountPercent}% OFF
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-[0.6875rem] font-bold text-slate-900">{product.name}</span>
        <span className="block text-[0.6875rem] font-extrabold text-slate-950">{formatCedi(product.price)}</span>
      </Link>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`size-2.5 ${index < fullStars ? 'text-auth-primary' : 'text-slate-300'}`}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
          <span className="ml-1 text-[0.5625rem] text-slate-500">({product.reviewCount})</span>
        </div>
        <Link
          to="/cart"
          aria-label={`Add ${product.name} to cart`}
          className="flex size-6 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        >
          <ShoppingCart className="size-3" strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  )
}

function HorizontalProductRail({ title, products, visibleCount }) {
  const visibleProducts = visibleCount ? products.slice(0, visibleCount) : products

  return (
    <section className="bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <span className="text-xs font-semibold text-slate-600">Page 1 Of 50</span>
      </div>
      <div className="relative">
        <button type="button" className="absolute left-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-300 bg-white">
          <ChevronLeft className="size-4" />
        </button>
        <div className="grid auto-cols-[7.5rem] grid-flow-col gap-2 overflow-x-auto px-8 pb-1 [-ms-overflow-style:none] sm:auto-cols-[9rem] sm:gap-3 lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {visibleProducts.map((item) => (
            <div key={`${item.slug}-${title}`} className="min-w-0">
              <RailProductCard product={item} />
            </div>
          ))}
        </div>
        <button type="button" className="absolute right-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center border border-slate-300 bg-white">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

function ProductDescription({ product }) {
  return (
    <section className="bg-white p-3 sm:p-5">
      <h2 className="text-base font-bold text-slate-950">Product description</h2>
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
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {product.gallery.slice(1).concat(product.gallery.slice(1, 3)).slice(0, 6).map((image, index) => (
            <img key={`${image}-description-${index}`} src={image} alt="" className="aspect-square w-full bg-slate-100 object-cover" />
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
      <main className="bg-[#f2f2f2] py-3 sm:py-4">
        <Container className="space-y-3 sm:space-y-4">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="space-y-4">
              <ProductGallery product={product} />
              <KeyDetails product={product} />
              <SellerShowcase product={product} />
            </div>
            <div className="space-y-4">
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
