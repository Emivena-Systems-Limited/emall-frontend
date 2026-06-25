import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
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
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getProductById } from '../services/landingPageService'
import { formatCedi } from '../utils/formatCurrency'
import { normalizeLandingProduct } from '../utils/normalizeLandingProducts'
import { notify } from '../lib/notify'

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

function ProductGallery({ product, activeImage, setActiveImage }) {
  const currentImage = activeImage || product.gallery[0]

  return (
    <div className="space-y-3">
      <div className="group overflow-hidden bg-white">
        <img
          src={currentImage}
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
              currentImage === image ? 'border-auth-primary' : 'border-slate-200 hover:border-slate-300'
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
              src={product.colorImages?.[color] ?? product.gallery[(index + 1) % product.gallery.length]}
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

function ProductInfoPanel({
  product,
  setActiveImage,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  activeSku,
  displayPriceInfo
}) {
  const [quantity, setQuantity] = useState(1)
  const outOfStock = !product.inStock

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor)
    const varImage = product.colorImages?.[newColor]
    if (varImage && setActiveImage) {
      setActiveImage(varImage)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on EZ-Stores!`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        notify.success('Product link copied to clipboard!')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href)
          notify.success('Product link copied to clipboard!')
        } catch (clipErr) {
          notify.error('Could not copy link to clipboard')
          console.error(clipErr)
        }
      }
    }
  }

  const isLowStock = !outOfStock && product.stockCount <= (product.lowStockThreshold ?? 10)

  return (
    <aside className="bg-white p-3 sm:p-4">
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold leading-snug text-slate-950">{product.title}</h1>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="flex size-5 shrink-0 items-center justify-center bg-auth-primary text-white hover:opacity-90 transition-opacity"
          >
            <Share2 className="size-3" strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 font-medium">Visit {product.storeName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {product.reviewCount > 0 ? (
            <>
              <span className="font-bold text-slate-950">{product.rating.toFixed(1)}</span>
              <Stars rating={product.rating} size="size-3" />
              <Link to="#reviews" className="font-semibold text-blue-600 hover:underline">
                ({product.reviewCount.toLocaleString()})
              </Link>
            </>
          ) : (
            <span className="font-medium text-slate-500">No reviews yet</span>
          )}
          <span className="font-semibold text-slate-600">{product.salesCount.toLocaleString()} sold</span>
        </div>
        <p className="mt-1 text-[0.6875rem] font-semibold text-slate-600">{product.soldIndicator}</p>
      </div>

      <div className="space-y-2 py-3">
        <p className="w-fit rounded-sm bg-auth-primary px-2 py-1 text-[0.625rem] font-bold text-white">
          Limited time deal
        </p>
        <div className="flex flex-wrap items-end gap-2">
          {displayPriceInfo.discountPercent && (
            <span className="text-xl font-bold text-auth-primary">-{displayPriceInfo.discountPercent}%</span>
          )}
          <span className="text-2xl font-extrabold text-slate-950">{formatCedi(displayPriceInfo.price)}</span>
          {displayPriceInfo.compareAt && (
            <span className="pb-0.5 text-xs text-slate-400 line-through">{formatCedi(displayPriceInfo.compareAt)}</span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500">
          List Price: {displayPriceInfo.compareAt ? formatCedi(displayPriceInfo.compareAt) : formatCedi(displayPriceInfo.price)}
        </p>
      </div>

      <ColorSwatches product={product} selected={selectedColor} onSelect={handleColorSelect} />
      <VariantGroup label="Compatible Model" values={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-950">Quantity</p>
        <div className="mt-2 flex items-center gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={outOfStock} />
          <p className="text-[0.625rem] leading-4">
            <span className={outOfStock ? 'font-bold text-red-600' : isLowStock ? 'font-bold text-auth-primary' : 'font-bold text-emerald-600'}>
              {outOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stockCount} Items Left` : 'In Stock'}
            </span>
            <span className="block text-slate-500">
              {outOfStock ? 'Currently unavailable' : isLowStock ? "Don't miss it" : 'Available now'}
            </span>
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

function KeyDetails({ product, activeSku }) {
  const detailsList = { ...product.keyDetails }
  if (activeSku) {
    detailsList['Model/SKU'] = activeSku
  }

  return (
    <section className="bg-white p-3 sm:p-4">
      <h2 className="text-sm font-bold text-slate-950">Key Details</h2>
      <dl className="mt-2 grid gap-0.5 text-[0.6875rem] leading-4 text-slate-700">
        {Object.entries(detailsList).map(([key, value]) => (
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

      {product.reviewCount > 0 ? (
        <>
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
        </>
      ) : (
        <p className="mt-4 text-xs text-slate-500">No ratings yet for this product.</p>
      )}

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

  const productHref = product.href?.replace(/^\/products\//, '/')

  return (
    <article className="min-w-0">
      <Link to={productHref} className="block">
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
        {product.reviewCount > 0 ? (
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
        ) : (
          <span className="text-[0.5625rem] text-slate-400">No reviews</span>
        )}
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
  const detailsList = { ...product.details }
  delete detailsList['SKU']
  delete detailsList['sku']
  delete detailsList['Sku']

  return (
    <section className="bg-white p-3 sm:p-5">
      <h2 className="text-base font-bold text-slate-950">Product description</h2>
      <div className="mt-5 divide-y divide-slate-300 border-y border-slate-300">
        {Object.entries(detailsList).map(([key, value]) => (
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

function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((m) => m && (m.key === key || m.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.products)) return value.products
  return []
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

function normalizeApiProductDetails(apiProduct) {
  const core = normalizeLandingProduct(apiProduct)
  if (!core) return null

  const metadata = toArray(apiProduct.metadata)
  const sku = apiProduct.sku || apiProduct.variants?.[0]?.sku || getMetadataValue(metadata, 'sku') || 'N/A'
  const quantity = toNumber(getMetadataValue(metadata, 'quantity'), 10)
  const lowStockThreshold = toNumber(getMetadataValue(metadata, 'low_stock_threshold'), 10)
  const inStock = quantity > 0

  // Build gallery
  const gallery = []
  if (Array.isArray(apiProduct.images)) {
    apiProduct.images.forEach(img => {
      if (img?.image_url) gallery.push(img.image_url)
    })
  }
  if (Array.isArray(apiProduct.variants)) {
    apiProduct.variants.forEach(v => {
      if (Array.isArray(v.images)) {
        v.images.forEach(img => {
          if (img?.image_url) gallery.push(img.image_url)
        })
      }
    })
  }
  if (gallery.length === 0) {
    gallery.push(core.image)
  }
  const uniqueGallery = [...new Set(gallery)]

  // Build colors and sizes from variants
  const colorImages = {}
  const colors = []
  const sizes = []
  if (Array.isArray(apiProduct.variants)) {
    apiProduct.variants.forEach(v => {
      const color = v.attributes?.color || v.color || v.variant_name
      if (color) {
        colors.push(color)
        const varImage = v.images?.[0]?.image_url || v.image_url || v.image
        if (varImage) {
          colorImages[color] = varImage
        }
      }
      const size = v.attributes?.size || v.size
      if (size) sizes.push(size)
    })
  }
  const uniqueColors = [...new Set(colors)]
  const uniqueSizes = [...new Set(sizes)]

  // Strip HTML tags from description
  const rawDescription = apiProduct.description || ''
  const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim()

  return {
    ...core,
    slug: apiProduct.slug,
    title: core.name,
    storeName: 'EZ Stores',
    salesCount: 120,
    soldIndicator: '100+ bought in past month',
    inStock,
    stockCount: quantity,
    lowStockThreshold,
    variants: apiProduct.variants || [],
    gallery: uniqueGallery,
    colors: uniqueColors,
    sizes: uniqueSizes,
    colorImages,
    about: [
      'High-quality design and build for premium daily use.',
      'Features reliable and durable construction.',
      'Designed for optimal comfort and perfect handling.',
      'Matches the official specifications and quality standards.',
    ],
    keyDetails: {
      'Model/SKU': sku,
      'Fulfillment': apiProduct.fulfillment_channel || 'Vendor',
      'Category': apiProduct.category?.category_name || 'General',
      'Status': apiProduct.status || 'Approved',
    },
    description: cleanDescription || 'No description available for this product.',
    details: {
      SKU: sku,
      Condition: 'Brand New',
      Category: apiProduct.category?.category_name || 'General',
    },
    ratingDistribution: [
      { label: 'Small', value: 0 },
      { label: 'True to size', value: 0 },
      { label: 'Large', value: 0 },
    ],
    reviews: [],
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { data: landingData, isLoading: isLandingLoading } = useLandingPageData()

  const apiProductId = useMemo(() => {
    if (!landingData) return null
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    for (const sec of sections) {
      const list = landingData[sec]
      if (Array.isArray(list)) {
        const found = list.find((p) => p && p.slug === slug)
        if (found) return found.id
      }
    }
    return null
  }, [landingData, slug])

  const { data: apiProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ['product-details', apiProductId],
    queryFn: () => getProductById(apiProductId),
    enabled: Boolean(apiProductId),
    staleTime: 5 * 60 * 1000,
  })

  const product = useMemo(() => {
    if (apiProduct) {
      return normalizeApiProductDetails(apiProduct)
    }
    return getProductBySlug(slug)
  }, [apiProduct, slug])

  const [activeImage, setActiveImage] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  // Sync selectedColor, selectedSize, and activeImage when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] ?? '')
      setSelectedSize(product.sizes?.[0] ?? '')
      if (product.gallery && product.gallery[0]) {
        setActiveImage(product.gallery[0])
      } else {
        setActiveImage(null)
      }
    } else {
      setSelectedColor('')
      setSelectedSize('')
      setActiveImage(null)
    }
  }, [product])

  const activeVariant = useMemo(() => {
    if (!product || !product.variants || !product.variants.length) return null
    return product.variants.find((v) => {
      const vColor = v.attributes?.color || v.color || v.variant_name || ''
      const vSize = v.attributes?.size || v.size || ''
      const matchColor = !selectedColor || String(vColor).toLowerCase() === String(selectedColor).toLowerCase()
      const matchSize = !selectedSize || String(vSize).toLowerCase() === String(selectedSize).toLowerCase()
      return matchColor && matchSize
    }) || product.variants[0]
  }, [product, selectedColor, selectedSize])

  const activeSku = useMemo(() => {
    return activeVariant?.sku || product?.sku || product?.keyDetails?.['Model/SKU'] || 'N/A'
  }, [activeVariant, product])

  const displayPriceInfo = useMemo(() => {
    if (activeVariant) {
      const variantPrice = toNumber(activeVariant.price)
      const variantDiscountPrice = toNumber(activeVariant.discount_price)
      
      const price = variantDiscountPrice > 0 ? variantDiscountPrice : variantPrice
      const compareAt = variantDiscountPrice > 0 ? variantPrice : null
      
      const discountPercent = compareAt > price && price > 0
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : null
      
      return { price, compareAt, discountPercent }
    }
    
    return {
      price: product?.price ?? 0,
      compareAt: product?.compareAt ?? null,
      discountPercent: product?.discountPercent ?? null
    }
  }, [product, activeVariant])

  const allApiProducts = useMemo(() => {
    if (!landingData) return []
    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    const products = []
    const seenIds = new Set()
    for (const sec of sections) {
      const list = landingData[sec]
      if (Array.isArray(list)) {
        list.forEach((p) => {
          if (p && !seenIds.has(p.id)) {
            seenIds.add(p.id)
            const normalized = normalizeLandingProduct(p)
            if (normalized) {
              products.push({
                ...normalized,
                vendor_id: p.vendor_id || p.vendor?.id || p.store?.vendor_id || p.store?.id || ''
              })
            }
          }
        })
      }
    }
    return products
  }, [landingData])

  const sellerProducts = useMemo(() => {
    if (!apiProduct) {
      return getRelatedProducts(product.slug, 8)
    }

    const currentVendorId = apiProduct.vendor_id
    let matching = allApiProducts.filter(
      (p) => p.id !== product.id && p.vendor_id === currentVendorId
    )

    if (matching.length < 5) {
      const otherReal = allApiProducts.filter(
        (p) => p.id !== product.id && p.vendor_id !== currentVendorId
      )
      matching = [...matching, ...otherReal].slice(0, 8)
    }

    if (matching.length === 0) {
      return getRelatedProducts(product.slug, 8)
    }

    return matching
  }, [apiProduct, product.id, product.slug, allApiProducts])

  const exploreRelatedProducts = useMemo(() => {
    if (!apiProduct) {
      return getRelatedProducts(product.slug, 8)
    }

    const otherReal = allApiProducts.filter((p) => p.id !== product.id)
    
    if (otherReal.length === 0) {
      return getRelatedProducts(product.slug, 8)
    }

    return otherReal.slice(0, 8)
  }, [apiProduct, product.id, product.slug, allApiProducts])

  if (isLandingLoading || (apiProductId && isProductLoading)) {
    return (
      <SiteLayout cartCount={4}>
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-3 border-slate-200 border-t-auth-primary" />
            <p className="text-sm font-medium text-slate-500">Loading product details...</p>
          </div>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout cartCount={4}>
      <main className="bg-[#f2f2f2] py-3 sm:py-4">
        <Container className="space-y-3 sm:space-y-4">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="space-y-4">
              <ProductGallery product={product} activeImage={activeImage} setActiveImage={setActiveImage} />
              <KeyDetails product={product} activeSku={activeSku} />
              <SellerShowcase product={product} />
            </div>
            <div className="space-y-4">
              <ProductInfoPanel
                product={product}
                setActiveImage={setActiveImage}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                activeSku={activeSku}
                displayPriceInfo={displayPriceInfo}
              />
              <ReviewSummary product={product} />
            </div>
          </section>

          <HorizontalProductRail title="Other Items From Seller" products={sellerProducts} visibleCount={5} />
          <ProductDescription product={product} />
          <HorizontalProductRail title="Explore Other Related Items" products={exploreRelatedProducts} visibleCount={5} />
        </Container>
      </main>
    </SiteLayout>
  )
}
