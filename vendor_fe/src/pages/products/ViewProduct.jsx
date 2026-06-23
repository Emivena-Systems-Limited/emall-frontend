import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Barcode,
  Box,
  Edit2,
  Loader2,
  Package,
  Pencil,
  RefreshCw,
  Ruler,
  Tag,
  Trash2,
  TrendingDown,
  Truck,
  Warehouse,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useProduct } from '../../hooks/useProducts'
import { useDeleteProductsMutation } from '../../hooks/useProductMutations'
import { toCatalogProduct } from '../../utils/normalizeProducts'
import { metadataArrayToMap } from '../../utils/normalizeProducts'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function htmlToText(html = '') {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const STATUS_STYLES = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  draft:    'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  pending:  'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.inactive}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function resolveThumbnailLayout(imageCount) {
  if (imageCount <= 4) {
    return {
      containerClass: 'flex gap-2.5',
      itemClass: 'aspect-square min-w-0 flex-1',
    }
  }

  if (imageCount === 5) {
    return {
      containerClass: 'grid grid-cols-5 gap-2.5',
      itemClass: 'aspect-square w-full',
    }
  }

  if (imageCount <= 6) {
    return {
      containerClass: 'grid grid-cols-3 gap-2.5',
      itemClass: 'aspect-square w-full',
    }
  }

  if (imageCount <= 8) {
    return {
      containerClass: 'grid grid-cols-4 gap-2.5',
      itemClass: 'aspect-square w-full',
    }
  }

  if (imageCount <= 10) {
    return {
      containerClass: 'grid grid-cols-5 gap-2.5',
      itemClass: 'aspect-square w-full',
    }
  }

  return {
    containerClass:
      'flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300',
    itemClass: 'aspect-square size-[4.25rem] shrink-0 snap-start sm:size-20',
  }
}

function GalleryThumbnail({ image, isActive, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-xl border-2 transition-all ${className} ${
        isActive
          ? 'border-brand shadow-[0_0_0_2px_rgba(199,59,45,0.15)]'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {image.image_url ? (
        <img src={image.image_url} alt="" className="size-full object-contain bg-slate-50 p-1" />
      ) : (
        <div className="flex size-full items-center justify-center bg-slate-50">
          <Package className="size-4 text-slate-300" />
        </div>
      )}
    </button>
  )
}

function ProductGallery({ images }) {
  const sorted = [...images].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
  const [activeIdx, setActiveIdx] = useState(0)
  const active = sorted[activeIdx]
  const thumbLayout = resolveThumbnailLayout(sorted.length)

  return (
    <div className="w-full space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {active?.image_url ? (
          <img
            src={active.image_url}
            alt="Product"
            className="absolute inset-0 size-full object-contain transition-all duration-300"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300">
            <Package className="size-10" />
          </div>
        )}

        {sorted.length > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {activeIdx + 1} / {sorted.length}
          </span>
        )}
      </div>

      {sorted.length > 1 && (
        <div className={thumbLayout.containerClass}>
          {sorted.map((img, idx) => (
            <GalleryThumbnail
              key={img.id ?? idx}
              image={img}
              isActive={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
              className={thumbLayout.itemClass}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ icon: Icon, label, children, accent = false }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'border-brand/20 bg-brand-light' : 'border-slate-200 bg-white'}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-lg ${accent ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
          <Icon className="size-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Variants Display ─────────────────────────────────────────────────────────

function VariantGrid({ variants }) {
  if (!variants?.length) return null

  return (
    <div className="space-y-2">
      {variants.map((variant) => (
        <div
          key={variant.id}
          className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
        >
          {variant.images?.[0]?.image_url && (
            <img
              src={variant.images[0].image_url}
              alt={variant.variant_name}
              className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{variant.variant_name}</span>
              {variant.attributes && Object.entries(variant.attributes).map(([k, v]) => (
                <span key={k} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 capitalize">
                  {v}
                </span>
              ))}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">SKU: {variant.sku}</p>
            {variant.barcode && (
              <p className="text-xs text-slate-400">Barcode: {variant.barcode}</p>
            )}
          </div>

          <div className="text-right">
            {variant.discount_price && Number(variant.discount_price) > 0 ? (
              <>
                <p className="text-sm font-bold text-slate-900">{formatMoney(variant.discount_price)}</p>
                <p className="text-xs text-slate-400 line-through">{formatMoney(variant.price)}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-slate-900">{formatMoney(variant.price)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Stock Indicator ──────────────────────────────────────────────────────────

function StockIndicator({ stock, lowThreshold }) {
  if (stock == null) return <span className="text-sm text-slate-400">—</span>

  const isLow = lowThreshold != null && stock <= lowThreshold
  const isOut = stock === 0

  if (isOut) {
    return <span className="text-sm font-bold text-red-600">Out of stock</span>
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-black ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
          {stock.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">units</span>
        {isLow && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
            Low stock
          </span>
        )}
      </div>
      {lowThreshold != null && (
        <p className="text-xs text-slate-400">Alert threshold: {lowThreshold} units</p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ViewProduct() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { data: rawRecord, isLoading, isError, refetch } = useProduct(productId)
  const deleteMutation = useDeleteProductsMutation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Product Details">
        <div className="flex items-center justify-center gap-2 px-5 py-28 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading product…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !rawRecord) {
    return (
      <DashboardLayout pageTitle="Product Details">
        <div className="mx-auto max-w-md space-y-5 py-20 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              It may have been removed or you may not have permission to view it.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" />
              Back to products
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const product = toCatalogProduct(rawRecord)
  const meta = metadataArrayToMap(rawRecord.metadata)
  const variants = Array.isArray(rawRecord.variants) ? rawRecord.variants : []
  const images = Array.isArray(rawRecord.images) ? rawRecord.images : []
  const tags = Array.isArray(rawRecord.tags) ? rawRecord.tags : []

  const customMetadata = Array.isArray(rawRecord.metadata)
    ? rawRecord.metadata.filter((item) => {
        const reserved = new Set([
          'regular_price', 'sale_price', 'discount_mode', 'discount_price',
          'discount_percent', 'percent_off', 'savings_amount', 'has_discount',
          'quantity', 'low_stock_threshold', 'barcode', 'sku',
          'shipping_weight', 'shipping_length', 'shipping_width', 'shipping_height',
        ])
        return !reserved.has(item.key)
      })
    : []

  const hasShipping = product.shippingWeight || product.shippingLength

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync([product.id])
      navigate('/products')
    } catch {
      /* toast handled in mutation */
    }
  }

  return (
    <DashboardLayout pageTitle={product.name}>
      <div className="page-enter space-y-6">

        {/* ── Top bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            All Products
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/products/${product.id}/edit`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* ── Product header ── */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {product.category && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold">
                    <Box className="size-3" />
                    {product.category}
                  </span>
                )}
                {product.brand && product.brand !== '—' && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold">
                    <BadgeCheck className="size-3" />
                    {product.brand}
                  </span>
                )}
                {rawRecord.fulfillment_channel && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize">
                    <Truck className="size-3" />
                    {rawRecord.fulfillment_channel}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">{product.name}</h1>
              <p className="text-sm text-slate-400">slug: {product.slug}</p>
            </div>

            <StatusPill status={product.status} />
          </div>
        </div>

        {/* ── Gallery + sidebar ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Gallery */}
          {images.length > 0 ? (
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <ProductGallery images={images} />
            </div>
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              <div className="text-center">
                <Package className="mx-auto mb-2 size-10" />
                <p className="text-sm font-medium">No images uploaded</p>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Pricing */}
            <InfoCard icon={TrendingDown} label="Pricing" accent={product.hasDiscount}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Regular price</span>
                  <span className={`text-sm font-bold ${product.hasDiscount ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {formatMoney(product.regularPrice)}
                  </span>
                </div>

                {product.hasDiscount && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Sale price</span>
                      <span className="text-base font-black text-brand">{formatMoney(product.salePrice)}</span>
                    </div>
                    <div className="rounded-xl bg-brand/10 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand">You save</span>
                        <span className="text-xs font-bold text-brand">
                          {formatMoney(product.savingsAmount)}{' '}
                          {product.discountPercent > 0 && `(${product.discountPercent}% off)`}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </InfoCard>

            {/* Inventory */}
            <InfoCard icon={Warehouse} label="Inventory">
              <div className="space-y-3">
                <StockIndicator stock={product.stock} lowThreshold={product.lowStockThreshold} />

                {product.barcode && (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                    <Barcode className="size-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Barcode</p>
                      <p className="font-mono text-xs font-bold text-slate-800">{product.barcode}</p>
                    </div>
                  </div>
                )}

                {product.sku && product.sku !== '—' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">SKU</span>
                    <span className="font-mono text-xs font-semibold text-slate-700">{product.sku}</span>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Shipping */}
            {hasShipping && (
              <InfoCard icon={Truck} label="Shipping">
                <div className="space-y-2">
                  {product.shippingWeight && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Box className="size-3" />
                        Weight
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{product.shippingWeight} kg</span>
                    </div>
                  )}

                  {(product.shippingLength || product.shippingWidth || product.shippingHeight) && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Ruler className="size-3" />
                        Dimensions
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {[product.shippingLength, product.shippingWidth, product.shippingHeight]
                          .filter(Boolean)
                          .join(' × ')} cm
                      </span>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Quick actions</p>
              <div className="space-y-2">
                <Link
                  to={`/products/${product.id}/edit`}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Edit2 className="size-4 text-slate-500" />
                  Edit product details
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="size-4" />
                  Delete product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width content below ── */}
        <div className="space-y-6">
          {/* Description */}
          {product.description && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Description</h2>
              </div>
              <div
                className="prose prose-sm prose-slate max-w-none px-5 py-4 text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">
                  Variants
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {variants.length}
                  </span>
                </h2>
              </div>
              <div className="px-5 py-4">
                <VariantGrid variants={variants} />
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2 px-5 py-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Tag className="size-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom metadata */}
          {customMetadata.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Additional attributes</h2>
              </div>
              <div className="divide-y divide-slate-50 px-5">
                {customMetadata.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <span className="text-sm capitalize text-slate-500">{item.key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete product?"
        description={`"${product.name}" will be permanently removed from your catalogue. This action cannot be undone.`}
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        isLoading={deleteMutation.isPending}
        tone="danger"
      />
    </DashboardLayout>
  )
}
