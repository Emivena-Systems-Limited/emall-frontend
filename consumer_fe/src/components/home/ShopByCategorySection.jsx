import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { CATEGORY_IMAGES } from '../../constants/categoryImageLibrary'
import { useCategoryCatalog } from '../../hooks/useCategoryCatalog'
import { getProductCatalog } from '../../services/productService'
import { buildCategoryListingHref } from '../../utils/listingFilterParams'
import { resolveParentCategoryImage } from '../../utils/resolveCategoryImage'

const BENTO_COUNT = 8
const CHIP_LIMIT = 5
const EXCLUDED_SLUGS = new Set(['underwear-sleepwear'])
const PLACEHOLDER_NAMES = new Set(['emma', 'testing', 'classroom', 'parent category'])

/** Same arrangement as the shop-by-category bento. The last slot is filled from the next popular category. */
const LAYOUT_SLUGS = [
  'electronics',
  'womens-clothing',
  'home-kitchen',
  'sports-outdoors',
  'beauty-health',
  'toys-games',
  'shoes',
]

const SLOT_CLASS = [
  'shop-category-hero col-span-2 lg:row-span-2',
  'h-44',
  'h-44',
  'h-44',
  'h-44',
  'h-44',
  'h-44',
  'col-span-2 h-44',
]

function isPlaceholderCategory(category) {
  const name = String(category?.name ?? '').trim().toLowerCase()
  if (PLACEHOLDER_NAMES.has(name)) return true
  return /-\d{2}[a-z0-9]{16,}$/i.test(String(category?.slug ?? ''))
}

function selectPopularCategories(parentCategories = []) {
  const usable = parentCategories.filter(
    (category) => category?.slug && category.isActive !== false && !EXCLUDED_SLUGS.has(category.slug) && !isPlaceholderCategory(category),
  )
  const featured = usable.filter((category) => category.isFeatured)
  const pool = featured.length ? featured : usable
  const bySlug = new Map(usable.map((category) => [category.slug, category]))
  const selected = []
  const used = new Set()

  for (const slug of LAYOUT_SLUGS) {
    const category = bySlug.get(slug)
    if (!category || used.has(category.slug)) continue
    used.add(category.slug)
    selected.push(category)
  }

  for (const category of pool) {
    if (selected.length >= BENTO_COUNT) break
    if (used.has(category.slug)) continue
    used.add(category.slug)
    selected.push(category)
  }

  for (const category of usable) {
    if (selected.length >= BENTO_COUNT) break
    if (used.has(category.slug)) continue
    used.add(category.slug)
    selected.push(category)
  }

  return selected.slice(0, BENTO_COUNT)
}

function formatItemStatus(count) {
  if (!Number.isFinite(count)) return null
  if (count <= 0) return 'Coming soon'
  return `${count.toLocaleString('en-US')}+ items`
}

function useCategoryItemCounts(slugs) {
  return useQuery({
    queryKey: ['shop-by-category-counts', slugs],
    enabled: slugs.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const entries = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const catalog = await getProductCatalog({ category: [slug], page: 1, per_page: 1 })
            const total = Number(catalog?.pagination?.total)
            return [slug, Number.isFinite(total) ? total : 0]
          } catch {
            return [slug, 0]
          }
        }),
      )
      return Object.fromEntries(entries)
    },
  })
}

function BentoImage({ src, fallback }) {
  const [current, setCurrent] = useState(src)

  useEffect(() => {
    setCurrent(src)
  }, [src])

  return (
    <img
      src={current}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => {
        const next = fallback && fallback !== current ? fallback : CATEGORY_IMAGES.generic
        if (next !== current) setCurrent(next)
      }}
      className="absolute inset-0 size-full max-w-none object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  )
}

function ItemStatus({ status }) {
  return (
    <p className="mt-1 text-[11px] leading-none font-medium text-white/80 sm:text-xs">
      {status ?? <span className="inline-block h-3 w-16 rounded bg-white/20" />}
    </p>
  )
}

function CategoryTile({ category, status, className = '' }) {
  const image = resolveParentCategoryImage(category)
  const fallback = resolveParentCategoryImage({ ...category, image: null, thumbnail: null })

  return (
    <Link
      to={buildCategoryListingHref(category.slug)}
      className={`group relative block overflow-hidden rounded-2xl bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red ${className}`}
    >
      <BentoImage src={image} fallback={fallback} />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10" />
      <div className="relative flex h-full flex-col justify-end p-3.5 sm:p-4">
        <h3 className="text-sm leading-tight font-bold text-white sm:text-base">{category.name}</h3>
        <ItemStatus status={status} />
      </div>
    </Link>
  )
}

function FeaturedCategoryTile({ category, status, className = '' }) {
  const image = resolveParentCategoryImage(category)
  const fallback = resolveParentCategoryImage({ ...category, image: null, thumbnail: null })
  const chips = (category.children ?? []).filter((child) => child?.slug && child?.name).slice(0, CHIP_LIMIT)

  return (
    <article className={`group relative overflow-hidden rounded-2xl bg-slate-900 ${className}`}>
      <BentoImage src={image} fallback={fallback} />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
      <Link
        to={buildCategoryListingHref(category.slug)}
        aria-label={`Shop ${category.name}`}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      />
      <div className="relative z-20 mt-auto flex h-full flex-col justify-end p-4 pointer-events-none sm:p-5">
        <h3 className="text-xl leading-tight font-bold text-white sm:text-2xl">{category.name}</h3>
        {chips.length ? (
          <div className="pointer-events-auto mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Link
                key={chip.slug}
                to={buildCategoryListingHref(category.slug, chip.slug)}
                className="rounded-full bg-white/20 px-2 py-1 text-[10px] leading-none font-medium text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[11px]"
              >
                {chip.name}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="pointer-events-none">
          <ItemStatus status={status} />
        </div>
      </div>
    </article>
  )
}

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {SLOT_CLASS.map((slot, index) => (
        <div key={index} className={`animate-pulse rounded-2xl bg-slate-200 ${slot}`} />
      ))}
    </div>
  )
}

export default function ShopByCategorySection() {
  const { parentCategories, isLoading } = useCategoryCatalog()
  const categories = useMemo(
    () => selectPopularCategories(parentCategories),
    [parentCategories],
  )
  const slugs = useMemo(() => categories.map((category) => category.slug), [categories])
  const { data: counts = {} } = useCategoryItemCounts(slugs)

  if (!isLoading && !categories.length) return null

  return (
    <section aria-labelledby="shop-by-category-heading" className="bg-white py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <h2
              id="shop-by-category-heading"
              className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
            >
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore millions of products across every category
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
          >
            All Categories
            <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        {isLoading && !categories.length ? (
          <BentoSkeleton />
        ) : (
          <>
            <style>{`
              @media (max-width: 1023px) {
                .shop-category-hero { height: 20rem; }
              }
            `}</style>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((category, index) => {
              const status = formatItemStatus(counts[category.slug])
              const slot = SLOT_CLASS[index] ?? SLOT_CLASS[SLOT_CLASS.length - 1]

              if (index === 0) {
                return (
                  <FeaturedCategoryTile
                    key={category.slug}
                    category={category}
                    status={status}
                    className={slot}
                  />
                )
              }

              return (
                <CategoryTile
                  key={category.slug}
                  category={category}
                  status={status}
                  className={slot}
                />
              )
            })}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}
