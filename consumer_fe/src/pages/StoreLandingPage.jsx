import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  PackageOpen,
  Phone,
  Share2,
  Star,
  Truck,
} from "lucide-react";
import Container from "../components/layout/Container";
import SiteLayout from "../components/layout/SiteLayout";
import ProductCard from "../components/shared/ProductCard";
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

function uniqueOptions(products, valueKey, labelKey = valueKey) {
  const options = new Map();
  products.forEach((product) => {
    const value = product[valueKey];
    const label = product[labelKey];
    if (value != null && value !== "" && label)
      options.set(String(value), String(label));
  });
  return [...options].map(([value, label]) => ({ value, label }));
}

function uniqueFacetOptions(products, key) {
  return [
    ...new Set(
      products
        .flatMap((product) => product.variantFacets?.[key] ?? [])
        .filter(Boolean),
    ),
  ]
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map((value) => ({ value: String(value), label: String(value) }));
}

function FilterSection({ label, open, onToggle, children, disabled = false }) {
  return (
    <div className="border-b border-slate-100">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-bold disabled:cursor-not-allowed disabled:text-slate-400"
      >
        <span>{label}</span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="space-y-2 pb-4">{children}</div> : null}
    </div>
  );
}

function RadioOptions({ name, value, options, onChange, emptyLabel }) {
  if (!options.length)
    return <p className="text-xs text-slate-400">{emptyLabel}</p>;
  return options.map((option) => (
    <label
      key={option.value}
      className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={value === option.value}
        onChange={() => onChange(option.value)}
        className="accent-auth-primary"
      />
      <span>{option.label}</span>
    </label>
  ));
}

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
  const [openFilter, setOpenFilter] = useState("");
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
        perPage: 10,
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
      categories: uniqueOptions(facetProducts, "categoryId", "category"),
      subcategories: uniqueOptions(
        facetProducts,
        "subcategoryId",
        "subcategory",
      ),
      brands: uniqueOptions(facetProducts, "brandId", "brand"),
      colors: uniqueFacetOptions(facetProducts, "color"),
      sizes: uniqueFacetOptions(facetProducts, "size"),
    }),
    [facetProducts],
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
  const productPagination =
    productsQuery.data?.pagination ?? productsQuery.data?.meta ?? {};
  const productPages = Math.max(
    1,
    Number(productPagination.last_page ?? productPagination.total_pages ?? 1),
  );
  const productTotal = Number(productPagination.total ?? products.length);
  const joinedYear = store?.joined_at
    ? new Date(store.joined_at).getFullYear()
    : null;
  const yearsOnPlatform =
    joinedYear && !Number.isNaN(joinedYear)
      ? Math.max(0, new Date().getFullYear() - joinedYear)
      : 0;
  const isPending = !store && (storeQuery.isPending || isLandingPending);
  const updateFilter = (key, value) => {
    setActiveFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
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
          <section className="relative h-52 overflow-hidden bg-gradient-to-r from-amber-100 to-orange-50 sm:h-72">
            {store.bannerImage ? (
              <img
                src={store.bannerImage}
                alt={`${store.name} banner`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center text-center">
                <strong className="text-xl">{store.name}</strong>
                <span className="mt-1 text-3xl font-black text-auth-primary sm:text-5xl">
                  Welcome to our store
                </span>
                <span className="mt-3 text-sm">
                  Discover products selected for you.
                </span>
              </div>
            )}
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
          <section className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="border-r border-slate-300 pr-4">
              <h2 className="text-xl font-black">Filters</h2>
              <p className="text-xs text-slate-500">Narrow your search</p>
              <label className="mt-5 block text-sm font-bold">
                Search
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Product name"
                  className="mt-2 h-11 w-full border border-slate-300 px-3 text-xs outline-none focus:border-auth-primary"
                />
              </label>
              <FilterSection
                label="Categories"
                open={openFilter === "category"}
                onToggle={() =>
                  setOpenFilter((value) =>
                    value === "category" ? "" : "category",
                  )
                }
              >
                <RadioOptions
                  name="store-category"
                  value={activeFilters.categoryId}
                  options={filterOptions.categories}
                  onChange={(value) => updateFilter("categoryId", value)}
                  emptyLabel="No categories available"
                />
              </FilterSection>
              <FilterSection
                label="Sub-categories"
                open={openFilter === "subcategory"}
                onToggle={() =>
                  setOpenFilter((value) =>
                    value === "subcategory" ? "" : "subcategory",
                  )
                }
              >
                <RadioOptions
                  name="store-subcategory"
                  value={activeFilters.subcategoryId}
                  options={filterOptions.subcategories}
                  onChange={(value) => updateFilter("subcategoryId", value)}
                  emptyLabel="No sub-categories available"
                />
              </FilterSection>
              <FilterSection
                label="Promotional Deals"
                open={openFilter === "promotional"}
                onToggle={() =>
                  setOpenFilter((value) =>
                    value === "promotional" ? "" : "promotional",
                  )
                }
              >
                <RadioOptions
                  name="store-promotional"
                  value={activeFilters.promotional}
                  options={[{ value: "1", label: "Promotional products only" }]}
                  onChange={(value) => updateFilter("promotional", value)}
                />
              </FilterSection>
              <FilterSection
                label="Brand"
                open={openFilter === "brand"}
                onToggle={() =>
                  setOpenFilter((value) => (value === "brand" ? "" : "brand"))
                }
              >
                <RadioOptions
                  name="store-brand"
                  value={activeFilters.brandId}
                  options={filterOptions.brands}
                  onChange={(value) => updateFilter("brandId", value)}
                  emptyLabel="No brands available"
                />
              </FilterSection>
              <FilterSection
                label="Color"
                open={openFilter === "color"}
                onToggle={() =>
                  setOpenFilter((value) => (value === "color" ? "" : "color"))
                }
              >
                <RadioOptions
                  name="store-color"
                  value={activeFilters.color}
                  options={filterOptions.colors}
                  onChange={(value) => updateFilter("color", value)}
                  emptyLabel="No colors available"
                />
              </FilterSection>
              <FilterSection
                label="Size"
                open={openFilter === "size"}
                onToggle={() =>
                  setOpenFilter((value) => (value === "size" ? "" : "size"))
                }
              >
                <RadioOptions
                  name="store-size"
                  value={activeFilters.size}
                  options={filterOptions.sizes}
                  onChange={(value) => updateFilter("size", value)}
                  emptyLabel="No sizes available"
                />
              </FilterSection>
              <FilterSection
                label="Price"
                open={openFilter === "price"}
                onToggle={() =>
                  setOpenFilter((value) => (value === "price" ? "" : "price"))
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[0.68rem] text-slate-500">
                    Minimum
                    <input
                      type="number"
                      min="0"
                      value={activeFilters.minPrice}
                      onChange={(event) =>
                        updateFilter("minPrice", event.target.value)
                      }
                      placeholder="GH₵ 0"
                      className="mt-1 h-9 w-full border border-slate-200 px-2 text-xs outline-none focus:border-auth-primary"
                    />
                  </label>
                  <label className="text-[0.68rem] text-slate-500">
                    Maximum
                    <input
                      type="number"
                      min="0"
                      value={activeFilters.maxPrice}
                      onChange={(event) =>
                        updateFilter("maxPrice", event.target.value)
                      }
                      placeholder="Any"
                      className="mt-1 h-9 w-full border border-slate-200 px-2 text-xs outline-none focus:border-auth-primary"
                    />
                  </label>
                </div>
              </FilterSection>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSort("all");
                  setActiveFilters(EMPTY_FILTERS);
                  setOpenFilter("");
                  setPage(1);
                }}
                className="mt-6 w-full rounded bg-blue-50 py-3 text-sm font-bold"
              >
                Clear All
              </button>
            </aside>
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">
                  All Products{" "}
                  <span className="font-normal text-slate-400">
                    ({productTotal})
                  </span>
                </h2>
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
                  {productPages > 1 ? (
                    <nav className="mt-10 flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((value) => value - 1)}
                        className="flex size-9 items-center justify-center border border-slate-200 disabled:opacity-30"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="px-3 py-2 text-sm">
                        Page {page} of {productPages}
                      </span>
                      <button
                        type="button"
                        disabled={page === productPages}
                        onClick={() => setPage((value) => value + 1)}
                        className="flex size-9 items-center justify-center border border-slate-200 disabled:opacity-30"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </nav>
                  ) : null}
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
          <ReviewList reviews={reviews} isPending={reviewsQuery.isPending} />
        </Container>
      </main>
    </SiteLayout>
  );
}
