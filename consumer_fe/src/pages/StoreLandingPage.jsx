import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Flame,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  Package,
  PackageOpen,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Store,
  Truck,
} from "lucide-react";
import Container from "../components/layout/Container";
import SiteLayout from "../components/layout/SiteLayout";
import ProductCard from "../components/shared/ProductCard";
import ReviewsEmptyState from "../components/shared/ReviewsEmptyState";
import StoreFilterDrawer from "../components/store/StoreFilterDrawer";
import StoreFilterPanelContent from "../components/store/StoreFilterPanelContent";
import StoreProductPagination from "../components/store/StoreProductPagination";
import {
  landingProductGridClass,
  STAR_EMPTY_FILL,
  STAR_FILL,
} from "../constants/landingLayout";
import Images from "../utils/Images";
import { extractCatalogPagination } from "../utils/normalizeProductCatalog";

const FILTER_SIDEBAR_WIDTH = 272;
const LAYOUT_EASE = [0.16, 1, 0.3, 1];
const PRICE_RANGE_BOUNDS = { min: 0, max: 15000 };
import { useLandingPageData } from "../hooks/useLandingPageData";
import {
  followStore,
  getStore,
  getStoreDeliveryEligibility,
  getStoreFollowStatus,
  getStoreProducts,
  getStoreReviews,
  unfollowStore,
} from "../services/storeService";
import {
  buildStoreDirectory,
  normalizeStoreProducts,
  normalizeStoreRecord,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
} from "../utils/storefront";
import {
  countStoreSidebarFilters,
  groupStoreSubcategories,
  toggleStoreFilterValue,
  uniqueStoreOptions,
  uniqueStoreVariantColors,
  uniqueStoreVariantSizes,
} from "../utils/storeProductFilters";

const EMPTY_FILTERS = {
  categoryId: "",
  subcategoryId: "",
  promotional: "",
  brandId: "",
  color: "",
  size: "",
  minPrice: "",
  maxPrice: "",
};

const STORE_PRODUCTS_PER_PAGE = 12;
const VISIBLE_REVIEW_COUNT = 4;

function FiltersToggleButton({
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onToggleFilters}
      aria-pressed={filtersOpen}
      aria-label={
        activeFilterCount > 0
          ? `Filters, ${activeFilterCount} active`
          : "Filters"
      }
      className={`relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3 ${
        filtersOpen
          ? "border-nav-red bg-nav-red text-white"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
      } ${className}`}
    >
      <SlidersHorizontal className="size-3.5" strokeWidth={2.25} aria-hidden />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 ? (
        <span
          className={`inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold ${
            filtersOpen
              ? "bg-white/20 text-white max-sm:absolute max-sm:-top-1 max-sm:-right-1"
              : "bg-nav-red text-white max-sm:absolute max-sm:-top-1 max-sm:-right-1"
          }`}
        >
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  );
}

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return undefined;
}

function Stars({ rating, size = "size-3.5" }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className={`relative ${size}`} aria-hidden>
            <Star className={size} fill={STAR_EMPTY_FILL} strokeWidth={0} />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={size} fill={STAR_FILL} strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function resolveReviewAuthor(review) {
  return (
    firstValue(
      review.user?.first_name && review.user?.last_name
        ? `${review.user.first_name} ${review.user.last_name}`
        : null,
      review.user?.first_name,
      review.user?.name,
      review.first_name,
      review.customer_name,
      review.author_name,
      review.name,
      "Customer",
    ) || "Customer"
  );
}

function resolveReviewText(review) {
  return firstValue(review.review, review.comment, review.description, review.body, review.text, "");
}

function resolveReviewTitle(review) {
  return firstValue(review.title, review.headline, review.subject, "");
}

function formatReviewMonth(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function buildRatingDistribution(reviews, reviewCount) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    const rating = Math.round(Number(review.rating) || 0);
    if (rating >= 1 && rating <= 5) counts[rating] += 1;
  });
  const total = Math.max(reviewCount, reviews.length, 1);
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    label: `${stars} star`,
    value: Math.round((counts[stars] / total) * 100),
  }));
}

function StoreProfileHeader({
  store,
  averageRating,
  reviewCount,
  productTotal,
  establishedYear,
  isFollowing,
  followPending,
  onToggleFollow,
  eligible,
  isAuthenticated,
}) {
  const sellerService = Number(
    firstValue(store.seller_service_rating, store.sellerServiceRating, averageRating),
  ) || 0;
  const responseRate = Number(
    firstValue(store.response_rate, store.responseRate, 0),
  ) || 0;
  const returnsHandledRaw = firstValue(
    store.returns_handled_rate,
    store.returnsHandledRate,
    null,
  );
  const returnsHandled = returnsHandledRaw == null ? null : Number(returnsHandledRaw);
  const ordersCount = Number(
    firstValue(store.orders_count, store.ordersCount, store.salesCount, store.sales_count, 0),
  ) || 0;
  const isVerified = Boolean(
    firstValue(store.is_verified, store.verified, store.verified_vendor, true),
  );
  const locationLabel = [store.city, store.region || "Ghana"]
    .filter(Boolean)
    .filter((part, index, list) => list.indexOf(part) === index)
    .join(", ");
  const bannerSrc = store.bannerImage || Images.shop.default_store_banner;

  return (
    <header className="relative">
      <div className="relative h-36 overflow-hidden bg-[#6B0F1A] sm:h-44 lg:h-52">
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#6B0F1A]/70 via-[#6B0F1A]/85 to-[#6B0F1A]" />
      </div>

      <Container className="relative -mt-16 pb-1 sm:-mt-20 lg:-mt-24">
        <section className="rounded-t-[1.75rem] border border-slate-200/70 border-b-0 bg-white px-4 pb-4 pt-3.5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:rounded-t-[2rem] sm:px-6 sm:pb-5 sm:pt-4 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-3.5 flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-slate-400"
          >
            <Link to="/" className="transition hover:text-auth-primary">
              Home
            </Link>
            <span aria-hidden>&gt;</span>
            <Link to="/stores" className="transition hover:text-auth-primary">
              Vendors
            </Link>
            <span aria-hidden>&gt;</span>
            <span className="font-medium text-slate-600">{store.name}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="flex min-w-0 flex-1 gap-3.5 sm:gap-4">
              <div className="flex size-[3.75rem] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3EDE4] sm:size-[4.5rem]">
                {store.logo ? (
                  <img src={store.logo} alt="" className="size-full object-cover" />
                ) : (
                  <Store className="size-8 text-auth-primary/70" strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                    {store.name}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[0.625rem] font-bold text-sky-700">
                      <BadgeCheck className="size-3.5" />
                      Verified Vendor
                    </span>
                  ) : null}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.6875rem] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 shrink-0 text-slate-400" />
                    {locationLabel || "Location unavailable"}
                  </span>
                  {establishedYear ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5 shrink-0 text-slate-400" />
                      Est. {establishedYear}
                    </span>
                  ) : null}
                  {isAuthenticated ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-semibold ${
                        eligible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-auth-primary"
                      }`}
                    >
                      <Truck className="size-3" />
                      {eligible ? "Delivers to you" : "Delivery unavailable here"}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.6875rem] text-slate-600 sm:gap-x-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Stars rating={averageRating} size="size-3.5" />
                    <span>
                      <strong className="font-bold text-slate-800">
                        {averageRating.toFixed(1)}
                      </strong>
                      <span className="text-slate-400"> ({reviewCount} reviews)</span>
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Store className="size-3.5 shrink-0 text-sky-600" />
                    <span>
                      <strong className="font-bold text-slate-800">
                        {sellerService.toFixed(1)}
                      </strong>
                      <span className="text-slate-500"> Seller service</span>
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Package className="size-3.5 shrink-0 text-auth-primary" />
                    <span>
                      <strong className="font-bold text-slate-800">{productTotal}</strong>
                      <span className="text-slate-500"> Products</span>
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 shrink-0 text-auth-primary" />
                    <span>
                      <strong className="font-bold text-slate-800">
                        {Math.round(responseRate)}%
                      </strong>
                      <span className="text-slate-500"> Response Rate</span>
                    </span>
                  </span>

                  {Number.isFinite(returnsHandled) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      <RotateCcw className="size-3.5 shrink-0" />
                      <span>
                        <strong className="font-bold">{Math.round(returnsHandled)}%</strong>
                        <span> Returns Handled</span>
                      </span>
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5 shrink-0 text-auth-primary" />
                    <span>
                      <strong className="font-bold text-slate-800">{ordersCount}</strong>
                      <span className="text-slate-500"> Orders</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleFollow}
              disabled={followPending}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full border px-5 py-2 text-xs font-bold transition lg:mt-8 ${
                isFollowing
                  ? "border-auth-primary bg-red-50 text-auth-primary"
                  : "border-auth-primary bg-white text-auth-primary hover:bg-red-50"
              }`}
            >
              <Heart className={`size-3.5 ${isFollowing ? "fill-current" : ""}`} />
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </section>
      </Container>
    </header>
  );
}

function VendorReviewsSection({
  storeName,
  reviews,
  isPending,
  averageRating,
  reviewCount,
  sellerService,
}) {
  const [showAll, setShowAll] = useState(false);
  const hasReviews = reviewCount > 0 || reviews.length > 0;
  const distribution = useMemo(
    () => buildRatingDistribution(reviews, reviewCount),
    [reviews, reviewCount],
  );
  const visibleReviews = showAll ? reviews : reviews.slice(0, VISIBLE_REVIEW_COUNT);

  if (isPending) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-slate-100" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950 sm:text-base">
        <Star className="size-4 fill-amber-400 text-amber-400" />
        Vendor Reviews
      </h2>

      {!hasReviews ? (
        <ReviewsEmptyState subjectName={storeName} variant="vendor" />
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="min-w-0 border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <p className="text-4xl font-black tracking-tight text-slate-950">
              {averageRating.toFixed(1)}
            </p>
            <div className="mt-1.5">
              <Stars rating={averageRating} size="size-4" />
            </div>
            <p className="mt-1 text-[0.6875rem] text-slate-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>

            <div className="mt-4">
              <p className="text-[0.6875rem] font-semibold text-slate-700">
                Seller service{" "}
                <span className="font-bold text-slate-950">{sellerService.toFixed(1)}</span>
              </p>
              <div className="mt-1">
                <Stars rating={sellerService} size="size-3" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {distribution.map((row) => (
                <div
                  key={row.stars}
                  className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-2 text-[0.625rem] text-slate-500"
                >
                  <span>{row.label}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${row.value}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums">{row.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.625rem] font-semibold text-slate-500">
                Most Recent
                <ChevronDown className="size-3" />
              </span>
            </div>

            <div className="space-y-3">
              {visibleReviews.map((review, index) => {
                const author = resolveReviewAuthor(review);
                const title = resolveReviewTitle(review);
                const text = resolveReviewText(review);
                const dateLabel = formatReviewMonth(
                  review.created_at ?? review.date ?? review.reviewed_at,
                );
                return (
                  <article
                    key={review.id ?? `${author}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                        {author.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">{author}</p>
                            {dateLabel ? (
                              <p className="mt-0.5 text-[0.625rem] text-slate-400">
                                {dateLabel}
                              </p>
                            ) : null}
                          </div>
                          <Stars rating={review.rating} size="size-3" />
                        </div>
                        {title ? (
                          <h3 className="mt-2 text-xs font-bold text-slate-900">{title}</h3>
                        ) : null}
                        {text ? (
                          <p className="mt-1 text-[0.6875rem] leading-5 text-slate-600">
                            {text}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {reviews.length > VISIBLE_REVIEW_COUNT ? (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll((current) => !current)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 transition hover:border-auth-primary hover:text-auth-primary"
                >
                  {showAll
                    ? "Show fewer reviews"
                    : `See All ${reviewCount} Reviews`}
                  <ChevronDown
                    className={`size-3.5 transition ${showAll ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

export default function StoreLandingPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: landingData, isPending: isLandingPending } =
    useLandingPageData();
  const location = resolveShoppingLocationDetails(user);
  const [query, setQuery] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [sort, setSort] = useState("all");
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filtersActive = desktopFiltersOpen || mobileFiltersOpen;
  const fallbackStores = useMemo(
    () => buildStoreDirectory(landingData),
    [landingData],
  );
  const fallbackStore = fallbackStores.find(
    (entry) => String(entry.id) === String(storeId),
  );
  const storeQuery = useQuery({
    queryKey: ["store", storeId, location.region, location.city],
    queryFn: () => getStore(storeId, location),
    enabled: Boolean(storeId),
    staleTime: 60_000,
    retry: 0,
  });
  const productsQuery = useQuery({
    queryKey: [
      "store-products",
      storeId,
      location.region,
      location.city,
      query,
      sort,
      page,
      activeFilters,
    ],
    queryFn: () =>
      getStoreProducts(storeId, location, {
        search: query,
        sort: sort === "all" ? undefined : sort,
        ...activeFilters,
        page,
        perPage: STORE_PRODUCTS_PER_PAGE,
      }),
    enabled: Boolean(storeId),
    staleTime: 60_000,
    retry: 0,
  });
  const facetsQuery = useQuery({
    queryKey: ["store-product-facets", storeId],
    queryFn: () => getStoreProducts(storeId, null, { page: 1, perPage: 50 }),
    enabled: Boolean(storeId),
    staleTime: 5 * 60_000,
    retry: 0,
  });
  const reviewsQuery = useQuery({
    queryKey: ["store-reviews", storeId],
    queryFn: () => getStoreReviews(storeId, { page: 1, perPage: 10 }),
    enabled: Boolean(storeId),
    staleTime: 60_000,
    retry: 0,
  });
  const eligibilityQuery = useQuery({
    queryKey: [
      "store-delivery-eligibility",
      storeId,
      location.region,
      location.city,
    ],
    queryFn: () => getStoreDeliveryEligibility(storeId, location),
    enabled: Boolean(storeId && isAuthenticated),
    staleTime: 60_000,
    retry: 0,
  });
  const followQuery = useQuery({
    queryKey: ["store-follow-status", storeId],
    queryFn: () => getStoreFollowStatus(storeId),
    enabled: Boolean(storeId && isAuthenticated),
    retry: 0,
  });
  const followMutation = useMutation({
    mutationFn: (following) =>
      following ? unfollowStore(storeId) : followStore(storeId),
    onSuccess: (_, following) => {
      queryClient.setQueryData(["store-follow-status", storeId], !following);
      queryClient.invalidateQueries({ queryKey: ["followed-stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
    },
  });
  const liveStore = useMemo(
    () => normalizeStoreRecord(storeQuery.data),
    [storeQuery.data],
  );
  const liveProducts = useMemo(
    () => normalizeStoreProducts(productsQuery.data),
    [productsQuery.data],
  );
  const facetProducts = useMemo(
    () => normalizeStoreProducts(facetsQuery.data),
    [facetsQuery.data],
  );
  const filterOptions = useMemo(
    () => ({
      categories: uniqueStoreOptions(facetProducts, "categoryId", "category"),
      subcategoryGroups: groupStoreSubcategories(
        facetProducts,
        activeFilters.categoryId,
      ),
      brands: uniqueStoreOptions(facetProducts, "brandId", "brand"),
      colors: uniqueStoreVariantColors(facetProducts),
      sizes: uniqueStoreVariantSizes(facetProducts),
    }),
    [facetProducts, activeFilters.categoryId],
  );
  const store = liveStore ?? (storeQuery.isError ? fallbackStore : null);
  const products = productsQuery.isError
    ? (fallbackStore?.products ?? [])
    : liveProducts;
  const eligible =
    typeof eligibilityQuery.data?.delivery_eligible === "boolean"
      ? eligibilityQuery.data.delivery_eligible
      : store
        ? resolveStoreEligibility(store, location.city)
        : false;
  const reviews = Array.isArray(reviewsQuery.data?.reviews)
    ? reviewsQuery.data.reviews
    : Array.isArray(reviewsQuery.data)
      ? reviewsQuery.data
      : [];
  const reviewCount = Number(
    firstValue(
      reviewsQuery.data?.reviews_count,
      reviewsQuery.data?.review_count,
      store?.ratingCount,
      store?.reviews_count,
      store?.review_count,
      reviews.length,
      0,
    ),
  ) || 0;
  const averageRating = Number(
    firstValue(
      reviewsQuery.data?.average_rating,
      store?.rating,
      store?.average_rating,
      0,
    ),
  ) || 0;
  const sellerService = Number(
    firstValue(
      reviewsQuery.data?.seller_service_rating,
      store?.seller_service_rating,
      store?.sellerServiceRating,
      averageRating,
    ),
  ) || 0;
  const productPagination = extractCatalogPagination(
    productsQuery.data,
    products.length,
    { page, per_page: STORE_PRODUCTS_PER_PAGE },
  );
  const productTotal = Number(
    firstValue(store?.productsCount, store?.products_count, productPagination.total, 0),
  ) || productPagination.total;
  const establishedYear = (() => {
    const raw = firstValue(
      store?.joined_at,
      store?.created_at,
      store?.established_at,
      store?.established_year,
    );
    if (!raw) return null;
    if (typeof raw === "number" && raw > 1900 && raw < 2100) return raw;
    const year = new Date(raw).getFullYear();
    return Number.isNaN(year) ? null : year;
  })();
  const aboutText = firstValue(
    store?.description,
    store?.store_description,
    store?.about,
    store?.bio,
    store?.tagline,
    `${store?.name || "This store"} offers quality products with reliable service on EezMall.`,
  );
  const isPending = !store && (storeQuery.isPending || isLandingPending);
  const activeFilterCount = countStoreSidebarFilters(activeFilters, query);
  const filterPanelProps = {
    filters: activeFilters,
    filterOptions,
    isFacetsLoading: facetsQuery.isPending && facetProducts.length === 0,
    onToggleFilter: (key, value) => {
      setActiveFilters((current) => {
        const next = {
          ...current,
          [key]: toggleStoreFilterValue(current[key], value),
        };
        if (key === "categoryId") next.subcategoryId = "";
        return next;
      });
      setPage(1);
    },
    onPricePreset: (preset) => {
      setActiveFilters((current) => {
        const numericMin =
          current.minPrice === "" || current.minPrice == null
            ? null
            : Number(current.minPrice);
        const numericMax =
          current.maxPrice === "" || current.maxPrice == null
            ? null
            : Number(current.maxPrice);
        const alreadySelected =
          (preset.min ?? null) === numericMin &&
          (preset.max ?? null) === numericMax;

        return {
          ...current,
          minPrice:
            alreadySelected || preset.min == null ? "" : String(preset.min),
          maxPrice:
            alreadySelected || preset.max == null ? "" : String(preset.max),
        };
      });
      setPage(1);
    },
    onPriceRangeCommit: (nextMin, nextMax) => {
      const atDefaultMin = nextMin <= PRICE_RANGE_BOUNDS.min;
      const atDefaultMax = nextMax >= PRICE_RANGE_BOUNDS.max;
      setActiveFilters((current) => ({
        ...current,
        minPrice: atDefaultMin ? "" : String(nextMin),
        maxPrice: atDefaultMax ? "" : String(nextMax),
      }));
      setPage(1);
    },
    onClearAll: () => {
      setQuery("");
      setSearchDraft("");
      setActiveFilters(EMPTY_FILTERS);
      setPage(1);
    },
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchDraft.trim();
    if (trimmed === query) return;
    setQuery(trimmed);
    setPage(1);
  };

  const toggleFilters = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setDesktopFiltersOpen((open) => !open);
      return;
    }
    setMobileFiltersOpen((open) => !open);
  };

  const handleProductPageChange = (nextPage) => {
    setPage(nextPage);
    document.getElementById("store-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [storeId]);

  useEffect(() => {
    setSearchDraft(query);
  }, [query]);

  const toggleFollow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/stores/${storeId}` } });
      return;
    }
    followMutation.mutate(followQuery.data === true);
  };

  if (!isPending && !store) return <Navigate to="/stores" replace />;
  if (!store) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] animate-pulse bg-slate-100" />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <main className="bg-white pb-14">
        <StoreProfileHeader
          store={store}
          averageRating={averageRating}
          reviewCount={reviewCount}
          productTotal={productTotal}
          establishedYear={establishedYear}
          isFollowing={followQuery.data === true}
          followPending={followMutation.isPending}
          onToggleFollow={toggleFollow}
          eligible={eligible}
          isAuthenticated={isAuthenticated}
        />

        <Container className="pt-4 sm:pt-5">
          <div className="space-y-4 sm:space-y-5">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950 sm:text-base">
                <Info className="size-4 text-slate-400" />
                About {store.name}
              </h2>
              <p className="mt-2 max-w-4xl text-[0.6875rem] leading-5 text-slate-600 sm:text-xs sm:leading-6">
                {aboutText}
              </p>
            </section>

            <section
              id="store-products"
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950 sm:text-base">
                  <Flame className="size-4 text-auth-primary" />
                  Popular Products
                  <span className="font-normal text-slate-400">
                    ({productTotal})
                  </span>
                </h2>
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative w-full max-w-xs sm:w-[16rem]"
                >
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search products..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-800 outline-none transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-nav-red/30"
                  />
                </form>
              </div>

              <div
                className={`flex flex-col lg:flex-row lg:items-start ${
                  desktopFiltersOpen ? "lg:gap-6 xl:gap-8" : "lg:gap-0"
                } transition-[gap] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
              >
                <AnimatePresence initial={false}>
                  {desktopFiltersOpen ? (
                    <motion.aside
                      key="store-filters"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: FILTER_SIDEBAR_WIDTH, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: LAYOUT_EASE }}
                      className="hidden shrink-0 overflow-hidden lg:sticky lg:top-16 lg:z-20 lg:block lg:self-start"
                    >
                      <div
                        style={{ width: FILTER_SIDEBAR_WIDTH }}
                        className="flex max-h-[calc(100vh-4.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"
                      >
                        <StoreFilterPanelContent
                          {...filterPanelProps}
                          showHeading
                        />
                      </div>
                    </motion.aside>
                  ) : null}
                </AnimatePresence>

                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:justify-between sm:gap-3">
                    <FiltersToggleButton
                      filtersOpen={filtersActive}
                      onToggleFilters={toggleFilters}
                      activeFilterCount={activeFilterCount}
                    />
                    <label className="relative min-w-0 flex-1 sm:flex-initial">
                      <span className="sr-only">Sort products</span>
                      <select
                        value={sort}
                        onChange={(event) => {
                          setSort(event.target.value);
                          setPage(1);
                        }}
                        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-2.5 text-xs font-medium text-slate-800 outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-nav-red/30 sm:w-auto"
                      >
                        <option value="all">Best Match</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="top_rated">Highest Rated</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400">
                        <ChevronDown className="size-3.5" aria-hidden />
                      </span>
                    </label>
                  </div>

                  {productsQuery.isPending && !products.length ? (
                    <div
                      className={
                        desktopFiltersOpen
                          ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0"
                          : landingProductGridClass
                      }
                    >
                      {Array.from({ length: 12 }, (_, index) => (
                        <div
                          key={index}
                          className="aspect-3/4 animate-pulse rounded-xl bg-slate-100"
                        />
                      ))}
                    </div>
                  ) : products.length ? (
                    <>
                      <div
                        className={
                          desktopFiltersOpen
                            ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0"
                            : landingProductGridClass
                        }
                      >
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            disabledReason={
                              isAuthenticated && !eligible
                                ? "Not Available in your location"
                                : ""
                            }
                          />
                        ))}
                      </div>
                      <StoreProductPagination
                        page={productPagination.currentPage}
                        lastPage={productPagination.lastPage}
                        total={productPagination.total}
                        onPageChange={handleProductPageChange}
                        disabled={productsQuery.isFetching}
                      />
                    </>
                  ) : (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                      <PackageOpen className="size-10 text-auth-primary" />
                      <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                        No products available yet
                      </h3>
                      <p className="mt-1.5 max-w-sm text-[0.6875rem] text-slate-500">
                        Check back soon for new products from {store.name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <VendorReviewsSection
              storeName={store.name}
              reviews={reviews}
              isPending={reviewsQuery.isPending}
              averageRating={averageRating}
              reviewCount={reviewCount}
              sellerService={sellerService}
            />
          </div>

          <StoreFilterDrawer
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            resultCount={productPagination.total}
            {...filterPanelProps}
          />
        </Container>
      </main>
    </SiteLayout>
  );
}
