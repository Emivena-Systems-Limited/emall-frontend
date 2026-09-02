import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  Star,
  StoreIcon,
} from "lucide-react";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import { getStores } from "../services/storeService";
import {
  normalizeStoreDirectory,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
} from "../utils/storefront";

const PAGE_SIZE = 6;
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
  // The directory request is intentionally unfiltered so every store appears.
  // Its delivery_eligible value therefore has no location context; calculate
  // the badge from service areas and the shopper's resolved/default city.
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

function Rating({ store }) {
  const rating = Number(store.rating ?? store.average_rating ?? 0);
  const count = Number(
    store.rating_count ?? store.reviews_count ?? store.review_count ?? 0,
  );
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <strong>{rating.toFixed(1)}</strong>
      <span className="flex text-auth-primary">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${index < Math.round(rating) ? "fill-current" : ""}`}
          />
        ))}
      </span>
      {count > 0 ? <span className="text-slate-400">({count})</span> : null}
    </div>
  );
}

function DeliveryBadge({ eligible }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[0.68rem] font-semibold text-white ${eligible ? "bg-green-600" : "bg-auth-primary"}`}
    >
      {eligible ? "Delivers to your location" : "Delivery unavailable here"}
    </span>
  );
}

function StoreArtwork({ store, className = "" }) {
  return store.image ? (
    <img
      src={store.image}
      alt={`${store.name} store`}
      className={`size-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex size-full items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-100 ${className}`}
    >
      <StoreIcon className="size-12 text-auth-primary" />
    </div>
  );
}

function StoreCard({ store, location, view, popular = false, showDelivery = true }) {
  const eligible = resolveDirectoryEligibility(store, location.city);
  if (view === "list")
    return (
      <Link
        to={`/stores/${store.id}`}
        className="group flex min-h-28 gap-4 border border-slate-200 bg-white p-3 transition hover:border-auth-primary/40"
      >
        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <StoreArtwork store={store} />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold group-hover:text-auth-primary">
              {store.name}
            </h3>
            <Rating store={store} />
            <p className="mt-2 text-xs text-slate-600">{store.city}</p>
          </div>
          {showDelivery ? <DeliveryBadge eligible={eligible} /> : null}
        </div>
      </Link>
    );
  return (
    <Link to={`/stores/${store.id}`} className="group block min-w-0">
      <div
        className={`relative overflow-hidden rounded-xl bg-slate-100 ${popular ? "aspect-[1.9/1]" : "aspect-[1.85/1]"}`}
      >
        <StoreArtwork
          store={store}
          className="transition duration-500 group-hover:scale-105"
        />
        {!popular && showDelivery ? (
          <span className="absolute right-3 top-3">
            <DeliveryBadge eligible={eligible} />
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold group-hover:text-auth-primary">
            {store.name}
          </h3>
          <p className="mt-1 text-xs text-slate-600">{store.city}</p>
        </div>
        {popular && showDelivery ? <DeliveryBadge eligible={eligible} /> : null}
      </div>
      <div className="mt-2">
        <Rating store={store} />
      </div>
    </Link>
  );
}

function EmptyStoresState({ query }) {
  return (
    <section className="my-12 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-red-50/50 px-6 text-center">
      <div className="max-w-xl">
        <span className="mx-auto flex size-24 items-center justify-center rounded-3xl border border-red-100 bg-white text-auth-primary shadow-sm">
          <StoreIcon className="size-10" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-auth-primary">
          Stores coming soon
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
          {query
            ? "No stores match your search"
            : "No stores are available yet"}
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
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const storesQuery = useQuery({
    queryKey: ["stores", "directory"],
    // This is the complete marketplace directory. The shopper's location is
    // used for delivery badges, not to remove stores from the catalogue.
    queryFn: () => getStores(null, { page: 1, perPage: 50 }),
    staleTime: 60_000,
    retry: 0,
  });
  const stores = useMemo(
    () => normalizeStoreDirectory(storesQuery.data),
    [storesQuery.data],
  );
  const filteredStores = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return stores;
    return stores.filter((store) => {
      const searchableValues = [
        store.name,
        store.city,
        store.region,
        typeof store.address === "string"
          ? store.address
          : store.address?.address,
        ...(store.serviceAreas ?? []),
      ];
      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [query, stores]);
  const popularStores = useMemo(
    () =>
      query
        ? []
        : stores.filter((store) => store.is_popular === true).slice(0, 3),
    [query, stores],
  );
  const pages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const visibleStores = filteredStores.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const total = filteredStores.length;
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
      <main className="bg-white py-8 sm:py-10">
        <Container>
          <section className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-black tracking-tight text-black sm:text-5xl">
              Find Stores In your Location
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
                placeholder="Search"
                className="h-14 w-full rounded-full border border-slate-300 px-6 pr-16 text-sm outline-none transition focus:border-auth-primary"
              />
              <button
                type="submit"
                aria-label="Search stores"
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-auth-primary text-white"
              >
                <Search className="size-6" />
              </button>
            </form>
            {recentSearches.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <strong className="mr-1">Recent Searches:</strong>
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => search(item)}
                    className={`rounded-full border px-4 py-2.5 transition ${query.toLowerCase() === item.toLowerCase() ? "border-auth-primary bg-auth-primary text-white" : "border-slate-300 text-slate-600 hover:border-auth-primary hover:text-auth-primary"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
          {storesQuery.isPending ? (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : storesQuery.isError || !filteredStores.length ? (
            <EmptyStoresState query={query} />
          ) : (
            <>
              {popularStores.length ? (
                <section className="mt-12">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Popular Stores
                  </h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {popularStores.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        location={location}
                        popular
                        showDelivery={isAuthenticated}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="mt-12">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                      All Stores
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {total} {total === 1 ? "store" : "stores"}
                    </p>
                  </div>
                  <div className="flex overflow-hidden rounded-lg border border-slate-900">
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      className={`flex items-center gap-2 px-3 py-2 text-xs ${view === "grid" ? "text-auth-primary" : ""}`}
                    >
                      <Grid2X2 className="size-4" /> Cards
                    </button>
                    <span className="my-2 border-l border-slate-300" />
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className={`flex items-center gap-2 px-3 py-2 text-xs ${view === "list" ? "text-auth-primary" : ""}`}
                    >
                      <List className="size-4" /> List
                    </button>
                  </div>
                </div>
                <div
                  className={`mt-5 grid gap-x-5 gap-y-7 ${view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}
                >
                  {visibleStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      location={location}
                      view={view}
                      showDelivery={isAuthenticated}
                    />
                  ))}
                </div>
                {pages > 1 ? (
                  <nav className="mt-10 flex justify-center gap-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((value) => value - 1)}
                      className="flex size-9 items-center justify-center border border-slate-200 disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    {Array.from({ length: pages }, (_, index) => index + 1).map(
                      (number) => (
                        <button
                          type="button"
                          key={number}
                          onClick={() => setPage(number)}
                          className={`size-9 text-sm ${page === number ? "bg-auth-primary text-white" : ""}`}
                        >
                          {number}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      disabled={page === pages}
                      onClick={() => setPage((value) => value + 1)}
                      className="flex size-9 items-center justify-center border border-slate-200 disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </nav>
                ) : null}
              </section>
            </>
          )}
        </Container>
      </main>
    </SiteLayout>
  );
}
