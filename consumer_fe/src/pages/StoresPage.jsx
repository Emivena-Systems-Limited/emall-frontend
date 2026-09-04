import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
} from "lucide-react";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import { getStores } from "../services/storeService";
import {
  buildStoreDirectory,
  normalizeStoreDirectory,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
} from "../utils/storefront";
import { useLandingPageData } from "../hooks/useLandingPageData";
import { formatCedi } from "../utils/formatCurrency";
import Images from "../utils/Images";

const STORES_PER_PAGE = 5;
const RECENT_SEARCHES_KEY = "emall:store-recent-searches";

function readRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]",
    );
    return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 5) : [];
  } catch {
    return [];
  }
}

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

function StoreMiniProductCard({ product }) {
  return (
    <Link
      to={product.href}
      className="group flex w-28 shrink-0 flex-col sm:w-[7.5rem]"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-[0.7rem] font-medium leading-snug text-slate-700 group-hover:text-auth-primary">
        {product.name}
      </p>
      <p className="mt-1 text-[0.72rem] font-bold text-slate-900">
        {formatCedi(product.price)}
      </p>
    </Link>
  );
}

function StoreRow({ store, products = [], location, showDelivery }) {
  const eligible = resolveDirectoryEligibility(store, location.city);
  const rating = Number(store.rating ?? store.average_rating ?? 0);
  const ratingCount = Number(
    store.rating_count ?? store.reviews_count ?? store.review_count ?? 0,
  );
  const displayProducts = products.slice(0, 5);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 transition-shadow hover:shadow-md">
      {/* Store header */}
      <div className="flex items-center gap-3.5 px-4 py-4 sm:gap-5 sm:px-6">
        {/* Logo */}
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-sm sm:size-[4.25rem]">
          <img
            src={store.logo ?? store.avatar ?? Images.shop.shop_logo}
            alt={store.name}
            className="size-full object-contain"
            onError={(e) => { e.currentTarget.src = Images.shop.shop_logo; }}
          />
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold tracking-tight text-slate-950 sm:text-[1.0625rem]">
            {store.name}
          </h3>
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
        {displayProducts.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayProducts.map((product) => (
              <StoreMiniProductCard key={product.id ?? product.backendId} product={product} />
            ))}
            <Link
              to={`/stores/${store.id}`}
              className="flex w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-auth-primary/40 bg-red-50/40 text-auth-primary transition-colors hover:bg-auth-primary/10 sm:w-[7.5rem]"
            >
              <ArrowRight className="size-5" />
              <span className="text-[0.65rem] font-bold uppercase tracking-wide">
                See All
              </span>
            </Link>
          </div>
        ) : (
          <p className="py-1 text-xs text-slate-400">
            No products listed yet.{" "}
            <Link
              to={`/stores/${store.id}`}
              className="font-semibold text-auth-primary underline-offset-2 hover:underline"
            >
              Visit store
            </Link>
          </p>
        )}
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
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);
  const [page, setPage] = useState(1);

  const storesQuery = useQuery({
    queryKey: ["stores", "directory"],
    queryFn: () => getStores(null, { page: 1, perPage: 50 }),
    staleTime: 60_000,
    retry: 0,
  });
  const landingQuery = useLandingPageData();

  const stores = useMemo(
    () => normalizeStoreDirectory(storesQuery.data),
    [storesQuery.data],
  );

  // Build a product lookup keyed by store ID from landing page data
  const landingProductsByStoreId = useMemo(() => {
    const map = new Map();
    const landingStores = buildStoreDirectory(landingQuery.data);
    landingStores.forEach((s) => {
      if (s.id && s.products?.length) {
        map.set(String(s.id), s.products);
      }
    });
    return map;
  }, [landingQuery.data]);

  const getStoreProducts = (store) => {
    if (store.products?.length) return store.products;
    return landingProductsByStoreId.get(String(store.id)) ?? [];
  };

  const filteredStores = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return stores;
    return stores.filter((store) => {
      const searchable = [
        store.name,
        store.city,
        store.region,
        typeof store.address === "string"
          ? store.address
          : store.address?.address,
        ...(store.serviceAreas ?? []),
      ];
      return searchable.some((v) =>
        String(v ?? "").toLowerCase().includes(needle),
      );
    });
  }, [query, stores]);

  const lastPage = Math.max(1, Math.ceil(filteredStores.length / STORES_PER_PAGE));
  const visibleStores = filteredStores.slice(
    (page - 1) * STORES_PER_PAGE,
    page * STORES_PER_PAGE,
  );
  const total = filteredStores.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const search = (value) => {
    const normalized = value.trim();
    setDraftQuery(normalized);
    setQuery(normalized);
    setPage(1);
    if (normalized) {
      setRecentSearches((current) => {
        const next = [
          normalized,
          ...current.filter(
            (item) => item.toLowerCase() !== normalized.toLowerCase(),
          ),
        ].slice(0, 5);
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

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
                search(draftQuery);
              }}
              className="relative mt-8"
            >
              <input
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Search stores by name or city…"
                className="h-14 w-full rounded-full border border-slate-300 px-6 pr-16 text-sm outline-none transition focus:border-auth-primary"
              />
              <button
                type="submit"
                aria-label="Search stores"
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-auth-primary text-white"
              >
                <Search className="size-5" />
              </button>
            </form>
            {recentSearches.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <strong className="mr-1 text-slate-500">Recent:</strong>
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => search(item)}
                    className={`rounded-full border px-4 py-2 transition ${
                      query.toLowerCase() === item.toLowerCase()
                        ? "border-auth-primary bg-auth-primary text-white"
                        : "border-slate-300 text-slate-500 hover:border-auth-primary hover:text-auth-primary"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          {/* Loading skeleton */}
          {storesQuery.isPending ? (
            <div className="mt-12 flex flex-col gap-5">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : storesQuery.isError || !filteredStores.length ? (
            <EmptyStoresState query={query} />
          ) : (
            <section className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    All Stores
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {total} {total === 1 ? "store" : "stores"} found
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
