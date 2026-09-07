import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  PackageOpen,
  Search,
  Star,
  Users,
} from "lucide-react";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import ProductCard from "../components/shared/ProductCard";
import { landingProductGridClass } from "../constants/landingLayout";
import { useStoreDirectorySearch } from "../hooks/useStoreDirectorySearch";
import { getStores } from "../services/storeService";
import {
  extractStoreDirectoryPagination,
  normalizeStoreDirectory,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
} from "../utils/storefront";
import Images from "../utils/Images";

const STORES_PER_PAGE = 5;

function resolveDirectoryEligibility(store, city) {
  return resolveStoreEligibility(
    {
      ...store,
      explicitEligibility: undefined,
      delivery_eligible: undefined,
      delivers_to_user_location: undefined,
      is_delivery_eligible: undefined,
    },
    city,
  );
}

function getPageItems(currentPage, lastPage) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }
  const items = new Set([1, lastPage, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) { items.add(2); items.add(3); items.add(4); }
  if (currentPage >= lastPage - 2) { items.add(lastPage - 1); items.add(lastPage - 2); items.add(lastPage - 3); }
  const pages = [...items].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);
  const withEllipsis = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) withEllipsis.push("ellipsis");
    withEllipsis.push(p);
  });
  return withEllipsis;
}

function StoresPagination({ page, lastPage, total, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null;
  const items = getPageItems(page, lastPage);

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Stores pagination">
      <p className="text-xs text-slate-400">
        Page {page} of {lastPage} · {total} {total === 1 ? "store" : "stores"}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition disabled:opacity-30 hover:border-auth-primary hover:text-auth-primary"
        >
          <ChevronLeft className="size-4" />
        </button>

        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">…</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                page === item
                  ? "bg-auth-primary text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:border-auth-primary hover:text-auth-primary"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === lastPage}
          onClick={() => onPageChange(page + 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition disabled:opacity-30 hover:border-auth-primary hover:text-auth-primary"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

function StoreProductsEmptyState({ storeId }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:py-4 sm:text-left">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-auth-primary ring-1 ring-slate-200">
          <PackageOpen className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">No products yet</p>
          <p className="mt-0.5 text-xs text-slate-500">Check back soon for new listings.</p>
        </div>
      </div>
      <Link
        to={`/stores/${storeId}`}
        className="mt-3 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-auth-primary hover:underline sm:mt-0"
      >
        Visit store
        <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  );
}

function StoreProductsStrip({ storeId, products, showDelivery, eligible }) {
  const displayProducts = products.slice(0, 5);
  const productCount = displayProducts.length;

  if (!productCount) {
    return <StoreProductsEmptyState storeId={storeId} />;
  }

  return (
    <div className={landingProductGridClass}>
      {displayProducts.map((product) => (
        <ProductCard
          key={product.id ?? product.backendId}
          product={product}
          disabledReason={
            showDelivery && !eligible
              ? "Not Available in your location"
              : ""
          }
        />
      ))}
      <Link
        to={`/stores/${storeId}`}
        className="@container group flex min-w-0 flex-col overflow-hidden rounded-xl border border-dashed border-auth-primary/35 bg-gradient-to-br from-red-50/70 to-white text-auth-primary transition-colors hover:border-auth-primary hover:bg-auth-primary/5"
      >
        <div className="relative flex aspect-square w-full items-center justify-center">
          <span className="flex size-[2.25em] items-center justify-center rounded-full bg-auth-primary/10 text-[clamp(0.6875rem,2.75cqi,1rem)] transition-colors group-hover:bg-auth-primary group-hover:text-white">
            <ArrowRight className="size-[1em]" />
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-[0.25em] p-[0.75em] text-center">
          <span className="text-[1.05em] font-semibold leading-snug">See All</span>
          {productCount < 5 ? (
            <span className="text-[0.875em] text-auth-primary/70">Browse store</span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}

function StoreRow({ store, products = [], location, showDelivery }) {
  const eligible = resolveDirectoryEligibility(store, location.city);
  const rating = Number(store.rating ?? store.average_rating ?? 0);
  const ratingCount = Number(
    store.ratingCount ?? store.rating_count ?? store.reviews_count ?? store.review_count ?? 0,
  );
  const productsCount = Number(store.productsCount ?? store.products_count ?? products.length ?? 0);
  const salesCount = Number(store.salesCount ?? store.sales_count ?? 0);
  const followersCount = Number(store.followersCount ?? store.followers_count ?? 0);
  const tradingName = store.tradingName ?? store.trading_name;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 transition-shadow hover:shadow-md">
      {/* Store header */}
      <div className="flex items-center gap-3.5 px-4 py-4 sm:gap-5 sm:px-6">
        {/* Logo */}
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-sm sm:size-[4.25rem]">
          <img
            src={Images.shop.shop_logo}
            alt={store.name}
            className="size-full object-contain p-1"
          />
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="truncate text-base font-extrabold tracking-tight text-slate-950 sm:text-[1.0625rem]">
              {store.name}
            </h3>
            {tradingName && tradingName.toLowerCase() !== store.name?.toLowerCase() ? (
              <span className="truncate text-xs font-medium text-slate-400">
                ({tradingName})
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            {rating > 0 ? (
              <span className="flex items-center gap-1">
                <span className="flex text-auth-primary">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${i < Math.round(rating) ? "fill-current" : ""}`}
                    />
                  ))}
                </span>
                <span className="font-semibold text-slate-700">
                  {rating.toFixed(1)}
                </span>
                {ratingCount > 0 && (
                  <span className="text-slate-400">({ratingCount})</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">No ratings yet</span>
            )}
            {store.city ? (
              <span className="text-slate-400">{store.city}</span>
            ) : null}
            {showDelivery ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white ${eligible ? "bg-green-600" : "bg-auth-primary"}`}
              >
                {eligible ? "Delivers to you" : "No delivery here"}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {productsCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-semibold text-slate-600">
                <Package className="size-3" />
                {productsCount} {productsCount === 1 ? "product" : "products"}
              </span>
            ) : null}
            {salesCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-semibold text-slate-600">
                {salesCount} sales
              </span>
            ) : null}
            {followersCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-semibold text-slate-600">
                <Users className="size-3" />
                {followersCount} followers
              </span>
            ) : null}
          </div>
        </div>

        {/* View More CTA */}
        <Link
          to={`/stores/${store.id}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-auth-primary px-3.5 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-auth-primary transition-colors hover:bg-auth-primary hover:text-white sm:px-4 sm:text-xs"
        >
          View More <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Products strip */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-6">
        <StoreProductsStrip
          storeId={store.id}
          products={products}
          showDelivery={showDelivery}
          eligible={eligible}
        />
      </div>
    </article>
  );
}

function EmptyStoresState({ query }) {
  return (
    <section className="my-12 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-red-50/50 px-6 text-center">
      <div className="max-w-xl">
        <span className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border border-red-100 bg-white shadow-sm">
          <img
            src={Images.shop.shop_logo}
            alt=""
            className="size-full object-contain"
          />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-auth-primary">
          Stores coming soon
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
          {query ? "No stores match your search" : "No stores available yet"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {query
            ? "Try another store name or location to continue exploring."
            : "New sellers are joining the marketplace. Please check back soon."}
        </p>
      </div>
    </section>
  );
}

export default function StoresPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useMemo(() => resolveShoppingLocationDetails(user), [user]);
  const [draftQuery, setDraftQuery] = useState("");
  const [page, setPage] = useState(1);

  const storesQuery = useQuery({
    queryKey: ["stores", "directory"],
    queryFn: () => getStores(null, { page: 1, perPage: 50 }),
    staleTime: 60_000,
    retry: 0,
  });

  const stores = useMemo(
    () => normalizeStoreDirectory(storesQuery.data),
    [storesQuery.data],
  );

  const directoryMeta = useMemo(
    () => extractStoreDirectoryPagination(storesQuery.data),
    [storesQuery.data],
  );

  const { debouncedQuery, filteredStores, isSearching } = useStoreDirectorySearch(
    stores,
    draftQuery,
  );

  const getStoreProducts = (store) => store.products ?? [];

  const lastPage = Math.max(1, Math.ceil(filteredStores.length / STORES_PER_PAGE));
  const visibleStores = filteredStores.slice(
    (page - 1) * STORES_PER_PAGE,
    page * STORES_PER_PAGE,
  );
  const total = debouncedQuery
    ? filteredStores.length
    : directoryMeta.total || filteredStores.length;

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SiteLayout>
      <main className="min-h-screen bg-white py-8 sm:py-10">
        <Container>
          {/* Hero search */}
          <section className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-black tracking-tight text-black sm:text-5xl">
              Find Stores In Your Location
            </h1>
            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
              className="relative mt-8"
            >
              <input
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Search stores by name or city…"
                aria-label="Search stores by name or city"
                className="h-14 w-full rounded-full border border-slate-300 px-6 pr-16 text-sm outline-none transition focus:border-auth-primary"
              />
              <div className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-auth-primary text-white">
                {isSearching ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : (
                  <Search className="size-5" aria-hidden />
                )}
              </div>
            </form>
          </section>

          {/* Loading skeleton */}
          {storesQuery.isPending ? (
            <div className="mt-12 flex flex-col gap-5">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
                    <div className="size-14 shrink-0 animate-pulse rounded-full bg-slate-100 sm:size-[4.25rem]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                      <div className="flex gap-2">
                        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {Array.from({ length: 4 }, (_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
                          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : storesQuery.isError || (!isSearching && !filteredStores.length) ? (
            <EmptyStoresState query={debouncedQuery} />
          ) : (
            <section className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {debouncedQuery ? "Search Results" : "All Stores"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {isSearching ? "Searching stores…" : `${total} ${total === 1 ? "store" : "stores"} found`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-5">
                {visibleStores.map((store) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    products={getStoreProducts(store)}
                    location={location}
                    showDelivery={isAuthenticated}
                  />
                ))}
              </div>

              <StoresPagination
                page={page}
                lastPage={lastPage}
                total={total}
                onPageChange={setPage}
              />
            </section>
          )}
        </Container>
      </main>
    </SiteLayout>
  );
}
