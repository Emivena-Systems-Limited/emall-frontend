import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Heart,
  MapPin,
  PackageOpen,
  Phone,
  Share2,
  SlidersHorizontal,
  Star,
  Truck,
} from "lucide-react";
import Container from "../components/layout/Container";
import SiteLayout from "../components/layout/SiteLayout";
import ProductCard from "../components/shared/ProductCard";
import StoreFilterDrawer from "../components/store/StoreFilterDrawer";
import StoreFilterSidebar from "../components/store/StoreFilterSidebar";
import StoreProductPagination from "../components/store/StoreProductPagination";
import Images from "../utils/Images";
import { extractCatalogPagination } from "../utils/normalizeProductCatalog";
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

const STORE_PRODUCTS_PER_PAGE = 10;

function ReviewList({ reviews, isPending }) {
  if (isPending)
    return (
      <section className="mt-12 border-t border-slate-300 pt-7">
        <div className="h-7 w-32 animate-pulse bg-slate-100" />
        <div className="mt-5 h-24 animate-pulse bg-slate-100" />
      </section>
    );
  if (!reviews.length)
    return (
      <section className="mt-12 border-t border-slate-300 py-10 text-center">
        <h2 className="text-2xl font-black">Reviews</h2>
        <p className="mt-2 text-sm text-slate-500">
          This store has no reviews yet.
        </p>
      </section>
    );
  return (
    <section className="mt-12 border-t border-slate-300 pt-7">
      <h2 className="text-2xl font-black">Reviews</h2>
      <div className="mt-5 space-y-5">
        {reviews.map((review, index) => (
          <article
            key={review.id ?? index}
            className="border-b border-slate-300 pb-5"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="flex size-7 items-center justify-center rounded-full bg-pink-500 font-bold text-white">
                {String(
                  review.user?.first_name ??
                    review.first_name ??
                    review.customer_name ??
                    "C",
                ).charAt(0)}
              </span>
              <strong>
                {review.user?.first_name ??
                  review.first_name ??
                  review.customer_name ??
                  "Customer"}
              </strong>
              {review.created_at ? (
                <span className="text-slate-400">
                  on {new Date(review.created_at).toLocaleDateString()}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex text-auth-primary">
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  className={`size-4 ${star < Number(review.rating || 0) ? "fill-current" : ""}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {review.review ?? review.comment ?? review.description}
            </p>
          </article>
        ))}
      </div>
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
  const [sort, setSort] = useState("all");
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
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
    : [];
  const reviewCount = Number(
    reviewsQuery.data?.reviews_count ??
      store?.reviews_count ??
      store?.review_count ??
      reviews.length,
  );
  const averageRating = Number(
    reviewsQuery.data?.average_rating ??
      store?.average_rating ??
      store?.rating ??
      0,
  );
  const productPagination = extractCatalogPagination(
    productsQuery.data,
    products.length,
    { page, per_page: STORE_PRODUCTS_PER_PAGE },
  );
  const productTotal = productPagination.total;
  const joinedYear = store?.joined_at
    ? new Date(store.joined_at).getFullYear()
    : null;
  const yearsOnPlatform =
    joinedYear && !Number.isNaN(joinedYear)
      ? Math.max(0, new Date().getFullYear() - joinedYear)
      : 0;
  const isPending = !store && (storeQuery.isPending || isLandingPending);
  const activeFilterCount = countStoreSidebarFilters(activeFilters, query);

  const toggleFilter = (key, value) => {
    setActiveFilters((current) => {
      const next = {
        ...current,
        [key]: toggleStoreFilterValue(current[key], value),
      };
      if (key === "categoryId") next.subcategoryId = "";
      return next;
    });
    setPage(1);
  };

  const handleSearchCommit = (nextValue) => {
    const trimmed = nextValue.trim();
    if (trimmed === query) return;
    setQuery(trimmed);
    setPage(1);
  };

  const handlePricePreset = (preset) => {
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
  };

  const handleClearFilters = () => {
    setQuery("");
    setSort("all");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
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
  const toggleFollow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/stores/${storeId}` } });
      return;
    }
    followMutation.mutate(followQuery.data === true);
  };
  const shareStore = async () => {
    if (navigator.share)
      await navigator.share({ title: store.name, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  };
  if (!isPending && !store) return <Navigate to="/stores" replace />;
  if (!store)
    return (
      <SiteLayout>
        <div className="min-h-[60vh] animate-pulse bg-slate-100" />
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <main className="bg-white pb-12">
        <Container className="pt-5">
          <section className="relative h-52 overflow-hidden bg-white sm:h-72">
            <img
              // src={store.bannerImage || Images.shop.default_store_banner}
              src={Images.shop.default_store_banner}
              alt={store.bannerImage ? `${store.name} banner` : ""}
              className={`size-full ${store.bannerImage ? "object-cover" : "object-contain"}`}
            />
            <Link
              to="/stores"
              className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-auth-primary shadow"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
          </section>
          <section className="py-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {store.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {store.city}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Star className="size-4 fill-auth-primary text-auth-primary" />
                    {averageRating.toFixed(1)}{" "}
                    <span className="font-normal text-slate-400">
                      ({reviewCount})
                    </span>
                  </span>
                  <span>
                    <strong>{store.sales_count ?? 0}</strong> Sales
                  </span>
                  <span>
                    <strong>{store.followers_count ?? 0}</strong> Followers
                  </span>
                  <span>
                    <strong>{yearsOnPlatform}</strong> Years on E-MALL
                  </span>
                  {isAuthenticated ? (
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-semibold text-white ${eligible ? "bg-green-600" : "bg-auth-primary"}`}
                    >
                      <Truck className="mr-1 inline size-3.5" />
                      {eligible
                        ? "Delivers to your location"
                        : "Delivery unavailable here"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={
                    store.phone
                      ? `tel:${store.phone}`
                      : store.email
                        ? `mailto:${store.email}`
                        : undefined
                  }
                  className="flex items-center gap-2 rounded-full border border-slate-400 px-5 py-2.5 text-sm"
                >
                  <Phone className="size-4" /> Contact
                </a>
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followMutation.isPending}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm ${followQuery.data ? "border-auth-primary bg-red-50 text-auth-primary" : "border-slate-400"}`}
                >
                  <Heart
                    className={`size-4 ${followQuery.data ? "fill-current" : ""}`}
                  />
                  {followQuery.data ? "Following" : "Follow"}
                </button>
                <button
                  type="button"
                  onClick={shareStore}
                  className="flex items-center gap-2 rounded-full border border-slate-400 px-5 py-2.5 text-sm"
                >
                  <Share2 className="size-4" /> Share
                </button>
              </div>
            </div>
          </section>
          <section className="relative flex flex-col gap-5 overflow-visible lg:flex-row lg:items-stretch lg:gap-6 xl:gap-8">
            <StoreFilterSidebar
              filters={activeFilters}
              filterOptions={filterOptions}
              searchValue={query}
              isFacetsLoading={facetsQuery.isPending && facetProducts.length === 0}
              onToggleFilter={toggleFilter}
              onSearchCommit={handleSearchCommit}
              onPricePreset={handlePricePreset}
              onClearAll={handleClearFilters}
            />
            <div id="store-products" className="min-w-0 flex-1">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black">
                  All Products{" "}
                  <span className="font-normal text-slate-400">
                    ({productTotal})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition-colors hover:border-auth-primary hover:text-auth-primary sm:text-sm lg:hidden"
                  >
                    <SlidersHorizontal className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
                    Filters
                    {activeFilterCount > 0 ? (
                      <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-auth-primary px-1.5 text-[0.65rem] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                  <label className="flex items-center gap-2 text-xs">
                    Sort by:
                    <select
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value);
                        setPage(1);
                      }}
                      className="h-10 min-w-28 border border-slate-300 bg-white px-3"
                    >
                      <option value="all">All</option>
                      <option value="newest">Newest</option>
                      <option value="top_rated">Top rated</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </label>
                </div>
              </div>
              {productsQuery.isPending && !products.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 10 }, (_, index) => (
                    <div
                      key={index}
                      className="h-64 animate-pulse bg-slate-100"
                    />
                  ))}
                </div>
              ) : products.length ? (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        disabledReason={
                          isAuthenticated && !eligible
                            ? "Store does not deliver to your location"
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
                <div className="flex min-h-80 flex-col items-center justify-center border border-slate-200 text-center">
                  <PackageOpen className="size-12 text-auth-primary" />
                  <h3 className="mt-4 text-xl font-black">
                    No products available yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Check back soon for new products from {store.name}.
                  </p>
                </div>
              )}
            </div>
          </section>
          <StoreFilterDrawer
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            filters={activeFilters}
            filterOptions={filterOptions}
            searchValue={query}
            isFacetsLoading={facetsQuery.isPending && facetProducts.length === 0}
            onToggleFilter={toggleFilter}
            onSearchCommit={handleSearchCommit}
            onPricePreset={handlePricePreset}
            onClearAll={handleClearFilters}
          />
          <ReviewList reviews={reviews} isPending={reviewsQuery.isPending} />
        </Container>
      </main>
    </SiteLayout>
  );
}
