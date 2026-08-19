import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  FilePenLine,
  Filter,
  Loader2,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import phoneImage from '../../assets/images/categories/phones_and_accesories.png'
import homeImage from '../../assets/images/categories/home_and_kitchen.png'
import decorImage from '../../assets/images/categories/home_decor.jpg'
import kitchenImage from '../../assets/images/categories/kitchen_utensils.jpg'
import { notify } from '../../lib/notify'
import {
  useEligibleReviewItemsQuery,
  useReviewMutations,
  useReviewQuery,
  useUserReviewsQuery,
} from '../../hooks/useReviewsQuery'

const reviewsSeed = [
  {
    id: 'RV-1048',
    product: 'Wireless Head Set',
    variant: 'Color: Eternal Green',
    order: 'ORD-20483',
    date: '18 July 2026',
    rating: 5,
    title: 'Excellent sound and all-day comfort',
    body: 'The sound is clear, the fit is comfortable, and the battery easily lasts through my workday. Delivery was quick and the packaging was secure.',
    status: 'Published',
    image: kitchenImage,
  },
  {
    id: 'RV-1047',
    product: 'iPhone 17',
    variant: 'Natural space grey · 256GB',
    order: 'ORD-20483',
    date: '16 July 2026',
    rating: 4,
    title: 'Premium feel and smooth performance',
    body: 'Everything feels fast and polished. The camera is especially impressive in low light.',
    status: 'Pending',
    image: phoneImage,
  },
  {
    id: 'RV-1036',
    product: 'Smart Watch',
    variant: 'Phantom Black · 128GB',
    order: 'ORD-19926',
    date: '04 July 2026',
    rating: 2,
    title: 'The strap could be better',
    body: 'The watch works well, but the included strap was uncomfortable after a few hours of use.',
    status: 'Not Approved',
    image: homeImage,
  },
  {
    id: 'RV-1022',
    product: 'Minimalist Accent Chair',
    variant: 'Sand beige',
    order: 'ORD-18742',
    date: '22 June 2026',
    rating: 5,
    title: 'Beautiful and sturdy',
    body: 'It looks exactly like the photos and feels very sturdy. It has become my favourite piece in the room.',
    status: 'Published',
    image: decorImage,
  },
]
void reviewsSeed

const statusTone = {
  Published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'Not Approved': 'bg-red-50 text-red-700 ring-red-200',
}

function normalizeApiReview(item, index) {
  if (!item) return null

  const id = String(item.id || item.review_id || item._id || `RV-${1040 + index}`)
  const product = item.product_name || item.productName || item.product?.name || item.product || 'Purchased Item'
  const variant = item.variant || item.product_variant || item.product?.variant || 'Standard'
  const order = item.order_number || item.orderNumber || item.order_id || item.orderId || 'ORD-20483'

  let date = item.created_at || item.createdAt || item.date || 'Recent'
  if (date && date !== 'Recent' && !isNaN(Date.parse(date))) {
    date = new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const rating = Number(item.rating || item.score || 5)
  const title = item.title || item.heading || 'Review'
  const body = item.review || item.comment || item.description || item.body || item.content || ''

  let status = item.status || 'Published'
  if (typeof status === 'string') {
    const s = status.toLowerCase()
    if (s === 'approved' || s === 'published' || s === 'active') status = 'Published'
    else if (s === 'pending' || s === 'in_review') status = 'Pending'
    else if (s === 'rejected' || s === 'declined' || s === 'not approved') status = 'Not Approved'
    else status = status.charAt(0).toUpperCase() + status.slice(1)
  }

  const productImages = Array.isArray(item.product?.images) ? item.product.images : []
  const primaryProductImage =
    productImages.find((entry) => entry?.is_primary) ?? productImages[0]
  const nestedPrimaryImage = item.product?.primary_image
  const image =
    item.image_url ||
    item.imageUrl ||
    item.image ||
    item.product_image?.image_url ||
    (typeof nestedPrimaryImage === 'string'
      ? nestedPrimaryImage
      : nestedPrimaryImage?.image_url ?? nestedPrimaryImage?.url) ||
    primaryProductImage?.image_url ||
    primaryProductImage?.url ||
    item.product?.image_url ||
    item.product?.image ||
    kitchenImage
  const productSlug = item.product?.slug || item.product_slug || null

  return {
    id,
    product,
    variant,
    order,
    date,
    rating,
    title,
    body,
    status,
    image,
    productHref: productSlug ? `/${productSlug}` : null,
    raw: item,
  }
}

function Stars({ rating, size = 'size-4' }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
          }`}
        />
      ))}
    </span>
  )
}

function Dialog({ children, label, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((key) => (
        <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex gap-4 xl:w-64">
              <div className="size-20 rounded-xl bg-slate-200 sm:size-24" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-12 w-full rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewsList() {
  const navigate = useNavigate()
  const { data: apiData, isLoading, isError, refetch } = useUserReviewsQuery()
  const { deleteMutation, isDeleting } = useReviewMutations()

  const [tab, setTab] = useState('All Reviews')
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState('All Ratings')
  const [status, setStatus] = useState('All Status')
  const [sort, setSort] = useState('Most Recent')
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const tabs = ['All Reviews', 'Published', 'Pending', 'Not Approved']

  const reviews = useMemo(() => {
    if (Array.isArray(apiData)) {
      return apiData.map(normalizeApiReview).filter(Boolean)
    }
    return []
  }, [apiData])

  const visible = useMemo(() => {
    const items = reviews.filter(
      (review) =>
        (tab === 'All Reviews' || review.status === tab) &&
        (status === 'All Status' || review.status === status) &&
        (rating === 'All Ratings' || review.rating === Number(rating[0])) &&
        `${review.product} ${review.title}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    return [...items].sort((a, b) =>
      sort === 'Highest Rating'
        ? b.rating - a.rating
        : sort === 'Lowest Rating'
          ? a.rating - b.rating
          : sort === 'Oldest'
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id),
    )
  }, [rating, reviews, search, sort, status, tab])

  const count = (name) =>
    name === 'All Reviews'
      ? reviews.length
      : reviews.filter((review) => review.status === name).length

  const handleDeleteConfirmed = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled in mutation onError
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">
            Your feedback
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            My Reviews
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            View and manage all the reviews you have written.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh reviews"
            className="inline-flex items-center justify-center size-11 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/account/reviews/new')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-auth-primary-hover"
          >
            <FilePenLine className="size-4" />
            Write a New Review
          </button>
        </div>
      </div>

      <div className="mt-7 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-2">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={`border-b-2 px-4 py-3 text-sm font-bold ${
                tab === name
                  ? 'border-auth-primary text-auth-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {name}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[0.65rem] ${
                  tab === name ? 'bg-red-50' : 'bg-slate-100'
                }`}
              >
                {count(name)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:grid-cols-2 xl:grid-cols-[minmax(13rem,1fr)_repeat(3,auto)]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-auth-primary">
          <Search className="size-4 text-slate-400" />
          <span className="sr-only">Search reviews</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name"
            className="min-w-0 flex-1 text-sm outline-none"
          />
        </label>

        <select
          aria-label="Rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-auth-primary"
        >
          <option>All Ratings</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value}>{value} Stars</option>
          ))}
        </select>

        <select
          aria-label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-auth-primary"
        >
          <option>All Status</option>
          <option>Published</option>
          <option>Pending</option>
          <option>Not Approved</option>
        </select>

        <label className="flex items-center gap-2">
          <Filter className="size-4 text-auth-primary" />
          <span className="sr-only">Sort reviews</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-auth-primary"
          >
            <option>Most Recent</option>
            <option>Oldest</option>
            <option>Highest Rating</option>
            <option>Lowest Rating</option>
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-4">
        {isLoading ? (
          <ReviewsSkeleton />
        ) : visible.length > 0 ? (
          visible.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:border-auth-primary/25 sm:p-5"
            >
              <div className="flex flex-col gap-5 xl:flex-row">
                <div className="flex min-w-0 gap-4 xl:w-64 xl:shrink-0">
                  {review.productHref ? (
                    <Link to={review.productHref} className="shrink-0">
                      <img
                        src={review.image}
                        alt={review.product}
                        className="size-20 rounded-xl border border-slate-100 object-cover sm:size-24"
                      />
                    </Link>
                  ) : (
                    <img
                      src={review.image}
                      alt={review.product}
                      className="size-20 shrink-0 rounded-xl border border-slate-100 object-cover sm:size-24"
                    />
                  )}
                  <div className="min-w-0">
                    <h3
                      title={review.product}
                      className="line-clamp-3 font-bold leading-6 text-slate-950"
                    >
                      {review.productHref ? (
                        <Link to={review.productHref} className="hover:text-auth-primary hover:underline">
                          {review.product}
                        </Link>
                      ) : review.product}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{review.variant}</p>
                    <p className="mt-3 text-[0.68rem] font-semibold text-slate-500">
                      Order #{review.order}
                    </p>
                    <p className="mt-1 text-[0.68rem] text-slate-400">Reviewed {review.date}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 border-t border-slate-100 pt-4 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars rating={review.rating} />
                    <span className="text-sm font-bold text-slate-700">{review.rating}.0</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1 ring-inset ${
                        statusTone[review.status] ?? statusTone.Published
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <h4 className="mt-3 font-bold text-slate-950">{review.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setViewing(review)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="size-3.5" />
                      View Review
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/account/reviews/${review.id}/edit`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-auth-primary"
                    >
                      <FilePenLine className="size-3.5" />
                      Edit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(review)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-auth-primary"
                    >
                      <Trash2 className="size-3.5" />
                      Delete Review
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <MessageSquareText className="size-11 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-900">
              {isError ? 'Unable to load reviews' : 'No reviews written yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isError
                ? 'Check your connection or try again later.'
                : 'Share your feedback on products you have purchased to help other shoppers.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/account/reviews/new')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-auth-primary-hover"
            >
              <FilePenLine className="size-4" />
              Write Your First Review
            </button>
          </div>
        )}
      </div>

      {viewing ? (
        <Dialog label="Review details" onClose={() => setViewing(null)}>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
              statusTone[viewing.status] ?? statusTone.Published
            }`}
          >
            {viewing.status}
          </span>
          <div className="mt-5 flex items-center gap-4">
            <img src={viewing.image} alt="" className="size-20 rounded-xl object-cover" />
            <div>
              <h3 className="text-xl font-bold text-slate-950">{viewing.product}</h3>
              <p className="mt-1 text-sm text-slate-500">{viewing.variant}</p>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <Stars rating={viewing.rating} size="size-5" />
            <h4 className="mt-3 text-lg font-bold text-slate-950">{viewing.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{viewing.body}</p>
          </div>
        </Dialog>
      ) : null}

      {deleting ? (
        <Dialog label="Delete review" onClose={() => setDeleting(null)}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="size-5" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-slate-950">Delete this review?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your review for <strong>{deleting.product}</strong> will be permanently removed.
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleting(null)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirmed}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isDeleting ? 'Deleting…' : 'Delete Review'}
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  )
}

function NoEligibleReviewsCard() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-112 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-12">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-auth-primary">
        <PackageCheck className="size-8" strokeWidth={1.8} />
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        No delivered orders to review yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        You can only review products from orders that have been successfully delivered to you.
        Once your package arrives, your items will become eligible for feedback here.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/account/orders')}
          className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-auth-primary-hover active:scale-98"
        >
          <ShoppingBag className="size-4" />
          View Your Orders
        </button>

        <button
          type="button"
          onClick={() => navigate('/account/reviews')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Back to My Reviews
        </button>
      </div>
    </div>
  )
}

function LeaveReview({ reviewId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const params = new URLSearchParams(location.search)
  const editing = Boolean(reviewId)

  const { data: reviewData, isLoading: isLoadingReview } = useReviewQuery(reviewId)
  const { data: eligibleItems = [], isLoading: isLoadingEligible } =
    useEligibleReviewItemsQuery({ enabled: !editing })
  const { createMutation, updateMutation, deleteMediaMutation, isSubmitting } = useReviewMutations({
    onSaved: () => navigate('/account/reviews'),
  })

  const existing = useMemo(
    () => (reviewData ? normalizeApiReview(reviewData, 0) : null),
    [reviewData],
  )

  const requestedOrderItemId = params.get('order_item_id') ?? ''
  const [orderItemId, setOrderItemId] = useState(requestedOrderItemId)

  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [recommend, setRecommend] = useState(editing ? 'yes' : '')
  const [media, setMedia] = useState([])
  const [existingMedia, setExistingMedia] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!existing) return undefined
    const timer = window.setTimeout(() => {
      setRating(existing.rating)
      setTitle(existing.title)
      setBody(existing.body)
      const savedMedia = reviewData?.media ?? reviewData?.review_media ?? reviewData?.attachments ?? []
      setExistingMedia(Array.isArray(savedMedia) ? savedMedia : [])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [existing, reviewData])

  const hasEligibleItems =
    editing ||
    eligibleItems.length > 0 ||
    Boolean(params.get('product')) ||
    Boolean(params.get('order_item_id'))

  const effectiveOrderItemId = orderItemId || String(
    eligibleItems[0]?.id ?? eligibleItems[0]?.order_item_id ?? '',
  )

  const selectedEligibleItem = useMemo(
    () =>
      eligibleItems.find(
        (item) => String(item.id ?? item.order_item_id) === String(effectiveOrderItemId),
      ) ?? null,
    [effectiveOrderItemId, eligibleItems],
  )

  const eligibleProduct = selectedEligibleItem?.product ?? selectedEligibleItem?.product_variant?.product
  const productId = String(
    selectedEligibleItem?.product_id ??
      eligibleProduct?.id ??
      selectedEligibleItem?.product_variant?.product_id ??
      params.get('product_id') ??
      '',
  )
  const product = existing?.product ?? eligibleProduct?.name ?? params.get('product') ?? 'Purchased item'
  const order = existing?.order ?? selectedEligibleItem?.order_number ?? selectedEligibleItem?.order?.order_number ?? params.get('order') ?? 'Order'
  const image = existing?.image ?? eligibleProduct?.primary_image?.image_url ?? eligibleProduct?.images?.[0]?.image_url ?? kitchenImage
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  const addFiles = (files) => {
    const accepted = [...files]
      .filter((file) => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          notify.error(`${file.name} is not supported`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          notify.error(`${file.name} is larger than 10MB`)
          return false
        }
        return true
      })
      .slice(0, 5 - media.length)

    setMedia((items) => [
      ...items,
      ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ])
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!rating) next.rating = 'Please select an overall rating.'
    if (!editing && !effectiveOrderItemId) next.orderItem = 'Select a delivered item to review.'
    if (!editing && !productId) next.orderItem = 'The selected item is missing its product ID.'
    if (!title.trim()) next.title = 'Please enter a review title.'
    if (!body.trim()) next.body = 'Please describe your experience.'
    if (!recommend) next.recommend = 'Please select an option.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      rating,
      title: title.trim(),
      review: body.trim(),
    }
    if (!editing) {
      payload.order_item_id = effectiveOrderItemId
      payload.product_id = productId
    } else {
      const existingMediaIds = existingMedia
        .map((item) => {
          if (typeof item === 'string') return item.trim()
          return item?.id ?? item?.media_id ?? item?.ulid ?? item?.uuid ?? null
        })
        .filter((id) => Boolean(id) && typeof id === 'string')
      payload.existing_media_ids = existingMediaIds
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          reviewId,
          payload,
          files: media.map((item) => item.file),
        })
      } else {
        await createMutation.mutateAsync({
          payload,
          files: media.map((item) => item.file),
        })
      }
    } catch {
      // Handled in mutation onError
    }
  }

  return (
    <section>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
      >
        <Link to="/">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/account/orders">Orders</Link>
        <ChevronRight className="size-3.5" />
        <span className="font-bold text-slate-900">
          {editing ? 'Edit Review' : 'Write a Review'}
        </span>
      </nav>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-auth-primary"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">
          Customer feedback
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {editing ? 'Edit Your Review' : 'Write a Review'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Share your experience to help other customers make better choices.
        </p>
      </div>

      {!hasEligibleItems && !isLoadingEligible ? (
        <div className="mt-7">
          <NoEligibleReviewsCard />
        </div>
      ) : (
        <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <form
          onSubmit={submit}
          noValidate
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-7"
        >
          {!editing ? (
            <label className="block">
              <span className="text-sm font-bold text-slate-900">
                Delivered Item <span className="text-auth-primary">*</span>
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Only delivered order items that are eligible for review are shown.
              </span>
              <select
                value={effectiveOrderItemId}
                disabled={isLoadingEligible}
                onChange={(event) => {
                  setOrderItemId(event.target.value)
                  setErrors((items) => ({ ...items, orderItem: '' }))
                }}
                className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-auth-primary ${
                  errors.orderItem ? 'border-red-400' : 'border-slate-200'
                }`}
              >
                <option value="">
                  {isLoadingEligible ? 'Loading eligible items…' : 'Select an item'}
                </option>
                {eligibleItems.map((item) => {
                  const id = String(item.id ?? item.order_item_id ?? '')
                  const itemProduct = item.product ?? item.product_variant?.product
                  const label = itemProduct?.name ?? item.product_name ?? `Order item ${id}`
                  return <option key={id} value={id}>{label}</option>
                })}
              </select>
              {errors.orderItem ? (
                <span className="mt-1 block text-xs font-semibold text-red-600">
                  {errors.orderItem}
                </span>
              ) : null}
            </label>
          ) : isLoadingReview ? (
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ) : null}
          <fieldset>
            <legend className="text-sm font-bold text-slate-900">
              Overall Rating <span className="text-auth-primary">*</span>
            </legend>
            <p className="mt-1 text-xs text-slate-500">How would you rate this product?</p>
            <div
              className="mt-3 flex flex-wrap items-center gap-1"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} stars`}
                  onMouseEnter={() => setHover(value)}
                  onFocus={() => setHover(value)}
                  onClick={() => {
                    setRating(value)
                    setErrors((items) => ({ ...items, rating: '' }))
                  }}
                  className="rounded-lg p-1 transition hover:scale-110 focus:ring-2 focus:ring-auth-primary/30"
                >
                  <Star
                    className={`size-8 ${
                      value <= (hover || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700">
                {labels[hover || rating]}
              </span>
            </div>
            {errors.rating ? (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.rating}</p>
            ) : null}
          </fieldset>

          <label className="block">
            <span className="text-sm font-bold text-slate-900">
              Review Title <span className="text-auth-primary">*</span>
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Summarise your experience in a few words.
            </span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setErrors((items) => ({ ...items, title: '' }))
              }}
              maxLength={100}
              placeholder="What stood out about this product?"
              className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm outline-none focus:border-auth-primary ${
                errors.title ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {errors.title ? (
              <span className="mt-1 block text-xs font-semibold text-red-600">
                {errors.title}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-900">
              Review Description <span className="text-auth-primary">*</span>
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Tell other shoppers what you liked or what could be improved.
            </span>
            <textarea
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                setErrors((items) => ({ ...items, body: '' }))
              }}
              rows={6}
              maxLength={1000}
              placeholder="Describe the quality, fit, delivery, and your overall experience…"
              className={`mt-2 w-full rounded-xl border p-4 text-sm leading-6 outline-none focus:border-auth-primary ${
                errors.body ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            <span className="mt-1 flex justify-between text-xs">
              <span className="font-semibold text-red-600">{errors.body}</span>
              <span className="text-slate-400">{body.length}/1000</span>
            </span>
          </label>

          <fieldset>
            <legend className="text-sm font-bold text-slate-900">
              Add Photos or Videos <span className="font-normal text-slate-400">(Optional)</span>
            </legend>
            <p className="mt-1 text-xs text-slate-500">
              Up to 5 JPG, PNG, WEBP or video files. Maximum 10MB each.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                addFiles(event.dataTransfer.files)
              }}
              className="mt-3 flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center hover:border-auth-primary/40"
            >
              <UploadCloud className="size-8 text-auth-primary" />
              <span className="mt-2 text-sm font-bold text-slate-800">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Show customers the product in real life
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(event) => addFiles(event.target.files)}
              className="hidden"
            />
            {media.length ? (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {media.map((item) => (
                  <div
                    key={item.url}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    {item.file.type.startsWith('video/') ? (
                      <video src={item.url} className="size-full object-cover" />
                    ) : (
                      <img src={item.url} alt="" className="size-full object-cover" />
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() =>
                        setMedia((items) => items.filter((entry) => entry.url !== item.url))
                      }
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-slate-950/70 text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {existingMedia.length ? (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {existingMedia.map((item) => {
                  const mediaId = item.id ?? item.media_id
                  const url = item.url ?? item.media_url ?? item.file_url
                  const isVideo = String(item.type ?? item.mime_type ?? '').startsWith('video')
                  return (
                    <div key={mediaId ?? url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                      {isVideo ? <video src={url} className="size-full object-cover" /> : <img src={url} alt="" className="size-full object-cover" />}
                      <button
                        type="button"
                        aria-label="Remove uploaded review media"
                        disabled={deleteMediaMutation.isPending}
                        onClick={async () => {
                          try {
                            await deleteMediaMutation.mutateAsync({ reviewId, mediaId })
                            setExistingMedia((items) => items.filter((entry) => (entry.id ?? entry.media_id) !== mediaId))
                          } catch {
                            // Mutation displays the API error.
                          }
                        }}
                        className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-slate-950/70 text-white disabled:opacity-50"
                      >
                        {deleteMediaMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold text-slate-900">
              Would you recommend this product? <span className="text-auth-primary">*</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ['yes', 'Yes, I recommend it'],
                ['no', 'No, I would not'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRecommend(value)
                    setErrors((items) => ({ ...items, recommend: '' }))
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold ${
                    recommend === value
                      ? 'border-auth-primary bg-red-50 text-auth-primary'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full border ${
                      recommend === value
                        ? 'border-auth-primary bg-auth-primary text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {recommend === value ? <Check className="size-3" /> : null}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            {errors.recommend ? (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.recommend}</p>
            ) : null}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-7 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Submit Review'}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] xl:sticky xl:top-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">
            Reviewing
          </p>
          <img
            src={image}
            alt=""
            className="mt-4 aspect-square w-full rounded-2xl bg-slate-50 object-cover"
          />
          <h3 className="mt-4 text-lg font-bold text-slate-950">{product}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {existing?.variant ?? 'Color: Eternal Green · Storage: 256GB'}
          </p>
          <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Order number</dt>
              <dd className="font-bold text-slate-800">#{order}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Purchased</dt>
              <dd className="font-bold text-slate-800">12 July 2026</dd>
            </div>
          </dl>
          <Link
            to="/wireless-head-set-ylgRZ8"
            className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline"
          >
            View Product Details
            <ChevronRight className="size-3.5" />
          </Link>
        </aside>
      </div>
      )}
    </section>
  )
}

export default function AccountReviewsPanel() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const edit = pathname.match(/^\/account\/reviews\/([^/]+)\/edit$/)
  if (pathname === '/account/reviews/new') return <LeaveReview />
  if (edit) return <LeaveReview reviewId={decodeURIComponent(edit[1])} />
  return <ReviewsList />
}
